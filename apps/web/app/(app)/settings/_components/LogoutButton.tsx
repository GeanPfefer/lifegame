'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './LogoutButton.module.css';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <button className={styles.btn} onClick={handleLogout}>
      Sair da conta
    </button>
  );
}
