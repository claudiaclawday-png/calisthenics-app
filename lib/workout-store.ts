"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WorkoutDay {
  dayName: string
  workoutType: string
  exercise: string
}

interface Workout {
  date: string
  exercise: string
  workoutType: string
  totalReps: number
  seriesDetail?: number[] // Detalle de repeticiones por serie
  [key: string]: any
}

// Simplificar cómo guardamos el estado del entrenamiento actual para evitar referencias circulares

// Modificar la interfaz CurrentWorkoutState para hacerla más plana y simple
interface CurrentWorkoutState {
  exercise: string
  workoutType: string
  dayName: string
  startTime?: string // Añadir para saber cuándo se inició
  data: {
    currentSet?: number
    reps?: number[]
    currentCycle?: number
    currentRep?: number
    completedReps?: number[][]
    showTimer?: boolean
    timeLeft?: number
    isActive?: boolean
  }
}

interface WorkoutStore {
  workouts: Workout[]
  lastWorkoutDate: string | null
  selectedWorkout: { exercise: string; workoutType: string } | null
  currentWorkout: CurrentWorkoutState | null
  soundEnabled: boolean
  getCurrentWorkoutDay: () => WorkoutDay
  getLastMaxReps: (exercise?: string) => number
  completeWorkout: (workout: Workout) => void
  getRecentWorkouts: (count: number) => Workout[]
  getAllWorkouts: () => Workout[]
  getWorkoutSchedule: () => WorkoutDay[]
  setSelectedWorkout: (workout: { exercise: string; workoutType: string }) => void
  saveCurrentWorkoutState: (state: Partial<CurrentWorkoutState>) => void
  clearCurrentWorkoutState: () => void
  deleteWorkout: (workoutIndex: number) => void
  editWorkout: (workoutIndex: number, updatedWorkout: Partial<Workout>) => void
  toggleSound: () => void
}

// Define the workout types
const workoutTypes = {
  MAX_REPS: "Max Reps",
  SUB_MAX: "Sub Max",
  VOLUMEN_ESCALERA: "Volumen Escalera",
  DESCANSO: "Descanso",
}

// Define the workout schedule in the correct order
const workoutSchedule: WorkoutDay[] = [
  { dayName: "Día 1", workoutType: workoutTypes.MAX_REPS, exercise: "Dominadas" },
  { dayName: "Día 1", workoutType: workoutTypes.MAX_REPS, exercise: "Fondos" },
  { dayName: "Día 2", workoutType: workoutTypes.SUB_MAX, exercise: "Dominadas" },
  { dayName: "Día 2", workoutType: workoutTypes.SUB_MAX, exercise: "Fondos" },
  { dayName: "Día 3", workoutType: workoutTypes.VOLUMEN_ESCALERA, exercise: "Dominadas" },
  { dayName: "Día 3", workoutType: workoutTypes.VOLUMEN_ESCALERA, exercise: "Fondos" },
]

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workouts: [],
      lastWorkoutDate: null,
      selectedWorkout: null,
      currentWorkout: null,
      soundEnabled: true,

      getCurrentWorkoutDay: () => {
        const { workouts } = get()

        // Si no hay entrenamientos previos, comenzar con el primero
        if (workouts.length === 0) {
          return workoutSchedule[0]
        }

        // Obtener el último entrenamiento realizado (el más reciente)
        const sortedWorkouts = [...workouts]
          .filter((w) => w.workoutType !== workoutTypes.DESCANSO)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (sortedWorkouts.length === 0) {
          return workoutSchedule[0]
        }

        const lastWorkout = sortedWorkouts[0]

        // Encontrar el índice del último entrenamiento en la secuencia
        const lastWorkoutIndex = workoutSchedule.findIndex(
          (day) => day.exercise === lastWorkout.exercise && day.workoutType === lastWorkout.workoutType,
        )

        // Si no se encuentra (caso raro), comenzar con el primero
        if (lastWorkoutIndex === -1) {
          return workoutSchedule[0]
        }

        // Calcular el siguiente índice en la secuencia
        const nextIndex = (lastWorkoutIndex + 1) % workoutSchedule.length

        // Para depuración
        console.log("Último entrenamiento:", lastWorkout.exercise, lastWorkout.workoutType)
        console.log("Índice del último entrenamiento:", lastWorkoutIndex)
        console.log("Próximo índice:", nextIndex)
        console.log("Próximo entrenamiento:", workoutSchedule[nextIndex])

        return workoutSchedule[nextIndex]
      },

      getLastMaxReps: (exercise) => {
        const { workouts } = get()
        const currentDay = get().getCurrentWorkoutDay()
        const exerciseToCheck = exercise || currentDay.exercise

        // Find the last Max Reps workout for the specified exercise
        const lastMaxRepsWorkout = [...workouts]
          .reverse()
          .find((w) => w.workoutType === workoutTypes.MAX_REPS && w.exercise === exerciseToCheck)

        return lastMaxRepsWorkout?.maxReps || 0
      },

      completeWorkout: (workout) => {
        set((state) => ({
          workouts: [...state.workouts, workout],
          lastWorkoutDate: workout.date,
          currentWorkout: null, // Clear current workout state after completion
        }))
      },

      getRecentWorkouts: (count) => {
        const { workouts } = get()
        return [...workouts]
          .filter((w) => w.workoutType !== workoutTypes.DESCANSO)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, count)
      },

      getAllWorkouts: () => {
        const { workouts } = get()
        return [...workouts]
          .filter((w) => w.workoutType !== workoutTypes.DESCANSO)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },

      getWorkoutSchedule: () => {
        return workoutSchedule
      },

      setSelectedWorkout: (workout) => {
        set({ selectedWorkout: workout })
      },

      saveCurrentWorkoutState: (state: Partial<CurrentWorkoutState>) => {
        set((current) => {
          // Si no hay estado actual, creamos uno nuevo con valores por defecto
          if (!current.currentWorkout) {
            return {
              currentWorkout: {
                exercise: state.exercise || "",
                workoutType: state.workoutType || "",
                dayName: state.dayName || "",
                startTime: state.startTime || new Date().toISOString(),
                data: { ...(state.data || {}) },
              },
            }
          }

          // Si ya hay un estado, actualizamos solo lo necesario
          return {
            currentWorkout: {
              ...current.currentWorkout,
              ...(state.exercise ? { exercise: state.exercise } : {}),
              ...(state.workoutType ? { workoutType: state.workoutType } : {}),
              ...(state.dayName ? { dayName: state.dayName } : {}),
              data: {
                ...current.currentWorkout.data,
                ...(state.data || {}),
              },
            },
          }
        })
      },

      clearCurrentWorkoutState: () => {
        set({ currentWorkout: null })
      },

      deleteWorkout: (workoutIndex) => {
        set((state) => {
          const sortedWorkouts = [...state.workouts]
            .filter((w) => w.workoutType !== workoutTypes.DESCANSO)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          const workoutToDelete = sortedWorkouts[workoutIndex]

          if (!workoutToDelete) return state

          const newWorkouts = state.workouts.filter(
            (w) =>
              !(
                w.date === workoutToDelete.date &&
                w.exercise === workoutToDelete.exercise &&
                w.workoutType === workoutToDelete.workoutType
              ),
          )

          return { workouts: newWorkouts }
        })
      },

      // Nueva función para editar un entrenamiento
      editWorkout: (workoutIndex, updatedWorkout) => {
        set((state) => {
          const sortedWorkouts = [...state.workouts]
            .filter((w) => w.workoutType !== workoutTypes.DESCANSO)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          const workoutToEdit = sortedWorkouts[workoutIndex]

          if (!workoutToEdit) return state

          // Crear una nueva lista de entrenamientos con el entrenamiento actualizado
          const newWorkouts = state.workouts.map((w) => {
            if (
              w.date === workoutToEdit.date &&
              w.exercise === workoutToEdit.exercise &&
              w.workoutType === workoutToEdit.workoutType
            ) {
              // Actualizar el entrenamiento con los nuevos valores
              return { ...w, ...updatedWorkout }
            }
            return w
          })

          return { workouts: newWorkouts }
        })
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }))
      },
    }),
    {
      name: "calisthenics-workout-storage",
    },
  ),
)
