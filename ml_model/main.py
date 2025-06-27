from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager

from api_models import ThreatPredictionRequest, ThreatPredictionResponse, HealthResponse
from prediction_service import ThreatPredictionService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global prediction service instance
prediction_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global prediction_service
    try:
        prediction_service = ThreatPredictionService()
        logger.info("Prediction service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize prediction service: {e}")
        prediction_service = ThreatPredictionService.__new__(ThreatPredictionService)
        prediction_service.is_loaded = False
    
    yield
    
    # Shutdown
    logger.info("Application shutting down")

# Create FastAPI app
app = FastAPI(
    title="Cybersecurity Threat Intelligence API",
    description="AI-powered API for predicting cybersecurity incident resolution times",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Cybersecurity Threat Intelligence API",
        "version": "1.0.0",
        "description": "AI-powered prediction of cybersecurity incident resolution times",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    global prediction_service
    
    if prediction_service is None:
        return HealthResponse(
            status="unhealthy",
            message="Prediction service not initialized",
            model_loaded=False
        )
    
    return HealthResponse(
        status="healthy" if prediction_service.is_loaded else "degraded",
        message="Service is running" if prediction_service.is_loaded else "Service running but model not loaded",
        model_loaded=prediction_service.is_loaded
    )

@app.post("/predict", response_model=ThreatPredictionResponse)
async def predict_resolution_time(request: ThreatPredictionRequest):
    """
    Predict cybersecurity incident resolution time based on threat characteristics.
    
    This endpoint uses machine learning to predict how long it will take to resolve
    a cybersecurity incident based on various threat parameters.
    """
    global prediction_service
    
    if prediction_service is None or not prediction_service.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Prediction service unavailable. Model not loaded."
        )
    
    try:
        logger.info(f"Received prediction request for {request.attack_type.value} attack")
        
        # Make prediction
        result = prediction_service.predict(request)
        
        logger.info(f"Prediction successful: {result.predicted_resolution_time} hours")
        return result
        
    except ValueError as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during prediction: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction")

@app.get("/model-info", response_model=dict)
async def get_model_info():
    """Get information about the loaded ML model"""
    global prediction_service
    
    if prediction_service is None:
        raise HTTPException(status_code=503, detail="Prediction service not initialized")
    
    return prediction_service.get_model_info()

@app.post("/retrain", response_model=dict)
async def trigger_retrain(background_tasks: BackgroundTasks):
    """
    Trigger model retraining (placeholder for production implementation)
    In production, this would trigger a background job to retrain the model
    """
    def retrain_model():
        logger.info("Model retraining triggered (placeholder)")
        # In production, implement actual retraining logic here
        pass
    
    background_tasks.add_task(retrain_model)
    return {"message": "Model retraining triggered", "status": "accepted"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )