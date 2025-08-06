import axios from 'axios'

export const udpate = async (processedOrder, order) => {
    // Emitir al servidor Socket.IO (vía HTTP POST)
    try {
        await axios.post('http://localhost:5001/emit-order', processedOrder)
        console.log('Orden emitida al servidor Socket.IO:', order.orderId)
    } catch (emitError) {
        console.error('Error al emitir orden via Socket.IO:', emitError.message)
    }
}