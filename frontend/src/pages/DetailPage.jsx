import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDetection, getImageUrl } from '../utils/api'
import ImageCanvas from '../components/ImageCanvas'
import DetectionList from '../components/DetectionList'
import StatsChart from '../components/StatsChart'

function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detection, setDetection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    loadDetection()
  }, [id])
  
  const loadDetection = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getDetection(id)
      setDetection(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load detection')
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }
  
  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
        </div>
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
          Loading detection details...
        </p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="card">
        <div className="alert error">
          <strong>Error:</strong> {error}
        </div>
        <button onClick={() => navigate('/history')}>
          ← Back to History
        </button>
      </div>
    )
  }
  
  if (!detection) {
    return (
      <div className="card">
        <div className="alert info">
          <p>Detection not found.</p>
        </div>
        <button onClick={() => navigate('/history')}>
          ← Back to History
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/history')} className="secondary">
            ← Back to History
          </button>
        </div>
        
        <h2>Detection Details</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '1rem',
          marginTop: '1.5rem',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.95rem'
        }}>
          <strong>Detection ID:</strong>
          <span>{detection.id}</span>
          
          <strong>Image File:</strong>
          <span>{detection.image_filename}</span>
          
          <strong>Upload Date:</strong>
          <span>{formatDate(detection.created_at)}</span>
          
          <strong>Total Objects:</strong>
          <span style={{ color: '#27ae60', fontWeight: '600' }}>
            {detection.total_objects}
          </span>
        </div>
        
        <h3>Image with Detections</h3>
        <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          <ImageCanvas
            imageUrl={getImageUrl(detection.image_url)}
            detections={detection.detections}
          />
        </div>
        
        <DetectionList detections={detection.detections} />
        
        <StatsChart detections={detection.detections} />
      </div>
    </div>
  )
}

export default DetailPage
