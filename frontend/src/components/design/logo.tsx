import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Logo ({className = ""}) {
    return(
        <Link href="/">
            <div className={cn("flex items-center gap-3", className)}>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{
                        once: true,
                    }}
                    transition={{ type: "spring" }}
                >
                    <h1 className="text-3xl font-extrabold font-sans">
                        <span className="text-primary">a'</span>Rafitra
                    </h1>
                </motion.div>
            </div>
        </Link>
    )
}