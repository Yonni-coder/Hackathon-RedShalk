"use client"

import { usePathname } from "next/navigation"
import { PropsWithChildren, useMemo } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Props {
  href: string
}

export default function ActiveLink({ href, children }: PropsWithChildren<Props>) {
    const pathname = usePathname()
    const isActive = useMemo((): boolean => 
        pathname === href || pathname.startsWith(href + '/'), 
        [pathname, href]
    )
    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.05 }}
            className={cn(isActive && "text-accent",
                "flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200"
            )}
        >
            {children}
        </motion.a>
    )
}
