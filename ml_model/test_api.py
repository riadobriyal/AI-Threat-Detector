#!/usr/bin/env python3
"""
Test script for the cybersecurity threat prediction API
"""

import requests
import json
from typing import Dict, Any

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing health endpoint: {e}")
        return False

def test_prediction_endpoint():
    """Test the prediction endpoint with sample data"""
    print("\nTesting prediction endpoint...")
    
    # Sample threat data
    test_cases = [
        {
            "name": "Ransomware Attack on Healthcare",
            "data": {
                "country": "USA",
                "year": 2024,
                "attack_type": "Ransomware",
                "target_industry": "Healthcare",
                "financial_loss": 75.5,
                "affected_users": 150000,
                "attack_source": "Hacker Group",
                "vulnerability_type": "Unpatched Software",
                "defense_mechanism": "AI-based Detection"
            }
        },
        {
            "name": "Phishing Attack on Banking",
            "data": {
                "country": "UK",
                "year": 2024,
                "attack_type": "Phishing",
                "target_industry": "Banking",
                "financial_loss": 25.3,
                "affected_users": 50000,
                "attack_source": "Nation-state",
                "vulnerability_type": "Social Engineering",
                "defense_mechanism": "Firewall"
            }
        },
        {
            "name": "DDoS Attack on Government",
            "data": {
                "country": "Germany",
                "year": 2024,
                "attack_type": "DDoS",
                "target_industry": "Government",
                "financial_loss": 10.2,
                "affected_users": 25000,
                "attack_source": "Unknown",
                "vulnerability_type": "Weak Passwords",
                "defense_mechanism": "VPN"
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n--- {test_case['name']} ---")
        try:
            response = requests.post(
                f"{BASE_URL}/predict",
                json=test_case['data'],
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Predicted Resolution Time: {result['predicted_resolution_time']} hours")
                print(f"Risk Level: {result['risk_level']}")
                print(f"Model Used: {result['model_used']}")
                print(f"Confidence Interval: {result['confidence_interval']}")
                print("Recommendations:")
                for i, rec in enumerate(result['recommendations'][:3], 1):
                    print(f"  {i}. {rec}")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"Error testing prediction: {e}")

def test_model_info_endpoint():
    """Test the model info endpoint"""
    print("\n\nTesting model info endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/model-info")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error testing model info endpoint: {e}")

def main():
    """Run all API tests"""
    print("Cybersecurity Threat Prediction API Test Suite")
    print("=" * 50)
    
    # Test health endpoint
    if not test_health_endpoint():
        print("Health check failed. Make sure the API server is running.")
        return
    
    # Test prediction endpoint
    test_prediction_endpoint()
    
    # Test model info endpoint
    test_model_info_endpoint()
    
    print("\n" + "=" * 50)
    print("API testing completed!")

if __name__ == "__main__":
    main()