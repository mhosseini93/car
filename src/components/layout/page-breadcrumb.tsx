import { Fragment } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

// Visible breadcrumb; the last item is the current page
export function PageBreadcrumb({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="مسیر صفحه">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, i) => (
          <Fragment key={item.path}>
            {i > 0 && (
              <li aria-hidden="true">
                <ChevronLeft className="size-4" />
              </li>
            )}
            {i === items.length - 1 ? (
              <li aria-current="page" className="text-foreground font-medium">
                {item.name}
              </li>
            ) : (
              <li>
                <Link href={item.path} className="hover:text-foreground">
                  {item.name}
                </Link>
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
