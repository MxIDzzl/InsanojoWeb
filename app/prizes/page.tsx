import { Card, CardContent } from "@/components/ui/card";

const PRIZES = [
  { place: "1er lugar", amount: "$150 USD", extra: "Badge de campeón + reconocimiento oficial" },
  { place: "2do lugar", amount: "$75 USD", extra: "Reconocimiento oficial en foro y stream" },
  { place: "3er lugar", amount: "$40 USD", extra: "Mención oficial en resultados finales" },
];

export default function PrizesPage() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">Premios</h1>
      <p className="mt-3 text-white/60 max-w-2xl">
        Distribución de premios para la edición actual del torneo.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PRIZES.map((item) => (
          <Card key={item.place} className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-6">
              <p className="text-sm text-white/50">{item.place}</p>
              <p className="mt-2 text-2xl font-bold text-purple-300">{item.amount}</p>
              <p className="mt-3 text-sm text-white/70">{item.extra}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
