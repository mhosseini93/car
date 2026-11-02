"use client"

import * as React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { Car } from "./data"

type Filter = "all" | Car["condition"]

// Cards are rendered on the server; this only toggles which ones are visible
// via the data-filter attribute, so every car stays in the HTML for crawlers.
export function CarFilter({
  heading,
  children,
}: {
  heading: React.ReactNode
  children: React.ReactNode
}) {
  const [filter, setFilter] = React.useState<Filter>("all")

  return (
    <div className="grid gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        {heading}
        <Tabs dir="rtl" value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList aria-label="فیلتر وضعیت خودرو">
            <TabsTrigger value="all">همه</TabsTrigger>
            <TabsTrigger value="new">صفر کیلومتر</TabsTrigger>
            <TabsTrigger value="used">کارکرده</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ul
        data-filter={filter}
        className="group/list grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {children}
      </ul>
    </div>
  )
}
