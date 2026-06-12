import api from './api'

export const getBudget = async (params = {}) => {
  const response = await api.get('/budget', { params })
  return response.data
}

export const setBudget = async (data) => {
  const response = await api.post('/budget', data)
  return response.data
}

export const updateBudget = async (id, data) => {
  const response = await api.put(`/budget/${id}`, data)
  return response.data
}

export const deleteBudget = async (id) => {
  const response = await api.delete(`/budget/${id}`)
  return response.data
}
