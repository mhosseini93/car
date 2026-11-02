// Base URL of the NestJS backend (server-side only; never exposed to the browser)
export const API_URL = (process.env.API_URL ?? "http://localhost:4000/api").replace(/\/$/, "")

export class ApiError extends Error {
  constructor(
    public status: number,
    public messages: string[]
  ) {
    super(messages.join("، "))
  }
}

export async function api<T>(
  path: string,
  init: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = init
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null
    const message = body?.message ?? "خطای ناشناخته از سرور"
    throw new ApiError(res.status, Array.isArray(message) ? message : [message])
  }
  return (await res.json()) as T
}
