import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SalesOrder from './pages/SalesOrder'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sales-order" element={<SalesOrder />} />
        <Route path="/sales-order/:id" element={<SalesOrder />} />
      </Routes>
    </div>
  )
}

export default App

