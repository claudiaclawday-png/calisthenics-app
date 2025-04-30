"use client"

import { useState, useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { Timer, Volume2, VolumeX, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkoutStore } from "@/lib/workout-store"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WorkoutTimerProps {
  duration: number // in seconds
  onComplete: () => void
  timerId?: string
  currentInfo?: {
    type: string
    currentSet?: number
    totalSets?: number
    currentCycle?: number
    totalCycles?: number
    exercise?: string
    currentRep?: number
  }
}

export default function WorkoutTimer({ duration, onComplete, timerId = "default", currentInfo }: WorkoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [progress, setProgress] = useState(100)
  const { soundEnabled, toggleSound } = useWorkoutStore()
  const { toast } = useToast()
  const [showAlert, setShowAlert] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const endTimeRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)

  // Reproducir un beep usando la API Web Audio
  const playBeep = () => {
    if (!soundEnabled) return

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create multiple beeps for better noticeability
      for (let i = 0; i < 3; i++) {
        // Create oscillator and gain node for each beep
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        // Configure oscillator with slightly different frequencies for each beep
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(700 + i * 100, audioContext.currentTime)

        // Configure volume
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)

        // Connect nodes
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Schedule start and end with delay between beeps
        oscillator.start(audioContext.currentTime + i * 0.3)
        oscillator.stop(audioContext.currentTime + 0.25 + i * 0.3)

        // Add volume ramp to avoid clicks
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25 + i * 0.3)
      }

      console.log("Enhanced beep sequence played")
    } catch (error) {
      console.error("Error playing beep:", error)
    }
  }

  // Mostrar notificación en pantalla usando el componente Toast
  const showOnScreenNotification = () => {
    const title = "¡Descanso completado!"
    let description = "Es hora de continuar con tu entrenamiento."

    // Add specific information based on workout type
    if (currentInfo) {
      if (currentInfo.type === "Max Reps") {
        description = `Continúa con la serie ${currentInfo.currentSet! + 1} de ${currentInfo.totalSets} de ${currentInfo.exercise}.`
      } else if (currentInfo.type === "Sub Max") {
        description = `Continúa con la serie ${currentInfo.currentSet! + 1} de ${currentInfo.totalSets} de ${currentInfo.exercise}.`
      } else if (currentInfo.type === "Volumen Escalera") {
        if (currentInfo.currentRep === 0) {
          description = `Comienza el ciclo ${currentInfo.currentCycle! + 1} de ${currentInfo.totalCycles} de ${currentInfo.exercise}.`
        } else {
          description = `Continúa con la repetición ${currentInfo.currentRep! + 1} de ${currentInfo.exercise}.`
        }
      }
    }

    // Mostrar alerta en pantalla
    setShowAlert(true)

    // También mostrar toast
    toast({
      title: title,
      description: description,
      duration: 5000,
    })

    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
      setShowAlert(false)
    }, 5000)
  }

  // Intentar mostrar notificación del sistema
  const showSystemNotification = () => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return
    }

    // If we already have permission, show notification
    if (Notification.permission === "granted") {
      createNotification()
    }
    // Otherwise, request permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          createNotification()
        }
      })
    }
  }

  // Function to create the actual notification
  const createNotification = () => {
    const title = "¡Descanso completado!"
    let body = "Es hora de continuar con tu entrenamiento."

    // Add specific information based on workout type
    if (currentInfo) {
      if (currentInfo.type === "Max Reps") {
        body = `Continúa con la serie ${currentInfo.currentSet! + 1} de ${currentInfo.totalSets} de ${currentInfo.exercise}.`
      } else if (currentInfo.type === "Sub Max") {
        body = `Continúa con la serie ${currentInfo.currentSet! + 1} de ${currentInfo.totalSets} de ${currentInfo.exercise}.`
      } else if (currentInfo.type === "Volumen Escalera") {
        if (currentInfo.currentRep === 0) {
          body = `Comienza el ciclo ${currentInfo.currentCycle! + 1} de ${currentInfo.totalCycles} de ${currentInfo.exercise}.`
        } else {
          body = `Continúa con la repetición ${currentInfo.currentRep! + 1} de ${currentInfo.exercise}.`
        }
      }
    }

    try {
      const notification = new Notification(title, {
        body: body,
        icon: "/icon-192.png",
        vibrate: [200, 100, 200],
        tag: "workout-timer",
      })

      // Close notification after 5 seconds or when clicked
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      setTimeout(() => notification.close(), 5000)
    } catch (error) {
      console.error("Error showing notification:", error)
    }
  }

  // Initialize Web Worker for background timer
  useEffect(() => {
    if (typeof window !== "undefined" && window.Worker) {
      const workerCode = `
        let timerId = null;
        let startTime = null;
        let duration = 0;
        
        self.onmessage = function(e) {
          if (e.data.type === 'start') {
            startTime = Date.now();
            duration = e.data.duration * 1000;
            
            // Clear any existing timer
            if (timerId) {
              clearInterval(timerId);
            }
            
            // Start a new timer that checks every 100ms
            timerId = setInterval(() => {
              const elapsed = Date.now() - startTime;
              const remaining = Math.max(0, duration - elapsed);
              
              self.postMessage({ 
                type: 'tick', 
                timeLeft: Math.ceil(remaining / 1000) 
              });
              
              if (remaining <= 0) {
                clearInterval(timerId);
                self.postMessage({ type: 'complete' });
              }
            }, 100);
          } 
          else if (e.data.type === 'skip') {
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
            self.postMessage({ type: 'complete' });
          }
        };
      `

      const blob = new Blob([workerCode], { type: "application/javascript" })
      workerRef.current = new Worker(URL.createObjectURL(blob))

      // Update the worker's onmessage handler to show notification when timer completes
      workerRef.current.onmessage = (e) => {
        if (e.data.type === "tick") {
          setTimeLeft(e.data.timeLeft)
          setProgress((e.data.timeLeft / duration) * 100)
        } else if (e.data.type === "complete") {
          // Play enhanced beep when timer ends
          playBeep()

          // Show both types of notifications
          showSystemNotification()
          showOnScreenNotification()

          onComplete()
        }
      }

      // Iniciar el timer automáticamente al montar el componente
      startTimer()
      isInitializedRef.current = true

      return () => {
        if (workerRef.current) {
          workerRef.current.terminate()
          workerRef.current = null
        }
      }
    }
  }, []) // Solo se ejecuta al montar el componente

  // Función para iniciar el timer
  const startTimer = () => {
    if (!workerRef.current) return

    workerRef.current.postMessage({
      type: "start",
      duration: timeLeft,
    })
    startTimeRef.current = Date.now()
    endTimeRef.current = Date.now() + timeLeft * 1000
  }

  // Función para saltar el timer
  const skipTimer = () => {
    if (!workerRef.current) return

    workerRef.current.postMessage({
      type: "skip",
    })
  }

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && endTimeRef.current) {
        const now = Date.now()
        const newTimeLeft = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))

        if (newTimeLeft <= 0) {
          setTimeLeft(0)
          setProgress(0)
          playBeep()
          onComplete()
        } else {
          setTimeLeft(newTimeLeft)
          setProgress((newTimeLeft / duration) * 100)

          // Restart the worker with the new time
          if (workerRef.current) {
            workerRef.current.postMessage({
              type: "start",
              duration: newTimeLeft,
            })
          }
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [duration, onComplete, soundEnabled])

  // Request notification permission when component mounts
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      // Request permission when the component mounts
      Notification.requestPermission()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Alerta en pantalla cuando el timer se completa */}
      {showAlert && (
        <Alert className="bg-primary text-primary-foreground animate-pulse">
          <Bell className="h-4 w-4" />
          <AlertTitle>¡Descanso completado!</AlertTitle>
          <AlertDescription>
            {currentInfo && currentInfo.type === "Max Reps" && (
              <>
                Continúa con la serie {currentInfo.currentSet! + 1} de {currentInfo.totalSets} de {currentInfo.exercise}
                .
              </>
            )}
            {currentInfo && currentInfo.type === "Sub Max" && (
              <>
                Continúa con la serie {currentInfo.currentSet! + 1} de {currentInfo.totalSets} de {currentInfo.exercise}
                .
              </>
            )}
            {currentInfo && currentInfo.type === "Volumen Escalera" && currentInfo.currentRep === 0 && (
              <>
                Comienza el ciclo {currentInfo.currentCycle! + 1} de {currentInfo.totalCycles} de {currentInfo.exercise}
                .
              </>
            )}
            {currentInfo && currentInfo.type === "Volumen Escalera" && currentInfo.currentRep !== 0 && (
              <>
                Continúa con la repetición {currentInfo.currentRep! + 1} de {currentInfo.exercise}.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Mostrar información del entrenamiento actual similar a cuando no está corriendo el timer */}
      <div className="text-center">
        <h3 className="text-lg font-medium">Descanso</h3>
        {currentInfo && currentInfo.type === "Max Reps" && (
          <p className="text-sm text-muted-foreground">
            Serie {currentInfo.currentSet} de {currentInfo.totalSets} - {currentInfo.exercise}
          </p>
        )}
        {currentInfo && currentInfo.type === "Sub Max" && (
          <p className="text-sm text-muted-foreground">
            Serie {currentInfo.currentSet} de {currentInfo.totalSets} - {currentInfo.exercise}
          </p>
        )}
        {currentInfo && currentInfo.type === "Volumen Escalera" && (
          <p className="text-sm text-muted-foreground">
            Ciclo {currentInfo.currentCycle} de {currentInfo.totalCycles} - {currentInfo.exercise}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Timer className="h-5 w-5 text-muted-foreground" />
              <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
            </div>
            <Progress value={progress} className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={skipTimer}>
          Saltar Descanso
        </Button>
        <Button variant="outline" size="icon" onClick={toggleSound}>
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
