import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password })
  return response.data
}

export const getProfile = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

export const updateProfile = async (data) => {
  const response = await api.put('/auth/me', data)
  return response.data
}

export const uploadAvatar = async (file) => {
  // Upload goes to our backend which securely calls Cloudinary with API keys
  // API key/secret are never exposed to the browser
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/auth/avatar/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data  // returns updated user with avatar_url
}
