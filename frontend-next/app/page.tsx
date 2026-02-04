import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LandingClient } from './LandingClient';

export default async function Home() {
  return <LandingClient />;
}
