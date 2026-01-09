'use client';
import Link from 'next/link';
import {
  CircleUser,
  Menu,
  BookOpen,
  LayoutDashboard,
  HeartHandshake,
  HeartPulse,
  CircleDollarSign,
  ScrollText,
  BotMessageSquare,
  TrendingUp,
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

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/dhikr', label: 'Dhikr Circle', icon: HeartPulse },
  { href: '/khatm', label: 'Quran Khatm', icon: BookOpen },
  { type: 'divider' },
  { type: 'title', label: 'Tools' },
  { href: '/zakat', label: 'Zakat Calculator', icon: CircleDollarSign },
  { href: '/halal-screener', label: 'Halal Screener', icon: TrendingUp },
  { href: '/ai-assistant', label: 'AI Assistant', icon: BotMessageSquare },
  { href: '/wasiya', label: 'Wasiya Generator', icon: ScrollText },
];

export function Header() {
  const pathname = usePathname();

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

      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Potentially a search bar */}
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
          <DropdownMenuItem>
            <Link href="/profile" className="w-full">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
