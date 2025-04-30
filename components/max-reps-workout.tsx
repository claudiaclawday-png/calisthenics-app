"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import WorkoutTimer from "@/components/workout-timer"
import { Plus, Minus } from "lucide-react"
import { useWorkoutStore } from "@/lib/workout-store"

interface MaxRepsWorkoutProps {
  onComplete: (data: any) => void
}

export default function MaxRepsWorkout({ onComplete }: MaxRepsWorkoutProps) {
  const { currentWorkout, saveCurrentWorkoutState } = useWorkoutStore()
  const [currentSet, setCurrentSet] = useState(1)
  const [reps, setReps] = useState<number[]>([0, 0, 0])
  const [showTimer, setShowTimer] = useState(false)
  const totalSets = 3
  const restTime = 300 // 5 minutes in seconds

  // Load saved state if available - solo una vez al inicio
  useEffect(() => {
    if (currentWorkout && currentWorkout.workoutType === "Max Reps" && currentWorkout.data) {
      const data = currentWorkout.data
      if (data.currentSet) setCurrentSet(data.currentSet)
      if (data.reps) setReps(data.reps)
      if (data.showTimer !== undefined) setShowTimer(data.showTimer)
    }
  }, [])

  // Guardar el estado solo cuando cambian los valores importantes
  const saveState = () => {
    saveCurrentWorkoutState({
      exercise: currentWorkout?.exercise || "Dominadas",
      workoutType: "Max Reps",
      dayName: "Día 1",
      data: {
        currentSet,
        reps,
        showTimer,
      },
    })
  }

  // Usar funciones para los manejadores de eventos en lugar de depender del efecto
  const handleRepChange = (value: number) => {
    const newReps = [...reps]
    newReps[currentSet - 1] = Math.max(0, value)
    setReps(newReps)

    // Guardamos el estado después de actualizar
    setTimeout(() => {
      saveState()
    }, 0)
  }

  const handleNextSet = () => {
    if (currentSet < totalSets) {
      setShowTimer(true)
    } else {
      handleComplete()
    }

    // Guardamos el estado después de actualizar
    setTimeout(() => {
      saveState()
    }, 0)
  }

  const handleTimerComplete = () => {
    setShowTimer(false)
    setCurrentSet((prevSet) => prevSet + 1)

    // Guardamos el estado después de actualizar
    setTimeout(() => {
      saveState()
    }, 0)
  }

  const handleComplete = () => {
    onComplete({
      sets: totalSets,
      reps: reps,
      maxReps: Math.max(...reps),
      totalReps: reps.reduce((a, b) => a + b, 0),
      seriesDetail: reps, // Save detailed series information
    })
  }

  return (
    <div className="space-y-6">
      {showTimer ? (
        <WorkoutTimer
          duration={restTime}
          onComplete={handleTimerComplete}
          timerId="max-reps"
          currentInfo={{
            type: "Max Reps",
            currentSet: currentSet,
            totalSets: totalSets,
            exercise: currentWorkout?.exercise || "Dominadas",
          }}
        />
      ) : (
        <>
          <div className="text-center">
            <h3 className="text-lg font-medium">
              Serie {currentSet} de {totalSets}
            </h3>
            <p className="text-sm text-muted-foreground">Realiza el máximo de repeticiones posible</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" onClick={() => handleRepChange(reps[currentSet - 1] - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-4xl font-bold">{reps[currentSet - 1]}</span>
                    <Button variant="outline" size="icon" onClick={() => handleRepChange(reps[currentSet - 1] + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Label className="text-center text-sm text-muted-foreground">Repeticiones</Label>
                </div>

                <Button className="w-full" onClick={handleNextSet}>
                  {currentSet < totalSets ? "Siguiente Serie" : "Completar Entrenamiento"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {currentSet > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Series Anteriores:</h4>
              <div className="space-y-1">
                {reps.slice(0, currentSet - 1).map((rep, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>Serie {index + 1}:</span>
                    <span className="font-medium">{rep} repeticiones</span>
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
