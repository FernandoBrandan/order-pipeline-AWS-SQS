// import { APIGatewayProxyHandler, APIGatewayProxyEvent, SQSHandler, SQSEvent } from 'aws-lambda'

// export const processSQSMessage: SQSHandler = async (event: SQSEvent) => {
//   console.log(`Processing ${event.Records.length} messages`)

//   for (const record of event.Records) {
//     try {
//       const message = JSON.parse(record.body)
//       console.log('Processing message:', message)
//       await processMessage(message)
//       console.log('Message processed successfully')
//     } catch (error) {
//       console.error('Error processing message:', error)
//       // En producción, podrías enviar a DLQ
//       throw error
//     }
//   }
// }

// const processMessage = async (message: any): Promise<void> => {
//   console.log('Message processed:', message.id)
// }
