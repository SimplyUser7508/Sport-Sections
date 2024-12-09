import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Missing from './Components/Missing';
import RequireAuth from './Components/RequireAuth';
import Home from './Pages/Home';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/register" element={<Register />} />
        <Route path="/" element={<Home />} />
      
        {/* protected routes */}
        <Route element={<RequireAuth />}>
          
        </Route>

        {/* catch all */}
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;