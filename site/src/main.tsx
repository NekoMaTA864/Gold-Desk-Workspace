import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
import './design-refresh.css';
import './layout-experiments.css';
import './product-experience.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
