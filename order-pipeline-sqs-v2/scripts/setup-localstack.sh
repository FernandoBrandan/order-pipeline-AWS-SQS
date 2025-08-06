#!/bin/bash

echo "Configurando LocalStack..."
echo "⏳ Esperando LocalStack..."
until curl -s http://localhost:4566/_localstack/health | grep -q "sqs.*available"; do
  sleep 2
done
echo "✅ LocalStack listo!"   

echo "📦 Creando cola SQS...order-queue"
aws --endpoint-url=http://localhost:4566 sqs create-queue \
    --queue-name order-queue \
    --region us-east-1

# Crear tabla DynamoDB
echo "🗄️ Creando tabla DynamoDB..."
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
    --table-name order-table \
    --attribute-definitions AttributeName=orderId,AttributeType=S \
    --key-schema AttributeName=orderId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

# Verificar recursos creados
echo "✅ Verificando recursos..."
echo "Colas SQS:"
aws --endpoint-url=http://localhost:4566 sqs list-queues --region us-east-1

aws --endpoint-url=http://localhost:4566 sqs receive-message \
  --queue-url http://sqs.us-east-1.localhost:4566/000000000000/slsB-local-orderQueue \
  --max-number-of-messages 10 \
  --region us-east-1


echo "Tablas DynamoDB:"
aws --endpoint-url=http://localhost:4566 dynamodb list-tables --region us-east-1

echo "🎉 Setup completado!"
