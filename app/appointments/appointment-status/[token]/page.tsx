import React from 'react';
import AppointmentStatusPage from '../page';

export default async function DirectAppointmentTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: rawToken } = await params;
  const token = rawToken ? decodeURIComponent(rawToken) : '';

  // Reuse the unified AppointmentStatusPage which handles URL tokens directly
  return <AppointmentStatusPage />;
}
