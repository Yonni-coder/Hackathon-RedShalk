"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Users,
  Building,
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Wifi,
  Home,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Library,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Logo from "@/components/design/logo"
import TypesForm from "@/components/design/manage/types-forms"
import RessourcesForm from "@/components/design/manage/ressources-forms"

// Données simulées pour les statistiques
const occupancyData = [
  { name: "Lun", occupied: 85, available: 15 },
  { name: "Mar", occupied: 92, available: 8 },
  { name: "Mer", occupied: 78, available: 22 },
  { name: "Jeu", occupied: 88, available: 12 },
  { name: "Ven", occupied: 95, available: 5 },
  { name: "Sam", occupied: 45, available: 55 },
  { name: "Dim", occupied: 32, available: 68 },
]

const roomTypeData = [
  { name: "Bureaux privés", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Espaces ouverts", value: 40, color: "hsl(var(--chart-2))" },
  { name: "Salles de réunion", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Espaces détente", value: 10, color: "hsl(var(--chart-4))" },
]

const revenueData = [
  { month: "Jan", revenue: 12500 },
  { month: "Fév", revenue: 14200 },
  { month: "Mar", revenue: 13800 },
  { month: "Avr", revenue: 15600 },
  { month: "Mai", revenue: 16900 },
  { month: "Jun", revenue: 18200 },
]

const rooms = [
  { id: 1, name: "Bureau A1", type: "Bureau privé", capacity: 4, status: "occupied", price: "€45/jour" },
  { id: 2, name: "Salle Réunion B", type: "Salle de réunion", capacity: 8, status: "available", price: "€25/heure" },
  { id: 3, name: "Open Space C", type: "Espace ouvert", capacity: 20, status: "occupied", price: "€15/jour" },
  { id: 4, name: "Bureau A2", type: "Bureau privé", capacity: 2, status: "maintenance", price: "€35/jour" },
  { id: 5, name: "Salle Créative", type: "Espace créatif", capacity: 12, status: "available", price: "€30/heure" },
  { id: 6, name: "Cabine Phone", type: "Cabine téléphone", capacity: 1, status: "occupied", price: "€5/heure" },
]

export default function CoworkingDashboard() {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState("dashboard")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-red-500"
      case "available":
        return "bg-green-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "occupied":
        return "Occupé"
      case "available":
        return "Disponible"
      case "maintenance":
        return "Maintenance"
      default:
        return "Inconnu"
    }
  }

    const sidebarItems = [
        { id: "dashboard", label: "Tableau de Bord", icon: Home },
        { id: "rooms", label: "Gestion des Salles", icon: Building },
        { id: "analytics", label: "Analytiques", icon: BarChart3 },
        { id: "layout", label: "Plan des Salles", icon: MapPin },
        { id: "members", label: "Membres", icon: Users },
        { id: "ressources", label: "Ressources", icon: Library },
    ]

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 px-2 py-1">
                            <Logo />
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {sidebarItems.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton
                                                    onClick={() => setActiveSection(item.id)}
                                                    isActive={activeSection === item.id}
                                                    tooltip={item.label}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Aide & Support">
                            <HelpCircle className="h-4 w-4" />
                            <span>Aide & Support</span>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Déconnexion">
                            <LogOut className="h-4 w-4" />
                            <span>Déconnexion</span>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex flex-1 items-center justify-between">
                        <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {sidebarItems.find((item) => item.id === activeSection)?.label || "Tableau de Bord"}
                        </h1>
                        <p className="text-sm text-muted-foreground">Gestion et statistiques de votre espace de travail</p>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90">
                        <Calendar className="w-4 h-4 mr-2" />
                        Nouvelle Réservation
                        </Button>
                    </div>
                    </header>

                    <div className="flex-1 space-y-4 p-4 pt-6">
                    {activeSection === "dashboard" && (
                        <div className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Taux d'Occupation</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">87%</div>
                                <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
                                <Progress value={87} className="mt-2" />
                            </CardContent>
                            </Card>

                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">€18,200</div>
                                <p className="text-xs text-muted-foreground">+8% par rapport au mois dernier</p>
                            </CardContent>
                            </Card>

                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Salles Actives</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">24/28</div>
                                <p className="text-xs text-muted-foreground">4 salles en maintenance</p>
                            </CardContent>
                            </Card>

                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Membres Actifs</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">156</div>
                                <p className="text-xs text-muted-foreground">+23 nouveaux ce mois</p>
                            </CardContent>
                            </Card>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Occupation Chart */}
                            <Card>
                            <CardHeader>
                                <CardTitle>Occupation Hebdomadaire</CardTitle>
                                <CardDescription>Taux d'occupation par jour de la semaine</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                config={{
                                    occupied: { label: "Occupé", color: "hsl(var(--chart-1))" },
                                    available: { label: "Disponible", color: "hsl(var(--chart-2))" },
                                }}
                                className="h-[300px]"
                                >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={occupancyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="occupied" fill="var(--color-occupied)" />
                                    <Bar dataKey="available" fill="var(--color-available)" />
                                    </BarChart>
                                </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                            </Card>

                            {/* Room Types Distribution */}
                            <Card>
                            <CardHeader>
                                <CardTitle>Répartition des Types de Salles</CardTitle>
                                <CardDescription>Distribution par type d'espace</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                config={{
                                    value: { label: "Pourcentage" },
                                }}
                                className="h-[300px]"
                                >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                    <Pie
                                        data={roomTypeData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}%`}
                                    >
                                        {roomTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                            </Card>
                        </div>

                        {/* Revenue Chart */}
                        <Card>
                            <CardHeader>
                            <CardTitle>Évolution des Revenus</CardTitle>
                            <CardDescription>Revenus mensuels sur les 6 derniers mois</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <ChartContainer
                                config={{
                                revenue: { label: "Revenus (€)", color: "hsl(var(--chart-1))" },
                                }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--color-revenue)"
                                    fill="var(--color-revenue)"
                                    fillOpacity={0.3}
                                    />
                                </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            </CardContent>
                        </Card>
                        </div>
                    )}

                    {activeSection === "rooms" && (
                        <Card>
                        <CardHeader>
                            <CardTitle>Gestion des Salles</CardTitle>
                            <CardDescription>État actuel de toutes les salles et espaces</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rooms.map((room) => (
                                <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{room.name}</CardTitle>
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(room.status)}`} />
                                    </div>
                                    <CardDescription>{room.type}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        {room.capacity} personnes
                                    </span>
                                    <Badge variant={room.status === "available" ? "default" : "secondary"}>
                                        {getStatusText(room.status)}
                                    </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-primary">{room.price}</span>
                                    <Button size="sm" variant="outline">
                                        Gérer
                                    </Button>
                                    </div>
                                </CardContent>
                                </Card>
                            ))}
                            </div>
                        </CardContent>
                        </Card>
                    )}

                    {activeSection === "analytics" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                            <CardTitle>Heures de Pointe</CardTitle>
                            <CardDescription>Utilisation par tranche horaire</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                <span className="text-sm">9h - 12h</span>
                                <div className="flex items-center space-x-2">
                                    <Progress value={95} className="w-24" />
                                    <span className="text-sm font-medium">95%</span>
                                </div>
                                </div>
                                <div className="flex items-center justify-between">
                                <span className="text-sm">12h - 14h</span>
                                <div className="flex items-center space-x-2">
                                    <Progress value={65} className="w-24" />
                                    <span className="text-sm font-medium">65%</span>
                                </div>
                                </div>
                                <div className="flex items-center justify-between">
                                <span className="text-sm">14h - 18h</span>
                                <div className="flex items-center space-x-2">
                                    <Progress value={88} className="w-24" />
                                    <span className="text-sm font-medium">88%</span>
                                </div>
                                </div>
                                <div className="flex items-center justify-between">
                                <span className="text-sm">18h - 20h</span>
                                <div className="flex items-center space-x-2">
                                    <Progress value={45} className="w-24" />
                                    <span className="text-sm font-medium">45%</span>
                                </div>
                                </div>
                            </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                            <CardTitle>Services Populaires</CardTitle>
                            <CardDescription>Utilisation des services additionnels</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Wifi className="w-4 h-4" />
                                    <span className="text-sm">WiFi Premium</span>
                                </div>
                                <span className="text-sm font-medium">89%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">Accès 24/7</span>
                                </div>
                                <span className="text-sm font-medium">67%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">Domiciliation</span>
                                </div>
                                <span className="text-sm font-medium">34%</span>
                                </div>
                            </div>
                            </CardContent>
                        </Card>
                        </div>
                    )}

                    {activeSection === "layout" && (
                        <Card>
                        <CardHeader>
                            <CardTitle>Plan Interactif des Salles</CardTitle>
                            <CardDescription>Cliquez sur une salle pour voir les détails</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative bg-muted rounded-lg p-8 min-h-[400px]">
                            {/* Simulation d'un plan de bureau */}
                            <div className="grid grid-cols-4 gap-4 h-full">
                                {/* Zone bureaux privés */}
                                <div className="col-span-2 space-y-2">
                                <h3 className="text-sm font-medium mb-2">Bureaux Privés</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-16 rounded border-2 cursor-pointer transition-colors ${
                                        selectedRoom === i
                                            ? "border-primary bg-primary/10"
                                            : "border-border bg-card hover:border-primary/50"
                                        }`}
                                        onClick={() => setSelectedRoom(selectedRoom === i ? null : i)}
                                    >
                                        <div className="p-2 text-xs">
                                        <div className="font-medium">Bureau A{i}</div>
                                        <div
                                            className={`w-2 h-2 rounded-full mt-1 ${i % 2 === 0 ? "bg-green-500" : "bg-red-500"}`}
                                        />
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                </div>

                                {/* Zone espaces ouverts */}
                                <div className="col-span-1">
                                <h3 className="text-sm font-medium mb-2">Espace Ouvert</h3>
                                <div
                                    className={`h-32 rounded border-2 cursor-pointer transition-colors ${
                                    selectedRoom === 5
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-card hover:border-primary/50"
                                    }`}
                                    onClick={() => setSelectedRoom(selectedRoom === 5 ? null : 5)}
                                >
                                    <div className="p-2 text-xs">
                                    <div className="font-medium">Open Space</div>
                                    <div className="w-2 h-2 rounded-full mt-1 bg-red-500" />
                                    </div>
                                </div>
                                </div>

                                {/* Zone salles de réunion */}
                                <div className="col-span-1">
                                <h3 className="text-sm font-medium mb-2">Salles Réunion</h3>
                                <div className="space-y-2">
                                    {[6, 7].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-12 rounded border-2 cursor-pointer transition-colors ${
                                        selectedRoom === i
                                            ? "border-primary bg-primary/10"
                                            : "border-border bg-card hover:border-primary/50"
                                        }`}
                                        onClick={() => setSelectedRoom(selectedRoom === i ? null : i)}
                                    >
                                        <div className="p-2 text-xs">
                                        <div className="font-medium">Salle {i - 5}</div>
                                        <div
                                            className={`w-2 h-2 rounded-full mt-1 ${i === 6 ? "bg-green-500" : "bg-yellow-500"}`}
                                        />
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                </div>
                            </div>

                            {/* Légende */}
                            <div className="absolute bottom-4 left-4 flex space-x-4 text-xs">
                                <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Disponible</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span>Occupé</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <span>Maintenance</span>
                                </div>
                            </div>
                            </div>

                            {/* Détails de la salle sélectionnée */}
                            {selectedRoom && (
                            <Card className="mt-4">
                                <CardHeader>
                                <CardTitle>Détails de la Salle</CardTitle>
                                </CardHeader>
                                <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                    <span className="font-medium">Nom:</span> Bureau A{selectedRoom}
                                    </div>
                                    <div>
                                    <span className="font-medium">Capacité:</span>{" "}
                                    {selectedRoom <= 4 ? "2-4" : selectedRoom === 5 ? "20" : "8"} personnes
                                    </div>
                                    <div>
                                    <span className="font-medium">Statut:</span>
                                    <Badge className="ml-2" variant={selectedRoom % 2 === 0 ? "default" : "secondary"}>
                                        {selectedRoom % 2 === 0 ? "Disponible" : "Occupé"}
                                    </Badge>
                                    </div>
                                    <div>
                                    <span className="font-medium">Prix:</span> €
                                    {selectedRoom <= 4 ? "35" : selectedRoom === 5 ? "15" : "25"}/
                                    {selectedRoom <= 4 || selectedRoom === 5 ? "jour" : "heure"}
                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                            )}
                        </CardContent>
                        </Card>
                    )}

                    {activeSection === "members" && (
                        <Card>
                        <CardHeader>
                            <CardTitle>Gestion des Membres</CardTitle>
                            <CardDescription>Liste et statistiques des membres actifs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Section Membres</h3>
                            <p className="text-muted-foreground">Cette section sera développée prochainement</p>
                            </div>
                        </CardContent>
                        </Card>
                    )}

                    {activeSection === "ressources" && (
                        <div className="flex gap-5">
                            <RessourcesForm />
                            <TypesForm />
                        </div>
                    )}

                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
