'use client';

import { usePathname } from 'next/navigation';
import styles from './AppNav.module.css';

const NAV_ITEMS = [
  { href: '/home',     label: 'Home' },
  { href: '/history',  label: 'Histórico' },
  { href: '/settings', label: 'Configurações' },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <a href="/home" className={styles.logo}>LifeGame</a>
      <div className={styles.links}>
        {NAV_ITEMS.map(item => (
          <a
            key={item.href}
            href={item.href}
            className={`${styles.link} ${pathname === item.href ? styles.active : ''}`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
