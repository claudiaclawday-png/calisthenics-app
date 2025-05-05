"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function ResetButton() {
  const [showConfirm, setShowConfirm] = useState(false)
  const { toast } = useToast()

  const handleReset = () => {
    // Eliminar los datos del almacenamiento local
    localStorage.removeItem("calisthenics-workout-storage")

    // Mostrar toast de confirmación
    toast({
      title: "Datos reiniciados",
      description: "Todos los datos de entrenamiento han sido eliminados",
    })

    // Cerrar el diálogo
    setShowConfirm(false)

    // Recargar la página para aplicar los cambios
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Reiniciar Datos
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar reinicio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar todos los datos de entrenamiento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Eliminar Todos los Datos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
