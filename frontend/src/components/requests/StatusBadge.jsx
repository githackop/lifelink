const styles = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${styles[status] || styles.pending}`}
  >
    {status}
  </span>
);

export default StatusBadge;
