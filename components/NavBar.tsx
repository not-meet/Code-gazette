'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import axios from 'axios';
import { createClient } from "@/utils/supabase/client";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { AuroraText } from "@/components/magicui/aurora-text";

// Interface for user profile response
interface UserProfileResponse {
  avatar_url: string | null;
  role: string | null;
}

// Interface for cached user data in local storage
interface CachedUserData {
  email: string;
  avatar_url: string | null;
  role: string | null;
}

const Navbar = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check Supabase authentication and fetch user data
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          setIsAuthenticated(true);
          setUserEmail(user.email);

          // Check local storage for cached user data
          const cachedData = localStorage.getItem(`user_data_${user.email}`);
          if (cachedData) {
            const parsedData: CachedUserData = JSON.parse(cachedData);
            if (parsedData.avatar_url) {
              setAvatarUrl(parsedData.avatar_url);
              setUserRole(parsedData.role);
              setLoading(false);
              return;
            }
          }

          // If no cached data, fetch from API
          try {
            const response = await axios.get('/api/user/profile');
            const data: UserProfileResponse = response.data;
            setAvatarUrl(data.avatar_url);
            setUserRole(data.role);

            // Cache the data in local storage
            localStorage.setItem(
              `user_data_${user.email}`,
              JSON.stringify({
                email: user.email,
                avatar_url: data.avatar_url,
                role: data.role
              })
            );
          } catch (error) {
            console.error('Failed to fetch avatar:', error);
            setAvatarUrl(null);
          }
        } else {
          setIsAuthenticated(false);
          setAvatarUrl(null);
          setUserEmail(null);
        }
      } catch (error) {
        console.error('Error checking user authentication:', error);
        setIsAuthenticated(false);
        setAvatarUrl(null);
        setUserEmail(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Handle sign-out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear local storage for the user
      if (userEmail) {
        localStorage.removeItem(`user_data_${userEmail}`);
      }
      setAvatarUrl(null);
      setIsAuthenticated(false);
      setUserEmail(null);
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleDropdown();
  };

  return (
    <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm">
      <nav className="flex items-center justify-between px-6 py-4">
        {/* Left: Brand Title */}
        <Link href="/" className="text-3xl font-serif font-bold text-gray-200 hover:text-white transition-colors">
          <AuroraText colors={["#e5e7eb", "#9ca3af", "#4b5563", "#1f2937"]}>
            Code Gazette
          </AuroraText>
        </Link>

        {/* Right: Create Button and Profile */}
        <div className="flex items-center gap-4">
          {userRole == 'WRITER' && (
            <Link href="/create" className="inline-block">
              <ShimmerButton className="shadow-2xl">
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-gray-200 dark:from-white dark:to-slate-900/10 font-mono flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Create
                </span>
              </ShimmerButton>
            </Link>
          )}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : isAuthenticated && avatarUrl ? (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Avatar */}
              <div
                onClick={handleProfileClick}
                className="cursor-pointer flex items-center gap-2"
              >
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-gray-400 hover:text-white transition-colors font-mono"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/signin" className="inline-block">
                <ShimmerButton className="shadow-2xl">
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-gray-200 dark:from-white dark:to-slate-900/10 font-mono">
                    Sign In
                  </span>
                </ShimmerButton>
              </Link>
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={handleProfileClick}
                  className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                >
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
