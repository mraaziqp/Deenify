'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BookOpen,
  CircleDollarSign,
  CircleUser,
  HeartPulse,
  LayoutDashboard,
  BotMessageSquare,
  Settings,
  GraduationCap,
  ShieldCheck,
  Apple,
  Trophy,
  MapPin,
  Compass,
} from 'lucide-react';
import { Icons } from '@/components/icons';
import type { NavLink } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const mainNavLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learning', label: 'Learning Library', icon: BookOpen },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/courses', label: 'Courses', icon: GraduationCap },
  { href: '/dhikr', label: 'Dhikr Circle', icon: HeartPulse },
  { href: '/khatm', label: 'Quran Khatm', icon: BookOpen },
];

const toolNavLinks: NavLink[] = [
  { href: '/zakat', label: 'Zakat Calculator', icon: CircleDollarSign },
  { href: '/qibla', label: 'Qiblah Compass', icon: Compass },
  { href: '/halal-food', label: 'Halal Food', icon: Apple },
  { href: '/quran', label: 'Quran & Recitations', icon: BookOpen },
  { href: '/ai-assistant', label: 'AI Assistant', icon: BotMessageSquare },
  { href: '/masjid', label: 'Masjid Finder', icon: MapPin },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
];

function NavLinkItem({ href, label, icon: Icon }: NavLink) {
  const pathname = usePathname();
  if (!href || !Icon) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
            pathname === href && 'bg-accent text-accent-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const { user, hasRole, signOut } = useAuth();
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;
  
  // Conditional nav links based on role
  const roleNavLinks: NavLink[] = [];
  if (hasRole('teacher')) {
    roleNavLinks.push({ href: '/teacher', label: 'Teacher Portal', icon: GraduationCap });
  }
  if (hasRole('verifier')) {
    roleNavLinks.push({ href: '/verifier', label: 'Verifier Dashboard', icon: ShieldCheck });
  }
  if (hasRole('admin')) {
    roleNavLinks.push({ href: '/admin', label: 'Admin Dashboard', icon: ShieldCheck });
  }

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Icons.logo className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Deenify</span>
          </Link>
          {mainNavLinks.map((link) => (
            <NavLinkItem key={link.href} {...link} />
          ))}
          <div className="my-2 h-px w-full bg-border" />
          {toolNavLinks.map((link) => (
            <NavLinkItem key={link.href} {...link} />
          ))}
          {roleNavLinks.length > 0 && (
            <>
              <div className="my-2 h-px w-full bg-border" />
              {roleNavLinks.map((link) => (
                <NavLinkItem key={link.href} {...link} />
              ))}
            </>
          )}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                onClick={async () => {
                  await signOut();
                  if (router) router.push('/login');
                  else window.location.href = '/login';
                }}
                aria-label="Sign Out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
                </svg>
                <span className="sr-only">Sign Out</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
