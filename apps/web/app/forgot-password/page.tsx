'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]           = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setSubmitting(false);

    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>LifeGame</h1>

        {sent ? (
          <>
            <p className={styles.subtitle}>E-mail enviado!</p>
            <p className={styles.info}>
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              Em desenvolvimento, o e-mail chega no{' '}
              <a href="http://127.0.0.1:54324" target="_blank" rel="noreferrer" className={styles.link}>
                Mailpit
              </a>.
            </p>
            <a href="/login" className={styles.backLink}>← Voltar para o login</a>
          </>
        ) : (
          <>
            <p className={styles.subtitle}>Redefinir senha</p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">E-mail da sua conta</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="seu@email.com"
                  value={email}
                  required
                  autoComplete="email"
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.button} disabled={submitting}>
                {submitting ? 'Enviando…' : 'Enviar link de redefinição'}
              </button>
            </form>

            <p className={styles.footer}>
              <a href="/login" className={styles.link}>← Voltar para o login</a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
