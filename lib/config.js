export const STORE = {
  name: 'Pijamas Sotana',
  tagline: 'Pijamas femininos para descansar com estilo',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '5517992018965',
  whatsappLabel: '(17) 99201-8965',
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const SIZE_PRESETS = ['PP', 'P', 'M', 'G', 'GG', 'EG', 'Único'];
