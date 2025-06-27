#!/usr/bin/env python3
"""
Script to train the cybersecurity threat prediction model
Run this script to train the model before starting the API
"""

import sys
import os
from model_training import main as train_main

if __name__ == "__main__":
    print("Starting cybersecurity threat prediction model training...")
    print("=" * 60)
    
    # Check if data file exists
    if not os.path.exists('Global_Cybersecurity_Threats_2015-2024.csv'):
        print("Error: Data file 'Global_Cybersecurity_Threats_2015-2024.csv' not found!")
        print("Please ensure the CSV file is in the current directory.")
        sys.exit(1)
    
    try:
        # Run the training
        train_main()
        print("\n" + "=" * 60)
        print("Model training completed successfully!")
        print("Files created:")
        print("- best_threat_model.joblib (trained model)")
        print("- preprocessor.joblib (data preprocessor)")
        print("- model_analysis.png (analysis plots)")
        print("\nYou can now start the API server with: python main.py")
        
    except Exception as e:
        print(f"\nError during training: {e}")
        sys.exit(1)