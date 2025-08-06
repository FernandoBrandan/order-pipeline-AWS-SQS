```json
{
  "orderId": "abc123",
  "customer": {
    "id": "u001",
    "name": "Ana Gómez"
  },
  "items": [
    { "productId": "p1", "quantity": 2 },
    { "productId": "p2", "quantity": 1 }
  ],
  "total": 150.75,
  "timestamp": "2025-08-02T15:00:00Z"
}
```
```sh
curl -X POST http://localhost:3001/dev/orders   -H "Content-Type: application/json"   -d '{
      "orderId": "abc123",
      "customer": {
        "id": "u001",
        "name": "Ana Gómez"
      },
      "items": [
        { "productId": "p1", "quantity": 2 },
        { "productId": "p2", "quantity": 1 }
      ],
      "total": 150.75,
      "timestamp": "2025-08-02T15:00:00Z"
  }'
```