import { Navigate, useParams } from 'react-router-dom';
import DashboardPage from './DashboardPage';

const PublicProfilePage = () => {
  const { username } = useParams();

  if (!username) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardPage publicUsername={username.toLowerCase()} forceReadOnly />;
};

export default PublicProfilePage;
