"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { useWorkoutStore } from "@/lib/workout-store"
import { formatDate } from "@/lib/utils"

interface Workout {
  date: string
  exercise: string
  workoutType: string
  totalReps: number
  maxReps?: number
  sets?: number
  cycles?: number
}

function WorkoutItem({ workout }: { workout: Workout }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <div>
        <p className="font-medium">
          {workout.exercise} - {workout.workoutType}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(workout.date)}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">{workout.totalReps} reps</p>
        <p className="text-xs text-muted-foreground">
          {workout.workoutType === "Max Reps" && `Max: ${workout.maxReps}`}
          {workout.workoutType === "Sub Max" && `Series: ${workout.sets}`}
          {workout.workoutType === "Volumen Escalera" && `Ciclos: ${workout.cycles}`}
        </p>
      </div>
    </div>
  )
}

const MemoizedWorkoutItem = memo(WorkoutItem)

function RecentWorkoutsInner() {
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const getRecentWorkouts = useWorkoutStore((state) => state.getRecentWorkouts)

  useEffect(() => {
    setRecentWorkouts(getRecentWorkouts(3))
  }, [getRecentWorkouts])

  if (recentWorkouts.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
        <p>No hay entrenamientos registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recentWorkouts.map((workout, index) => (
        <MemoizedWorkoutItem key={`${workout.date}-${workout.exercise}-${index}`} workout={workout} />
      ))}
    </div>
  )
}

const RecentWorkouts = memo(RecentWorkoutsInner)
export default RecentWorkouts
