"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import WorkoutTimer from "@/components/workout-timer"
import { Plus, Minus } from "lucide-react"
import { useWorkoutStore } from "@/lib/workout-store"

interface SubMaxWorkoutProps {
  onComplete: (data: any) => void
}

export default function SubMaxWorkout({ onComplete }: SubMaxWorkoutProps) {
  const { getLastMaxReps, currentWorkout, saveCurrentWorkoutState } = useWorkoutStore()
  const [currentSet, setCurrentSet] = useState(1)
  const [targetReps, setTargetReps] = useState(0)
  const [reps, setReps] = useState<number[]>(Array(10).fill(0))
  const [showTimer, setShowTimer] = useState(false)
  const totalSets = 10
  const restTime = 60 // 1 minute in seconds

  // Load saved state if available - solo una vez al inicio
  useEffect(() => {
    if (currentWorkout && currentWorkout.workoutType === "Sub Max" && currentWorkout.data) {
      const data = currentWorkout.data
      if (data.currentSet) setCurrentSet(data.currentSet)
      if (data.reps) setReps(data.reps)
      if (data.showTimer !== undefined) setShowTimer(data.showTimer)
    }
  }, [])

  useEffect(() => {
    // Get the last max reps for the current exercise
    const exercise = currentWorkout?.exercise || "Dominadas"
    const lastMax = getLastMaxReps(exercise)
    const target = Math.floor(lastMax / 2)
    setTargetReps(target > 0 ? target : 5) // Default to 5 if no previous data
  }, [getLastMaxReps, currentWorkout?.exercise])

  // Guardar el estado solo cuando cambian los valores importantes
  const saveState = () => {
    saveCurrentWorkoutState({
      exercise: currentWorkout?.exercise || "Dominadas",
      workoutType: "Sub Max",
      dayName: "Día 2",
      data: {
        currentSet,
        reps,
        showTimer,
      },
    })
  }

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
      targetReps: targetReps,
      totalReps: reps.reduce((a, b) => a + b, 0),
      seriesDetail: reps,
    })
  }

  return (
    <div className="space-y-6">
      {showTimer ? (
        <WorkoutTimer
          duration={restTime}
          onComplete={handleTimerComplete}
          timerId="sub-max"
          currentInfo={{
            type: "Sub Max",
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
            <p className="text-sm text-muted-foreground">Objetivo: {targetReps} repeticiones (50% del máximo)</p>
          </div>

          <Progress value={(currentSet / totalSets) * 100} className="h-2" />

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
                  <p className="text-center text-sm text-muted-foreground">
                    {reps[currentSet - 1] === targetReps
                      ? "¡Objetivo alcanzado!"
                      : reps[currentSet - 1] > targetReps
                        ? "Por encima del objetivo"
                        : "Por debajo del objetivo"}
                  </p>
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
