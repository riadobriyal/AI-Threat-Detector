from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class CountryEnum(str, Enum):
    CHINA = "China"
    INDIA = "India"
    UK = "UK"
    GERMANY = "Germany"
    FRANCE = "France"
    AUSTRALIA = "Australia"
    RUSSIA = "Russia"
    BRAZIL = "Brazil"
    JAPAN = "Japan"
    USA = "USA"

class AttackTypeEnum(str, Enum):
    PHISHING = "Phishing"
    RANSOMWARE = "Ransomware"
    MAN_IN_THE_MIDDLE = "Man-in-the-Middle"
    DDOS = "DDoS"
    SQL_INJECTION = "SQL Injection"
    MALWARE = "Malware"

class TargetIndustryEnum(str, Enum):
    EDUCATION = "Education"
    RETAIL = "Retail"
    IT = "IT"
    TELECOMMUNICATIONS = "Telecommunications"
    BANKING = "Banking"
    HEALTHCARE = "Healthcare"
    GOVERNMENT = "Government"

class AttackSourceEnum(str, Enum):
    HACKER_GROUP = "Hacker Group"
    NATION_STATE = "Nation-state"
    INSIDER = "Insider"
    UNKNOWN = "Unknown"

class VulnerabilityTypeEnum(str, Enum):
    UNPATCHED_SOFTWARE = "Unpatched Software"
    SOCIAL_ENGINEERING = "Social Engineering"
    WEAK_PASSWORDS = "Weak Passwords"
    ZERO_DAY = "Zero-day"

class DefenseMechanismEnum(str, Enum):
    VPN = "VPN"
    FIREWALL = "Firewall"
    AI_BASED_DETECTION = "AI-based Detection"
    ANTIVIRUS = "Antivirus"
    ENCRYPTION = "Encryption"

class ThreatPredictionRequest(BaseModel):
    country: CountryEnum = Field(..., description="Country where the attack occurred")
    year: int = Field(..., ge=2015, le=2030, description="Year of the attack")
    attack_type: AttackTypeEnum = Field(..., description="Type of cyber attack")
    target_industry: TargetIndustryEnum = Field(..., description="Industry targeted by the attack")
    financial_loss: float = Field(..., ge=0, description="Financial loss in million dollars")
    affected_users: int = Field(..., ge=0, description="Number of affected users")
    attack_source: AttackSourceEnum = Field(..., description="Source of the attack")
    vulnerability_type: VulnerabilityTypeEnum = Field(..., description="Type of security vulnerability")
    defense_mechanism: DefenseMechanismEnum = Field(..., description="Defense mechanism used")

    class Config:
        schema_extra = {
            "example": {
                "country": "USA",
                "year": 2024,
                "attack_type": "Ransomware",
                "target_industry": "Healthcare",
                "financial_loss": 50.5,
                "affected_users": 100000,
                "attack_source": "Hacker Group",
                "vulnerability_type": "Unpatched Software",
                "defense_mechanism": "AI-based Detection"
            }
        }

class ThreatPredictionResponse(BaseModel):
    predicted_resolution_time: float = Field(..., description="Predicted incident resolution time in hours")
    confidence_interval: dict = Field(..., description="95% confidence interval for the prediction")
    risk_level: str = Field(..., description="Risk level based on predicted resolution time")
    recommendations: list = Field(..., description="Recommended actions based on the threat profile")
    model_used: str = Field(..., description="Name of the ML model used for prediction")

class HealthResponse(BaseModel):
    status: str
    message: str
    model_loaded: bool