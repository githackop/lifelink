import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#f8fafc',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#f43f5e', secondary: '#fff' },
          },
        }}
      />
    </>
  );
}

export default App;
