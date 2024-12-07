'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    let authSubscription: any;
    let channel: any;

    const setupConnections = () => {
      // Setup auth monitoring
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session && reconnectAttempts.current < maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
          reconnectAttempts.current += 1;
          supabase.auth.getSession().catch(console.error);
        }
      });
      authSubscription = data.subscription;

      // Setup realtime monitoring
      channel = supabase.channel('system')
        .on('system', { event: '*' }, (payload) => {
          if (payload.event === 'disconnected') {
            console.log('Disconnected from Supabase, attempting to reconnect...');
            channel?.unsubscribe();
            setTimeout(setupConnections, 1000);
          }
        })
        .subscribe();
    };

    setupConnections();

    // Cleanup function
    return () => {
      authSubscription?.unsubscribe();
      channel?.unsubscribe();
      reconnectAttempts.current = 0;
    };
  }, []);

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 