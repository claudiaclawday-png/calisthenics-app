"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWorkoutStore } from "@/lib/workout-store"

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [storeState, setStoreState] = useState<any>({})
  const { getWorkoutSchedule, getCurrentWorkoutDay } = useWorkoutStore()

  useEffect(() => {
    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV !== "development") {
      return
    }

    const updateState = () => {
      const state = useWorkoutStore.getState()
      const workouts = state.workouts
        .filter((w) => w.workoutType !== "Descanso")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const lastWorkout = workouts.length > 0 ? workouts[0] : null
      const nextWorkout = getCurrentWorkoutDay()

      setStoreState({
        workoutsCount: state.workouts.length,
        lastWorkoutDate: state.lastWorkoutDate,
        lastWorkout: lastWorkout
          ? `${lastWorkout.exercise} - ${lastWorkout.workoutType} (${new Date(lastWorkout.date).toLocaleDateString()})`
          : "Ninguno",
        nextWorkout: `${nextWorkout.exercise} - ${nextWorkout.workoutType}`,
        currentWorkout: state.currentWorkout
          ? {
              exercise: state.currentWorkout.exercise,
              workoutType: state.currentWorkout.workoutType,
            }
          : null,
        selectedWorkout: state.selectedWorkout,
      })
    }

    updateState()

    // Suscribirse a cambios en el store
    const unsubscribe = useWorkoutStore.subscribe(updateState)

    return () => {
      unsubscribe()
    }
  }, [getWorkoutSchedule, getCurrentWorkoutDay])

  // No mostrar nada en producción
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button size="sm" variant="outline" onClick={() => setIsVisible(true)} className="bg-white shadow-md">
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80">
      <Card>
        <CardHeader className="py-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Estado del Store</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
              Cerrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-2 text-xs">
          <div className="space-y-1">
            <p>
              <span className="font-medium">Entrenamientos:</span> {storeState.workoutsCount || 0}
            </p>
            <p>
              <span className="font-medium">Último entrenamiento:</span> {storeState.lastWorkout || "Ninguno"}
            </p>
            <p>
              <span className="font-medium">Próximo entrenamiento:</span> {storeState.nextWorkout || "Ninguno"}
            </p>
            <p>
              <span className="font-medium">Entrenamiento actual:</span>{" "}
              {storeState.currentWorkout
                ? `${storeState.currentWorkout.exercise} - ${storeState.currentWorkout.workoutType}`
                : "Ninguno"}
            </p>
            <p>
              <span className="font-medium">Entrenamiento seleccionado:</span>{" "}
              {storeState.selectedWorkout
                ? `${storeState.selectedWorkout.exercise} - ${storeState.selectedWorkout.workoutType}`
                : "Ninguno"}
            </p>
          </div>
          <div className="mt-2">
            <Button
              size="sm"
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (
                  window.confirm("¿Estás seguro de que quieres reiniciar el store? Esto eliminará todos los datos.")
                ) {
                  localStorage.removeItem("calisthenics-workout-storage")
                  window.location.reload()
                }
              }}
            >
              Reiniciar Store
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
