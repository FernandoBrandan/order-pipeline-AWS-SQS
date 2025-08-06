import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
const dynamoClient = new DynamoDBClient({
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'root',
        secretAccessKey: 'root',
    },
})

export const docClient = DynamoDBDocumentClient.from(dynamoClient)