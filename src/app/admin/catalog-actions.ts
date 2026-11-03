"use server"

import type { AdminBrand, AdminBrandInput, AdminCar, AdminCarInput } from "@/lib/admin-api"
import { adminMutate } from "@/lib/admin-mutate"
import { CATALOG_TAG } from "@/lib/catalog-paths"

// Admin API call that also refreshes the public catalog cache (homepage and brand pages)
const mutate = <T>(path: string, init: RequestInit) => adminMutate<T>(path, init, CATALOG_TAG)

export async function saveBrand(id: number | null, input: AdminBrandInput) {
  return mutate<AdminBrand>(id ? `/admin/brands/${id}` : "/admin/brands", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  })
}

export async function deleteBrand(id: number) {
  return mutate(`/admin/brands/${id}`, { method: "DELETE" })
}

export async function saveCar(id: number | null, input: AdminCarInput) {
  return mutate<AdminCar>(id ? `/admin/cars/${id}` : "/admin/cars", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  })
}

export async function deleteCar(id: number) {
  return mutate(`/admin/cars/${id}`, { method: "DELETE" })
}
