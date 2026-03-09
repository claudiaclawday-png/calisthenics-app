"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore } from "@/lib/workout-store"
import MaxRepsWorkout from "@/components/max-reps-workout"
import SubMaxWorkout from "@/components/sub-max-workout"
import VolumeWorkout from "@/components/volume-workout"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CurrentWorkout {
  dayName: string
  workoutType: string
  exercise: string
}

function LoadingState() {
  return (
    <div className="container flex items-center justify-center p-4 min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Cargando...</h2>
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="container p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No se pudo cargar el entrenamiento.</AlertDescription>
      </Alert>
      <Button className="mt-4 w-full" onClick={onRetry}>
        Seleccionar Entrenamiento
      </Button>
    </div>
  )
}

function WorkoutContent({
  workout,
  onComplete,
}: {
  workout: CurrentWorkout
  onComplete: (data: any) => void
}) {
  const workoutComponents: Record<string, React.ComponentType<{ onComplete: (data: any) => void }>> = {
    "Max Reps": MaxRepsWorkout,
    "Sub Max": SubMaxWorkout,
    "Volumen Escalera": VolumeWorkout,
  }

  const WorkoutComponent = workoutComponents[workout.workoutType]

  if (!WorkoutComponent) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Tipo no válido</AlertTitle>
        <AlertDescription>Tipo de entrenamiento no reconocido.</AlertDescription>
      </Alert>
    )
  }

  return <WorkoutComponent onComplete={onComplete} />
}

function WorkoutPageInner() {
  const router = useRouter()
  const { toast } = useToast()
  const getCurrentWorkoutDay = useWorkoutStore((state) => state.getCurrentWorkoutDay)
  const completeWorkout = useWorkoutStore((state) => state.completeWorkout)
  const clearCurrentWorkoutState = useWorkoutStore((state) => state.clearCurrentWorkoutState)
  const setSelectedWorkout = useWorkoutStore((state) => state.setSelectedWorkout)

  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadWorkout = useCallback(() => {
    const { selectedWorkout, currentWorkout: savedWorkout } = useWorkoutStore.getState()

    if (savedWorkout?.exercise) {
      setCurrentWorkout({
        dayName: savedWorkout.dayName,
        workoutType: savedWorkout.workoutType,
        exercise: savedWorkout.exercise,
      })
      setIsLoading(false)
      return
    }

    if (selectedWorkout?.exercise && selectedWorkout?.workoutType) {
      const schedule = useWorkoutStore.getState().getWorkoutSchedule()
      const matchingDay = schedule.find(
        (day) => day.exercise === selectedWorkout.exercise && day.workoutType === selectedWorkout.workoutType,
      )

      if (matchingDay) {
        setCurrentWorkout(matchingDay)
      } else {
        setCurrentWorkout(getCurrentWorkoutDay())
      }
    } else {
      setCurrentWorkout(getCurrentWorkoutDay())
    }

    setIsLoading(false)
  }, [getCurrentWorkoutDay])

  useEffect(() => {
    loadWorkout()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadWorkout()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [loadWorkout])

  const handleComplete = useCallback(
    (workoutData: any) => {
      if (!currentWorkout) return

      completeWorkout({
        ...workoutData,
        date: new Date().toISOString(),
        exercise: currentWorkout.exercise,
        workoutType: currentWorkout.workoutType,
      })

      setIsCompleted(true)
      toast({
        title: "¡Completado!",
        description: "Tu progreso ha sido guardado",
      })
    },
    [currentWorkout, completeWorkout, toast],
  )

  const handleFinish = useCallback(() => {
    setSelectedWorkout({ exercise: "", workoutType: "" })
    clearCurrentWorkoutState()
    router.push("/")
  }, [setSelectedWorkout, clearCurrentWorkoutState, router])

  const handleCancelWorkout = useCallback(() => {
    if (showCancelConfirm) {
      clearCurrentWorkoutState()
      setSelectedWorkout({ exercise: "", workoutType: "" })
      router.push("/")
    } else {
      setShowCancelConfirm(true)
    }
  }, [showCancelConfirm, clearCurrentWorkoutState, setSelectedWorkout, router])

  if (isLoading) return <LoadingState />

  if (!currentWorkout) return <ErrorState onRetry={() => router.push("/workout/select")} />

  return (
    <div className="container px-3 py-4">
      <div className="mb-4 space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Entrenamiento</h1>
        <p className="text-sm text-muted-foreground">
          {currentWorkout.exercise} • {currentWorkout.workoutType}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{currentWorkout.workoutType}</CardTitle>
          <CardDescription>
            {currentWorkout.dayName} - {currentWorkout.exercise}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="space-y-4 text-center py-4">
              <div className="text-2xl">🎉</div>
              <h3 className="text-lg font-bold">¡Entrenamiento Completado!</h3>
              <Button onClick={handleFinish} className="w-full">
                Volver al Inicio
              </Button>
            </div>
          ) : (
            <WorkoutContent workout={currentWorkout} onComplete={handleComplete} />
          )}
        </CardContent>

        {!isCompleted && (
          <CardFooter className="flex flex-col gap-3 pt-2">
            {showCancelConfirm ? (
              <>
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>¿Cancelar?</AlertTitle>
                  <AlertDescription>Perderás el progreso actual.</AlertDescription>
                </Alert>
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCancelConfirm(false)}>
                    Continuar
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleCancelWorkout}>
                    Sí, Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelWorkout}
                className="w-full text-muted-foreground"
              >
                Cancelar
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

const WorkoutPage = memo(WorkoutPageInner)
export default WorkoutPage
