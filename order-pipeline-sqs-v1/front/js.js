 
        // Configuración
        const API_URL = 'http://localhost:3001/dev/orders' // Cambia por tu API Gateway URL
        const SOCKET_URL = 'http://localhost:5001' // Cambia por tu Socket.IO server URL

        // Referencias DOM
        const form = document.getElementById('order-form')
        const submitBtn = document.getElementById('submit-btn')
        const connectionStatus = document.getElementById('connection-status')
        const activityLog = document.getElementById('activity-log')
        const ordersList = document.getElementById('orders-list')

        // Estado
        let orders = []
        let socket = null

        // Socket.IO Connection
        function connectSocket() {
            socket = io(SOCKET_URL)

            socket.on('connect', () => {
                updateConnectionStatus(true)
                addLogEntry('✅ Conectado al servidor Socket.IO', 'success')
            })

            socket.on('disconnect', () => {
                updateConnectionStatus(false)
                addLogEntry('❌ Desconectado del servidor Socket.IO', 'error')
            })

            socket.on('orderProcessed', (data) => {
                addLogEntry(`🎉 Orden procesada: ${data.orderId}`, 'success')
                updateOrderStatus(data.orderId, 'processed', data)
                renderOrders()
            })

            socket.on('error', (error) => {
                addLogEntry(`❌ Error del servidor: ${error.message}`, 'error')
            })
        }

        // Actualizar estado de conexión
        function updateConnectionStatus(connected) {
            if (connected) {
                connectionStatus.className = 'status connected'
                connectionStatus.innerHTML = '🟢 Conectado al servidor'
            } else {
                connectionStatus.className = 'status disconnected'
                connectionStatus.innerHTML = '🔴 Desconectado del servidor'
            }
        }

        // Manejar envío de formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault()

            const orderData = {
                customerName: document.getElementById('customerName').value,
                product: document.getElementById('product').value,
                quantity: parseInt(document.getElementById('quantity').value),
                price: parseFloat(document.getElementById('price').value),
                notes: document.getElementById('notes').value,
                total: parseInt(document.getElementById('quantity').value) * parseFloat(document.getElementById('price').value)
            }

            try {
                submitBtn.disabled = true
                submitBtn.innerHTML = '⏳ Enviando...'

                addLogEntry(`📤 Enviando orden para ${orderData.customerName}...`, 'info')

                const data = {
                    "fail": true,
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

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData)
                })

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                const result = await response.json()

                // Agregar orden a la lista local
                const newOrder = {
                    ...orderData,
                    orderId: result.orderId,
                    messageId: result.messageId,
                    status: 'pending',
                    timestamp: new Date().toISOString()
                }

                orders.unshift(newOrder)
                renderOrders()

                addLogEntry(`✅ Orden enviada exitosamente: ${result.orderId}`, 'success')

                // Limpiar formulario
                form.reset()

            } catch (error) {
                addLogEntry(`❌ Error enviando orden: ${error.message}`, 'error')
            } finally {
                submitBtn.disabled = false
                submitBtn.innerHTML = '📤 Enviar Orden'
            }
        })

        // Actualizar estado de orden
        function updateOrderStatus(orderId, status, processedData = null) {
            const orderIndex = orders.findIndex(o => o.orderId === orderId)
            if (orderIndex !== -1) {
                orders[orderIndex].status = status
                if (processedData) {
                    orders[orderIndex] = { ...orders[orderIndex], ...processedData }
                }
            }
        }

        // Renderizar lista de órdenes
        function renderOrders() {
            if (orders.length === 0) {
                ordersList.innerHTML = '<p style="text-align: center; color: #888; margin: 50px 0;">Las órdenes procesadas aparecerán aquí...</p>'
                return
            }

            ordersList.innerHTML = orders.map(order => `
                <div class="order-item ${order.status === 'processed' ? 'order-processed' : ''}">
                    <div class="order-header">
                        <span class="order-id">📦 ${order.orderId}</span>
                        <span class="order-status status-${order.status}">
                            ${order.status === 'processed' ? '✅ Procesada' : '⏳ Pendiente'}
                        </span>
                    </div>
                    <div><strong>Cliente:</strong> ${order.customerName}</div>
                    <div><strong>Producto:</strong> ${order.product} (x${order.quantity})</div>
                    <div><strong>Total:</strong> $${order.total.toFixed(2)}</div>
                    <div><strong>Enviada:</strong> ${new Date(order.timestamp).toLocaleString()}</div>
                    ${order.processedAt ? `<div><strong>Procesada:</strong> ${new Date(order.processedAt).toLocaleString()}</div>` : ''}
                    ${order.notes ? `<div><strong>Notas:</strong> ${order.notes}</div>` : ''}
                </div>
            `).join('')
        }

        // Agregar entrada al log
        function addLogEntry(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString()
            const logEntry = document.createElement('div')
            logEntry.className = 'log-entry'
            logEntry.innerHTML = `
                <span class="log-time">[${timestamp}]</span>
                <span class="log-${type}">${message}</span>
            `
            activityLog.appendChild(logEntry)
            activityLog.scrollTop = activityLog.scrollHeight
        }

        // Limpiar log
        function clearLog() {
            activityLog.innerHTML = ''
        }

        // Inicializar aplicación
        document.addEventListener('DOMContentLoaded', () => {
            addLogEntry('🚀 Aplicación iniciada', 'info')
            connectSocket()
        })

        // Reconectar automáticamente si se pierde la conexión
        setInterval(() => {
            if (socket && !socket.connected) {
                addLogEntry('🔄 Intentando reconectar...', 'info')
                connectSocket()
            }
        }, 5000); 
