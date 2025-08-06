# Proyecto Serverless con SQS - `slsA` -> `slsB`

## <mark> Version 2: serverless-lift - crea una cola SQS + Lambda asociada automáticamente.

Este proyecto implementa una arquitectura `serverless distribuida`, compuesta por dos servicios desacoplados que se comunican asíncronamente mediante `SQS`, utilizando:

* `AWS Lambda`
* `DynamoDB`
* `Serverless Framework`
* `LocalStack para entorno local`
* `TypeScript + Jest / Supertest para tests`

## Objetivo funcional 

Crear un pedido desde una API HTTP (`slsA`) -> enviarlo a una cola SQS -> procesarlo en otra Lambda (`slsB`) -> guardarlo en DynamoDB.

## Flujo de eventos

```plaintext
Cliente
  │
[slsA] Lambda: POST /orders (API Gateway + Lambda para recibir pedidos  )
  │
  |-- Valida input
  |-- Publica mensaje JSON en SQS
       |
[SQS Queue] ← creada por slsB (o stack externo) (desacoplar los servicios)
       |
[slsB] Lambda: Procesa mensaje (Lambda consumidora de la cola + DynamoDB)
  |-- Loguea
  |-- Guarda en DynamoDB 
```

## Casos reales 

* Un sistema de ventas que recibe órdenes y las encola para ser procesadas luego.
* Un backend que genera pedidos y otro que los factura, despacha o notifica.
* Un flujo ETL, procesamiento batch o pipeline de eventos.

## Herramientas de LocalStack

| Herramienta                    | Propósito                                    |
| ------------------------------ | -------------------------------------------- |
| `LocalStack`		               | Simulación de AWS (SQS, Lambda, DynamoDB)    |
| `serverless-offline`           | Ejecutar Lambdas HTTP localmente             |
| `serverless-localstack`        | Integrar Serverless Framework con LocalStack |
| `serverless-offline-sqs`       | Simular triggers SQS -> Lambda localmente    |
| `serverless-offline-sqs-dlq`   | Simular Dead Letter Queue - retries          |

## Issue

| Fase | Descripción                           | Ejemplo                          |
| ---- | ------------------------------------- | -------------------------------- |
| v1   | Envío de mensajes simples con SQS     | Crear pedido y loguearlo         |
| v2   | Persistencia en DynamoDB (`slsB`)     | Guardar los pedidos              |
| v3   | Notificaciones salientes (SNS, mails) | Confirmar al cliente             |
| v4   | Trazabilidad                          | `correlationId`, logs end-to-end |
| v5   | Resiliencia                           | Dead Letter Queue, retries, TTL  | 

# Notas

- Outputs de Stack: Servicio de configuración, pasar información entre servicios en AWS 
```yaml
resources:
  Outputs:
    OrderQueueUrl:
      Value:
        Ref: OrderQueue
      Export:
        Name: order-queue-url
```
```yaml
environment:
  QUEUE_URL:
    Fn::ImportValue: order-queue-url
```

# Test

```json
{
  "orderId": "abc123",
  "customer": {
    "id": "u001",
    "name": "Ana Gómez"
  },
  "items": [
    { "productId": "p1", "quantity": 2 },
    { "productId": "p2", "quantity": 1 }
  ],
  "total": 150.75,
  "timestamp": "2025-08-02T15:00:00Z"
}
```
```sh
curl -X POST http://localhost:3001/dev/orders   -H "Content-Type: application/json"   -d '{
      "orderId": "abc123",
      "customer": {
        "id": "u001",
        "name": "Ana Gómez"
      },
      "items": [
        { "productId": "p1", "quantity": 2 },
        { "productId": "p2", "quantity": 1 }
      ],
      "total": 150.75,
      "timestamp": "2025-08-02T15:00:00Z"
  }'
```
