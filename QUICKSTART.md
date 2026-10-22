# 🚀 Quick Start Guide

## Prerequisites
1. ✅ Completed model training in Google Colab
2. ✅ Docker Desktop installed and running
3. ✅ ONNX model file ready

## Step-by-Step Setup

### 1. Export Your Model to ONNX

In your Google Colab notebook, add and run this cell:

```python
from ultralytics import YOLO

# Load your trained model
model = YOLO("runs/detect/train/weights/best.pt")

# Export to ONNX
model.export(format="onnx", imgsz=640, simplify=True)

# Download the file
from google.colab import files
files.download("runs/detect/train/weights/best.onnx")
```

### 2. Place the Model File

```bash
# Create models directory if it doesn't exist
mkdir -p backend/models

# Copy your downloaded ONNX file
# Windows:
copy Downloads\best.onnx backend\models\

# Mac/Linux:
cp ~/Downloads/best.onnx backend/models/
```

### 3. Launch the Application

```bash
# Build and start all services
docker compose up --build
```

Wait for all services to start. You should see:
- ✅ Database initialized
- ✅ Backend running on port 8000
- ✅ Frontend running on port 3000

### 4. Test the Application

1. **Open the frontend**: http://localhost:3000
2. **Upload a test image** (any drone/aerial image)
3. **Click "Detect Objects"**
4. **View results** with bounding boxes
5. **Check history** in the History tab

### 5. Test the API

Visit the auto-generated API docs: http://localhost:8000/docs

Try the endpoints:
- `GET /` - Health check
- `POST /predict` - Upload and detect
- `GET /history` - View history

## Troubleshooting

### Model file not found
```
Error: FileNotFoundError: ./models/best.onnx
```

**Solution**: Ensure `best.onnx` is in `backend/models/` directory.

### Port already in use
```
Error: Port 8000 is already in use
```

**Solution**: 
```bash
# Stop the container using the port
docker compose down

# Or change the port in docker-compose.yml
```

### Database connection error
```
Error: Connection refused to database
```

**Solution**:
```bash
# Restart with fresh database
docker compose down -v
docker compose up --build
```

### Frontend can't connect to backend
```
Error: Network Error / CORS
```

**Solution**: Ensure backend is running and accessible at http://localhost:8000

## Stopping the Application

```bash
# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v
```

## Development Mode

### Backend Hot Reload
The backend automatically reloads on code changes (mounted volumes).

### Frontend Hot Reload
The frontend uses Vite HMR for instant updates.

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## Testing Without Docker

### Backend Only
```bash
cd backend
pip install -r requirements.txt

# Ensure PostgreSQL is running locally
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/drone_detection"
export MODEL_PATH="./models/best.onnx"

uvicorn app.main:app --reload
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

## Next Steps

1. ✅ Upload different drone images to test
2. ✅ Check detection accuracy on various scenarios
3. ✅ Explore the history page
4. ✅ Try the API documentation at /docs
5. ✅ Review README.md for detailed documentation

## Need Help?

- Check the main README.md for detailed documentation
- Review the API docs at http://localhost:8000/docs
- Check container logs: `docker compose logs -f`
- Ensure all prerequisites are met

Happy detecting! 🚁
