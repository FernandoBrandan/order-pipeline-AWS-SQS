import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'


// 💡 Recomendaciones
// A futuro, si lo vas a desplegar en AWS:
// Reemplazá localhost por una URL pública (API Gateway, ALB, etc.).

// Considerá usar API Gateway WebSocket o SNS + WebSocket Server si querés mantener un patrón más escalable y serverless.

// Podés usar un queue adicional o SNS Topic para fanout (SQS → procesamiento → SNS → web server con Socket.IO).

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())

// Endpoint HTTP para recibir órdenes procesadas
app.post('/emit-order', (req, res) => {
    const order = req.body
    console.log('📡 Emitiendo orden procesada via Socket.IO:', order.orderId)
    io.emit('orderProcessed', order)
    res.status(200).json({ success: true })
})

io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id)

    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado:', socket.id)
    })
})

server.listen(5001, () => {
    console.log('🚀 Servidor Socket.IO escuchando en http://localhost:3001')
})
