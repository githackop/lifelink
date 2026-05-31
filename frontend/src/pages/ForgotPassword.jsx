import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/ui/FormInput';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      // toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
        <p className="text-slate-500 mt-2 text-sm">
          {sent
            ? 'Check your inbox for a reset link. It expires in 10 minutes.'
            : 'Enter your email and we will send you a reset link.'}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <FormInput
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={error}
            />
            <Button type="submit" loading={loading} className="w-full">
              <Send className="w-4 h-4" />
              Send reset link
            </Button>
          </form>
        ) : (
          <div className="mt-6">
            <Button variant="secondary" className="w-full" onClick={() => setSent(false)}>
              Send again
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
