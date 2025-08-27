"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/design/logo"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const registerSchema = z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(8, "Numéro de téléphone invalide"),
    role: z.enum(["Admin", "Agent", "Client", "Gestionnaire"], {
        required_error: "Veuillez sélectionner un rôle",
    }),
    entreprise: z.string().min(2, "Le nom de l’entreprise est requis"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [phone, setPhone] = useState("")

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isValid, isSubmitting },
    } = useForm<RegisterFormValues>({
        mode: "onTouched",
        resolver: zodResolver(registerSchema),
    })

    return (
        <div className="min-h-screen relative overflow-hidden">

            <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <Card className="shadow-2xl">
                        <CardHeader className="text-center space-y-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                            >
                                <CardTitle className="flex items-center justify-center text-3xl font-bold text-balance">
                                    <Logo />
                                </CardTitle>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                                <CardDescription className="text-muted-foreground text-balance">
                                    Rejoindre une communauté active et engagée
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <form className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Nom : <span className="text-sm text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User 
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" 
                                            />
                                            <Input
                                                id="nom"
                                                type="text"
                                                placeholder="Enter votre nom"
                                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                {...register("nom")}
                                            />
                                        </div>
                                        {errors.nom && 
                                            <span className="text-sm text-red-500">
                                                {errors.nom.message}
                                            </span>
                                        }
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Prénom : <span className="text-sm text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User 
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" 
                                            />
                                            <Input
                                                id="prenom"
                                                type="text"
                                                placeholder="Enter votre prenom"
                                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                {...register("prenom")}
                                            />
                                        </div>
                                        {errors.nom && 
                                            <span className="text-sm text-red-500">
                                                {errors.nom.message}
                                            </span>
                                        }
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email : <span className="text-sm text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Mail 
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" 
                                        />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="example: johndoe@example.com"
                                            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            {...register("email")}
                                        />
                                    </div>
                                    {errors.email && 
                                        <span className="text-xs text-red-500">
                                            {errors.email.message}
                                        </span>
                                    }
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="text-sm font-medium">
                                            Rôle : <span className="text-sm text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Select onValueChange={(val) => setValue("role", val as any, { shouldValidate: true })}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choisir votre rôle" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles?.map((role, index) => (
                                                        <SelectItem key={index} value={role.name}>
                                                            {role.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {errors.role && 
                                            <span className="text-xs text-red-500">
                                                {errors.role.message}
                                            </span>
                                        }
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-2"
                                >
                                    <Label className="block text-sm font-medium">
                                        Téléphone : <span className="text-red-500 text-sm">*</span>
                                    </Label>
                                    <PhoneInput
                                        defaultCountry="mg"
                                        value={phone}
                                        onChange={(phone) => {
                                            setPhone(phone)
                                            setValue("phone", phone, { shouldValidate: true })
                                        }}
                                        className={cn(
                                            "w-full rounded-lg border p-0.5 text-base",
                                            "bg-background text-foreground border-input",
                                            "placeholder:text-muted-foreground",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                            "disabled:cursor-not-allowed disabled:opacity-50",
                                            "max-sm:text-caption4"
                                        )}
                                        style={
                                        {
                                            "--react-international-phone-background-color": "var(--background)",
                                            "--react-international-phone-border-radius": "0.5rem",
                                            "--react-international-phone-border-color": "none",
                                            "--react-international-phone-text-color": "var(--foreground)",
                                            "--react-international-phone-placeholder-color": "var(--muted-foreground)",
                                            "--react-international-phone-font-size": "16px",
                                        } as React.CSSProperties
                                        }
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.9 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Mot de passe : <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a password"
                                            className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            {...register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && 
                                        <span className="text-xs text-red-500">
                                            {errors.password.message}
                                        </span>
                                    }
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.1 }}
                                    className="pt-2"
                                >
                                    <Button type="submit" className="w-full group relative overflow-hidden" size="lg">
                                    <motion.span
                                        className="flex items-center justify-center gap-2"
                                        whileHover={{ x: -5 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        Créer un compte
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </motion.span>
                                    </Button>
                                </motion.div>
                            </form>

                            <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="text-center text-sm text-muted-foreground"
                            >
                                <p className="text-balance">
                                    By creating an account, you agree to our{" "}
                                    <Link href="/terms" className="text-primary hover:underline">
                                    Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                    </Link>
                                </p>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

        </div>
    )
}
