"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Route configuration for better labels
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  skillpaths: "SkillPaths",
  lessons: "Lessons",
  quizzes: "Quizzes",
  projects: "Projects",
  modules: "Modules",
  units: "Units",
  settings: "Settings",
  create: "Create",
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname()

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = React.useMemo(() => {
    // Remove leading slash and split
    const pathSegments = pathname.split("/").filter(Boolean)

    // Build breadcrumb items
    const items: { label: string; href: string; isLast: boolean }[] = []

    pathSegments.forEach((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/")
      const isLast = index === pathSegments.length - 1

      // Check if this is a dynamic ID (number)
      const isId = /^\d+$/.test(segment)

      let label = segment

      if (isId) {
        // For IDs, use a generic label based on the previous segment
        const prevSegment = pathSegments[index - 1]
        if (prevSegment === "skillpaths") {
          label = "SkillPath Details"
        } else if (prevSegment === "modules") {
          label = "Module Details"
        } else if (prevSegment === "lessons") {
          label = "Lesson Details"
        } else if (prevSegment === "quizzes") {
          label = "Quiz Details"
        } else if (prevSegment === "projects") {
          label = "Project Details"
        } else {
          label = `#${segment}`
        }
      } else {
        // Use configured label or capitalize the segment
        label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      }

      items.push({ label, href, isLast })
    })

    return items
  }, [pathname])

  // Don't show breadcrumbs on just /dashboard
  if (generateBreadcrumbs.length <= 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {generateBreadcrumbs.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem className={index === 0 ? "" : "hidden md:block"}>
              {item.isLast ? (
                <BreadcrumbPage className="max-w-[200px] truncate">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="max-w-[150px] truncate">
                    {index === 0 ? (
                      <span className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && (
              <BreadcrumbSeparator className={index === 0 ? "" : "hidden md:block"}>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
