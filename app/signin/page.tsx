"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from "next/navigation"
import { Icons } from "@/components/ui/Icons"

export default function SignInPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)
  const supabase = createClient()
  const searchParams = useSearchParams()

  const next = searchParams.get("next")
  async function signInWithGoogle() {
    setIsGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""
            }`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={signInWithGoogle}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <Icons.loaderCircle className="mr-2 size-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 size-6" />
      )}{" "}
      Sign in with Google
    </Button>
  )
}
