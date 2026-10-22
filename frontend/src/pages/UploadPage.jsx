import { useState } from 'react'
import { uploadImage, getImageUrl } from '../utils/api'
import ImageCanvas from '../components/ImageCanvas'
import DetectionList from '../components/DetectionList'
import StatsChart from '../components/StatsChart'

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [confThreshold, setConfThreshold] = useState(0.25)
  const [iouThreshold, setIouThreshold] = useState(0.45)
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
      setError(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await uploadImage(selectedFile, confThreshold, iouThreshold)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process image')
    } finally {
      setLoading(false)
    }
  }
  
  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }
  
  return (
    <div>
      <div className="card">
        <h2>Upload Image for Object Detection</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
          Upload an aerial image from your drone to detect objects using YOLO11n trained on VisDrone dataset.
        </p>
        
        {error && (
          <div className="alert error">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
        />
        
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Detection Settings</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ minWidth: '180px', fontWeight: '500' }}>
                Confidence Threshold: {(confThreshold * 100).toFixed(0)}%
              </span>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                disabled={loading}
                style={{ flex: 1 }}
              />
            </label>
            <p style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '0.25rem', marginLeft: '180px' }}>
              Higher = fewer but more confident detections
            </p>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ minWidth: '180px', fontWeight: '500' }}>
                IoU Threshold: {(iouThreshold * 100).toFixed(0)}%
              </span>
              <input
                type="range"
                min="0.3"
                max="0.7"
                step="0.05"
                value={iouThreshold}
                onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                disabled={loading}
                style={{ flex: 1 }}
              />
            </label>
            <p style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '0.25rem', marginLeft: '180px' }}>
              Removes overlapping boxes (Non-Maximum Suppression)
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={handleSubmit} disabled={!selectedFile || loading}>
            {loading ? 'Processing...' : 'Detect Objects'}
          </button>
          <button className="secondary" onClick={handleReset} disabled={loading}>
            Reset
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
          </div>
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
            Running object detection...
          </p>
        </div>
      )}
      
      {result && !loading && (
        <div className="card">
          <h2>Detection Results</h2>
          <div style={{ marginBottom: '2rem' }}>
            <ImageCanvas
              imageUrl={getImageUrl(result.image_url)}
              detections={result.detections}
            />
          </div>
          <DetectionList detections={result.detections} />
          <StatsChart detections={result.detections} />
        </div>
      )}
      
      {preview && !result && !loading && (
        <div className="card">
          <h2>Preview</h2>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
          />
        </div>
      )}
    </div>
  )
}

export default UploadPage
