import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type StaffUser = {
  osu_id: number;
  username: string;
  avatar_url: string | null;
  role: string | null;
};

export default async function StaffListPage() {
  const { data } = await supabase
    .from("users")
    .select("osu_id, username, avatar_url, role")
    .in("role", ["owner", "host"])
    .order("role", { ascending: true })
    .order("username", { ascending: true });

  const staff = (data ?? []) as StaffUser[];

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">Staff del torneo</h1>
      <p className="mt-3 text-white/60 max-w-2xl">
        Equipo oficial encargado de la organización y revisión del torneo.
      </p>

      {staff.length === 0 ? (
        <Card className="mt-8 rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-sm text-white/60">Aún no hay staff publicado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {staff.map((member) => (
            <Card key={member.osu_id} className="rounded-2xl bg-white/5 border-white/10">
              <CardContent className="p-5 flex items-center gap-4">
                <img
                  src={member.avatar_url ?? "https://a.ppy.sh"}
                  alt={member.username}
                  className="w-14 h-14 rounded-full border border-white/20"
                />
                <div>
                  <p className="text-white font-semibold">{member.username}</p>
                  <p className="text-xs text-white/50">osu! ID: {member.osu_id}</p>
                  <p className="text-sm text-purple-300 mt-1 uppercase">
                    {member.role === "owner" ? "Owner" : "Host"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
