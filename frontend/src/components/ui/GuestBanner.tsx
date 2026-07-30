/**
 * GuestBanner — displays a banner for guest users browsing the site.
 * 
 * Shows a subtle notification that they're browsing as a guest with a CTA
 * to sign in for full features like favorites, purchasing, and contacting sellers.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '@/context';

export function GuestBanner() {
  const { isGuest } = useAuth();

  // Only show for guest users
  if (!isGuest) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-500/10 border-b border-amber-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-200 border border-amber-500/30">
                <svg 
                  className="w-3 h-3 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                </svg>
                Browsing as Guest
              </span>
            </div>
            <p className="text-sm text-slate-300 hidden sm:block">
              Sign in to save favorites, contact sellers, and book test drives
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-medium text-slate-900 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 text-sm font-medium text-amber-500 hover:text-amber-400 border border-amber-500/30 hover:border-amber-400/50 rounded-lg transition-colors duration-200"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
