import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const uploadImage = async (file, confThreshold, iouThreshold) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const params = {}
  if (confThreshold !== undefined) params.conf_threshold = confThreshold
  if (iouThreshold !== undefined) params.iou_threshold = iouThreshold
  
  const response = await api.post('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params
  })
  
  return response.data
}

export const getHistory = async (page = 1, pageSize = 10) => {
  const response = await api.get('/history', {
    params: { page, page_size: pageSize }
  })
  return response.data
}

export const getDetection = async (id) => {
  const response = await api.get(`/detection/${id}`)
  return response.data
}

export const getImageUrl = (path) => {
  return `${API_BASE_URL}${path}`
}

export default api
