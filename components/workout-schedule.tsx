"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWorkoutStore } from "@/lib/workout-store"
import Link from "next/link"
import { Edit2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function WorkoutSchedule() {
  const [currentDay, setCurrentDay] = useState("")
  const [workoutType, setWorkoutType] = useState("")
  const [exercise, setExercise] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [lastIndex, setLastIndex] = useState(-1)
  const [nextIndex, setNextIndex] = useState(0)
  const { getCurrentWorkoutDay, getWorkoutSchedule } = useWorkoutStore()

  useEffect(() => {
    // Asegurarse de que getCurrentWorkoutDay esté disponible antes de llamarlo
    if (typeof getCurrentWorkoutDay === "function") {
      try {
        const nextWorkout = getCurrentWorkoutDay()
        setCurrentDay(nextWorkout.dayName)
        setWorkoutType(nextWorkout.workoutType)
        setExercise(nextWorkout.exercise)

        // Obtener índices para depuración
        const { lastWorkoutIndex } = useWorkoutStore.getState()
        setLastIndex(lastWorkoutIndex)
        setNextIndex((lastWorkoutIndex + 1) % getWorkoutSchedule().length)

        setIsLoading(false)
      } catch (error) {
        console.error("Error al obtener el día de entrenamiento actual:", error)
        setIsLoading(false)
      }
    }
  }, [getCurrentWorkoutDay, getWorkoutSchedule])

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-muted-foreground">Cargando entrenamiento...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-primary/5 border-primary/20">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Secuencia de Entrenamiento</AlertTitle>
        <AlertDescription className="text-xs">
          Los entrenamientos siguen esta secuencia: Dominadas Max Reps → Fondos Max Reps → Dominadas Sub Max → Fondos
          Sub Max → Dominadas Volumen Escalera → Fondos Volumen Escalera
        </AlertDescription>
      </Alert>

      {/* Información de depuración - solo visible durante desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-muted-foreground bg-gray-100 p-2 rounded">
          <p>Último índice: {lastIndex}</p>
          <p>Próximo índice: {nextIndex}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Día:</p>
          <p className="text-lg font-bold">{currentDay}</p>
        </div>
        <Badge variant={exercise === "Dominadas" ? "default" : "secondary"} className="text-xs">
          {exercise}
        </Badge>
      </div>
      <div>
        <p className="text-sm font-medium">Tipo de entrenamiento:</p>
        <p className="text-lg">{workoutType}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Descripción:</p>
        <p className="text-sm text-muted-foreground">
          {workoutType === "Max Reps" && "3 series al máximo con 5 minutos de descanso"}
          {workoutType === "Sub Max" && "10 series al 50% del máximo con 1 minuto de descanso"}
          {workoutType === "Volumen Escalera" &&
            "Empezar con 1 rep e ir aumentando hasta el máximo. Repetir 5 veces con 30 segundos de descanso"}
        </p>
      </div>
      <div className="pt-4 mt-2">
        <Link href="/workout/select">
          <Button variant="outline" size="sm" className="w-full">
            <Edit2 className="mr-2 h-4 w-4" />
            Cambiar Entrenamiento
          </Button>
        </Link>
      </div>
    </div>
  )
}
