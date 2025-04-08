
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page immediately without rendering anything else
    navigate('/login', { replace: true });
  }, [navigate]);

  // Return minimal content until redirect happens
  return null;
};

export default Index;
