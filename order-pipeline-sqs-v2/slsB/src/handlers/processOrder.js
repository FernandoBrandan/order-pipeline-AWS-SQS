
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { docClient } from '../config/dynamodb.js'
import { udpate } from '../service/socketio.js'

const TABLE_NAME = 'order-table'

export const handler = async (event) => {
    // export const handler = async (event) => {
    console.log('\n\n === PROCESANDO ÓRDENES SQS ===')
    console.log(`📨 Recibidos ${event.Records.length} mensajes`)

    for (const record of event.Records) {
        try {

            if (!record.body) throw new Error("Mensaje vacío de SQS")
            let order
            try {
                order = JSON.parse(record.body)
            } catch (e) {
                throw new Error("Formato inválido en el body del mensaje")
            }

            const correlationId = order.correlationId || 'N/A'

            console.log(`[slsB] correlationId=${correlationId} | Procesando orden: ${order.orderId}`)

            const processedOrder = {
                ...order,
                processedAt: new Date().toISOString(),
                processedBy: 'slsB-processOrder',
                sqsMessageId: record.messageId,
                status: 'processed'
            }

            console.log(`[slsB] correlationId=${correlationId} | Enviando a socket.io`)
            udpate(processedOrder, order)

            // TTL opcional
            // processedOrder.expiresAt = Math.floor(Date.now() / 1000) + 86400

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
