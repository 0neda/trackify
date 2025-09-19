'use client';

import { useAuth } from '@/contexts/auth';
import {
   Avatar,
   Button,
   Dropdown,
   DropdownItem,
   DropdownMenu,
   DropdownTrigger
} from '@heroui/react';
import {
   DotsThreeOutlineIcon,
   HouseLineIcon,
   KanbanIcon,
   SignOutIcon
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

// Helper function to get user initials
const getUserInitials = (username: string): string => {
   return username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
};

interface SidebarProps {
   children: React.ReactNode;
}

const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
   const pathname = usePathname();
   const { user, logout } = useAuth();
   const router = useRouter();

   const handleLogout = () => {
      logout();
      router.push('/');
   };

   const navItems = [
      { href: '/', icon: <HouseLineIcon size={22} />, label: 'Início' },
      { href: '/dashboard', icon: <KanbanIcon size={22} />, label: 'Dashboard' },
   ];

   const handleNavClick = () => {
      if (onClose) onClose();
   };

   return (
      <div className="flex h-full flex-col bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 text-white shadow-2xl">
         {/* Header */}
         <div className="p-6">
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg">
                  <KanbanIcon className="h-6 w-6 text-white" />
               </div>
               <h1 className="text-xl font-bold tracking-wide text-white drop-shadow">Trackify</h1>
            </div>
         </div>

         {/* Navigation */}
         <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
               <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:shadow-md hover:scale-[1.02]
             ${pathname === item.href
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 shadow-lg'
                        : ''
                     }`}
               >
                  <span className={`transition-colors ${pathname === item.href ? 'text-blue-300' : 'text-gray-300 group-hover:text-white'}`}>
                     {item.icon}
                  </span>
                  <span className={pathname === item.href ? 'text-white' : 'text-gray-100 group-hover:text-white'}>
                     {item.label}
                  </span>
               </Link>
            ))}
         </nav>

         {/* User Section */}
         <div className="p-4 border-t border-white/10">
            {user && (
               <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/10 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-semibold shadow-lg">
                     {getUserInitials(user.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="text-sm font-medium text-white truncate">{user.username}</div>
                     {user.email && (
                        <div className="text-xs text-gray-200 truncate">{user.email}</div>
                     )}
                  </div>
               </div>
            )}
            <button
               onClick={handleLogout}
               className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300 hover:shadow-md cursor-pointer"
            >
               <SignOutIcon size={20} className="group-hover:text-red-400" />
               <span>Sair</span>
            </button>
         </div>
      </div>
   );
};

export const MainLayout: React.FC<SidebarProps> = ({ children }) => {
   const { user, logout } = useAuth();
   const router = useRouter();

   const handleLogout = () => {
      logout();
      router.push('/');
   };

   return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
         {/* Desktop Sidebar - Fixed and Sticky */}
         <div className="hidden md:flex md:flex-shrink-0">
            <div className="fixed top-0 left-0 h-screen w-80 overflow-y-auto">
               <Sidebar />
            </div>
         </div>
         {/* Desktop Content Offset */}
         <div className="hidden md:block md:w-80 md:flex-shrink-0"></div>

         {/* Mobile Header */}
         <header className="flex md:hidden h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
            <Link href="/" className="flex items-center gap-3 font-semibold">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <KanbanIcon className="h-5 w-5 text-white" />
               </div>
               <span className="text-lg font-bold text-gray-800">Trackify</span>
            </Link>

            <Dropdown placement="bottom-end">
               <DropdownTrigger>
                  <Button
                     isIconOnly
                     variant="light"
                     className="text-gray-600"
                  >
                     <DotsThreeOutlineIcon size={24} />
                  </Button>
               </DropdownTrigger>
               <DropdownMenu
                  aria-label="Menu de navegação"
                  onAction={(key) => {
                     if (key === 'home') router.push('/');
                     if (key === 'dashboard') router.push('/dashboard');
                     if (key === 'logout') handleLogout();
                  }}
               >
                  <DropdownItem key="home" startContent={<HouseLineIcon size={18} />}>
                     Início
                  </DropdownItem>
                  <DropdownItem key="dashboard" startContent={<KanbanIcon size={18} />}>
                     Dashboard
                  </DropdownItem>
                  {user && (
                     <DropdownItem
                        key="user"
                        className="opacity-60"
                        startContent={
                           <Avatar
                              name={getUserInitials(user.username)}
                              size="sm"
                              classNames={{
                                 base: "bg-gradient-to-br from-indigo-500 to-purple-600 w-6 h-6",
                                 name: "text-white font-semibold text-xs"
                              }}
                           />
                        }
                     >
                        {user.username}
                     </DropdownItem>
                  )}
                  <DropdownItem
                     key="logout"
                     className="text-danger"
                     color="danger"
                     startContent={<SignOutIcon size={18} />}
                  >
                     Sair
                  </DropdownItem>
               </DropdownMenu>
            </Dropdown>
         </header>

         {/* Main Content */}
         <main className="flex flex-1 flex-col bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 sm:p-6 min-h-screen overflow-x-auto">
            {children}
         </main>
      </div>
   );
};
