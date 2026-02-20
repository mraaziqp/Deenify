"use client";
import Link from 'next/link';
import {
  CircleUser,
  Menu,
  BookOpen,
  LayoutDashboard,
  HeartHandshake,
  HeartPulse,
  CircleDollarSign,
  BotMessageSquare,
  Apple,
  Landmark,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import type { NavLink } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import DeenifyLogo from '@/components/ui/deenify-logo';
import { useAuth } from '@/lib/auth-context';

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/dhikr', label: 'Dhikr Circle', icon: HeartPulse },
  { href: '/khatm', label: 'Quran Khatm', icon: BookOpen },
  { type: 'divider' },
  { type: 'title', label: 'Tools' },
  { href: '/zakat', label: 'Zakat Calculator', icon: CircleDollarSign },
  { href: '/halal-food', label: 'Halal Food', icon: Apple },
  { href: '/quran', label: 'Quran & Recitations', icon: BookOpen },
  { href: '/ai-assistant', label: 'AI Assistant', icon: BotMessageSquare },
];

  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Icons.logo className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Deenify</span>
            </Link>
            {navLinks.map((link, index) => {
              if (link.type === 'divider') {
                return <DropdownMenuSeparator key={`mob-sep-${index}`} className="my-2" />;
              }
              if (link.type === 'title') {
                return (
                  <h4 key={`mob-title-${index}`} className="px-2 text-sm font-semibold text-muted-foreground">
                    {link.label}
                  </h4>
                );
              }
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                    pathname === link.href && 'text-foreground'
                  )}
                >
                  <LinkIcon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="relative ml-auto flex-1 md:grow-0 flex items-center gap-2">
        <KeyboardShortcutsDialog />
        <Link href="/dashboard" className="font-bold text-xl text-primary flex items-center gap-2">
          <DeenifyLogo />
          <span>Deenify</span>
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <CircleUser className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user && (
            <>
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-semibold">{user.email}</span>
                  <span className="text-xs text-muted-foreground">User ID: {user.id}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/profile" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 font-semibold cursor-pointer">
                Sign Out
              </DropdownMenuItem>
            </>
          )}
          {!user && (
            <DropdownMenuItem>
              <Link href="/auth/sign-in" className="w-full">Sign In</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );

export default Header;
