import { useState, useEffect } from 'react'
import { getHistory, getImageUrl } from '../utils/api'

function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [minObjects, setMinObjects] = useState('')
  const [maxObjects, setMaxObjects] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const pageSize = 10
  
  useEffect(() => {
    loadHistory()
  }, [page])
  
  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getHistory(page, pageSize)
      setHistory(data)
      setHasMore(data.length === pageSize)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }
  
  const filteredHistory = history.filter(item => {
    // Search filter
    if (searchTerm && !item.image_filename.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Min objects filter
    if (minObjects && item.total_objects < parseInt(minObjects)) {
      return false
    }
    
    // Max objects filter
    if (maxObjects && item.total_objects > parseInt(maxObjects)) {
      return false
    }
    
    return true
  })
  
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'date-asc':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'objects-desc':
        return b.total_objects - a.total_objects
      case 'objects-asc':
        return a.total_objects - b.total_objects
      default:
        return 0
    }
  })
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }
  
  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1)
    }
  }
  
  return (
    <div>
      <div className="card">
        <h2>Detection History</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
          View past object detection results.
        </p>
        
        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Search Filename
            </label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '0.9rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Min Objects
            </label>
            <input
              type="number"
              placeholder="Min"
              value={minObjects}
              onChange={(e) => setMinObjects(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '0.9rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Max Objects
            </label>
            <input
              type="number"
              placeholder="Max"
              value={maxObjects}
              onChange={(e) => setMaxObjects(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '0.9rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '0.9rem'
              }}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="objects-desc">Objects (Most First)</option>
              <option value="objects-asc">Objects (Least First)</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="secondary"
              onClick={() => {
                setSearchTerm('')
                setMinObjects('')
                setMaxObjects('')
                setSortBy('date-desc')
              }}
              style={{ width: '100%', padding: '0.5rem' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Results count */}
        <div style={{ marginBottom: '1rem', color: '#7f8c8d', fontSize: '0.9rem' }}>
          Showing {sortedHistory.length} of {history.length} results
        </div>
        
        {error && (
          <div className="alert error">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="alert info">
            <p>No detection history found. Upload an image to get started!</p>
          </div>
        ) : sortedHistory.length === 0 ? (
          <div className="alert info">
            <p>No results match your filters. Try adjusting the search criteria.</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Preview</th>
                  <th>Filename</th>
                  <th>Objects Detected</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.image_filename}
                        style={{
                          width: '80px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    </td>
                    <td>{item.image_filename}</td>
                    <td>
                      <strong style={{ color: '#27ae60' }}>
                        {item.total_objects}
                      </strong>
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="pagination">
              <button onClick={handlePrevPage} disabled={page === 1}>
                Previous
              </button>
              <span>Page {page}</span>
              <button onClick={handleNextPage} disabled={!hasMore}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
