import logo from '@/assets/logo.png';

export default function Logo({ size = 40, className = '' }) {
  return <img src={logo} alt="TechOf Solution" width={size} height={size} className={`rounded-lg bg-white object-contain ${className}`} style={{ width: size, height: size }} />;
}
