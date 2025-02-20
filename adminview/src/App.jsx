import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import './App.css'

function App() {

  return (
    <Router basename='/admin'>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
      </Routes>
    </Router>
  )
}

export default App
