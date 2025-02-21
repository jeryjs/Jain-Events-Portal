import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomeScreen'
import EventPage from './pages/Event/EventScreen'
import ActivityPage from './pages/Activity/ActivityScreen'
import './App.css'

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:eventId" element={<EventPage />} />
        <Route path="/event/:eventId/:activityId" element={<ActivityPage />} />
        {/* <Route path="/admin" element={<iframe src="http://localhost:5781" title="Admin Page" style={{ width: '100%', height: '100vh', border: 'none' }} />}/> */}
        {/* <Route path="*" element={<h2>404 - Page Not Found</h2>} /> */}
      </Routes>
    </Router>
  )
}

export default App
