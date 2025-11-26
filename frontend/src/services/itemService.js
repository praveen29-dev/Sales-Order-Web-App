import api from './api'

export const itemService = {
  getAllItems: async () => {
    const response = await api.get('/items')
    return response.data
  },
  getItemById: async (id) => {
    const response = await api.get(`/items/${id}`)
    return response.data
  },
  getItemByCode: async (code) => {
    const response = await api.get(`/items/code/${code}`)
    return response.data
  },
}

