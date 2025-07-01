// app/(main)/profile/layout.js

import React from 'react';

export const metadata = {
  title: 'My Profile - MediMeet',
  description: 'Update your personal profile and preferences',
};

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
}
