import { useEffect, useState } from 'react'

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
]

function StatsChart({ detections }) {
  const [classStats, setClassStats] = useState({})
  
  useEffect(() => {
    if (!detections || detections.length === 0) return
    
    // Count objects by class
    const stats = {}
    detections.forEach(det => {
      const className = det.class_name
      stats[className] = (stats[className] || 0) + 1
    })
    
    setClassStats(stats)
  }, [detections])
  
  const entries = Object.entries(classStats).sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(...entries.map(([_, count]) => count), 1)
  
  if (entries.length === 0) return null
  
  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Object Count by Class</h3>
      <div style={{ marginTop: '1rem' }}>
        {entries.map(([className, count], index) => {
          const percentage = (count / maxCount) * 100
          const color = COLORS[index % COLORS.length]
          
          return (
            <div key={className} style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
                fontSize: '0.9rem'
              }}>
                <span style={{ 
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  color: '#2c3e50'
                }}>
                  {className}
                </span>
                <span style={{ 
                  color: '#27ae60',
                  fontWeight: '600'
                }}>
                  {count}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '24px',
                backgroundColor: '#ecf0f1',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: color,
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '8px',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {percentage > 20 && `${count}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#e8f4f8',
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <strong>Total Objects Detected:</strong> {detections.length}
      </div>
    </div>
  )
}

export default StatsChart
