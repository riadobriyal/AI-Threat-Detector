import requests
import logging
from celery import shared_task
from django.utils import timezone
from django.conf import settings
from datetime import datetime, timedelta
from .models import Threat, ThreatFeed
from .ai_processor import ThreatAIProcessor

logger = logging.getLogger(__name__)

@shared_task
def fetch_threat_feeds():
    """Fetch all active threat feeds"""
    active_feeds = ThreatFeed.objects.filter(is_active=True)
    
    for feed in active_feeds:
        # Check if it's time to fetch this feed
        if feed.last_fetched:
            time_since_last_fetch = timezone.now() - feed.last_fetched
            if time_since_last_fetch.total_seconds() < feed.fetch_interval * 60:
                continue
        
        fetch_single_threat_feed.delay(feed.id)
    
    logger.info(f"Triggered fetch for {active_feeds.count()} threat feeds")

@shared_task
def fetch_single_threat_feed(feed_id):
    """Fetch a single threat feed"""
    try:
        feed = ThreatFeed.objects.get(id=feed_id)
        logger.info(f"Fetching threat feed: {feed.name}")
        
        # Prepare headers
        headers = {'User-Agent': 'ThreatIntel-Dashboard/1.0'}
        if feed.api_key:
            headers['Authorization'] = f'Bearer {feed.api_key}'
        
        # Fetch data
        response = requests.get(feed.url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Process based on feed type
        if feed.feed_type == 'cve':
            threats_created = process_cve_feed(response.json(), feed)
        elif feed.feed_type == 'malware':
            threats_created = process_malware_feed(response.json(), feed)
        else:
            threats_created = process_generic_feed(response.json(), feed)
        
        # Update feed metadata
        feed.last_fetched = timezone.now()
        feed.total_threats_imported += threats_created
        feed.save()
        
        logger.info(f"Successfully processed {threats_created} threats from {feed.name}")
        
    except Exception as e:
        logger.error(f"Error fetching threat feed {feed_id}: {str(e)}")

def process_cve_feed(data, feed):
    """Process CVE feed data"""
    threats_created = 0
    
    for item in data:
        try:
            # Check if threat already exists
            if Threat.objects.filter(
                external_id=item.get('id'),
                source=feed.name
            ).exists():
                continue
            
            # Create threat
            threat = Threat.objects.create(
                source=feed.name,
                threat_type='vulnerability',
                title=item.get('summary', 'CVE Vulnerability')[:500],
                description=item.get('summary', ''),
                external_id=item.get('id'),
                cve_id=item.get('id'),
                date_detected=parse_cve_date(item.get('Published')),
                severity=calculate_cve_severity(item.get('cvss', 0)),
                references=item.get('references', []),
            )
            
            # Process with AI
            process_threat_with_ai.delay(threat.id)
            threats_created += 1
            
        except Exception as e:
            logger.error(f"Error processing CVE item: {str(e)}")
    
    return threats_created

def process_malware_feed(data, feed):
    """Process malware feed data"""
    threats_created = 0
    
    for item in data.get('data', []):
        try:
            # Check if threat already exists
            if Threat.objects.filter(
                external_id=item.get('sha256_hash'),
                source=feed.name
            ).exists():
                continue
            
            # Create threat
            threat = Threat.objects.create(
                source=feed.name,
                threat_type='malware',
                title=f"Malware: {item.get('file_name', 'Unknown')}",
                description=f"Malware sample detected: {item.get('file_type', 'Unknown type')}",
                external_id=item.get('sha256_hash'),
                date_detected=parse_malware_date(item.get('first_seen')),
                severity=calculate_malware_severity(item.get('signature', '')),
                indicators_of_compromise=[
                    {'type': 'sha256', 'value': item.get('sha256_hash')},
                    {'type': 'md5', 'value': item.get('md5_hash')},
                ],
                tags=item.get('tags', []),
            )
            
            # Process with AI
            process_threat_with_ai.delay(threat.id)
            threats_created += 1
            
        except Exception as e:
            logger.error(f"Error processing malware item: {str(e)}")
    
    return threats_created

def process_generic_feed(data, feed):
    """Process generic threat feed data"""
    threats_created = 0
    
    # This is a placeholder for processing other types of feeds
    # Implement based on your specific feed formats
    
    return threats_created

@shared_task
def process_threat_with_ai(threat_id):
    """Process a threat with AI to generate risk score and suggestions"""
    try:
        threat = Threat.objects.get(id=threat_id)
        processor = ThreatAIProcessor()
        
        # Generate AI analysis
        ai_result = processor.analyze_threat(threat)
        
        # Update threat with AI results
        threat.risk_score = ai_result.get('risk_score', 0)
        threat.ai_classification = ai_result.get('classification', '')
        threat.incident_response_suggestion = ai_result.get('response_suggestion', '')
        threat.save()
        
        # Check if alert should be triggered
        if threat.should_trigger_alert(settings.THREAT_ALERT_THRESHOLD):
            from alerts.tasks import create_threat_alert
            create_threat_alert.delay(threat.id)
        
        logger.info(f"AI processing completed for threat {threat_id}")
        
    except Exception as e:
        logger.error(f"Error processing threat {threat_id} with AI: {str(e)}")

# Helper functions
def parse_cve_date(date_string):
    """Parse CVE date string to datetime"""
    try:
        return datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%S')
    except:
        return timezone.now()

def parse_malware_date(date_string):
    """Parse malware date string to datetime"""
    try:
        return datetime.strptime(date_string, '%Y-%m-%d %H:%M:%S')
    except:
        return timezone.now()

def calculate_cve_severity(cvss_score):
    """Convert CVSS score to our severity scale (1-10)"""
    if cvss_score == 0:
        return 1
    return min(10, max(1, int(cvss_score)))

def calculate_malware_severity(signature):
    """Calculate malware severity based on signature"""
    high_risk_indicators = ['trojan', 'ransomware', 'rootkit', 'backdoor']
    
    if any(indicator in signature.lower() for indicator in high_risk_indicators):
        return 8
    return 6