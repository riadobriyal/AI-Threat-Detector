# AI Threat Intelligence Repository

A comprehensive, production-ready AI-powered threat intelligence platform that integrates real-time threat detection, machine learning predictions, and automated incident response.

## 🏗️ Architecture Overview

This repository consists of three integrated components:

### 1. **Frontend (React + TypeScript)**
- **Location**: `frontend/`
- **Technology**: React 18, TypeScript, Tailwind CSS, Lucide React
- **Features**:
  - Real-time threat intelligence dashboard
  - Interactive data visualizations
  - Live threat feed with AI insights
  - Integrated alert management
  - ML model performance monitoring

### 2. **Backend (Django REST API)**
- **Location**: `backend/`
- **Technology**: Django 4.2, Django REST Framework, Celery, Redis
- **Features**:
  - RESTful API for threat data management
  - Real-time threat feed processing
  - Alert generation and management
  - User authentication and authorization
  - Background task processing

### 3. **ML Model (FastAPI + Scikit-learn)**
- **Location**: `ml_model/`
- **Technology**: FastAPI, Scikit-learn, XGBoost, Pandas
- **Features**:
  - Threat resolution time prediction
  - Risk level classification
  - Automated threat analysis
  - Model performance monitoring

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Redis (for Celery)

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start Django server
python manage.py runserver 0.0.0.0:8001
```

### 2. ML Model Setup

```bash
cd ml_model
pip install -r requirements.txt

# Train the model (if CSV data is available)
python train_model.py

# Start ML API server
python main.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

### 4. Background Services

```bash
# In separate terminals:

# Start Redis
redis-server

# Start Celery worker
cd backend
celery -A threat_intelligence worker -l info

# Start Celery beat (scheduler)
cd backend
celery -A threat_intelligence beat -l info
```

## 🔗 Integration Points

### API Endpoints

#### Backend (Django) - Port 8001
- **Dashboard Stats**: `GET /api/analytics/dashboard/dashboard_stats/`
- **Threats**: `GET /api/threats/threats/`
- **Alerts**: `GET /api/alerts/alerts/`
- **ML Predictions**: `POST /api/analytics/dashboard/predict_threat_resolution/`

#### ML Model (FastAPI) - Port 8000
- **Health Check**: `GET /health`
- **Predict**: `POST /predict`
- **Model Info**: `GET /model-info`

### Data Flow

1. **Threat Detection**: Backend processes threat feeds and creates threat records
2. **AI Analysis**: Threats are automatically analyzed by the ML model for risk scoring
3. **Alert Generation**: High-risk threats trigger automated alerts
4. **Real-time Updates**: Frontend receives live updates via API polling
5. **ML Predictions**: Users can request resolution time predictions for specific threats

## 📊 Features

### Real-time Dashboard
- Live threat feed with AI-powered risk scoring
- Interactive charts and visualizations
- ML model performance metrics
- Alert management with AI recommendations

### AI-Powered Analysis
- Automated threat classification
- Risk score calculation
- Resolution time prediction
- Incident response suggestions

### Threat Intelligence
- Multiple threat feed integration
- Automated threat correlation
- False positive detection
- Historical trend analysis

### Alert Management
- Priority-based alert routing
- Automated escalation
- ML-enhanced alert context
- Resolution tracking

## 🛠️ Configuration

### Environment Variables

#### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
REDIS_URL=redis://localhost:6379/0
THREAT_ALERT_THRESHOLD=7
ML_MODEL_API_URL=http://localhost:8000
```

#### Frontend
```typescript
// src/services/api.ts
const API_BASE_URL = 'http://localhost:8001/api';
const ML_API_URL = 'http://localhost:8000';
```

## 🔧 Development

### Adding New Threat Sources
1. Create a new `ThreatFeed` in Django admin
2. Implement feed processing in `threats/tasks.py`
3. Add feed-specific parsing logic

### Extending ML Models
1. Add new features to `ml_model/data_preprocessing.py`
2. Update model training in `ml_model/model_training.py`
3. Modify API endpoints in `ml_model/main.py`

### Custom Alert Rules
1. Create `AlertRule` objects in Django admin
2. Rules are automatically applied to new threats
3. Customize logic in `alerts/tasks.py`

## 📈 Monitoring

### Health Checks
- **Backend**: `http://localhost:8001/admin/`
- **ML Model**: `http://localhost:8000/health`
- **Frontend**: `http://localhost:5173/`

### Logs
- Django logs: `backend/threat_intelligence.log`
- Celery logs: Console output
- ML Model logs: Console output

## 🚀 Production Deployment

### Docker Deployment (Recommended)

```bash
# Build and run all services
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=2 --scale ml-model=2
```

### Manual Deployment

1. **Backend**: Use Gunicorn + Nginx
2. **ML Model**: Use Uvicorn + Nginx
3. **Frontend**: Build and serve static files
4. **Database**: PostgreSQL for production
5. **Cache**: Redis cluster
6. **Queue**: Celery with Redis broker

## 🔒 Security

- JWT-based authentication
- CORS configuration
- Input validation and sanitization
- Rate limiting (recommended for production)
- HTTPS enforcement (production)

## 📚 API Documentation

- **Backend API**: `http://localhost:8001/swagger/`
- **ML Model API**: `http://localhost:8000/docs`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Real-time WebSocket updates
- [ ] Advanced ML models (deep learning)
- [ ] Threat hunting capabilities
- [ ] MISP integration
- [ ] Mobile application
- [ ] Advanced analytics and reporting