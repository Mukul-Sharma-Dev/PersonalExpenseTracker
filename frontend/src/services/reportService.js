import api from './api'

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.parentNode.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const downloadCSV = async (params = {}) => {
  const response = await api.get('/reports/csv', {
    params,
    responseType: 'blob',
  })
  const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`
  triggerDownload(response.data, filename)
}

export const downloadExcel = async (params = {}) => {
  const response = await api.get('/reports/excel', {
    params,
    responseType: 'blob',
  })
  const filename = `expenses_${new Date().toISOString().split('T')[0]}.xlsx`
  triggerDownload(response.data, filename)
}

export const getReportPreview = async (params = {}) => {
  const response = await api.get('/reports/preview', { params })
  return response.data
}
