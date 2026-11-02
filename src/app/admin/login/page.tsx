import type { Metadata } from "next"
import { Suspense } from "react"
import { Car } from "lucide-react"

import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "ورود" }

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="bg-primary text-primary-foreground grid size-12 place-items-center rounded-xl">
            <Car className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-extrabold">ورود به پنل مدیریت</h1>
          <p className="text-muted-foreground text-sm">خودرو قسطی</p>
        </div>
        <Suspense fallback={<LoginForm />}>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}

async function LoginFormWithNext({
  searchParams,
}: {
  searchParams: PageProps<"/admin/login">["searchParams"]
}) {
  const { next } = await searchParams
  return <LoginForm next={typeof next === "string" ? next : undefined} />
}
