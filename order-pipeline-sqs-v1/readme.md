# Proyecto Serverless con SQS – `slsA` ➜ `slsB`

# <mark> DISCONTINUADO
## <mark> PROBLEMA: COSTOSO AL SER UNA ESCUCHA ACTIVA HACIA LAS COLAS DE MENSAJES
## <mark> SOLUCION 1: Consulta manual (polling)
## <mark> SOLUCION 2: Worker o servicio dedicado (no Lambda)
## <mark> MEJOR - SOLUCION 3: serverless-lift - crea una cola SQS + Lambda asociada automáticamente.

Este proyecto implementa una arquitectura **serverless distribuida**, compuesta por dos servicios desacoplados que se comunican asíncronamente mediante **SQS**, utilizando:

* **AWS Lambda**
* **DynamoDB**
* **Serverless Framework**
* **LocalStack para entorno local**
* **TypeScript + Jest / Supertest para tests**

## Objetivo funcional 

> Crear un pedido desde una API HTTP (`slsA`) ➜ enviarlo a una cola SQS ➜ procesarlo en otra Lambda (`slsB`) ➜ guardarlo en DynamoDB.

## Flujo de eventos

```plaintext
Cliente
  │
  ▼
[slsA] Lambda: POST /orders (API Gateway + Lambda para recibir pedidos  )
  │
  ├── Valida input
  └── Publica mensaje JSON en SQS
       │
       ▼
[SQS Queue] ← creada por slsB (o stack externo) (desacoplar los servicios)
       │
       ▼
[slsB] Lambda: Procesa mensaje (Lambda consumidora de la cola + DynamoDB)
  ├── Loguea
  └── Guarda en DynamoDB 
```
## <mark> Nota importante de precio

- Escucha activa al servidor esperando un mensaje tiene costo. 
- `sls_sqs_localstack  | 2025-08-06T04:48:19.785  INFO --- [et.reactor-1] localstack.request.aws     : AWS sqs.ReceiveMessage => 200`
- `sls_sqs_localstack  | 2025-08-06T04:48:19.785  INFO --- [et.reactor-1] localstack.request.aws     : AWS sqs.ReceiveMessage => 200`
- `sls_sqs_localstack  | 2025-08-06T04:48:19.785  INFO --- [et.reactor-1] localstack.request.aws     : AWS sqs.ReceiveMessage => 200`

- En su lugar modificar serverless.yml realizan long polling

## Casos reales 

* Un sistema de ventas que recibe órdenes y las encola para ser procesadas luego.
* Un backend que genera pedidos y otro que los factura, despacha o notifica.
* Un flujo ETL, procesamiento batch o pipeline de eventos.

## Herramientas de LocalStack

| Herramienta                | Propósito                                    |
| -------------------------- | -------------------------------------------- |
| **LocalStack**		         | Simulación de AWS (SQS, Lambda, DynamoDB)    |
| **serverless-offline**     | Ejecutar Lambdas HTTP localmente             |
| **serverless-localstack**  | Integrar Serverless Framework con LocalStack |
| **serverless-offline-sqs** | Simular triggers SQS → Lambda localmente     |

`serverless-offline-sqs:Este plugin hace "polling" continuo a la cola y, si detecta mensajes, invoca la Lambda.`

`serverless-lift crea un binding eficiente, crea la cola SQS como constructo de alto nivel y vincula directamente una Lambda como worker.`

`Conclusion lift reemplaza a sqs`

## Issue

| Fase | Descripción                           | Ejemplo                          |
| ---- | ------------------------------------- | -------------------------------- |
| v1   | Envío de mensajes simples con SQS     | Crear pedido y loguearlo         |
| v2   | Persistencia en DynamoDB (`slsB`)     | Guardar los pedidos              |
| v3   | Notificaciones salientes (SNS, mails) | Confirmar al cliente             |
| v4   | Trazabilidad                          | `correlationId`, logs end-to-end |
| v5   | Resiliencia                           | Dead Letter Queue, retries, TTL  | 

# Notas

- v5: offline-sqs : los DLQ y retries de SQS no funciona totalmente, solo genera un intento

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
