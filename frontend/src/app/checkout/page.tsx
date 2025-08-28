"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, Lock, Calendar, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { PaymentSkeleton } from "@/components/payment-skeleton"

export default function Page () {
    const { items, total, isOpen, addItem, removeItem, clearCart, toggleCart, openCart, closeCart } = useCartStore()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        company: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",
    })

    useEffect(() => {
        if (items.length === 0) {
            router.push("/")
        }
    }, [items.length, router])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ""
        const parts = []

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }

        if (parts.length) {
            return parts.join(" ")
        } else {
            return v
        }
    }

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`
        }
        return v
    }

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value)
        if (formatted.length <= 19) {
            handleInputChange("cardNumber", formatted)
        }
    }

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value)
        if (formatted.length <= 5) {
            handleInputChange("expiryDate", formatted)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Simulate successful payment
        const bookingId = `BK-${Date.now()}`

        // Store booking data for confirmation page
        localStorage.setItem(
            "lastBooking",
            JSON.stringify({
            id: bookingId,
            items: items,
            total: total,
            customerInfo: {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                company: formData.company,
            },
            paymentDate: new Date().toISOString(),
            }),
        )

        clearCart()
        router.push(`/confirmation/${bookingId}`)

        if (items.length === 0) {
            return null
        }
    
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>

                    <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Finaliser la réservation</h1>
                            <p className="text-muted-foreground">Complétez vos informations pour confirmer votre réservation</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                <CardTitle className="text-lg">Informations de contact</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className="mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <Label htmlFor="firstName">Prénom *</Label>
                                    <Input
                                        id="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        className="mt-1"
                                    />
                                    </div>
                                    <div>
                                    <Label htmlFor="lastName">Nom *</Label>
                                    <Input
                                        id="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        className="mt-1"
                                    />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="company">Entreprise</Label>
                                    <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => handleInputChange("company", e.target.value)}
                                    className="mt-1"
                                    />
                                </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Informations de paiement
                                </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="cardName">Nom sur la carte *</Label>
                                    <Input
                                    id="cardName"
                                    required
                                    value={formData.cardName}
                                    onChange={(e) => handleInputChange("cardName", e.target.value)}
                                    className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cardNumber">Numéro de carte *</Label>
                                    <Input
                                    id="cardNumber"
                                    required
                                    placeholder="1234 5678 9012 3456"
                                    value={formData.cardNumber}
                                    onChange={handleCardNumberChange}
                                    className="mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <Label htmlFor="expiryDate">Date d'expiration *</Label>
                                    <Input
                                        id="expiryDate"
                                        required
                                        placeholder="MM/YY"
                                        value={formData.expiryDate}
                                        onChange={handleExpiryChange}
                                        className="mt-1"
                                    />
                                    </div>
                                    <div>
                                    <Label htmlFor="cvv">CVV *</Label>
                                    <Input
                                        id="cvv"
                                        required
                                        placeholder="123"
                                        maxLength={4}
                                        value={formData.cvv}
                                        onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                                        className="mt-1"
                                    />
                                    </div>
                                </div>
                                </CardContent>
                            </Card>

                            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                                {loading ? (
                                    <PaymentSkeleton />
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        Payer {total} Ar
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Résumé de la commande</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3 p-3 bg-muted rounded-lg"
                                >
                                    <img
                                        src={item.image || "/placeholder.svg"}
                                        alt={item.roomName}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold truncate">{item.roomName}</h4>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{item.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {item.startTime} - {item.endTime} ({item.duration}h)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right mt-2">
                                            <div className="font-bold text-primary">{item.price * item.duration}€</div>
                                        </div>
                                    </div>
                                </motion.div>
                                ))}

                                <Separator />

                                <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Sous-total</span>
                                    <span>{total}€</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>TVA (20%)</span>
                                    <span>{Math.round(total * 0.2)}€</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total TTC</span>
                                    <span className="text-primary">{Math.round(total * 1.2)}€</span>
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Paiement sécurisé SSL</span>
                        </div>
                    </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
