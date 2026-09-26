import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  to: string;
  children: ReactNode;
  className?: string;
}

export default function SectionHeaderLink({ to, children, className = '' }: Props) {
  return (
    <Link
      to={to}
      className={`group/title inline-flex items-center gap-2 text-white hover:text-indigo-300 transition-colors ${className}`}
    >
      <span>{children}</span>
      <span className="opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all duration-200 text-indigo-400">
        →
      </span>
    </Link>
  );
}
