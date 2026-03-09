"use client"

import { useEffect, useState, memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWorkoutStore } from "@/lib/workout-store"
import Link from "next/link"
import { Edit2, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WorkoutDay {
  dayName: string
  workoutType: string
  exercise: string
}

interface LastWorkout {
  date: string
  exercise: string
  workoutType: string
}

const workoutDescriptions: Record<string, string> = {
  "Max Reps": "3 series al máximo con 5 min de descanso",
  "Sub Max": "10 series al 50% del máximo con 1 min de descanso",
  "Volumen Escalera": "1 rep hasta el máximo. 5 ciclos con 30 seg descanso",
}

function WorkoutScheduleInner() {
  const [currentDay, setCurrentDay] = useState("")
  const [workoutType, setWorkoutType] = useState("")
  const [exercise, setExercise] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [lastWorkout, setLastWorkout] = useState<LastWorkout | null>(null)

  const getCurrentWorkoutDay = useWorkoutStore((state) => state.getCurrentWorkoutDay)
  const getRecentWorkouts = useWorkoutStore((state) => state.getRecentWorkouts)

  useEffect(() => {
    const nextWorkout = getCurrentWorkoutDay()
    setCurrentDay(nextWorkout.dayName)
    setWorkoutType(nextWorkout.workoutType)
    setExercise(nextWorkout.exercise)

    const recentWorkouts = getRecentWorkouts(1)
    if (recentWorkouts.length > 0) {
      setLastWorkout({
        date: recentWorkouts[0].date,
        exercise: recentWorkouts[0].exercise,
        workoutType: recentWorkouts[0].workoutType,
      })
    }

    setIsLoading(false)
  }, [getCurrentWorkoutDay, getRecentWorkouts])

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm">Secuencia</AlertTitle>
        <AlertDescription className="text-xs">
          Dominadas Max → Fondos Max → Dominadas Sub → Fondos Sub → Dominadas Volumen → Fondos Volumen
        </AlertDescription>
      </Alert>

      {lastWorkout && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
          <p className="font-medium">Último:</p>
          <p>
            {lastWorkout.exercise} - {lastWorkout.workoutType}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Día</p>
          <p className="text-lg font-bold">{currentDay}</p>
        </div>
        <Badge variant={exercise === "Dominadas" ? "default" : "secondary"} className="text-xs">
          {exercise}
        </Badge>
      </div>

      <div>
        <p className="text-sm font-medium">Tipo</p>
        <p className="text-lg">{workoutType}</p>
      </div>

      <div>
        <p className="text-sm font-medium">Descripción</p>
        <p className="text-sm text-muted-foreground">{workoutDescriptions[workoutType]}</p>
      </div>

      <div className="pt-2">
        <Link href="/workout/select">
          <Button variant="outline" size="sm" className="w-full">
            <Edit2 className="mr-2 h-4 w-4" />
            Cambiar
          </Button>
        </Link>
      </div>
    </div>
  )
}

const WorkoutSchedule = memo(WorkoutScheduleInner)
export default WorkoutSchedule
