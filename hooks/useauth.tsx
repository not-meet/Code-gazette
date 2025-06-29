"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";


export const useAuth = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          setUser(null);
          router.push("/sign-in");
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUser();
  }, [router, supabase.auth]);

  const signout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { user, isLoading, signout };
};

