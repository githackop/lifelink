import toast from 'react-hot-toast';

export const showSuccess = (message) => toast.success(message);

export const showError = (message) => toast.error(message);

export const showInfo = (message) =>
  toast(message, {
    icon: 'ℹ️',
    style: {
      borderRadius: '12px',
      background: '#0f172a',
      color: '#f8fafc',
    },
  });

export const showRequestResponse = (status, donorName) => {
  if (status === 'accepted') {
    showSuccess(donorName ? `${donorName} accepted your request` : 'Your request was accepted');
    return;
  }
  showInfo(donorName ? `${donorName} declined your request` : 'Your request was declined');
};
