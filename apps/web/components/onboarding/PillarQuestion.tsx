'use client';

import { useState } from 'react';
import type { PillarQuestion as PillarQuestionType } from '@/lib/pillar-questions';
import styles from './PillarQuestion.module.css';

interface Props {
  question: PillarQuestionType;
  value: string[];
  onChange: (value: string[]) => void;
}

export function PillarQuestion({ question, value, onChange }: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText]  = useState('');

  function toggleOption(opt: string) {
    const already = value.includes(opt);
    // Remove custom text se estava selecionado via "Outro" com mesmo texto
    onChange(already ? value.filter((v) => v !== opt) : [...value, opt]);
  }

  function openCustom() {
    setCustomOpen(true);
  }

  function handleCustomConfirm() {
    const text = customText.trim();
    if (text && !value.includes(text)) {
      onChange([...value, text]);
    }
    setCustomText('');
    setCustomOpen(false);
  }

  function handleCustomKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); handleCustomConfirm(); }
    if (e.key === 'Escape') { setCustomOpen(false); setCustomText(''); }
  }

  // Valores custom = selecionados que não estão nas opções fixas
  const customValues = value.filter((v) => !question.options.includes(v));

  return (
    <div className={styles.question}>
      <p className={styles.text}>{question.text}</p>
      <div className={styles.options}>
        {question.options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`${styles.chip} ${value.includes(opt) ? styles.selected : ''}`}
            onClick={() => toggleOption(opt)}
          >
            {opt}
          </button>
        ))}

        {/* Valores customizados já adicionados */}
        {customValues.map((v) => (
          <button
            key={v}
            type="button"
            className={`${styles.chip} ${styles.selected} ${styles.other}`}
            onClick={() => toggleOption(v)}
            title="Clique para remover"
          >
            {v} ×
          </button>
        ))}

        {/* Botão / input "Outro" */}
        {!customOpen ? (
          <button
            type="button"
            className={`${styles.chip} ${styles.other}`}
            onClick={openCustom}
          >
            ✏ Outro...
          </button>
        ) : (
          <input
            autoFocus
            className={styles.customInput}
            placeholder="Escreva e pressione Enter"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            onBlur={handleCustomConfirm}
          />
        )}
      </div>
    </div>
  );
}
