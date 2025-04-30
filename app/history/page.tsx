"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkoutStore } from "@/lib/workout-store"
import { formatDate } from "@/lib/utils"
import { BarChart, Calendar, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import EditWorkoutDialog from "@/components/edit-workout-dialog"

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const { getAllWorkouts, deleteWorkout, editWorkout } = useWorkoutStore()
  const { toast } = useToast()
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<{ index: number; workout: any } | null>(null)

  useEffect(() => {
    setWorkouts(getAllWorkouts())
  }, [getAllWorkouts])

  const groupByDate = (workouts: any[]) => {
    const grouped: Record<string, any[]> = {}

    workouts.forEach((workout) => {
      const date = formatDate(workout.date)
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(workout)
    })

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, workouts]) => ({ date, workouts }))
  }

  const groupByExercise = (workouts: any[]) => {
    const pullUps = workouts.filter((w) => w.exercise === "Dominadas")
    const dips = workouts.filter((w) => w.exercise === "Fondos")

    return [
      { name: "Dominadas", workouts: pullUps },
      { name: "Fondos", workouts: dips },
    ]
  }

  const handleDelete = (index: number) => {
    setDeleteIndex(index)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      deleteWorkout(deleteIndex)
      setWorkouts(getAllWorkouts())
      toast({
        title: "Entrenamiento eliminado",
        description: "El registro ha sido eliminado correctamente",
      })
      setShowDeleteDialog(false)
    }
  }

  const handleEdit = (index: number, workout: any) => {
    setEditingWorkout({ index, workout })
  }

  const handleSaveEdit = (updatedWorkout: any) => {
    if (editingWorkout) {
      editWorkout(editingWorkout.index, updatedWorkout)
      setWorkouts(getAllWorkouts())
      setEditingWorkout(null)
    }
  }

  const formatSeriesDetail = (workout: any) => {
    if (!workout.seriesDetail) return "No hay detalles disponibles"

    if (workout.workoutType === "Volumen Escalera") {
      // For ladder workouts, the format is different
      if (typeof workout.seriesDetail === "string") {
        // If it's stored as a string, parse it
        const cycles = workout.seriesDetail.split(";")
        return cycles.map((cycle, i) => (
          <div key={i} className="text-xs">
            <span className="font-medium">Ciclo {i + 1}:</span> {cycle || "vacío"}
          </div>
        ))
      } else if (Array.isArray(workout.seriesDetail)) {
        // If it's stored as an array of arrays
        return workout.seriesDetail.map((cycle, i) => (
          <div key={i} className="text-xs">
            <span className="font-medium">Ciclo {i + 1}:</span>{" "}
            {Array.isArray(cycle) ? cycle.join(", ") : cycle || "vacío"}
          </div>
        ))
      }
    } else {
      // For Max Reps and Sub Max, it's a simple array
      if (Array.isArray(workout.seriesDetail)) {
        return workout.seriesDetail.join(", ")
      } else {
        return workout.seriesDetail
      }
    }
  }

  const dateGroups = groupByDate(workouts)
  const exerciseGroups = groupByExercise(workouts)

  if (workouts.length === 0) {
    return (
      <div className="container flex h-[70vh] items-center justify-center px-4 py-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No hay entrenamientos registrados</h2>
          <p className="text-muted-foreground">Completa tu primer entrenamiento para ver tu historial</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Historial de Entrenamientos</h1>
        <p className="text-muted-foreground">Revisa tu progreso y entrenamientos anteriores</p>
      </div>

      <Tabs defaultValue="by-date">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-date" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Por Fecha
          </TabsTrigger>
          <TabsTrigger value="by-exercise" className="flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            Por Ejercicio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="by-date" className="mt-4 space-y-6">
          {dateGroups.map((group, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-medium">{group.date}</h3>
              {group.workouts.map((workout, wIndex) => {
                const globalIndex = workouts.findIndex(
                  (w) =>
                    w.date === workout.date && w.exercise === workout.exercise && w.workoutType === workout.workoutType,
                )

                return (
                  <Card key={wIndex}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{workout.exercise}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(globalIndex, workout)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(globalIndex)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{workout.workoutType}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total de repeticiones:</span>
                          <span className="font-medium">{workout.totalReps}</span>
                        </div>

                        {workout.workoutType === "Max Reps" && (
                          <div className="flex justify-between">
                            <span>Repetición máxima:</span>
                            <span className="font-medium">{workout.maxReps}</span>
                          </div>
                        )}

                        {workout.workoutType === "Sub Max" && (
                          <div className="flex justify-between">
                            <span>Objetivo por serie:</span>
                            <span className="font-medium">{workout.targetReps}</span>
                          </div>
                        )}

                        {workout.workoutType === "Volumen Escalera" && (
                          <div className="flex justify-between">
                            <span>Ciclos completados:</span>
                            <span className="font-medium">{workout.cycles}</span>
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t">
                          <span className="text-xs font-medium">Detalle de series:</span>
                          <div className="mt-1">{formatSeriesDetail(workout)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="by-exercise" className="mt-4 space-y-6">
          {exerciseGroups.map((group, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-medium">{group.name}</h3>
              {group.workouts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay entrenamientos registrados</p>
              ) : (
                group.workouts.map((workout, wIndex) => {
                  const globalIndex = workouts.findIndex(
                    (w) =>
                      w.date === workout.date &&
                      w.exercise === workout.exercise &&
                      w.workoutType === workout.workoutType,
                  )

                  return (
                    <Card key={wIndex}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{workout.workoutType}</CardTitle>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(globalIndex, workout)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(globalIndex)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>{formatDate(workout.date)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total de repeticiones:</span>
                            <span className="font-medium">{workout.totalReps}</span>
                          </div>

                          {workout.workoutType === "Max Reps" && (
                            <div className="flex justify-between">
                              <span>Repetición máxima:</span>
                              <span className="font-medium">{workout.maxReps}</span>
                            </div>
                          )}

                          {workout.workoutType === "Sub Max" && (
                            <div className="flex justify-between">
                              <span>Objetivo por serie:</span>
                              <span className="font-medium">{workout.targetReps}</span>
                            </div>
                          )}

                          {workout.workoutType === "Volumen Escalera" && (
                            <div className="flex justify-between">
                              <span>Ciclos completados:</span>
                              <span className="font-medium">{workout.cycles}</span>
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-t">
                            <span className="text-xs font-medium">Detalle de series:</span>
                            <div className="mt-1">{formatSeriesDetail(workout)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este registro de entrenamiento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      {editingWorkout && (
        <EditWorkoutDialog
          open={!!editingWorkout}
          onOpenChange={(open) => {
            if (!open) setEditingWorkout(null)
          }}
          workout={editingWorkout.workout}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}
