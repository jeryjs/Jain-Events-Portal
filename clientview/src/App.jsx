import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomeScreen'
import EventPage from './pages/Event/EventScreen'
import MatchPage from './pages/Match/MatchScreen'
import './App.css'

function App() {
  
  {/* TODO: RENAME EVENTS AND MATCHES TO A MORE GENERIC NAME (considering culturals and other categories) */}
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:eventId" element={<EventPage />} />
        <Route path="/event/:eventId/:matchId" element={<MatchPage />} />
        {/* <Route path="/admin" element={<iframe src="http://localhost:5781" title="Admin Page" style={{ width: '100%', height: '100vh', border: 'none' }} />}/> */}
        {/* <Route path="*" element={<h2>404 - Page Not Found</h2>} /> */}
      </Routes>
    </Router>
  )
}

export default App
