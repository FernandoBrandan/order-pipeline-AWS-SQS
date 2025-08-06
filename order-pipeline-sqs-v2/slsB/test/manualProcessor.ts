

//  Trigger manual(para testing rápido)
// const params = {
//     QueueUrl: 'http://localhost:4566/000000000000/order-queue',
//     MaxNumberOfMessages: 10
// };
// const messages = await sqs.receiveMessage(params).promise();


// import { SQS, DynamoDB } from 'aws-sdk'

// const sqs = new SQS({
//     endpoint: 'http://localhost:4566',
//     region: 'us-east-1'
// })

// const dynamo = new DynamoDB.DocumentClient({
//     endpoint: 'http://localhost:4566',
//     region: 'us-east-1'
// })

// const QUEUE_URL = 'http://localhost:4566/000000000000/order-queue'
// const TABLE_NAME = 'order-table'

// async function pollAndProcess() {
//     console.log('🔍 Buscando mensajes en la cola...')

//     try {
//         const result = await sqs.receiveMessage({
//             QueueUrl: QUEUE_URL,
//             MaxNumberOfMessages: 10,
//             WaitTimeSeconds: 5, // Long polling
//             VisibilityTimeout: 30
//         }).promise()

//         if (!result.Messages || result.Messages.length === 0) {
//             console.log('📭 No hay mensajes')
//             return
//         }

//         console.log(`📨 Procesando ${result.Messages.length} mensajes...`)

//         for (const message of result.Messages) {
//             try {
//                 const order = JSON.parse(message.Body!)
//                 console.log('📦 Procesando orden:', order.orderId)

//                 // Guardar en DynamoDB
//                 await dynamo.put({
//                     TableName: TABLE_NAME,
//                     Item: {
//                         ...order,
//                         processedAt: new Date().toISOString(),
//                         status: 'processed'
//                     }
//                 }).promise()

//                 // Eliminar mensaje de la cola
//                 await sqs.deleteMessage({
//                     QueueUrl: QUEUE_URL,
//                     ReceiptHandle: message.ReceiptHandle!
//                 }).promise()

//                 console.log('✅ Orden procesada y eliminada de cola:', order.orderId)

//             } catch (error) {
//                 console.error('❌ Error procesando mensaje:', error)
//             }
//         }

//     } catch (error) {
//         console.error('❌ Error polling cola:', error)
//     }
// }

// // Ejecutar cada 3 segundos
// console.log('🚀 Iniciando procesador manual...')
// setInterval(pollAndProcess, 3000)

// // Mantener el proceso vivo
// process.on('SIGINT', () => {
//     console.log('\n👋 Deteniendo procesador...')
//     process.exit(0)
// })