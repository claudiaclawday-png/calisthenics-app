"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore } from "@/lib/workout-store"
import MaxRepsWorkout from "@/components/max-reps-workout"
import SubMaxWorkout from "@/components/sub-max-workout"
import VolumeWorkout from "@/components/volume-workout"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function WorkoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { getCurrentWorkoutDay, completeWorkout, clearCurrentWorkoutState } = useWorkoutStore()
  const [currentWorkout, setCurrentWorkout] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar el entrenamiento actual o seleccionado
  useEffect(() => {
    const loadWorkout = () => {
      const { selectedWorkout, currentWorkout } = useWorkoutStore.getState()

      // Si ya había un entrenamiento en progreso, continuar con él
      if (currentWorkout) {
        setCurrentWorkout(currentWorkout)
        setIsLoading(false)
        return
      }

      // Si no hay entrenamiento en progreso pero hay uno seleccionado
      if (selectedWorkout && selectedWorkout.exercise && selectedWorkout.workoutType) {
        // Find the day that matches the selected workout
        const matchingDay = useWorkoutStore
          .getState()
          .getWorkoutSchedule()
          .find((day) => day.exercise === selectedWorkout.exercise && day.workoutType === selectedWorkout.workoutType)

        if (matchingDay) {
          setCurrentWorkout(matchingDay)
        } else {
          // Fallback to suggested workout
          setCurrentWorkout(getCurrentWorkoutDay())
        }
      } else {
        // No selection, use suggested workout
        setCurrentWorkout(getCurrentWorkoutDay())
      }

      setIsLoading(false)
    }

    loadWorkout()

    // Recargar el entrenamiento cuando la pestaña se vuelve visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadWorkout()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [getCurrentWorkoutDay])

  const handleComplete = (workoutData: any) => {
    completeWorkout({
      ...workoutData,
      date: new Date().toISOString(),
      exercise: currentWorkout.exercise,
      workoutType: currentWorkout.workoutType,
    })

    setIsCompleted(true)
    toast({
      title: "¡Entrenamiento completado!",
      description: "Tu progreso ha sido guardado",
    })
  }

  const handleFinish = () => {
    // Clear the selected workout and current workout state
    useWorkoutStore.getState().setSelectedWorkout({ exercise: "", workoutType: "" })
    clearCurrentWorkoutState()
    router.push("/")
  }

  const handleCancelWorkout = () => {
    if (showCancelConfirm) {
      clearCurrentWorkoutState()
      useWorkoutStore.getState().setSelectedWorkout({ exercise: "", workoutType: "" })
      router.push("/")
    } else {
      setShowCancelConfirm(true)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center p-4 h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cargando entrenamiento...</h2>
          <p className="text-muted-foreground">Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  if (!currentWorkout) {
    return (
      <div className="container p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar el entrenamiento</AlertTitle>
          <AlertDescription>
            No se pudo cargar el entrenamiento. Por favor, intenta seleccionar uno nuevo.
          </AlertDescription>
        </Alert>
        <Button className="mt-4 w-full" onClick={() => router.push("/workout/select")}>
          Seleccionar Entrenamiento
        </Button>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Entrenamiento Actual</h1>
        <p className="text-muted-foreground">
          {currentWorkout.exercise} - {currentWorkout.workoutType}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentWorkout.workoutType}</CardTitle>
          <CardDescription>
            {currentWorkout.dayName} - {currentWorkout.exercise}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="space-y-4 text-center">
              <h3 className="text-xl font-bold">¡Entrenamiento Completado!</h3>
              <Button onClick={handleFinish} className="w-full">
                Volver al Inicio
              </Button>
            </div>
          ) : (
            <>
              {currentWorkout.workoutType === "Max Reps" && <MaxRepsWorkout onComplete={handleComplete} />}
              {currentWorkout.workoutType === "Sub Max" && <SubMaxWorkout onComplete={handleComplete} />}
              {currentWorkout.workoutType === "Volumen Escalera" && <VolumeWorkout onComplete={handleComplete} />}
            </>
          )}
        </CardContent>

        {!isCompleted && (
          <CardFooter className="flex flex-col space-y-4">
            {showCancelConfirm ? (
              <>
                <Alert variant="destructive" className="mt-4 w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>¿Estás seguro?</AlertTitle>
                  <AlertDescription>Si cancelas el entrenamiento perderás todo el progreso actual.</AlertDescription>
                </Alert>
                <div className="flex w-full flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button variant="outline" className="w-full" onClick={() => setShowCancelConfirm(false)}>
                    Continuar Entrenando
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleCancelWorkout}>
                    Cancelar Entrenamiento
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="outline" className="w-full mt-2" onClick={handleCancelWorkout}>
                Cancelar Entrenamiento
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
