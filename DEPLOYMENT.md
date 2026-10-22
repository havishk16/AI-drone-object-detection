# 🚢 Deployment Guide

## Local Development (Current Setup)

The current `docker-compose.yml` is configured for local development with:
- Volume mounts for hot reload
- Exposed ports for direct access
- Development mode for both frontend and backend

## Production Deployment

### Option 1: Docker Compose (Simple VPS)

**1. Update docker-compose.yml for production:**

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      DATABASE_URL: ${DATABASE_URL}
      MODEL_PATH: ./models/best.onnx
    volumes:
      - ./backend/models:/app/models:ro
      - uploads:/app/uploads
    restart: unless-stopped
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - uploads:/var/www/uploads:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
  uploads:
```

**2. Create production Dockerfile for frontend:**

`frontend/Dockerfile.prod`:
```dockerfile
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**3. Add nginx configuration:**

`nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        # Frontend
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Uploaded images
        location /uploads/ {
            alias /var/www/uploads/;
        }
    }
}
```

### Option 2: Cloud Deployment (AWS)

**Architecture:**
- **ECS/Fargate**: Run backend containers
- **S3**: Store uploaded images and model
- **RDS**: PostgreSQL database
- **CloudFront**: CDN for frontend
- **ALB**: Load balancer

**Estimated Costs** (us-east-1):
- RDS db.t3.micro: ~$15/month
- ECS Fargate (0.25 vCPU, 0.5GB): ~$10/month
- S3 storage: ~$0.023/GB
- Data transfer: Variable

### Option 3: Cloud Deployment (GCP)

**Architecture:**
- **Cloud Run**: Serverless containers
- **Cloud SQL**: PostgreSQL
- **Cloud Storage**: Images and model
- **Cloud CDN**: Frontend delivery

**Estimated Costs:**
- Cloud SQL db-f1-micro: ~$10/month
- Cloud Run: Pay per request (~$0.00002400/request)
- Cloud Storage: ~$0.020/GB

## Environment Variables for Production

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Backend
MODEL_PATH=./models/best.onnx
CONF_THRESHOLD=0.25
IOU_THRESHOLD=0.45
UPLOAD_DIR=./uploads

# Security
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=https://your-domain.com

# Frontend
VITE_API_URL=https://api.your-domain.com
```

## Security Checklist

- [ ] Use strong database passwords
- [ ] Enable HTTPS with SSL certificates (Let's Encrypt)
- [ ] Set up firewall rules (only expose necessary ports)
- [ ] Implement rate limiting on API endpoints
- [ ] Add authentication for sensitive endpoints
- [ ] Regular security updates for dependencies
- [ ] Enable database backups
- [ ] Monitor logs and set up alerts
- [ ] Implement CORS properly
- [ ] Use environment variables for secrets

## Performance Optimization

### Backend
- Use gunicorn/uvicorn with multiple workers
- Implement caching for frequently accessed data
- Use Redis for session management
- Optimize ONNX model (quantization)
- Implement request queuing for heavy inference

### Frontend
- Minify and bundle assets
- Implement lazy loading
- Use CDN for static assets
- Enable gzip compression
- Implement service workers for caching

### Database
- Add indexes on frequently queried columns
- Implement connection pooling
- Regular VACUUM and ANALYZE
- Consider read replicas for scaling

## Monitoring

### Recommended Tools
- **Application**: Sentry for error tracking
- **Infrastructure**: Prometheus + Grafana
- **Logs**: ELK Stack or CloudWatch
- **Uptime**: UptimeRobot or Pingdom

### Key Metrics to Monitor
- API response times
- Inference latency
- Database query performance
- Error rates
- CPU/Memory usage
- Disk space

## Backup Strategy

### Database Backups
```bash
# Daily automated backup
docker exec postgres pg_dump -U postgres drone_detection > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i postgres psql -U postgres drone_detection < backup_20261022.sql
```

### Model and Upload Backups
- Regular S3/Cloud Storage sync
- Version control for models
- 30-day retention policy

## Scaling Considerations

### Horizontal Scaling
- Load balance backend containers
- Separate read/write database operations
- Use Redis for shared state
- Implement message queue (Celery + RabbitMQ)

### Vertical Scaling
- Upgrade database instance
- Add more CPU/memory to containers
- Use GPU instances for faster inference

## CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push Docker images
        run: |
          docker compose build
          docker compose push
      
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && docker compose pull && docker compose up -d'
```

## Cost Optimization

1. **Use spot instances** for non-critical workloads
2. **Implement auto-scaling** based on traffic
3. **Cache static assets** on CDN
4. **Compress images** before storage
5. **Set up lifecycle policies** for old data
6. **Use reserved instances** for steady-state resources

## Support and Maintenance

- Regular dependency updates
- Security patch monitoring
- Performance profiling
- User feedback collection
- A/B testing new features
