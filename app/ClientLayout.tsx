'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check and refresh auth session if needed
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking session:', error);
      }
      if (session) {
        console.log('Session found');
      }
    };
    checkSession();
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
} 