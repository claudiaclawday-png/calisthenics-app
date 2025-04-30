import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import WorkoutSchedule from "@/components/workout-schedule"
import RecentWorkouts from "@/components/recent-workouts"
import Logo from "@/components/logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Logo size={48} showText={false} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seguimiento de Calistenia</h1>
            <p className="text-muted-foreground">Controla tu rutina de calistenia y tu progreso</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Próximo Entrenamiento</CardTitle>
              <CardDescription>Basado en tu último entrenamiento registrado</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkoutSchedule />
              <div className="mt-4">
                <Link href="/workout/select">
                  <Button className="w-full">Comenzar Entrenamiento</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entrenamientos Recientes</CardTitle>
              <CardDescription>Tus últimos resultados de entrenamiento</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentWorkouts />
              <div className="mt-4">
                <Link href="/history">
                  <Button variant="outline" className="w-full">
                    Ver Historial Completo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ejemplos de Rutinas Semanales</CardTitle>
            <CardDescription>Puedes organizar tu rutina de calistenia de estas formas</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="routine1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="routine1">Rutina Intensiva</TabsTrigger>
                <TabsTrigger value="routine2">Rutina Espaciada</TabsTrigger>
              </TabsList>

              <TabsContent value="routine1" className="mt-4">
                {/* Versión para móviles - scroll horizontal */}
                <div className="md:hidden overflow-x-auto pb-4">
                  <div className="flex min-w-max">
                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day, index) => (
                      <div key={index} className="w-20 flex-shrink-0 p-2 border rounded-md mx-1">
                        <div className="font-medium text-sm">{day}</div>
                        <div className="text-xs mt-1">
                          {index === 0 || index === 3 ? (
                            <span className="text-primary">Dominadas</span>
                          ) : index === 1 || index === 4 ? (
                            <span className="text-primary">Fondos</span>
                          ) : (
                            <span className="text-muted-foreground">Descanso</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Versión para desktop */}
                <div className="hidden md:grid grid-cols-7 gap-2 text-center">
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Lunes</div>
                    <div className="text-sm text-primary">Dominadas</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Martes</div>
                    <div className="text-sm text-primary">Fondos</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Miércoles</div>
                    <div className="text-sm text-muted-foreground">Descanso</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Jueves</div>
                    <div className="text-sm text-primary">Dominadas</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Viernes</div>
                    <div className="text-sm text-primary">Fondos</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Sábado</div>
                    <div className="text-sm text-muted-foreground">Descanso</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Domingo</div>
                    <div className="text-sm text-muted-foreground">Descanso</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="routine2" className="mt-4">
                {/* Versión para móviles - scroll horizontal */}
                <div className="md:hidden overflow-x-auto pb-4">
                  <div className="flex min-w-max">
                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day, index) => (
                      <div key={index} className="w-20 flex-shrink-0 p-2 border rounded-md mx-1">
                        <div className="font-medium text-sm">{day}</div>
                        <div className="text-xs mt-1">
                          {index === 0 || index === 4 ? (
                            <span className="text-primary">Dominadas</span>
                          ) : index === 2 || index === 6 ? (
                            <span className="text-primary">Fondos</span>
                          ) : (
                            <span className="text-muted-foreground">Descanso</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Versión para desktop */}
                <div className="hidden md:grid grid-cols-7 gap-2 text-center">
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Lunes</div>
                    <div className="text-sm text-primary">Dominadas</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Martes</div>
                    <div className="text-sm text-muted-foreground">Descanso</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Miércoles</div>
                    <div className="text-sm text-primary">Fondos</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Jueves</div>
                    <div className="text-sm text-muted-foreground">Descanso</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Viernes</div>
                    <div className="text-sm text-primary">Dominadas</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Sábado</div>
                    <div className="text-sm text-muted-foreground">Descanso</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Domingo</div>
                    <div className="text-sm text-primary">Fondos</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                Recuerda que cada tipo de entrenamiento (Max Reps, Sub Max, Volumen Escalera) debe realizarse en
                secuencia para cada ejercicio.
              </p>
              <p className="mt-2">
                Por ejemplo: Lunes (Dominadas Max Reps) → Jueves (Dominadas Sub Max) → Lunes siguiente (Dominadas
                Volumen Escalera)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
