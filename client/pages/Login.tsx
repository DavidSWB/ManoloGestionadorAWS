import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dog } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useNavigate } from "react-router-dom";

const Schema = z.object({
  correo: z.string().email("Correo inválido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
});

type Values = z.infer<typeof Schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm<Values>({ resolver: zodResolver(Schema), defaultValues: { correo: "", password: "" } });

  function onSubmit(values: Values) {
    login(values.correo, values.password);
    navigate("/");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-white to-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--brand-primary))]/10">
            <Dog className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
          </div>
          <CardTitle className="text-xl">Manolo’s Gestión</CardTitle>
          <CardDescription>Inicia sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField control={form.control} name="correo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo</FormLabel>
                  <FormControl>
                    <Input placeholder="correo@ejemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-[hsl(var(--brand-primary))]" data-test="my-button-test-tag" name="iniciarSesion">Iniciar sesión</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
