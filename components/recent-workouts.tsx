"use client"

import { useEffect, useState } from "react"
import { useWorkoutStore } from "@/lib/workout-store"
import { formatDate } from "@/lib/utils"

export default function RecentWorkouts() {
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const { getRecentWorkouts } = useWorkoutStore()

  useEffect(() => {
    // Asegurarse de que getRecentWorkouts esté disponible antes de llamarlo
    if (typeof getRecentWorkouts === "function") {
      setRecentWorkouts(getRecentWorkouts(3))
    }
  }, [getRecentWorkouts])

  if (recentWorkouts.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
        <p>No hay entrenamientos registrados todavía</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recentWorkouts.map((workout, index) => (
        <div key={index} className="flex items-center justify-between border-b pb-2">
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
      ))}
    </div>
  )
}
