"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

export default function TypesForm () {

    const typeSchema = z.object({
        nom: z.string().nonempty("Ce champ est requis"),
        description: z.string().nonempty("Ce champ est requis"),
    })
    
    type typeFormValues = z.infer<typeof typeSchema>

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isValid, isSubmitting },
    } = useForm<typeFormValues>({
        mode: "onTouched",
        resolver: zodResolver(typeSchema),
    })

    const onSubmit = (data: typeFormValues) => {
        console.log(data)
    }

    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>
                    Types de Ressources
                </CardTitle>
                <CardDescription>
                    Définissez les catégories de vos espaces (salles de réunion, bureaux individuels, espaces collaboratifs, etc.) pour mieux organiser vos ressources.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <fieldset disabled={isSubmitting} className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="nom">
                            Nom : <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nom"
                            {...register("nom")}
                            placeholder="Nom du type"
                            className="col-span-3"
                        />
                        {errors.nom && (
                            <p className="text-red-500 text-sm">{errors.nom.message}</p>
                        )}
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
                        <Upload className="w-4 h-4 mr-2" />
                        Créer un Type
                    </Button>
                    </fieldset>
                </form>
            </CardContent>
        </Card>
    )
}