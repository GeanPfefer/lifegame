'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './ChangePasswordForm.module.css';

export default function ChangePasswordForm() {
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

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
      setSuccess(true);
      setPassword('');
      setConfirm('');
    }
  };

  return (
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

      {error   && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>Senha alterada com sucesso!</p>}

      <button type="submit" className={styles.button} disabled={submitting}>
        {submitting ? 'Salvando…' : 'Alterar senha'}
      </button>
    </form>
  );
}
