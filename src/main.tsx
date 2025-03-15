
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add Lovable script tag dynamically to enable latest features
const addLovableScript = () => {
  const script = document.createElement('script');
  script.src = 'https://cdn.gpteng.co/gptengineer.js';
  script.type = 'module';
  document.head.appendChild(script);
};

// Execute script addition
addLovableScript();

// Render the application
createRoot(document.getElementById("root")!).render(<App />);
