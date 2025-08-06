// src/handlers/createOrder.ts
import { SendMessageCommand } from "@aws-sdk/client-sqs";

// src/config/aws.ts
import { SQS } from "@aws-sdk/client-sqs";
var sqs = new SQS({
  endpoint: process.env.AWS_ENDPOINT || "http://localhost:4566",
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test"
  }
});

// src/service/services.ts
import { GetQueueUrlCommand, CreateQueueCommand, ListQueuesCommand, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
var listQueuesWithMessageCount = async () => {
  try {
    const queuesData = await sqs.send(new ListQueuesCommand({}));
    if (!queuesData.QueueUrls || queuesData.QueueUrls.length === 0) {
      console.log("\n\n\u{1F4ED} No hay colas disponibles");
      return;
    }
    console.log("\n\n\u{1F4CB} Estado de las colas:");
    for (const queueUrl of queuesData.QueueUrls) {
      const attrData = await sqs.send(new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ["ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible"]
      }));
      const available = attrData.Attributes?.ApproximateNumberOfMessages || "0";
      const inFlight = attrData.Attributes?.ApproximateNumberOfMessagesNotVisible || "0";
      console.log(`   \u2022 ${queueUrl}`);
      console.log(`     \u{1F4E8} Disponibles: ${available}`);
      console.log(`     \u23F3 En procesamiento: ${inFlight}`);
    }
  } catch (error) {
    console.error("\n\n\u274C Error listando colas:", error);
  }
};

// src/handlers/createOrder.ts
var handler = async (event) => {
  console.log("\n\n=== INICIANDO HANDLER ===");
  try {
    if (!event.body) return { statusCode: 400, body: JSON.stringify({ error: "Falta body" }) };
    const order = JSON.parse(event.body);
    console.log("\n\n\u{1F4E6} Orden recibida:", order);
    if (!order.orderId) order.orderId = `order-${Date.now()}`;
    order.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const correlationId = `correlationId-${Date.now()}`;
    order.correlationId = correlationId;
    const queueUrl = process.env.QUEUE_URL || null;
    if (!queueUrl) throw new Error("QUEUE_URL is not defined");
    console.log("\n\n\u{1F3AF} Enviando a cola URL:", queueUrl);
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(order),
      MessageAttributes: {
        source: {
          DataType: "String",
          StringValue: "slsA"
        }
      }
    };
    const result = await sqs.send(new SendMessageCommand(params));
    console.log(`[slsA] correlationId=${correlationId} | Mensaje enviado: ${result.MessageId}`);
    await listQueuesWithMessageCount();
    const res = { message: "Pedido enviado", orderId: order.orderId, messageId: result.MessageId };
    return { statusCode: 202, body: JSON.stringify(res) };
  } catch (error) {
    console.error("\n\n\u274C Error enviando pedido:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno",
        details: error instanceof Error ? error.message : String(error)
      })
    };
  }
};
export {
  handler
};
//# sourceMappingURL=createOrder.js.map
