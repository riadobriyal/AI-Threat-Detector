import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import xgboost as xgb
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from data_preprocessing import ThreatDataPreprocessor

class ThreatPredictionModel:
    def __init__(self):
        self.models = {}
        self.best_model = None
        self.best_model_name = None
        self.preprocessor = ThreatDataPreprocessor()
        
    def train_multiple_models(self, X, y):
        """Train multiple models and select the best one"""
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Define models to try
        models_to_try = {
            'XGBoost': xgb.XGBRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            ),
            'Random Forest': RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            ),
            'Gradient Boosting': GradientBoostingRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            ),
            'Ridge Regression': Ridge(alpha=1.0),
            'Lasso Regression': Lasso(alpha=1.0),
            'SVR': SVR(kernel='rbf', C=1.0, gamma='scale')
        }
        
        results = {}
        
        print("Training and evaluating models...")
        print("-" * 50)
        
        for name, model in models_to_try.items():
            print(f"Training {name}...")
            
            # Train the model
            model.fit(X_train, y_train)
            
            # Make predictions
            y_pred_train = model.predict(X_train)
            y_pred_test = model.predict(X_test)
            
            # Calculate metrics
            train_r2 = r2_score(y_train, y_pred_train)
            test_r2 = r2_score(y_test, y_pred_test)
            train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
            test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
            test_mae = mean_absolute_error(y_test, y_pred_test)
            
            # Cross-validation score
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
            cv_mean = cv_scores.mean()
            cv_std = cv_scores.std()
            
            results[name] = {
                'model': model,
                'train_r2': train_r2,
                'test_r2': test_r2,
                'train_rmse': train_rmse,
                'test_rmse': test_rmse,
                'test_mae': test_mae,
                'cv_mean': cv_mean,
                'cv_std': cv_std,
                'y_pred_test': y_pred_test
            }
            
            print(f"  Test R²: {test_r2:.4f}")
            print(f"  Test RMSE: {test_rmse:.4f}")
            print(f"  Test MAE: {test_mae:.4f}")
            print(f"  CV R² (mean ± std): {cv_mean:.4f} ± {cv_std:.4f}")
            print()
        
        # Select best model based on test R² score
        best_model_name = max(results.keys(), key=lambda k: results[k]['test_r2'])
        self.best_model = results[best_model_name]['model']
        self.best_model_name = best_model_name
        self.models = results
        
        print(f"Best Model: {best_model_name}")
        print(f"Best Test R²: {results[best_model_name]['test_r2']:.4f}")
        
        return X_test, y_test, results
    
    def optimize_best_model(self, X, y):
        """Optimize the best model with hyperparameter tuning"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        if self.best_model_name == 'XGBoost':
            param_grid = {
                'n_estimators': [100, 200],
                'max_depth': [4, 6, 8],
                'learning_rate': [0.05, 0.1, 0.15],
                'subsample': [0.8, 0.9, 1.0]
            }
            model = xgb.XGBRegressor(random_state=42)
            
        elif self.best_model_name == 'Random Forest':
            param_grid = {
                'n_estimators': [100, 200, 300],
                'max_depth': [8, 10, 12, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
            model = RandomForestRegressor(random_state=42)
            
        else:
            # For other models, use the current best model
            return self.best_model
        
        print(f"Optimizing {self.best_model_name} with GridSearchCV...")
        
        # Perform grid search
        grid_search = GridSearchCV(
            model, param_grid, cv=5, scoring='r2', n_jobs=-1, verbose=1
        )
        grid_search.fit(X_train, y_train)
        
        # Update best model
        self.best_model = grid_search.best_estimator_
        
        # Evaluate optimized model
        y_pred_test = self.best_model.predict(X_test)
        test_r2 = r2_score(y_test, y_pred_test)
        test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
        
        print(f"Optimized {self.best_model_name} - Test R²: {test_r2:.4f}, RMSE: {test_rmse:.4f}")
        print(f"Best parameters: {grid_search.best_params_}")
        
        return self.best_model
    
    def get_feature_importance(self, feature_names):
        """Get feature importance from the best model"""
        if hasattr(self.best_model, 'feature_importances_'):
            importance = self.best_model.feature_importances_
            feature_importance = pd.DataFrame({
                'feature': feature_names,
                'importance': importance
            }).sort_values('importance', ascending=False)
            return feature_importance
        return None
    
    def save_model(self, model_path, preprocessor_path):
        """Save the trained model and preprocessor"""
        joblib.dump(self.best_model, model_path)
        self.preprocessor.save_preprocessor(preprocessor_path)
        print(f"Model saved to {model_path}")
        print(f"Preprocessor saved to {preprocessor_path}")
    
    def load_model(self, model_path, preprocessor_path):
        """Load the trained model and preprocessor"""
        self.best_model = joblib.load(model_path)
        self.preprocessor.load_preprocessor(preprocessor_path)
        print("Model and preprocessor loaded successfully")

def main():
    """Main training pipeline"""
    # Initialize the model
    threat_model = ThreatPredictionModel()
    
    # Load and preprocess data
    print("Loading and preprocessing data...")
    X, y, df = threat_model.preprocessor.load_and_preprocess_data('Global_Cybersecurity_Threats_2015-2024.csv')
    
    print(f"Features: {threat_model.preprocessor.feature_columns}")
    print(f"Target: {threat_model.preprocessor.target_column}")
    print(f"Data shape: {X.shape}")
    
    # Train multiple models
    X_test, y_test, results = threat_model.train_multiple_models(X, y)
    
    # Optimize the best model
    optimized_model = threat_model.optimize_best_model(X, y)
    
    # Get feature importance
    feature_importance = threat_model.get_feature_importance(threat_model.preprocessor.feature_columns)
    if feature_importance is not None:
        print("\nTop 10 Most Important Features:")
        print(feature_importance.head(10))
    
    # Save the model
    threat_model.save_model('best_threat_model.joblib', 'preprocessor.joblib')
    
    # Create a simple visualization
    plt.figure(figsize=(12, 8))
    
    # Plot model comparison
    plt.subplot(2, 2, 1)
    model_names = list(results.keys())
    test_r2_scores = [results[name]['test_r2'] for name in model_names]
    plt.bar(model_names, test_r2_scores)
    plt.title('Model Comparison - Test R² Scores')
    plt.xticks(rotation=45)
    plt.ylabel('R² Score')
    
    # Plot feature importance
    if feature_importance is not None:
        plt.subplot(2, 2, 2)
        top_features = feature_importance.head(10)
        plt.barh(top_features['feature'], top_features['importance'])
        plt.title('Top 10 Feature Importance')
        plt.xlabel('Importance')
    
    # Plot actual vs predicted for best model
    plt.subplot(2, 2, 3)
    best_results = results[threat_model.best_model_name]
    plt.scatter(y_test, best_results['y_pred_test'], alpha=0.6)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
    plt.xlabel('Actual Resolution Time (hours)')
    plt.ylabel('Predicted Resolution Time (hours)')
    plt.title(f'{threat_model.best_model_name} - Actual vs Predicted')
    
    # Plot residuals
    plt.subplot(2, 2, 4)
    residuals = y_test - best_results['y_pred_test']
    plt.scatter(best_results['y_pred_test'], residuals, alpha=0.6)
    plt.axhline(y=0, color='r', linestyle='--')
    plt.xlabel('Predicted Resolution Time (hours)')
    plt.ylabel('Residuals')
    plt.title('Residual Plot')
    
    plt.tight_layout()
    plt.savefig('model_analysis.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"\nTraining completed! Best model: {threat_model.best_model_name}")
    print("Model analysis plot saved as 'model_analysis.png'")

if __name__ == "__main__":
    main()