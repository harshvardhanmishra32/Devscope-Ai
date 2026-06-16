FROM python:3.12-slim

WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend source
COPY . .

# Set Python path so imports work
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Run with app.main:app since WORKDIR is /app (the backend folder)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
