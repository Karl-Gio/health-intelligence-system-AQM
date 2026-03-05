import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import VitalsDashboard from './VitalsDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ito ang unang maglo-load kapag binuksan ang site */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Dito pupunta kapag nag-login ka na */}
        <Route path="/dashboard" element={<VitalsDashboard />} />
        
        {/* Kapag may tinype na maling link, ibabalik siya sa login screen */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;