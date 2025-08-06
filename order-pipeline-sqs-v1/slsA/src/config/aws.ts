import { SQS } from '@aws-sdk/client-sqs'

export const sqs = new SQS({
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
    },
})
