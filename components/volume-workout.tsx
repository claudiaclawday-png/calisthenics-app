"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import WorkoutTimer from "@/components/workout-timer"
import { useWorkoutStore } from "@/lib/workout-store"
import { Check, Flag, CheckSquare } from "lucide-react"

interface VolumeWorkoutProps {
  onComplete: (data: any) => void
}

export default function VolumeWorkout({ onComplete }: VolumeWorkoutProps) {
  const { getLastMaxReps, currentWorkout, saveCurrentWorkoutState } = useWorkoutStore()
  const [maxReps, setMaxReps] = useState(10)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [currentRep, setCurrentRep] = useState(1)
  const [showTimer, setShowTimer] = useState(false)
  const [completedReps, setCompletedReps] = useState<number[][]>([])
  const totalCycles = 5
  const restTime = 30 // 30 seconds

  // Load saved state if available - solo una vez al inicio
  useEffect(() => {
    if (currentWorkout && currentWorkout.workoutType === "Volumen Escalera" && currentWorkout.data) {
      const data = currentWorkout.data
      if (data.currentCycle) setCurrentCycle(data.currentCycle)
      if (data.currentRep) setCurrentRep(data.currentRep)
      if (data.showTimer !== undefined) setShowTimer(data.showTimer)
      if (data.completedReps) setCompletedReps(data.completedReps)
    }
  }, [])

  useEffect(() => {
    // Get the last max reps for the current exercise
    const exercise = currentWorkout?.exercise || "Dominadas"
    const lastMax = getLastMaxReps(exercise)
    setMaxReps(lastMax > 0 ? lastMax : 10) // Default to 10 if no previous data

    // Initialize completed reps array if empty
    if (completedReps.length === 0) {
      setCompletedReps(Array(totalCycles).fill([]))
    }
  }, [getLastMaxReps, completedReps.length, currentWorkout?.exercise])

  // Guardar el estado solo cuando cambian los valores importantes
  const saveState = () => {
    saveCurrentWorkoutState({
      exercise: currentWorkout?.exercise || "Dominadas",
      workoutType: "Volumen Escalera",
      dayName: "Día 3",
      data: {
        currentCycle,
        currentRep,
        completedReps,
        showTimer,
      },
    })
  }

  const handleCompleteRep = () => {
    // Add current rep to completed reps
    const newCompletedReps = [...completedReps]
    if (!newCompletedReps[currentCycle - 1]) {
      newCompletedReps[currentCycle - 1] = []
    }
    newCompletedReps[currentCycle - 1] = [...newCompletedReps[currentCycle - 1], currentRep]
    setCompletedReps(newCompletedReps)

    // Activar el timer después de completar las repeticiones
    setShowTimer(true)

    // Guardamos el estado después de actualizar
    setTimeout(() => {
      saveState()
    }, 0)
  }

  // Método para completar repeticiones y finalizar ciclo
  const handleCompleteAndFinishCycle = () => {
    // Añadir la repetición actual al ciclo
    const newCompletedReps = [...completedReps]
    if (!newCompletedReps[currentCycle - 1]) {
      newCompletedReps[currentCycle - 1] = []
    }
    newCompletedReps[currentCycle - 1] = [...newCompletedReps[currentCycle - 1], currentRep]
    setCompletedReps(newCompletedReps)

    // Si estamos en el último ciclo (5), completar el entrenamiento
    if (currentCycle === totalCycles) {
      // Completar el entrenamiento directamente
      handleComplete()
      return
    }

    // Si no estamos en el último ciclo, preparar para el siguiente ciclo
    setCurrentRep(0)
    setShowTimer(true)

    // Guardamos el estado después de actualizar
    setTimeout(() => {
      saveState()
    }, 0)
  }

  const handleTimerComplete = () => {
    setShowTimer(false)

    // Si estamos finalizando un ciclo, incrementar el ciclo
    if (currentRep === 0) {
      setCurrentCycle((prevCycle) => prevCycle + 1)
      setCurrentRep(1)
    } else {
      // Si no, incrementar la repetición para la siguiente serie
      setCurrentRep((prevRep) => prevRep + 1)
    }

    // Guardamos el estado después de actualizar
    setTimeout(() => {
      saveState()
    }, 0)
  }

  const handleFinishCycle = () => {
    if (currentCycle < totalCycles) {
      // Marcar que estamos cambiando de ciclo con currentRep = 0
      setCurrentRep(0)
      setShowTimer(true)
    } else {
      // Workout complete
      handleComplete()
    }

    // Guardamos el estado después de actualizar
    setTimeout(() => {
      saveState()
    }, 0)
  }

  const handleComplete = () => {
    // Calculate total reps
    const totalReps = completedReps.flat().reduce((a, b) => a + b, 0)

    onComplete({
      cycles: totalCycles,
      maxReps: maxReps,
      completedReps: completedReps,
      totalReps: totalReps,
      seriesDetail: completedReps.map((cycle) => cycle.join(",")).join(";"),
    })
  }

  const calculateProgress = () => {
    // Calcular el progreso basado en ciclos completados
    return ((currentCycle - 1) / totalCycles) * 100
  }

  return (
    <div className="space-y-6">
      {showTimer ? (
        <WorkoutTimer
          duration={restTime}
          onComplete={handleTimerComplete}
          timerId="volume-ladder"
          currentInfo={{
            type: "Volumen Escalera",
            currentCycle: currentCycle,
            totalCycles: totalCycles,
            currentRep: currentRep,
            exercise: currentWorkout?.exercise || "Dominadas",
          }}
        />
      ) : (
        <>
          <div className="text-center">
            <h3 className="text-lg font-medium">
              Ciclo {currentCycle} de {totalCycles}
            </h3>
            <p className="text-sm text-muted-foreground">
              Repeticiones completadas en este ciclo: {completedReps[currentCycle - 1]?.length || 0}
            </p>
          </div>

          <Progress value={calculateProgress()} className="h-2" />

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <span className="text-5xl font-bold">{currentRep}</span>
                  <p className="text-center text-sm text-muted-foreground">Repeticiones a realizar</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button className="w-full" onClick={handleCompleteRep}>
                    <Check className="mr-2 h-4 w-4" />
                    Completar {currentRep} {currentRep === 1 ? "repetición" : "repeticiones"}
                  </Button>

                  <Button className="w-full" variant="secondary" onClick={handleCompleteAndFinishCycle}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    {currentCycle === totalCycles ? "Completar Entrenamiento" : "Completar y Finalizar Ciclo"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleFinishCycle}
                    disabled={completedReps[currentCycle - 1]?.length === 0}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    {currentCycle < totalCycles ? "Finalizar Ciclo Actual" : "Completar Entrenamiento"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Repeticiones completadas en este ciclo:</h4>
            <div className="flex flex-wrap gap-2">
              {(completedReps[currentCycle - 1] || []).map((rep, index) => (
                <div
                  key={index}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium"
                >
                  {rep}
                </div>
              ))}
              {(completedReps[currentCycle - 1]?.length || 0) === 0 && (
                <p className="text-sm text-muted-foreground">No hay repeticiones completadas aún</p>
              )}
            </div>
          </div>

          {currentCycle > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Ciclos completados:</h4>
              <div className="space-y-1">
                {completedReps.slice(0, currentCycle - 1).map((cycle, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>Ciclo {index + 1}:</span>
                    <span className="font-medium">
                      {cycle.length} series, {cycle.reduce((a, b) => a + b, 0)} repeticiones totales
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
