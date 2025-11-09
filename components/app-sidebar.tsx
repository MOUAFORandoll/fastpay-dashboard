"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  IconDashboard,
  IconUsers,
  IconWorld,
  IconSettings,
  IconCreditCard,
  IconTransfer,
  IconBolt,
  IconHelp,
  IconSearch,
  IconInnerShadowTop,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from "@tabler/icons-react"

import { useAuthStore, type UserRole } from "@/stores/auth.store"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const getNavigationForRole = (role: UserRole | null) => {
  const baseNavSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ]

  switch (role) {
    case "ADMIN":
      return {
        navMain: [
          {
            title: "Dashboard",
            url: "/admin",
            icon: IconDashboard,
          },
          {
            title: "Users",
            url: "/admin/users",
            icon: IconUsers,
          },
          {
            title: "Countries",
            url: "/admin/countries",
            icon: IconWorld,
          },
          {
            title: "Services",
            url: "/admin/services",
            icon: IconSettings,
          },
        ],
        navSecondary: baseNavSecondary,
      }
    case "MERCHANT":
      return {
        navMain: [
          {
            title: "Dashboard",
            url: "/merchant",
            icon: IconDashboard,
          },
          {
            title: "Payments",
            url: "/merchant/payments",
            icon: IconCreditCard,
          },
          {
            title: "Transfers",
            url: "/merchant/transfers",
            icon: IconTransfer,
          },
          {
            title: "Quick Links",
            url: "/merchant/quick",
            icon: IconBolt,
          },
        ],
        navSecondary: baseNavSecondary,
      }
    case "CLIENT":
    default:
      return {
        navMain: [
          {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
          },
        ],
        navSecondary: baseNavSecondary,
      }
  }
}

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? theme : "system"

  const getThemeIcon = () => {
    switch (currentTheme) {
      case "light":
        return <IconSun className="size-4" />
      case "dark":
        return <IconMoon className="size-4" />
      default:
        return <IconDeviceDesktop className="size-4" />
    }
  }

  const getThemeLabel = () => {
    switch (currentTheme) {
      case "light":
        return "Light"
      case "dark":
        return "Dark"
      default:
        return "System"
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip="Theme" className="w-full">
              {getThemeIcon()}
              <span>{getThemeLabel()}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuRadioGroup value={currentTheme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <IconSun className="mr-2 size-4" />
                <span>Light</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <IconMoon className="mr-2 size-4" />
                <span>Dark</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <IconDeviceDesktop className="mr-2 size-4" />
                <span>System</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { user, getRole } = useAuthStore()
  const role = getRole() || "CLIENT"
  const navigation = getNavigationForRole(role)

  const userData = user
    ? {
        name: user.fullname,
        email: user.email,
        avatar: "",
      }
    : {
        name: "Guest User",
        email: "guest@example.com",
        avatar: "",
      }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">FastPay</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {role === "MERCHANT" && (
          <div className="px-2 py-2 border-b">
            <OrganizationSwitcher align="start" fullWidth />
          </div>
        )}
        <NavMain items={navigation.navMain} />
        <NavSecondary items={navigation.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <ThemeSwitcher />
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
