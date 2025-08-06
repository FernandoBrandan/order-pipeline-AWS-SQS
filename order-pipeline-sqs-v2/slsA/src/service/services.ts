import { GetQueueUrlCommand, CreateQueueCommand, ListQueuesCommand, GetQueueAttributesCommand } from '@aws-sdk/client-sqs'
import { sqs } from '../config/aws'

export const queueExists = async (queueName: string): Promise<string | null> => {
    try {
        const result = await sqs.send(new GetQueueUrlCommand({ QueueName: queueName }))
        return result.QueueUrl || null
    } catch (err: any) {
        if (err.code === 'AWS.SimpleQueueService.NonExistentQueue') return null
        throw err
    }
}

export const ensureQueueExists = async (queueName: string): Promise<string> => {
    try {
        const existingUrl = await queueExists(queueName)
        if (existingUrl) {
            console.log(`\n\n✅ Cola ya existe: ${existingUrl}`)
            return existingUrl
        }

        const params = {
            QueueName: queueName,
            Attributes: {
                VisibilityTimeoutSeconds: '300',
                MessageRetentionPeriod: '1209600'
            }
        }

        const result = await sqs.send(new CreateQueueCommand(params))
        console.log(`\n\n🆕 Cola creada: ${result.QueueUrl}`)
        return result.QueueUrl!
    } catch (error) {
        console.error('\n\n❌ Error creando la cola:', error)
        throw error
    }
}

export const listQueuesWithMessageCount = async () => {
    try {
        const queuesData = await sqs.send(new ListQueuesCommand({}))
        if (!queuesData.QueueUrls || queuesData.QueueUrls.length === 0) {
            console.log('\n\n📭 No hay colas disponibles')
            return
        }

        console.log('\n\n📋 Estado de las colas:')
        for (const queueUrl of queuesData.QueueUrls) {
            const attrData = await sqs.send(new GetQueueAttributesCommand({
                QueueUrl: queueUrl,
                AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
            }))

            const available = attrData.Attributes?.ApproximateNumberOfMessages || '0'
            const inFlight = attrData.Attributes?.ApproximateNumberOfMessagesNotVisible || '0'

            console.log(`   • ${queueUrl}`)
            console.log(`     📨 Disponibles: ${available}`)
            console.log(`     ⏳ En procesamiento: ${inFlight}`)
        }
    } catch (error) {
        console.error('\n\n❌ Error listando colas:', error)
    }
}