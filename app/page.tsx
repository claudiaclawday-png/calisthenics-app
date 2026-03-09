import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import WorkoutSchedule from "@/components/workout-schedule"
import RecentWorkouts from "@/components/recent-workouts"
import Logo from "@/components/logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResetButton from "@/components/reset-button"
import { memo } from "react"

const weeklyRoutines = {
  intensive: {
    name: "Intensiva",
    days: [
      { name: "Lun", exercise: "Dominadas" },
      { name: "Mar", exercise: "Fondos" },
      { name: "Mié", exercise: "Descanso" },
      { name: "Jue", exercise: "Dominadas" },
      { name: "Vie", exercise: "Fondos" },
      { name: "Sáb", exercise: "Descanso" },
      { name: "Dom", exercise: "Descanso" },
    ],
  },
  spaced: {
    name: "Espaciada",
    days: [
      { name: "Lun", exercise: "Dominadas" },
      { name: "Mar", exercise: "Descanso" },
      { name: "Mié", exercise: "Fondos" },
      { name: "Jue", exercise: "Descanso" },
      { name: "Vie", exercise: "Dominadas" },
      { name: "Sáb", exercise: "Descanso" },
      { name: "Dom", exercise: "Fondos" },
    ],
  },
}

function RoutineCard({ routine, isActive }: { routine: typeof weeklyRoutines.intensive; isActive: boolean }) {
  return (
    <div className="overflow-x-auto pb-3 -mx-2 px-2">
      <div className="flex min-w-max gap-2">
        {routine.days.map((day, index) => (
          <div
            key={index}
            className={`w-16 flex-shrink-0 rounded-lg p-2 text-center transition-colors ${
              day.exercise === "Descanso"
                ? "bg-muted/50"
                : isActive
                  ? "bg-primary/10 border-primary"
                  : "bg-muted"
            }`}
          >
            <div className="text-xs font-medium">{day.name}</div>
            <div
              className={`text-xs mt-1 ${
                day.exercise === "Descanso" ? "text-muted-foreground" : "text-primary font-medium"
              }`}
            >
              {day.exercise}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const MemoizedRoutineCard = memo(RoutineCard)

function HomeContent() {
  return (
    <div className="container px-3 py-4 md:py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Logo size={40} showText={false} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calistenia</h1>
            <p className="text-sm text-muted-foreground">Seguimiento de entrenamiento</p>
          </div>
        </div>

        {/* Quick Actions - Mobile optimized */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Próximo</CardTitle>
              <CardDescription className="text-xs">Según tu progreso</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <WorkoutSchedule />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recientes</CardTitle>
              <CardDescription className="text-xs">Últimos resultados</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <RecentWorkouts />
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <Link href="/workout/select">
          <Button size="lg" className="w-full h-12 text-base">
            Comenzar Entrenamiento
          </Button>
        </Link>

        {/* Weekly Routines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rutinas Semanales</CardTitle>
            <CardDescription className="text-xs">Organiza tu semana</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="intensive">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="intensive">{weeklyRoutines.intensive.name}</TabsTrigger>
                <TabsTrigger value="spaced">{weeklyRoutines.spaced.name}</TabsTrigger>
              </TabsList>

              <TabsContent value="intensive">
                <MemoizedRoutineCard routine={weeklyRoutines.intensive} isActive={true} />
              </TabsContent>

              <TabsContent value="spaced">
                <MemoizedRoutineCard routine={weeklyRoutines.spaced} isActive={true} />
              </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground mt-3">
              Secuencia: Max Reps → Sub Max → Volumen. Completa cada etapa para avanzar.
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <ResetButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

const Home = memo(HomeContent)
export default Home
