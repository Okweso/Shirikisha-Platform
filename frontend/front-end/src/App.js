import logo from './logo.svg';
import './App.css';

import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import ReactDOM from 'react-dom/client'
import Layout from './pages/Layout';
import Home from './pages/Home';
import Bills from './pages/Bills';
import Results from './pages/Results';
import AnalysisPage from './pages/Detailed_analysis';
import OpinionsPage from './pages/OpinionsPage';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Layout />}>
      <Route index element={<Home />} />
      <Route path='Bills' element={<Bills />} />
      <Route path='Results' element={<Results />} />
      <Route path='/issues/:id/analysis' element={<AnalysisPage />}></Route>
      <Route path='/issues/:id/opinions' element={<OpinionsPage />}></Route>

      </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
