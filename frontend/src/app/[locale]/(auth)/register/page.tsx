'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace({ pathname: '/login', query: { mode: 'signup' } });
  }, [router]);

  return null;
}
