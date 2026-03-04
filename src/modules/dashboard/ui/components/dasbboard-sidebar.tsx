"use client"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { BotIcon, icons, StarIcon, VideoIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { index } from "drizzle-orm/gel-core"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { DashboardUserButton } from "./dashboard-user-button"
import { DashboardTrial } from "./dashboard-trial"

const firstSection = [
    {
        icons: VideoIcon,
        label: "Meetings",
        href: "/meetings"
    },
    {
        icons: BotIcon,
        label: "Agents",
        href: "/agents"
    },
]

const secondSection = [
      {
        icons: StarIcon,
        label: "upgrade",
        href: "/upgrade"
    }
]


export const DashboardSidebar = () => { 
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader className="text-shadow-sidebar-accent-foreground">
                <Link href="/" className="flex items-center gap-2 px-2 pt-2">
                    <Image src="/logo.svg" width={36} height={36} alt="logo" />
                    <p className="text-2xl font-semibold">Therapy.AI</p>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className="opacity-10 text-[#5D6B68]"/>
            </div>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {
                                firstSection.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild className={cn(
                                            "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                            pathname ===item.href && "bg-linear-to-r/oklch border-[#5D6B68]/10 "
                                        )}
                                        isActive={pathname === item.href}
                                        >
                                            <Link href={item.href}>
                                                <item.icons className="size-5" />
                                                <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    ))
                                }
                            </SidebarMenu>
                        </SidebarGroupContent>
                </SidebarGroup>
                <div className="px-4 py-2">
                    <Separator className="opacity-10 text-[#5D6B68]"/>
                </div>
                <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {
                                secondSection.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild className={cn(
                                            "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                            pathname ===item.href && "bg-linear-to-r/oklch border-[#5D6B68]/10 "
                                        )}
                                        isActive={pathname === item.href}
                                        >
                                            <Link href={item.href}>
                                                <item.icons className="size-5" />
                                                <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    ))
                                }
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter className="text-white">
                <DashboardTrial/>
                <DashboardUserButton/>
            </SidebarFooter>

        </Sidebar>
        
    )
}





