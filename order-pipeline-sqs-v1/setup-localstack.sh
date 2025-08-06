#!/bin/bash

echo "Configurando LocalStack..."
echo "⏳ Esperando LocalStack..."
until curl -s http://localhost:4566/_localstack/health | grep -q "sqs.*available"; do
  sleep 2
done
echo "✅ LocalStack listo!"

# Según la documentación oficial de LocalStack
awslocal sqs create-queue --queue-name dead-letter-queue
awslocal sqs create-queue --queue-name input-queue
# Crear las colas (DLQ primero)
echo "📦 Creando cola SQS...orders-queue-dlq"
aws --endpoint-url=http://localhost:4566 sqs create-queue \
    --queue-name orders-queue-dlq \
    --region us-east-1

echo "📦 Creando cola SQS...order-queue"
aws --endpoint-url=http://localhost:4566 sqs create-queue \
    --queue-name order-queue \
    --region us-east-1

# Configurar la DLQ en la cola principal - FORMATO CORRECTO
aws  --endpoint-url=http://localhost:4566 sqs set-queue-attributes \
  --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/order-queue \
  --attributes '{ 
    "RedrivePolicy": "{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:orders-queue-dlq\",\"maxReceiveCount\":\"1\"}"
  }'

# Crear tabla DynamoDB
echo "🗄️ Creando tabla DynamoDB..."
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
    --table-name order-table \
    --attribute-definitions AttributeName=orderId,AttributeType=S \
    --key-schema AttributeName=orderId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

echo "🗄️ Creando tabla DynamoDB para DLQ..."
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
    --table-name order-dlq \
    --attribute-definitions \
        AttributeName=messageId,AttributeType=S \
    --key-schema \
        AttributeName=messageId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1 

# Verificar recursos creados
echo "✅ Verificando recursos..."
echo "Colas SQS:"
aws --endpoint-url=http://localhost:4566 sqs list-queues --region us-east-1

echo "Tablas DynamoDB:"
aws --endpoint-url=http://localhost:4566 dynamodb list-tables --region us-east-1

echo "🎉 Setup completado!"
