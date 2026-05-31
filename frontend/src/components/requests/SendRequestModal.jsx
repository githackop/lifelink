import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Droplets } from 'lucide-react';
import Button from '../ui/Button';
import { BLOOD_GROUPS } from '../../utils/bloodGroups';

const SendRequestModal = ({ donor, open, onClose, onSubmit, loading }) => {
  const [bloodGroup, setBloodGroup] = useState(donor?.bloodGroup || 'O+');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (donor) {
      setBloodGroup(donor.bloodGroup || 'O+');
      setMessage('');
    }
  }, [donor]);

  if (!donor) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ donorId: donor._id, bloodGroup, message: message.trim() || undefined });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Send blood request</h3>
                  <p className="text-sm text-slate-500 mt-0.5">To {donor.name}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Blood group needed
                  </label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Urgency, patient details, preferred contact time..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 resize-none focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1">
                    <Send className="w-4 h-4" />
                    Send request
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SendRequestModal;
