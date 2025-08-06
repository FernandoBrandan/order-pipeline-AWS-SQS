import { SQSHandler, SQSEvent } from "aws-lambda"
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { docClient } from "../config/dynamodb"
import { udpate } from "../service/socketio"

const TABLE_NAME = process.env.TABLE_NAME! || 'order-table'

export const handler: SQSHandler = async (event: SQSEvent) => {
    console.log('\n\n === PROCESANDO ÓRDENES SQS ===')
    console.log(`📨 Recibidos ${event.Records.length} mensajes`)

    for (const record of event.Records) {
        try {
            const order = JSON.parse(record.body)
            const correlationId = order.correlationId || 'N/A'

            if (order.fail) throw new Error("Fallo forzado")

            console.log(`[slsB] correlationId=${correlationId} | Procesando orden: ${order.orderId}`)

            // Agregar metadatos de procesamiento
            const processedOrder = {
                ...order,
                processedAt: new Date().toISOString(),
                processedBy: 'slsB-processOrder',
                sqsMessageId: record.messageId,
                status: 'processed'
            }

            // Metodo externo de procesado
            // Devolucion al cliente via socket.io
            console.log(`[slsB] correlationId=${correlationId} | Enviando a socket.io`)
            udpate(processedOrder, order)

            // Activá TTL en la consola de DynamoDB, eligiendo expiresAt como campo TTL.
            // const ttl = Math.floor(Date.now() / 1000) + 86400 // +1 día
            // processedOrder.expiresAt = ttl

            console.log(`[slsB] correlationId=${correlationId} | Guardando en DynamoDB`)
            await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: processedOrder }))

            console.log('Orden guardada en DynamoDB:', order.orderId)

        } catch (error) {
            console.error('\n Error procesando orden:', {
                messageId: record.messageId,
                error: error instanceof Error ? error.message : String(error),
                body: record.body
            })
            throw error // Para que SQS reintente
        }
    }
    console.log('\n Batch procesado exitosamente\n')
}