"use server"

import { adminMutate } from "@/lib/admin-mutate"

// Contact messages aren't shown on the site, so there is no cache tag to expire
export async function setMessageRead(id: number, isRead: boolean) {
  return adminMutate(`/admin/contact/${id}`, { method: "PATCH", body: JSON.stringify({ isRead }) })
}

export async function deleteMessage(id: number) {
  return adminMutate(`/admin/contact/${id}`, { method: "DELETE" })
}
