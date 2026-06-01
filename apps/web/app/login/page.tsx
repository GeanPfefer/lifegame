import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import styles from './login.module.css';

async function signIn(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) redirect('/login?error=' + encodeURIComponent(error.message));
  redirect('/home');
}

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Anima</h1>
        <p className={styles.subtitle}>Entre na sua jornada</p>

        <form action={signIn} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{decodeURIComponent(error)}</p>}

          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>

        <p className={styles.footer}>
          <a href="/forgot-password" className={styles.link}>Esqueci minha senha</a>
        </p>

        <p className={styles.footer}>
          Não tem conta?{' '}
          <a href="/signup" className={styles.link}>Criar conta</a>
        </p>
      </div>
    </main>
  );
}
