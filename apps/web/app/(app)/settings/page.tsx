import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChangePasswordForm from './_components/ChangePasswordForm';
import { LogoutButton } from './_components/LogoutButton';
import styles from './settings.module.css';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <a href="/home" className={styles.back}>← Voltar</a>
        <h1 className={styles.title}>Configurações</h1>
      </div>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Conta</h2>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Nome</span>
          <span className={styles.fieldValue}>{profile?.name ?? '—'}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>E-mail</span>
          <span className={styles.fieldValue}>{user.email}</span>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Alterar senha</h2>
        <ChangePasswordForm />
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Sessão</h2>
        <LogoutButton />
      </section>
    </main>
  );
}
