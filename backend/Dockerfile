FROM python:3.10-slim

RUN mkdir /app
WORKDIR /app

RUN apt update && \
    apt install -y postgresql-client

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

ENV PYTHONPATH="/app"

EXPOSE 8080

# Define build arguments
ARG WSDL
ARG LDB_TOKEN

# Set environment variables from build arguments
ENV WSDL=$WSDL
ENV LDB_TOKEN=$LDB_TOKEN

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8080 --log-level debug"]
