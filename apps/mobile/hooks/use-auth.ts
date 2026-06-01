import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Profile = {
  name: string;
  onboarding_completed_at: string | null;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lê sessão persistida no AsyncStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    supabase
      .from('profiles')
      .select('name, onboarding_completed_at')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data ?? null);
        setLoading(false);
      });
  }, [session]);

  return { session, profile, loading };
}
