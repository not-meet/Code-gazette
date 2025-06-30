'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import Image from 'next/image';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import Link from 'next/link';

export default function SignInPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  async function signInWithGoogle() {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setIsGoogleLoading(false);
      console.error('Sign-in error:', error);
    }
  }

  return (
    <div className="flex min-h-screen overflow-y-hidden">
      {/* Left Section: Image */}
      <div className="w-1/2 relative hidden md:block">
        <Image
          src="/1.png" // Path to your image in public folder
          alt="Sign-in background"
          fill
          className="object-cover"
          quality={75}
          priority // Load immediately for above-the-fold content
        />
      </div>

      {/* Right Section: Sign-In Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-5xl font-bold tracking-tight text-gray-600 hover:text-gray-400 transition-colors">
            Sign Up with Code Gazette!
          </h1>
          <TypingAnimation duration={50} className="text-2xl font-signature text-gray-200 hover:text-gray-400 transition-colors">
            Creating tech blogs that not only help you learn but inspire you to
            create something out of it
          </TypingAnimation>
          <Button
            type="button"
            variant="default"
            onClick={signInWithGoogle}
            disabled={isGoogleLoading}
            className="bg-gray-900 text-amber-200 font-mono text-lg py-6 w-full hover:bg-gray-800 hover:text-amber-400 transition-colors"
          >
            {isGoogleLoading ? (
              <Icons.loaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 size-6" />
            )}
            Sign up with Google!
          </Button>
          <Link href="/">
            <ShimmerButton className="shadow-2xl w-full font-mono">
              Back to Home
            </ShimmerButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
