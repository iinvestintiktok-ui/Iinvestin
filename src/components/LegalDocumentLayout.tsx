import type { ReactNode } from 'react';
import Navbar from './Navbar';

interface Props {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display font-bold text-lg text-white">{title}</h2>
      <div className="space-y-3 text-sm text-gray-400 leading-relaxed">{children}</div>
    </section>
  );
}

export default function LegalDocumentLayout({ title, lastUpdated, children }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        <div className="space-y-3">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
            {title}
          </h1>
          <p className="text-gray-500 text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="card p-6 sm:p-8 space-y-8">{children}</div>
      </div>
    </div>
  );
}
