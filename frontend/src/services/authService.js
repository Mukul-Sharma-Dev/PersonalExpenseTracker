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
  // Step 1: Upload directly to Cloudinary (unsigned preset - no API secret needed)
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'expense-tracker-uploads')
  formData.append('folder', 'expense-tracker/avatars')

  const cloudRes = await fetch(
    'https://api.cloudinary.com/v1_1/du8w7npyq/image/upload',
    { method: 'POST', body: formData }
  )
  if (!cloudRes.ok) {
    const err = await cloudRes.json()
    throw new Error(err?.error?.message || 'Cloudinary upload failed')
  }
  const cloudData = await cloudRes.json()
  const imageUrl = cloudData.secure_url  // e.g. https://res.cloudinary.com/...

  // Step 2: Save the Cloudinary URL to our backend DB
  const response = await api.patch('/auth/avatar', { avatar_url: imageUrl })
  return response.data  // returns updated user with avatar_url
}
