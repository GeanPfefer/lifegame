'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './reset-password.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (err) {
      setError(err.message);
    } else {
      router.push('/home');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Anima</h1>
        <p className={styles.subtitle}>Criar nova senha</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Nova senha</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Mínimo 6 caracteres"
              value={password}
              minLength={6}
              required
              autoComplete="new-password"
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">Confirmar nova senha</label>
            <input
              id="confirm"
              type="password"
              className={styles.input}
              placeholder="Repita a nova senha"
              value={confirm}
              required
              autoComplete="new-password"
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </main>
  );
}
