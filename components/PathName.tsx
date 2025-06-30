'use client';

import { usePathname } from 'next/navigation';
import Navbar from './NavBar';

export default function Pathname() {
  const pathname = usePathname();
  return pathname !== '/signin' ? <Navbar /> : null;
}
