import type { Metadata } from 'next';
import './appointments.css';

export const metadata: Metadata = {
  title: 'Faculty–Student Appointment Portal · Department of Aviation',
  description:
    'Book or track a faculty–student appointment for the Department of Aviation.',
};

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="appointments-root">
      {children}
    </div>
  );
}
