import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@lifegame/core', '@lifegame/types'],
};

export default config;
