import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import joblib

class ThreatDataPreprocessor:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.target_column = 'Incident Resolution Time (in Hours)'
        
    def load_and_preprocess_data(self, file_path):
        """Load and preprocess the cybersecurity threat data"""
        # Load the data
        df = pd.read_csv(file_path)
        
        print(f"Dataset shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        
        # Handle missing values
        df = df.dropna()
        
        # Define categorical and numerical columns
        categorical_columns = [
            'Country', 'Attack Type', 'Target Industry', 'Attack Source',
            'Security Vulnerability Type', 'Defense Mechanism Used'
        ]
        
        numerical_columns = [
            'Year', 'Financial Loss (in Million $)', 'Number of Affected Users'
        ]
        
        # Encode categorical variables
        for col in categorical_columns:
            if col in df.columns:
                le = LabelEncoder()
                df[col + '_encoded'] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le
        
        # Prepare feature columns
        encoded_categorical = [col + '_encoded' for col in categorical_columns if col in df.columns]
        self.feature_columns = numerical_columns + encoded_categorical
        
        # Prepare features and target
        X = df[self.feature_columns]
        y = df[self.target_column]
        
        # Scale numerical features
        X_scaled = X.copy()
        X_scaled[numerical_columns] = self.scaler.fit_transform(X[numerical_columns])
        
        return X_scaled, y, df
    
    def transform_new_data(self, data_dict):
        """Transform new data for prediction"""
        # Create a DataFrame from the input dictionary
        df = pd.DataFrame([data_dict])
        
        # Encode categorical variables using fitted encoders
        categorical_columns = [
            'Country', 'Attack Type', 'Target Industry', 'Attack Source',
            'Security Vulnerability Type', 'Defense Mechanism Used'
        ]
        
        for col in categorical_columns:
            if col in df.columns and col in self.label_encoders:
                # Handle unseen categories by using the most frequent category
                try:
                    df[col + '_encoded'] = self.label_encoders[col].transform(df[col].astype(str))
                except ValueError:
                    # If category not seen during training, use mode (most frequent)
                    df[col + '_encoded'] = 0  # Default to first category
        
        # Prepare features
        X = df[self.feature_columns]
        
        # Scale numerical features
        numerical_columns = ['Year', 'Financial Loss (in Million $)', 'Number of Affected Users']
        X_scaled = X.copy()
        X_scaled[numerical_columns] = self.scaler.transform(X[numerical_columns])
        
        return X_scaled
    
    def save_preprocessor(self, path):
        """Save the preprocessor components"""
        joblib.dump({
            'label_encoders': self.label_encoders,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'target_column': self.target_column
        }, path)
    
    def load_preprocessor(self, path):
        """Load the preprocessor components"""
        components = joblib.load(path)
        self.label_encoders = components['label_encoders']
        self.scaler = components['scaler']
        self.feature_columns = components['feature_columns']
        self.target_column = components['target_column']