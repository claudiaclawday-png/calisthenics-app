"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useWorkoutStore } from "@/lib/workout-store"
import { ArrowRight } from "lucide-react"

export default function SelectWorkoutPage() {
  const router = useRouter()
  const { getCurrentWorkoutDay, getWorkoutSchedule } = useWorkoutStore()
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>("")
  const [suggestedWorkout, setSuggestedWorkout] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un entrenamiento en progreso
    const { currentWorkout } = useWorkoutStore.getState()

    if (currentWorkout) {
      // Si hay un entrenamiento en progreso, redirigir directamente a la página de entrenamiento
      router.push("/workout")
      return
    }

    // Si no hay entrenamiento en progreso, cargar la sugerencia
    const suggested = getCurrentWorkoutDay()
    setSuggestedWorkout(suggested)
    setSelectedExercise(suggested.exercise)
    setSelectedWorkoutType(suggested.workoutType)
    setIsLoading(false)
  }, [getCurrentWorkoutDay, router])

  const handleStartWorkout = () => {
    // Set the selected workout in the store
    useWorkoutStore.getState().setSelectedWorkout({
      exercise: selectedExercise,
      workoutType: selectedWorkoutType,
    })

    // Navigate to the workout page
    router.push("/workout")
  }

  // Get unique exercises and workout types
  const workoutSchedule = getWorkoutSchedule()
  const exercises = Array.from(new Set(workoutSchedule.map((day) => day.exercise))).filter(
    (exercise) => exercise !== "Descanso",
  )
  const workoutTypes = Array.from(new Set(workoutSchedule.map((day) => day.workoutType))).filter(
    (type) => type !== "Descanso",
  )

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center p-4 h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
          <p className="text-muted-foreground">Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Seleccionar Entrenamiento</h1>
        <p className="text-muted-foreground">Elige el ejercicio y tipo de entrenamiento que quieres realizar</p>
      </div>

      {suggestedWorkout && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Entrenamiento Sugerido</CardTitle>
            <CardDescription>Basado en tu último entrenamiento registrado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Ejercicio:</span>
                <span>{suggestedWorkout.exercise}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tipo:</span>
                <span>{suggestedWorkout.workoutType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Día:</span>
                <span>{suggestedWorkout.dayName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ejercicio</CardTitle>
            <CardDescription>Selecciona qué ejercicio quieres realizar</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedExercise} onValueChange={setSelectedExercise} className="space-y-3">
              {exercises.map((exercise) => (
                <div key={exercise} className="flex items-center space-x-2">
                  <RadioGroupItem value={exercise} id={`exercise-${exercise}`} />
                  <Label htmlFor={`exercise-${exercise}`}>{exercise}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipo de Entrenamiento</CardTitle>
            <CardDescription>Selecciona qué tipo de entrenamiento quieres realizar</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedWorkoutType} onValueChange={setSelectedWorkoutType} className="space-y-3">
              {workoutTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={`type-${type}`} />
                  <Label htmlFor={`type-${type}`}>{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={handleStartWorkout} disabled={!selectedExercise || !selectedWorkoutType}>
          Comenzar Entrenamiento
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
