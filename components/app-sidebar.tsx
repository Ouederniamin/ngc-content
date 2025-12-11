"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Layers,
  FolderKanban,
  Settings,
  ChevronRight,
  LogOut,
  Sparkles,
  BookOpen,
  HelpCircle,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authClient } from "@/lib/auth-client"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
}

const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "SkillPaths",
    url: "/dashboard/skillpaths",
    icon: Layers,
    items: [
      {
        title: "All SkillPaths",
        url: "/dashboard/skillpaths",
      },
      {
        title: "Create SkillPath",
        url: "/dashboard/skillpaths/create",
      },
    ],
  },
  {
    title: "Content",
    url: "/dashboard/lessons",
    icon: BookOpen,
    items: [
      {
        title: "Lessons",
        url: "/dashboard/lessons",
      },
      {
        title: "Quizzes",
        url: "/dashboard/quizzes",
      },
      {
        title: "Projects",
        url: "/dashboard/projects",
      },
    ],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login"
        },
      },
    })
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="size-4" />
    if (theme === "system") return <Monitor className="size-4" />
    if (resolvedTheme === "dark") return <Moon className="size-4" />
    return <Sun className="size-4" />
  }

  const getThemeLabel = () => {
    if (!mounted) return "Theme"
    if (theme === "system") return "System"
    if (theme === "dark") return "Dark"
    return "Light"
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NGC Content</span>
                  <span className="truncate text-xs text-muted-foreground">
                    AI Content Creator
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) =>
                item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={pathname.startsWith(item.url)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname.startsWith(item.url)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Quick Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Create Lesson">
                  <Link href="/dashboard/lessons/create">
                    <BookOpen className="text-blue-500" />
                    <span>New Lesson</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Create Quiz">
                  <Link href="/dashboard/quizzes/create">
                    <HelpCircle className="text-green-500" />
                    <span>New Quiz</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Create Project">
                  <Link href="/dashboard/projects/create">
                    <FolderKanban className="text-orange-500" />
                    <span>New Project</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Theme Toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={cycleTheme}
              tooltip={`Theme: ${getThemeLabel()}`}
              className="cursor-pointer"
            >
              {getThemeIcon()}
              <span>{getThemeLabel()} Mode</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User Menu */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user.name || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={cycleTheme}
                  className="cursor-pointer"
                >
                  {getThemeIcon()}
                  <span className="ml-2">{getThemeLabel()} Mode</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
