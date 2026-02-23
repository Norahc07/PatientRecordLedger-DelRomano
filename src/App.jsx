import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PatientOverview from './pages/PatientOverview'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patient/:id" element={<PatientOverview />} />
      </Routes>
    </Layout>
  )
}

export default App
