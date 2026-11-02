"use client"

import { useActionState } from "react"
import { AlertCircle, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { login, type LoginState } from "../actions"

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {})

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          {next && <input type="hidden" name="next" value={next} />}
          <div className="grid gap-2">
            <Label htmlFor="username">نام کاربری</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              defaultValue={state.username}
              dir="ltr"
              required
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              required
            />
          </div>

          {state.error && (
            <p
              role="alert"
              className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-3 py-2 text-sm"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {state.error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={pending}>
            <LogIn aria-hidden="true" />
            {pending ? "در حال ورود..." : "ورود"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
