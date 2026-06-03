# Menggunakan image Python resmi yang ringan
FROM python:3.11-slim

# Install pustaka sistem Linux yang dibutuhkan OpenCV & MediaPipe
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Salin file requirements
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode aplikasi (termasuk folder models)
COPY . .

# Expose port yang digunakan FastAPI
EXPOSE 8000

# Jalankan FastAPI server menggunakan Uvicorn
CMD ["python", "app.py"]
