"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import WorkoutTimer from "@/components/workout-timer"
import { Plus, Minus, Check } from "lucide-react"
import { useWorkoutStore } from "@/lib/workout-store"

interface MaxRepsWorkoutProps {
  onComplete: (data: any) => void
}

const TOTAL_SETS = 3
const REST_TIME = 300 // 5 minutes

function RepCounter({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const decrement = () => onChange(Math.max(0, value - 1))
  const increment = () => onChange(value + 1)

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="lg"
        onClick={decrement}
        className="h-14 w-14 rounded-full"
        aria-label="Disminuir repeticiones"
      >
        <Minus className="h-5 w-5" />
      </Button>
      <span className="text-5xl font-bold tabular-nums min-w-[80px] text-center">{value}</span>
      <Button
        variant="outline"
        size="lg"
        onClick={increment}
        className="h-14 w-14 rounded-full"
        aria-label="Aumentar repeticiones"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  )
}

const MemoizedRepCounter = memo(RepCounter)

function MaxRepsWorkoutInner({ onComplete }: MaxRepsWorkoutProps) {
  const currentWorkout = useWorkoutStore((state) => state.currentWorkout)
  const saveCurrentWorkoutState = useWorkoutStore((state) => state.saveCurrentWorkoutState)

  const [currentSet, setCurrentSet] = useState(1)
  const [reps, setReps] = useState<number[]>([0, 0, 0])
  const [showTimer, setShowTimer] = useState(false)

  // Load saved state on mount
  useEffect(() => {
    if (currentWorkout?.workoutType === "Max Reps" && currentWorkout?.data) {
      const data = currentWorkout.data
      if (data.currentSet) setCurrentSet(data.currentSet)
      if (data.reps) setReps(data.reps)
      if (data.showTimer !== undefined) setShowTimer(data.showTimer)
    }
  }, []) // Only run on mount

  const saveState = useCallback(() => {
    saveCurrentWorkoutState({
      exercise: currentWorkout?.exercise || "Dominadas",
      workoutType: "Max Reps",
      dayName: "Día 1",
      data: { currentSet, reps, showTimer },
    })
  }, [currentWorkout, currentSet, reps, showTimer, saveCurrentWorkoutState])

  const handleRepChange = useCallback(
    (value: number) => {
      const newReps = [...reps]
      newReps[currentSet - 1] = value
      setReps(newReps)
      // Defer state saving
      setTimeout(saveState, 0)
    },
    [currentSet, reps, saveState],
  )

  const handleNextSet = useCallback(() => {
    if (currentSet < TOTAL_SETS) {
      setShowTimer(true)
    } else {
      onComplete({
        sets: TOTAL_SETS,
        reps,
        maxReps: Math.max(...reps),
        totalReps: reps.reduce((a, b) => a + b, 0),
        seriesDetail: reps,
      })
    }
    setTimeout(saveState, 0)
  }, [currentSet, reps, onComplete, saveState])

  const handleTimerComplete = useCallback(() => {
    setShowTimer(false)
    setCurrentSet((prev) => prev + 1)
    setTimeout(saveState, 0)
  }, [saveState])

  if (showTimer) {
    return (
      <WorkoutTimer
        duration={REST_TIME}
        onComplete={handleTimerComplete}
        timerId="max-reps"
        currentInfo={{
          type: "Max Reps",
          currentSet,
          totalSets: TOTAL_SETS,
          exercise: currentWorkout?.exercise || "Dominadas",
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Serie</p>
        <h3 className="text-2xl font-bold">
          {currentSet} <span className="text-muted-foreground">/ {TOTAL_SETS}</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Realiza el máximo posible</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <MemoizedRepCounter value={reps[currentSet - 1]} onChange={handleRepChange} />
            <Label className="block text-center text-sm text-muted-foreground">
              repeticiones
            </Label>

            <Button onClick={handleNextSet} className="w-full h-12" size="lg">
              {currentSet < TOTAL_SETS ? (
                <>Siguiente Serie</>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Completar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentSet > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Anteriores:</p>
          <div className="flex gap-2">
            {reps.slice(0, currentSet - 1).map((rep, index) => (
              <div
                key={index}
                className="flex-1 py-2 px-3 rounded-lg bg-muted text-center"
              >
                <span className="text-xs text-muted-foreground">S{index + 1}</span>
                <p className="font-bold">{rep}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MaxRepsWorkout = memo(MaxRepsWorkoutInner)
export default MaxRepsWorkout
