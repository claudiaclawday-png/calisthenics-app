"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface EditWorkoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workout: any
  onSave: (updatedWorkout: any) => void
}

export default function EditWorkoutDialog({ open, onOpenChange, workout, onSave }: EditWorkoutDialogProps) {
  const [exercise, setExercise] = useState(workout?.exercise || "Dominadas")
  const { toast } = useToast()

  const handleSave = () => {
    // Solo actualizar si el ejercicio ha cambiado
    if (exercise !== workout.exercise) {
      onSave({ exercise })
      toast({
        title: "Entrenamiento actualizado",
        description: `El ejercicio ha sido cambiado a ${exercise}`,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Entrenamiento</DialogTitle>
          <DialogDescription>
            Modifica los detalles de este entrenamiento. Actualmente puedes cambiar el tipo de ejercicio.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Tipo de Ejercicio</h4>
            <RadioGroup value={exercise} onValueChange={setExercise} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Dominadas" id="dominadas" />
                <Label htmlFor="dominadas">Dominadas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Fondos" id="fondos" />
                <Label htmlFor="fondos">Fondos</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Detalles del Entrenamiento</h4>
            <div className="text-sm">
              <p>
                <span className="font-medium">Fecha:</span> {new Date(workout?.date).toLocaleDateString("es-ES")}
              </p>
              <p>
                <span className="font-medium">Tipo:</span> {workout?.workoutType}
              </p>
              <p>
                <span className="font-medium">Repeticiones totales:</span> {workout?.totalReps}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
