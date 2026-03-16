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
  Users,
  Newspaper,
  PlayCircle,
  Settings,
  LogOut,
  Radio,
  School,
  Compass,
  Moon,
  BookMarked,
  Trophy,
  MapPin,
  Languages,
  X,
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import DeenifyLogo from '@/components/ui/deenify-logo';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck } from 'lucide-react';

// ─── Nav sections for the scrollable mobile drawer ──────────────────────────

const NAV_SECTIONS = [
  {
    title: '📱 Main',
    links: [
      { href: '/dashboard',      label: 'Dashboard',           icon: LayoutDashboard },
      { href: '/quran',          label: 'Quran & Recitations', icon: BookOpen },
      { href: '/library',        label: 'Library',             icon: BookMarked },
      { href: '/groups',         label: 'My Groups',           icon: Users },
      { href: '/news',           label: 'News',                icon: Newspaper },
      { href: '/radio',          label: 'Muslim Radio',        icon: Radio },
      { href: '/learn',          label: 'Video Library',       icon: PlayCircle },
      { href: '/arabic-learning', label: 'Arabic Learning Hub', icon: Languages },
    ],
  },
  {
    title: '🤲 Worship',
    links: [
      { href: '/hisnul-muslim',  label: 'Hisnul Muslim Duas',  icon: HeartHandshake },
      { href: '/dhikr',          label: 'Dhikr Circle',        icon: HeartPulse },
      { href: '/awrad',          label: 'Awrad & Mawlid',      icon: Moon },
      { href: '/yaseen',         label: 'Surah Yaaseen',       icon: BookOpen },
      { href: '/khatm',          label: 'Quran Khatm',         icon: BookOpen },
      { href: '/ramadan',        label: 'Ramadan Tracker',     icon: Moon },
    ],
  },
  {
    title: '🛠️ Tools',
    links: [
      { href: '/zakat',          label: 'Zakat Calculator',    icon: CircleDollarSign },
      { href: '/halal-food',     label: 'Halal Food Guide',    icon: Apple },
      { href: '/halal-screener', label: 'Halal Screener',      icon: Apple },
      { href: '/qiblah',         label: 'Qibla Compass',       icon: Compass },
      { href: '/ai-assistant',   label: 'AI Assistant',        icon: BotMessageSquare },
      { href: '/masjid',         label: 'Masjid Finder',       icon: MapPin },
      { href: '/achievements',   label: 'Achievements',        icon: Trophy },
    ],
  },
  {
    title: '🏫 School & Learning',
    links: [
      { href: '/madresah',       label: 'Madresah Portal',     icon: School },
      { href: '/qna',            label: 'Scholar Q&A',         icon: BookOpen },
      { href: '/ccemag',         label: 'CCE Mag Portal',      icon: Landmark },
    ],
  },
];

const DESKTOP_NAV = [
  { href: '/dashboard',    label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/quran',        label: 'Quran',       icon: BookOpen },
  { href: '/arabic-learning', label: 'Arabic',   icon: Languages },
  { href: '/library',      label: 'Library',     icon: BookMarked },
  { href: '/dhikr',        label: 'Dhikr',       icon: HeartPulse },
  { href: '/groups',       label: 'Groups',      icon: Users },
  { href: '/madresah',     label: 'Madresah',    icon: School },
  { href: '/radio',        label: 'Radio',       icon: Radio },
  { href: '/news',         label: 'News',        icon: Newspaper },
  { href: '/zakat',        label: 'Zakat',       icon: CircleDollarSign },
  { href: '/halal-food',   label: 'Halal Food',  icon: Apple },
  { href: '/ai-assistant', label: 'AI',          icon: BotMessageSquare },
];

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileDrawer() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden flex-shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="sm:hidden w-[82vw] max-w-[320px] p-0 flex flex-col overflow-hidden"
        style={{ height: '100dvh' }}
      >
        {/* Fixed top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <SheetClose asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Icons.logo className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-base text-primary">Deenify</span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors" aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
          </SheetClose>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="px-2 pt-3">
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.links.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== '/dashboard' && (pathname?.startsWith(href) ?? false));
                  return (
                    <SheetClose asChild key={href}>
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                          active
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-emerald-600' : 'text-gray-400')} />
                        {label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin section */}
          {user?.role === 'admin' && (
            <div className="px-2 pt-3">
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-rose-500">
                🛡️ Admin
              </p>
              <div className="space-y-0.5">
                {[
                  { href: '/admin',          label: 'Admin Dashboard' },
                  { href: '/admin/madresah', label: 'Madresah Schools' },
                  { href: '/admin/media',    label: 'Media Upload' },
                  { href: '/admin/content',  label: 'Content Upload' },
                  { href: '/facts-admin',    label: 'Daily Facts' },
                  { href: '/verifier',       label: 'Verifier Dashboard' },
                ].map(({ href, label }) => (
                  <SheetClose asChild key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                        pathname === href
                          ? 'bg-rose-50 text-rose-700 font-semibold'
                          : 'text-gray-700 hover:bg-rose-50'
                      )}
                    >
                      <ShieldCheck className="h-4 w-4 flex-shrink-0 text-rose-400" />
                      {label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>
          )}

          {/* Bottom spacer so last items are reachable above the footer */}
          <div className="h-4" />
        </div>

        {/* Fixed footer */}
        <div className="flex-shrink-0 border-t px-4 py-3 space-y-2 bg-background">
          {user ? (
            <>
              <div className="flex items-center gap-2.5 px-1">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CircleUser className="h-4 w-4 text-emerald-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate leading-tight">{user.email}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{user.role?.toLowerCase() ?? 'user'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <SheetClose asChild>
                  <Link href="/profile" className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                    <CircleUser className="h-3.5 w-3.5" /> Profile
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/settings" className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </Link>
                </SheetClose>
                <button
                  onClick={async () => { await signOut(); window.location.href = '/auth/sign-in'; }}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <SheetClose asChild>
              <Link href="/auth/sign-in" className="block w-full text-center px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors">
                Sign In
              </Link>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Header export ───────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-3 sm:px-6">
      <MobileDrawer />

      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary ml-1 sm:ml-0">
        <DeenifyLogo />
        <span className="text-base sm:text-lg">Deenify</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden sm:flex gap-0.5 items-center ml-4">
        {DESKTOP_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition',
              pathname === href && 'text-foreground bg-accent font-medium'
            )}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden lg:inline">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        <KeyboardShortcutsDialog />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full hidden sm:flex">
              <CircleUser className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user ? (
              <>
                <DropdownMenuItem className="flex-col items-start gap-0">
                  <span className="font-semibold">{user.email}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role?.toLowerCase()}</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full">Settings</Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full flex items-center gap-2 font-semibold text-primary">
                        <ShieldCheck className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => { await signOut(); window.location.href = '/auth/sign-in'; }}
                  className="text-red-600 font-semibold cursor-pointer"
                >
                  Sign Out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/auth/sign-in" className="w-full">Sign In</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
