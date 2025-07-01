'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Button } from './ui/button';
import {
  Badge,
  Calendar,
  CreditCard,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react';
import { checkAndAllocateCredits } from '@/actions/credits';

const Header = () => {
  const { user } = useUser();
  const role = user?.publicMetadata?.role || 'UNASSIGNED';

  useEffect(() => {
    if (role === 'PATIENT') {
      checkAndAllocateCredits(user);
    }
  }, [user, role]);

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-10 supports-[backdrop-filter]:">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo-single.png"
            alt="Medimeet Logo"
            width={200}
            height={60}
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-2">
          <SignedIn>
            {role === 'ADMIN' && (
              <>
                <Link href="/admin">
                  <Button variant="outline" className="hidden md:inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Admin Dashboard
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                    <ShieldCheck className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}

            {role === 'DOCTOR' && (
              <>
                <Link href="/doctor">
                  <Button variant="outline" className="hidden md:inline-flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Doctor Dashboard
                  </Button>
                </Link>
                <Link href="/doctor">
                  <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                    <Stethoscope className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}

            {role === 'PATIENT' && (
              <>
                <Link href="/appointments">
                  <Button variant="outline" className="hidden md:inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    My Appointments
                  </Button>
                </Link>
                <Link href="/appointments">
                  <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}

            {role === 'UNASSIGNED' && (
              <>
                <Link href="/profile">
                  <Button variant="outline" className="hidden md:inline-flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Complete Profile
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </SignedIn>

          {user && user?.publicMetadata?.role === "PATIENT" && (
            <Link href="/pricing">
              <Badge
                variant="outline"
                className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
              >
                <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">
                  {credits} <span className="hidden md:inline">Credits</span>
                </span>
              </Badge>
            </Link>
          )}

          <SignedOut>
            <SignInButton>
              <Button variant="secondary">Sign In</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                  userButtonPopoverCard: 'shadow-xl',
                  userPreviewMainIdentifier: 'font-semibold',
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
