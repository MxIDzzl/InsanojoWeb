import { Card, CardContent } from "@/components/ui/card";

const FAQS = [
  {
    q: "¿Cómo me registro al torneo?",
    a: "Inicia sesión con osu!, entra a Registro y envía tu usuario de Discord para revisión del staff.",
  },
  {
    q: "¿Qué formato usa el torneo?",
    a: "Formato 1v1 en osu!mania 4K, con mappools por fase y reglas publicadas en la sección Reglas.",
  },
  {
    q: "¿Dónde veo noticias y cambios?",
    a: "Todas las actualizaciones oficiales se publican en la sección Noticias.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">FAQ</h1>
      <p className="mt-3 text-white/60 max-w-2xl">
        Preguntas frecuentes sobre registro, reglas y funcionamiento del torneo.
      </p>

      <div className="mt-8 grid gap-4">
        {FAQS.map((item) => (
          <Card key={item.q} className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-purple-300">{item.q}</h2>
              <p className="mt-2 text-sm text-white/70">{item.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
