import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Start free',
  description: 'Create your OnboardOS workspace.',
};

export default function SignupPage() {
  return <SignupForm />;
}
