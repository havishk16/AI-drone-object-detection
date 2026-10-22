import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import HistoryPage from './pages/HistoryPage'
import DetailPage from './pages/DetailPage'

function Navigation() {
  const location = useLocation()
  
  return (
    <nav>
      <ul>
        <li><h1>🚁 Drone Object Detection</h1></li>
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Upload
          </Link>
        </li>
        <li>
          <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>
            History
          </Link>
        </li>
      </ul>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/detection/:id" element={<DetailPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
