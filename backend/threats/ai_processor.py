import logging
import re
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ThreatAIProcessor:
    """
    AI-powered threat analysis processor.
    This is a simplified version - in production, you would integrate
    with actual ML models or external AI services.
    """
    
    def __init__(self):
        self.risk_keywords = {
            'critical': ['zero-day', 'remote code execution', 'privilege escalation', 'ransomware'],
            'high': ['sql injection', 'cross-site scripting', 'buffer overflow', 'malware'],
            'medium': ['denial of service', 'information disclosure', 'phishing'],
            'low': ['misconfiguration', 'weak password', 'outdated software']
        }
        
        self.threat_patterns = {
            'apt': ['advanced persistent threat', 'nation-state', 'sophisticated attack'],
            'ransomware': ['encryption', 'ransom', 'crypto', 'file encryption'],
            'malware': ['trojan', 'virus', 'worm', 'backdoor', 'rootkit'],
            'phishing': ['credential theft', 'fake website', 'social engineering'],
        }
    
    def analyze_threat(self, threat) -> Dict[str, Any]:
        """
        Analyze a threat and return AI-generated insights
        """
        try:
            # Combine title and description for analysis
            text_content = f"{threat.title} {threat.description}".lower()
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(threat, text_content)
            
            # Generate classification
            classification = self._classify_threat(text_content)
            
            # Generate response suggestion
            response_suggestion = self._generate_response_suggestion(threat, classification)
            
            return {
                'risk_score': risk_score,
                'classification': classification,
                'response_suggestion': response_suggestion,
            }
            
        except Exception as e:
            logger.error(f"Error in AI threat analysis: {str(e)}")
            return {
                'risk_score': threat.severity,
                'classification': 'unknown',
                'response_suggestion': 'Manual analysis required',
            }
    
    def _calculate_risk_score(self, threat, text_content: str) -> float:
        """Calculate risk score based on multiple factors"""
        base_score = threat.severity
        
        # Adjust based on keywords
        keyword_multiplier = 1.0
        
        for risk_level, keywords in self.risk_keywords.items():
            for keyword in keywords:
                if keyword in text_content:
                    if risk_level == 'critical':
                        keyword_multiplier = max(keyword_multiplier, 1.5)
                    elif risk_level == 'high':
                        keyword_multiplier = max(keyword_multiplier, 1.3)
                    elif risk_level == 'medium':
                        keyword_multiplier = max(keyword_multiplier, 1.1)
        
        # Adjust based on threat type
        type_multipliers = {
            'ransomware': 1.4,
            'apt': 1.3,
            'malware': 1.2,
            'vulnerability': 1.1,
            'phishing': 1.0,
            'ddos': 0.9,
        }
        
        type_multiplier = type_multipliers.get(threat.threat_type, 1.0)
        
        # Calculate final score
        final_score = base_score * keyword_multiplier * type_multiplier
        
        # Ensure score is within bounds
        return min(10.0, max(1.0, round(final_score, 1)))
    
    def _classify_threat(self, text_content: str) -> str:
        """Classify threat based on content analysis"""
        classifications = []
        
        for threat_type, patterns in self.threat_patterns.items():
            for pattern in patterns:
                if pattern in text_content:
                    classifications.append(threat_type)
                    break
        
        if not classifications:
            return 'generic'
        
        # Return the most specific classification
        priority_order = ['apt', 'ransomware', 'malware', 'phishing']
        for priority_type in priority_order:
            if priority_type in classifications:
                return priority_type
        
        return classifications[0]
    
    def _generate_response_suggestion(self, threat, classification: str) -> str:
        """Generate incident response suggestion"""
        base_suggestions = {
            'apt': [
                "Immediately isolate potentially affected systems",
                "Conduct forensic analysis to determine scope of compromise",
                "Review network logs for lateral movement indicators",
                "Update all security controls and monitoring rules",
                "Consider engaging external incident response team"
            ],
            'ransomware': [
                "Immediately disconnect affected systems from network",
                "Do not pay ransom - contact law enforcement",
                "Assess backup integrity and restoration capabilities",
                "Implement network segmentation to prevent spread",
                "Notify relevant stakeholders and regulatory bodies"
            ],
            'malware': [
                "Quarantine infected systems immediately",
                "Run full antimalware scans on all endpoints",
                "Update signature databases and security patches",
                "Monitor network traffic for command and control activity",
                "Review email security and web filtering policies"
            ],
            'vulnerability': [
                "Apply security patches immediately if available",
                "Implement temporary mitigations if patches unavailable",
                "Scan infrastructure for vulnerable systems",
                "Update vulnerability management procedures",
                "Monitor for exploitation attempts"
            ],
            'phishing': [
                "Block malicious domains and email addresses",
                "Educate users about the specific phishing campaign",
                "Review and update email security controls",
                "Monitor for credential compromise indicators",
                "Implement additional authentication controls"
            ]
        }
        
        suggestions = base_suggestions.get(classification, [
            "Assess potential impact on organizational assets",
            "Implement appropriate security controls",
            "Monitor for related threat activity",
            "Update security policies and procedures",
            "Document lessons learned"
        ])
        
        # Add severity-based suggestions
        if threat.severity >= 8:
            suggestions.insert(0, "URGENT: This is a critical threat requiring immediate attention")
        elif threat.severity >= 6:
            suggestions.insert(0, "HIGH PRIORITY: Address this threat within 24 hours")
        
        return "\n".join(f"• {suggestion}" for suggestion in suggestions)