# Cybersecurity Threat Intelligence ML API

A comprehensive machine learning solution for predicting cybersecurity incident resolution times using advanced ML algorithms and FastAPI.

## 🚀 Features

- **Advanced ML Models**: Implements and compares multiple algorithms (XGBoost, Random Forest, Gradient Boosting, etc.)
- **Automated Model Selection**: Automatically selects the best performing model based on cross-validation
- **Hyperparameter Optimization**: Uses GridSearchCV for optimal model performance
- **RESTful API**: FastAPI-based API with automatic documentation
- **Real-time Predictions**: Instant threat resolution time predictions
- **Risk Assessment**: Automatic risk level classification and recommendations
- **Production Ready**: Includes error handling, logging, and health checks

## 📊 Model Performance

The system trains and evaluates multiple ML models:
- **XGBoost Regressor** (typically best performer)
- **Random Forest Regressor**
- **Gradient Boosting Regressor**
- **Ridge/Lasso Regression**
- **Support Vector Regression**

Performance metrics include R², RMSE, MAE, and cross-validation scores.

## 🛠️ Installation

1. **Clone the repository and install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Prepare your data:**
   - Place the `Global_Cybersecurity_Threats_2015-2024.csv` file in the project directory

3. **Train the model:**
```bash
python train_model.py
```

4. **Start the API server:**
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Endpoints

- **GET /** - API information
- **POST /predict** - Predict incident resolution time
- **GET /health** - Health check
- **GET /model-info** - Model information
- **GET /docs** - Interactive API documentation

### Example Prediction Request

```json
{
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
```

### Example Response

```json
{
  "predicted_resolution_time": 42.5,
  "confidence_interval": {
    "lower_bound": 36.1,
    "upper_bound": 48.9
  },
  "risk_level": "High",
  "recommendations": [
    "Immediately isolate affected systems",
    "Activate incident response team",
    "Check backup integrity and availability",
    "Do not pay ransom - contact law enforcement"
  ],
  "model_used": "XGBRegressor"
}
```

## 🧪 Testing

Run the test suite to verify API functionality:

```bash
python test_api.py
```

## 📈 Model Features

The model uses the following features for prediction:

### Categorical Features:
- **Country**: Geographic location of the attack
- **Attack Type**: Type of cyber attack (Ransomware, Phishing, DDoS, etc.)
- **Target Industry**: Industry sector targeted
- **Attack Source**: Source of the attack (Hacker Group, Nation-state, etc.)
- **Security Vulnerability Type**: Type of vulnerability exploited
- **Defense Mechanism Used**: Security measures in place

### Numerical Features:
- **Year**: Year of the attack
- **Financial Loss**: Financial impact in millions USD
- **Number of Affected Users**: Scale of user impact

## 🎯 Model Selection Process

1. **Data Preprocessing**: Automatic encoding of categorical variables and feature scaling
2. **Model Training**: Multiple algorithms trained with cross-validation
3. **Model Comparison**: Performance comparison using R², RMSE, and MAE
4. **Hyperparameter Tuning**: GridSearchCV optimization for the best model
5. **Model Persistence**: Automatic saving of the best model and preprocessor

## 🔧 Configuration

### Supported Values:

**Countries**: China, India, UK, Germany, France, Australia, Russia, Brazil, Japan, USA

**Attack Types**: Phishing, Ransomware, Man-in-the-Middle, DDoS, SQL Injection, Malware

**Industries**: Education, Retail, IT, Telecommunications, Banking, Healthcare, Government

**Attack Sources**: Hacker Group, Nation-state, Insider, Unknown

**Vulnerabilities**: Unpatched Software, Social Engineering, Weak Passwords, Zero-day

**Defense Mechanisms**: VPN, Firewall, AI-based Detection, Antivirus, Encryption

## 📊 Risk Levels

- **Low**: ≤ 12 hours resolution time
- **Medium**: 12-24 hours resolution time  
- **High**: 24-48 hours resolution time
- **Critical**: > 48 hours resolution time

## 🚀 Production Deployment

For production deployment:

1. Use a production WSGI server (e.g., Gunicorn)
2. Set up proper logging and monitoring
3. Implement authentication and rate limiting
4. Use environment variables for configuration
5. Set up model retraining pipelines

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.