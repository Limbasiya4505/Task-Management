import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUpForm from './components/SignUpForm';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import OTPVerification from './components/OTPVerification';
import CreatePassword from './components/CreatePassword';
import TaskManager from './components/TaskManager';
import TaskDashboard from './components/TaskDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          
          <Route path="/register" element={<SignUpForm />} />
          <Route path="/" element={<Login />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/OTPVerification" element={<OTPVerification />} />
          <Route path="/CreatePassword" element={<CreatePassword />} />
          <Route path="/TaskManager" element={<TaskManager />} />
          <Route path="/TaskDashboard" element={<TaskDashboard />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;