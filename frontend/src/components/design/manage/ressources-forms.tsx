"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Library, Loader2, Upload } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

export default function RessourcesForm () {

    const ressourceSchema = z.object({
        nom: z.string().nonempty("Ce champ est requis"),
        description: z.string().nonempty("Ce champ est requis"),
        capacity: z.string().optional(),
        type_id: z.number(),
        location: z.string().nonempty("Ce champ est requis")
    })
    
    type ressourceFormValues = z.infer<typeof ressourceSchema>

    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isValid, isSubmitting },
    } = useForm<ressourceFormValues>({
        mode: "onTouched",
        resolver: zodResolver(ressourceSchema),
    })

    const onSubmit = (data: ressourceFormValues) => {
        console.log(data)
    }

    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>
                    Création de Ressources
                </CardTitle>
                <CardDescription>
                    Ajoutez et configurez vos espaces physiques (salles, bureaux, espaces de travail, etc.) afin de les rendre disponibles pour réservation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 space-y-2">
                        <Label htmlFor="nom">
                            Nom : <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nom"
                            {...register("nom")}
                            placeholder="Nom de la ressource"
                            className="col-span-3"
                        />
                        {errors.nom && (
                            <p className="text-red-500 text-sm">{errors.nom.message}</p>
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="location">
                            Localisation : <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="location"
                            {...register("location")}
                            placeholder="Localisation"
                            className="col-span-3 resize-none"
                        />
                        {errors.location && (
                            <p className="text-red-500 text-sm">{errors.location.message}</p>
                        )}
                    </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                        <Label htmlFor="description">
                            Type : <span className="text-red-500">*</span>
                        </Label>
                        <Select onValueChange={(val) => setValue("type_id", Number(val) as any, { shouldValidate: true })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir le type" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* {types?.map((type, index) => (
                                    <SelectItem key={index} value={type?.id.toString()}>
                                        {type?.nom}
                                    </SelectItem>
                                ))} */}
                            </SelectContent>
                        </Select>
                        {errors.type_id && (
                            <p className="text-red-500 text-sm">{errors.type_id.message}</p>
                        )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="capacity">
                                Capacité :
                            </Label>
                            <Input
                                id="capacity"
                                {...register("capacity")}
                                placeholder="Capacité"
                                className="col-span-3"
                            />
                            {errors.capacity && (
                                <p className="text-red-500 text-sm">{errors.capacity.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description : <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Description du type"
                            className="col-span-3 resize-none"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm">{errors.description.message}</p>
                        )}
                    </div>
                    <Button
                        disabled={!isValid || isSubmitting}
                        variant="default"
                        type="submit"
                        className="w-full"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
                        ) : (
                            <Library className="w-4 h-4 mr-2" />
                        )}
                        Créer le ressource
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}