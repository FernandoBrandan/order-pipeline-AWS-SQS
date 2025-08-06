import { SendMessageCommand } from '@aws-sdk/client-sqs'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { sqs } from '../config/aws'
import { v4 as uuidv4 } from 'uuid'

import { listQueuesWithMessageCount } from '../service/services'

export const handler = async (event: APIGatewayProxyEvent) => {
    console.log('\n\n=== INICIANDO HANDLER ===')
    // Primero verificar/crear la cola
    // await ensureQueueExists('order-queue')
    // await listQueuesWithMessageCount()

    try {
        if (!event.body) return { statusCode: 400, body: JSON.stringify({ error: 'Falta body' }) }
        const order = JSON.parse(event.body)
        console.log('\n\n📦 Orden recibida:', order)

        // Agregar timestamp y ID único si no existe
        if (!order.orderId) order.orderId = `order-${Date.now()}`
        order.timestamp = new Date().toISOString()
        // const correlationId = uuidv4()
        const correlationId = `correlationId-${Date.now()}`
        order.correlationId = correlationId

        const queueUrl = process.env.QUEUE_URL || null
        if (!queueUrl) throw new Error('QUEUE_URL is not defined')

        console.log('\n\n🎯 Enviando a cola URL:', queueUrl)
        const params = {
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(order),
            MessageAttributes: {
                source: {
                    DataType: 'String',
                    StringValue: 'slsA'
                }
            }
        }

        const result = await sqs.send(new SendMessageCommand(params))
        console.log(`[slsA] correlationId=${correlationId} | Mensaje enviado: ${result.MessageId}`)

        // Verificar que se envió
        await listQueuesWithMessageCount()

        const res = { message: 'Pedido enviado', orderId: order.orderId, messageId: result.MessageId }
        return { statusCode: 202, body: JSON.stringify(res) }
    } catch (error) {
        console.error('\n\n❌ Error enviando pedido:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error interno',
                details: error instanceof Error ? error.message : String(error)
            })
        }
    }
}
