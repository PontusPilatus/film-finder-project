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
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let authSubscription: any;
    let channel: any;

    const setupConnections = async () => {
      try {
        // Check session on mount
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // Setup auth monitoring
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event);
          
          if (!session && reconnectAttempts.current < maxReconnectAttempts) {
            console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
            reconnectAttempts.current += 1;
            
            // Clear any existing timeout
            if (reconnectTimeout.current) {
              clearTimeout(reconnectTimeout.current);
            }
            
            // Set a new timeout for reconnection
            reconnectTimeout.current = setTimeout(async () => {
              try {
                const { error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError) throw refreshError;
                reconnectAttempts.current = 0; // Reset on successful refresh
              } catch (e) {
                console.error('Session refresh failed:', e);
                // Redirect to login if all attempts fail
                if (reconnectAttempts.current >= maxReconnectAttempts) {
                  window.location.href = '/login';
                }
              }
            }, 1000 * (reconnectAttempts.current + 1)); // Exponential backoff
          }
        });
        authSubscription = data.subscription;

        // Setup realtime monitoring with heartbeat
        channel = supabase.channel('system')
          .on('system', { event: '*' }, (payload) => {
            if (payload.event === 'disconnected') {
              console.log('Disconnected from Supabase, attempting to reconnect...');
              channel?.unsubscribe();
              setTimeout(setupConnections, 1000);
            }
          })
          .subscribe();

        // Setup periodic session check
        const sessionCheckInterval = setInterval(async () => {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
              console.log('Session check failed, attempting refresh...');
              await supabase.auth.refreshSession();
            }
          } catch (e) {
            console.error('Session check failed:', e);
          }
        }, 5 * 60 * 1000); // Check every 5 minutes

        return () => clearInterval(sessionCheckInterval);
      } catch (error) {
        console.error('Setup error:', error);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setTimeout(setupConnections, 1000 * (reconnectAttempts.current + 1));
          reconnectAttempts.current += 1;
        }
      }
    };

    setupConnections();

    // Cleanup function
    return () => {
      authSubscription?.unsubscribe();
      channel?.unsubscribe();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      reconnectAttempts.current = 0;
    };
  }, []);

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 