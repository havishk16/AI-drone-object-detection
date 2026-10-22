function DetectionList({ detections }) {
  if (!detections || detections.length === 0) {
    return (
      <div className="alert info">
        <p>No objects detected in this image.</p>
      </div>
    )
  }
  
  return (
    <div className="detection-list">
      <h3>Detected Objects ({detections.length})</h3>
      {detections.map((det, index) => (
        <div key={index} className="detection-item">
          <span className="class-name">{det.class_name}</span>
          <span className="confidence">
            {(det.confidence * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default DetectionList
