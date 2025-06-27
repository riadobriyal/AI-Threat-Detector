import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from data_preprocessing import ThreatDataPreprocessor
from api_models import ThreatPredictionRequest, ThreatPredictionResponse

class ThreatPredictionService:
    def __init__(self, model_path: str = 'best_threat_model.joblib', 
                 preprocessor_path: str = 'preprocessor.joblib'):
        self.model = None
        self.preprocessor = ThreatDataPreprocessor()
        self.model_name = None
        self.is_loaded = False
        
        try:
            self.load_model(model_path, preprocessor_path)
        except Exception as e:
            print(f"Warning: Could not load model on initialization: {e}")
    
    def load_model(self, model_path: str, preprocessor_path: str):
        """Load the trained model and preprocessor"""
        try:
            self.model = joblib.load(model_path)
            self.preprocessor.load_preprocessor(preprocessor_path)
            self.model_name = type(self.model).__name__
            self.is_loaded = True
            print("Model and preprocessor loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise e
    
    def _convert_request_to_dict(self, request: ThreatPredictionRequest) -> Dict:
        """Convert API request to dictionary format expected by preprocessor"""
        return {
            'Country': request.country.value,
            'Year': request.year,
            'Attack Type': request.attack_type.value,
            'Target Industry': request.target_industry.value,
            'Financial Loss (in Million $)': request.financial_loss,
            'Number of Affected Users': request.affected_users,
            'Attack Source': request.attack_source.value,
            'Security Vulnerability Type': request.vulnerability_type.value,
            'Defense Mechanism Used': request.defense_mechanism.value
        }
    
    def _calculate_confidence_interval(self, prediction: float, 
                                     uncertainty: float = 0.15) -> Dict[str, float]:
        """Calculate confidence interval for the prediction"""
        margin = prediction * uncertainty
        return {
            "lower_bound": max(0, prediction - margin),
            "upper_bound": prediction + margin
        }
    
    def _determine_risk_level(self, resolution_time: float) -> str:
        """Determine risk level based on predicted resolution time"""
        if resolution_time <= 12:
            return "Low"
        elif resolution_time <= 24:
            return "Medium"
        elif resolution_time <= 48:
            return "High"
        else:
            return "Critical"
    
    def _generate_recommendations(self, request: ThreatPredictionRequest, 
                                resolution_time: float) -> List[str]:
        """Generate recommendations based on threat characteristics"""
        recommendations = []
        
        # Base recommendations based on attack type
        attack_recommendations = {
            "Ransomware": [
                "Immediately isolate affected systems",
                "Activate incident response team",
                "Check backup integrity and availability",
                "Do not pay ransom - contact law enforcement"
            ],
            "Phishing": [
                "Block malicious domains and IPs",
                "Conduct user awareness training",
                "Review email security policies",
                "Monitor for credential compromise"
            ],
            "DDoS": [
                "Activate DDoS mitigation services",
                "Scale up infrastructure capacity",
                "Monitor network traffic patterns",
                "Coordinate with ISP for traffic filtering"
            ],
            "SQL Injection": [
                "Patch vulnerable applications immediately",
                "Review database access controls",
                "Implement input validation",
                "Monitor database activity logs"
            ],
            "Malware": [
                "Run full system antivirus scans",
                "Isolate infected systems",
                "Update security signatures",
                "Review network segmentation"
            ],
            "Man-in-the-Middle": [
                "Verify SSL/TLS certificate integrity",
                "Implement certificate pinning",
                "Monitor network traffic for anomalies",
                "Review VPN and encryption policies"
            ]
        }
        
        recommendations.extend(attack_recommendations.get(request.attack_type.value, []))
        
        # Additional recommendations based on resolution time
        if resolution_time > 48:
            recommendations.extend([
                "Escalate to senior management",
                "Consider external incident response support",
                "Prepare public communication strategy"
            ])
        elif resolution_time > 24:
            recommendations.extend([
                "Increase monitoring frequency",
                "Prepare stakeholder notifications"
            ])
        
        # Industry-specific recommendations
        if request.target_industry.value == "Healthcare":
            recommendations.append("Ensure patient data protection compliance")
        elif request.target_industry.value == "Banking":
            recommendations.append("Notify financial regulators if required")
        elif request.target_industry.value == "Government":
            recommendations.append("Follow government incident reporting procedures")
        
        return recommendations[:8]  # Limit to top 8 recommendations
    
    def predict(self, request: ThreatPredictionRequest) -> ThreatPredictionResponse:
        """Make prediction for incident resolution time"""
        if not self.is_loaded:
            raise ValueError("Model not loaded. Please ensure model files are available.")
        
        try:
            # Convert request to format expected by model
            data_dict = self._convert_request_to_dict(request)
            
            # Preprocess the data
            X = self.preprocessor.transform_new_data(data_dict)
            
            # Make prediction
            prediction = self.model.predict(X)[0]
            
            # Ensure prediction is positive
            prediction = max(0.1, prediction)
            
            # Calculate confidence interval
            confidence_interval = self._calculate_confidence_interval(prediction)
            
            # Determine risk level
            risk_level = self._determine_risk_level(prediction)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(request, prediction)
            
            return ThreatPredictionResponse(
                predicted_resolution_time=round(prediction, 2),
                confidence_interval=confidence_interval,
                risk_level=risk_level,
                recommendations=recommendations,
                model_used=self.model_name
            )
            
        except Exception as e:
            raise ValueError(f"Prediction failed: {str(e)}")
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model"""
        return {
            "model_loaded": self.is_loaded,
            "model_name": self.model_name if self.is_loaded else None,
            "features_count": len(self.preprocessor.feature_columns) if self.is_loaded else 0
        }