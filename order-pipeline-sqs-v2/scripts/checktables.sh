#!/bin/bash

echo "🔍 Verificando tabla DLQ..."

# Escanear todos los elementos de la tabla order-dlq
aws dynamodb scan \
  --table-name order-dlq \
  --region us-east-1 \
  --endpoint-url http://localhost:4566

echo -e "\n📊 Conteo de elementos en DLQ:"
aws dynamodb describe-table \
  --table-name order-dlq \
  --region us-east-1 \
  --endpoint-url http://localhost:4566 \
  --query 'Table.ItemCount'

# SSM Parameter Store con la URL de una cola, por ejemplo order-queue:
aws --endpoint-url=http://localhost:4566 ssm put-parameter \
  --name "/queues/order" \
  --type String \
  --value "http://localhost:4566/000000000000/order-queue" \
  --region us-east-1