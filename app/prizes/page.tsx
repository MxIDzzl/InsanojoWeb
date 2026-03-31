import { Card, CardContent } from "@/components/ui/card";

type Prize = {
  place: string;
  reward: string;
  extra: string;
};

const PRIZES: Prize[] = [
  {
    place: "1er lugar",
    reward: "4 meses de supporter",
    extra: "5 meses de VIP en RoBeats",
  },
  {
    place: "2do lugar",
    reward: "2 meses de supporter",
    extra: "2 meses de VIP en RoBeats",
  },
  {
    place: "3er lugar",
    reward: "1 mes de supporter",
    extra: "1 mes de VIP en RoBeats",
  },
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
              <p className="mt-2 text-2xl font-bold text-purple-300">{item.reward}</p>
              <p className="mt-3 text-sm text-white/70">{item.extra}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
