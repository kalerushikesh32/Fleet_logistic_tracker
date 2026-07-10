# ---- Build frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Runtime ----
FROM python:3.12-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy compiled frontend into FastAPI's static files directory
COPY --from=frontend-build /frontend/dist ./static

# Create data directory for SQLite
RUN mkdir -p data

EXPOSE 8000

# Run migrations then start server
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
