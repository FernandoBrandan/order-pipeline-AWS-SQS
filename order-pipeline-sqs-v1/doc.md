# Soluciones

### 1. Integración activa (event-driven) → Lambda suscripta a la cola SQS

- ¿Cómo funciona? : AWS (o LocalStack) se encarga de invocar automáticamente la Lambda cada vez que un mensaje llega a la cola.
- Ventajas:
  - No hace falta hacer polling manual.
  - Se escala automáticamente (puede procesar en paralelo si se configura `batchSize`, `maxConcurrency`, etc.).
  - Es el método recomendado en arquitecturas serverless.
- Modo en que recibe el mensaje: Activa (event-driven).
- Cómo se configura (ejemplo `serverless.yml`):
  ```yaml
  functions:
    myConsumer:
      handler: handler.processMessage
      events:
        - sqs:
            arn:
              Fn::GetAtt: [MyQueue, Arn]
  ```
 
### 2. Consulta manual (polling) → Lambda o microservicio hace `ReceiveMessage`

- ¿Cómo funciona? El consumidor ejecuta manualmente una consulta a la cola SQS usando el SDK (`receiveMessage`) para ver si hay mensajes.
- Modo en que recibe el mensaje: Pasiva o por consulta (polling manual).
- Ventajas:
  - Total control sobre el momento en que se procesan los mensajes.
  - Útil si no querés un procesamiento automático o continuo.
- Desventajas:
  - No es serverless.
  - Necesita más lógica: polling, manejo de errores, eliminación del mensaje, etc.
  - Puede tener costo adicional si se consulta la cola frecuentemente sin mensajes.
  
### 3. Worker o servicio dedicado (no Lambda)

- Si el consumidor es un container, microservicio, worker, etc., puede:
  - Hacer long polling (`ReceiveMessage` con `WaitTimeSeconds`), reduciendo el costo y latencia.
  - Procesar en lotes (`MaxNumberOfMessages`).
  - Ser parte de un sistema más complejo, como parte de un message bus.
- Modo en que recibe el mensaje:
   También consulta, pero puede ser más eficiente que el polling clásico. 

### 4. Fan-out con SNS + SQS + múltiples consumidores

- Podés tener una arquitectura donde:
  - Un productor publica a un topic SNS.
  - Ese topic entrega el mensaje a múltiples colas SQS.
  - Cada cola tiene su propio consumidor (Lambda u otro).
- Modo de recepción:
   Cada Lambda o servicio sigue alguna de las opciones anteriores (activa o por polling), pero la fan-out permite distribución a múltiples consumidores. 

<mark>---

# Cambios Clave para Reducir Costos de Polling SQS

## Problema Original
- Los logs muestran polling constante:
- AWS sqs.ReceiveMessage => 200 (cada pocos segundos)
- Esto genera costos por requests vacías continuas.

## Soluciones Implementadas

### 1. Long Polling en las Colas SQS
```yaml
ReceiveMessageWaitTimeSeconds: 20  #  CLAVE - Reduce requests vacías 90%
```
- En lugar de polling cada segundo, espera hasta 20s por mensaje
- Reduce drasticamente el número de requests

### 2. Batching en Lambda
```yaml
batchSize: 10                           # Procesa hasta 10 mensajes juntos
maximumBatchingWindowInSeconds: 20      # Espera 20s para formar batch
```
- Menos invocaciones de Lambda
- Más eficiente por mensaje

### 3. Concurrencia Controlada
```yaml
maximumConcurrency: 2                   # Solo 2 lambdas simultáneas
```
- Para DLQ: `maximumConcurrency: 1` (menos urgente)
- Evita polling excesivo

### 4. Plugin serverless-offline-sqs Optimizado
```yaml
pollingInterval: 30000  # 30 segundos entre polls local
```

## Impacto de cambios

Antes:
- Requests cada 1-2 segundos
- 90% requests vacías

Después:
- Long polling: espera hasta 20s
- Batching: menos invocaciones
- Requests vacías reducidas 90% 