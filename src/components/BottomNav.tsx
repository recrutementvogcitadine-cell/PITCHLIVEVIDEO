import React from "react";
import Link from "next/link";

// Affiche la barre de navigation style TikTok en bas de l'écran
export default function BottomNav() {
  // Vérifie si l'utilisateur est inscrit (localStorage côté client)
  const [registered, setRegistered] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setRegistered(!!localStorage.getItem('user_registered'));
    }
  }, []);
  if (!registered) return null;
  return (
    <nav className="fixed bottom-0 left-0 w-full z-[99999] bg-black border-t border-gray-800 flex justify-around items-center h-16 md:hidden">
      {/* Accueil */}
      <Link href="/" className="flex flex-col items-center text-white text-xs font-bold">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
        Accueil
      </Link>
      {/* Amis */}
      <Link href="/friends" className="flex flex-col items-center text-white text-xs font-bold">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><circle cx="17" cy="7" r="4"/><path d="M2 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M14 21v-2a4 4 0 014-4h0a4 4 0 014 4v2"/></svg>
        Ami(e)s
      </Link>
      {/* Caméra (création) */}
      <Link href="/camera" className="flex flex-col items-center">
        <div className="rounded-full bg-red-600 p-2 shadow-lg border-4 border-white -mt-8">
          <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
      </Link>
      {/* Messages */}
      <Link href="/messages" className="flex flex-col items-center text-white text-xs font-bold relative">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Messages
        {/* Badge exemple */}
        {/* <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">48</span> */}
      </Link>
      {/* Profil */}
      <Link href="/creator" className="flex flex-col items-center text-white text-xs font-bold">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
        Profil
      </Link>
    </nav>
  );
}
