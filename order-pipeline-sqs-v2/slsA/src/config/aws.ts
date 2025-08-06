import { SQS } from '@aws-sdk/client-sqs'

export const sqs = new SQS({
    endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566',
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
    },
})
