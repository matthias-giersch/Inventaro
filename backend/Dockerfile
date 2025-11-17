FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./

RUN apt-get update && \
    apt-get install -y netcat-openbsd && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /var/lib/apt/lists/*

COPY ./app ./app
COPY wait_for_db.sh ./wait_for_db.sh

RUN chmod +x ./wait_for_db.sh

ENV PYTHONUBUFFERED=1

EXPOSE 8000

CMD ["./wait_for_db.sh", "auth_db:5432", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
