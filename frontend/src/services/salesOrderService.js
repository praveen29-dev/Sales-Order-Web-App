import api from './api'

export const salesOrderService = {
  getAllSalesOrders: async () => {
    const response = await api.get('/salesorders')
    return response.data
  },
  getSalesOrderById: async (id) => {
    const response = await api.get(`/salesorders/${id}`)
    return response.data
  },
  createSalesOrder: async (orderData) => {
    const response = await api.post('/salesorders', orderData)
    return response.data
  },
  updateSalesOrder: async (id, orderData) => {
    const response = await api.put(`/salesorders/${id}`, orderData)
    return response.data
  },
  deleteSalesOrder: async (id) => {
    const response = await api.delete(`/salesorders/${id}`)
    return response.data
  },
}

