"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { type UserRole } from "@/stores/auth.store"

export function NavMain({
  items,
  role,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  role: UserRole | null
}) {
  const pathname = usePathname()

  // Get the route prefix for the current role to ensure we only match routes for this role
  const getRolePrefix = (userRole: UserRole | null): string => {
    switch (userRole) {
      case "ADMIN":
        return "/admin"
      case "MERCHANT":
        return "/merchant"
      case "CLIENT":
      default:
        return "/dashboard"
    }
  }

  const rolePrefix = getRolePrefix(role)

  // Find the most specific matching route to ensure only one is active
  // Only consider routes that belong to the current user's role
  const getActiveUrl = () => {
    if (!pathname) return null

    // Only process routes that match the current role's prefix
    if (!pathname.startsWith(rolePrefix)) return null

    // Filter items to only those that belong to the current role
    const roleItems = items.filter((item) => item.url.startsWith(rolePrefix))

    // First, check for exact matches
    const exactMatch = roleItems.find((item) => pathname === item.url)
    if (exactMatch) return exactMatch.url

    // Then, find all routes that match (pathname is a child of the route)
    const matchingRoutes = roleItems.filter((item) => {
      return pathname.startsWith(item.url + "/")
    })

    if (matchingRoutes.length === 0) return null

    // Return the most specific match (longest URL)
    return matchingRoutes.reduce((mostSpecific, current) => {
      return current.url.length > mostSpecific.url.length ? current : mostSpecific
    }).url
  }

  const activeUrl = getActiveUrl()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = activeUrl === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                  className={cn(
                    isActive &&
                      "bg-blue-600! text-white! hover:bg-blue-700! hover:text-white! active:bg-blue-700! active:text-white! data-[active=true]:bg-blue-600! data-[active=true]:text-white! duration-200 ease-linear"
                  )}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
