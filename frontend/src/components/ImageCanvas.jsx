import { useEffect, useRef } from 'react'

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
]

function ImageCanvas({ imageUrl, detections }) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  
  useEffect(() => {
    if (!imageUrl || !detections || detections.length === 0) return
    
    const image = imageRef.current
    const canvas = canvasRef.current
    
    if (!image || !canvas) return
    
    const drawDetections = () => {
      const ctx = canvas.getContext('2d')
      
      // Set canvas size to match image display size
      canvas.width = image.width
      canvas.height = image.height
      
      // Calculate scale factors
      const scaleX = image.width / image.naturalWidth
      const scaleY = image.height / image.naturalHeight
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw detections
      detections.forEach((det, index) => {
        const { bbox, class_name, confidence } = det
        const color = COLORS[index % COLORS.length]
        
        // Scale coordinates
        const x1 = bbox.x1 * scaleX
        const y1 = bbox.y1 * scaleY
        const width = (bbox.x2 - bbox.x1) * scaleX
        const height = (bbox.y2 - bbox.y1) * scaleY
        
        // Draw bounding box
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.strokeRect(x1, y1, width, height)
        
        // Draw label background
        const label = `${class_name} ${(confidence * 100).toFixed(1)}%`
        ctx.font = '14px Arial'
        const textWidth = ctx.measureText(label).width
        
        ctx.fillStyle = color
        ctx.fillRect(x1, y1 - 25, textWidth + 10, 25)
        
        // Draw label text
        ctx.fillStyle = 'white'
        ctx.fillText(label, x1 + 5, y1 - 8)
      })
    }
    
    // Draw when image loads
    if (image.complete) {
      drawDetections()
    } else {
      image.addEventListener('load', drawDetections)
      return () => image.removeEventListener('load', drawDetections)
    }
  }, [imageUrl, detections])
  
  return (
    <div className="image-container">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Detection result"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

export default ImageCanvas
