// import { SQSHandler } from 'aws-lambda'
// import { PutCommand } from '@aws-sdk/lib-dynamodb'
// import { docClient } from '../config/dynamodb'

// const TABLE_NAME = process.env.DLQ_TABLE || 'order-dlq'

// export const handler: SQSHandler = async (event) => {
//     console.log('\n\n === MANEJADOR DE DLQ ===')
//     console.log(`  Recibidos ${event.Records.length} mensajes de la DLQ`)

//     for (const record of event.Records) {
//         try {
//             const body = JSON.parse(record.body)
//             console.log(' Mensaje fallido:', { messageId: record.messageId, body })

//             // Guardar el mensaje en una tabla de fallos (opcional)
//             await docClient.send(new PutCommand({
//                 TableName: TABLE_NAME,
//                 Item: {
//                     messageId: record.messageId,
//                     failedAt: new Date().toISOString(),
//                     reason: 'Procesamiento fallido en cola principal',
//                     originalPayload: JSON.stringify(body),
//                 }
//             }))
//         } catch (error) {
//             console.error('❌ Error procesando mensaje de la DLQ:', {
//                 messageId: record.messageId,
//                 error: error instanceof Error ? error.message : String(error),
//             })
//         }
//     }
//     console.log('✅ DLQ procesada correctamente\n')
// }
