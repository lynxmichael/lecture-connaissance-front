export default function Badge({ children, color = 'red', className = '' }) {
  const colors = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
  };

  return (
    <span className={`${colors[color]} text-white text-xs font-bold rounded-full px-2 py-1 ${className}`}>
      {children}
    </span>
  );
}