import { useAuth } from '../context/AuthContext';
import UserDashboard from './UserDashboard';
import DonorDashboard from './DonorDashboard';
import HospitalDashboard from './HospitalDashboard';
import AdminDashboard from './admin/AdminDashboard';

const dashboards = {
  user: UserDashboard,
  donor: DonorDashboard,
  hospital: HospitalDashboard,
  admin: AdminDashboard,
};

const Home = () => {
  const { user } = useAuth();
  const Dashboard = dashboards[user?.role] || UserDashboard;
  return <Dashboard />;
};

export default Home;
