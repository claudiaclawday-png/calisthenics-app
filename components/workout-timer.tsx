"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { Progress } from "@/components/ui/progress"
import { Timer, Volume2, VolumeX, Bell, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkoutStore } from "@/lib/workout-store"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WorkoutTimerProps {
  duration: number
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

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function getNotificationMessage(currentInfo?: WorkoutTimerProps["currentInfo"]) {
  if (!currentInfo) return "Es hora de continuar."

  const { type, currentSet, totalSets, currentCycle, totalCycles, exercise } = currentInfo

  if (type === "Max Reps" || type === "Sub Max") {
    return `Serie ${(currentSet || 0) + 1} de ${totalSets} - ${exercise}`
  }

  if (type === "Volumen Escalera") {
    if (currentRep === 0) {
      return `Ciclo ${(currentCycle || 0) + 1} de ${totalCycles} - ${exercise}`
    }
    return `Continúa con ${exercise}`
  }

  return "Es hora de continuar."
}

function playBeep() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(700 + i * 100, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.start(audioContext.currentTime + i * 0.3)
      oscillator.stop(audioContext.currentTime + 0.25 + i * 0.3)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25 + i * 0.3)
    }
  } catch (error) {
    console.error("Error playing beep:", error)
  }
}

function showSystemNotification(message: string) {
  if (!("Notification" in window)) return

  if (Notification.permission === "granted") {
    new Notification("¡Descanso completado!", {
      body: message,
      icon: "/icon-192.png",
      tag: "workout-timer",
    })
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("¡Descanso completado!", { body: message, icon: "/icon-192.png" })
      }
    })
  }
}

function WorkoutTimerInner({
  duration,
  onComplete,
  timerId = "default",
  currentInfo,
}: WorkoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [progress, setProgress] = useState(100)
  const [showAlert, setShowAlert] = useState(false)

  const soundEnabled = useWorkoutStore((state) => state.soundEnabled)
  const toggleSound = useWorkoutStore((state) => state.toggleSound)

  const { toast } = useToast()

  const workerRef = useRef<Worker | null>(null)
  const endTimeRef = useRef<number | null>(null)

  const handleComplete = useCallback(() => {
    if (soundEnabled) playBeep()
    showSystemNotification(getNotificationMessage(currentInfo))
    setShowAlert(true)
    toast({
      title: "¡Listo!",
      description: getNotificationMessage(currentInfo),
      duration: 4000,
    })
    setTimeout(() => setShowAlert(false), 4000)
    onComplete()
  }, [soundEnabled, currentInfo, toast, onComplete])

  // Initialize worker
  useEffect(() => {
    if (typeof window === "undefined" || !window.Worker) return

    const workerCode = `
      let timerId = null;
      self.onmessage = function(e) {
        if (e.data.type === 'start') {
          const startTime = Date.now();
          const duration = e.data.duration * 1000;
          if (timerId) clearInterval(timerId);
          timerId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            self.postMessage({ type: 'tick', timeLeft: Math.ceil(remaining / 1000) });
            if (remaining <= 0) {
              clearInterval(timerId);
              self.postMessage({ type: 'complete' });
            }
          }, 100);
        } else if (e.data.type === 'skip') {
          if (timerId) clearInterval(timerId);
          self.postMessage({ type: 'complete' });
        }
      };
    `

    const blob = new Blob([workerCode], { type: "application/javascript" })
    workerRef.current = new Worker(URL.createObjectURL(blob))

    workerRef.current.onmessage = (e) => {
      if (e.data.type === "tick") {
        setTimeLeft(e.data.timeLeft)
        setProgress((e.data.timeLeft / duration) * 100)
      } else if (e.data.type === "complete") {
        handleComplete()
      }
    }

    // Start timer
    workerRef.current.postMessage({ type: "start", duration })
    endTimeRef.current = Date.now() + duration * 1000

    return () => {
      workerRef.current?.terminate()
    }
  }, [duration, handleComplete])

  // Handle visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && endTimeRef.current) {
        const newTimeLeft = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
        if (newTimeLeft <= 0) {
          setTimeLeft(0)
          setProgress(0)
          handleComplete()
        } else {
          setTimeLeft(newTimeLeft)
          setProgress((newTimeLeft / duration) * 100)
          workerRef.current?.postMessage({ type: "start", duration: newTimeLeft })
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [duration, handleComplete])

  const skipTimer = () => {
    workerRef.current?.postMessage({ type: "skip" })
  }

  return (
    <div className="space-y-5">
      {showAlert && (
        <Alert className="bg-primary text-primary-foreground animate-pulse border-0">
          <Bell className="h-4 w-4" />
          <AlertTitle>¡Descanso completado!</AlertTitle>
          <AlertDescription>{getNotificationMessage(currentInfo)}</AlertDescription>
        </Alert>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground">Descanso</p>
        {currentInfo && (
          <p className="text-sm font-medium">
            {currentInfo.type === "Max Reps" || currentInfo.type === "Sub Max"
              ? `Serie ${currentInfo.currentSet}/${currentInfo.totalSets}`
              : currentInfo.type === "Volumen Escalera"
                ? `Ciclo ${currentInfo.currentCycle}/${currentInfo.totalCycles}`
                : ""}
            {" • "}
            {currentInfo.exercise}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="h-6 w-6 text-muted-foreground" />
              <span className="text-5xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
            </div>
            <Progress value={progress} className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={skipTimer} className="flex-1">
          <SkipForward className="mr-2 h-4 w-4" />
          Saltar
        </Button>
        <Button variant="outline" size="icon" onClick={toggleSound}>
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

const WorkoutTimer = memo(WorkoutTimerInner)
export default WorkoutTimer
