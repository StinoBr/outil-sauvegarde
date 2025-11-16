// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import DashboardPage from './pages/DashboardPage';

// 1. Importer notre future page
import TargetsPage from './pages/TargetsPage'; 
import PlansPage from './pages/PlansPage';
// import JournalsPage from './pages/JournalsPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        
        {/* 2. Ajouter la nouvelle route pour la page des cibles */}
        <Route path="/targets" element={<TargetsPage />} />
        
        <Route path="/plans" element={<PlansPage />} /> 
        {/* <Route path="/journals" element={<JournalsPage />} /> */}
      </Routes>
    </Layout>
  );
}

export default App;