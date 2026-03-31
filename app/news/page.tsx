"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { renderBBCode } from "@/lib/bbcode";

type NewsItem = {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data.news ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-white/70">Cargando noticias...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">
        Noticias
      </h1>
      <p className="mt-3 text-white/60">
        Últimas actualizaciones del torneo.
      </p>

      {news.length === 0 ? (
        <Card className="mt-8 rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-white/50">No hay noticias publicadas aún.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {news.map((item) => (
            <Card key={item.id} className="rounded-2xl bg-white/5 border-white/10 overflow-hidden">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-56 object-cover"
                />
              )}
              <CardContent className="p-6">
                <p className="text-xs text-white/30 mb-2">
                  {new Date(item.created_at).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {item.title}
                </h2>
                <div
                  className="text-white/80 leading-relaxed bbcode-content"
                  dangerouslySetInnerHTML={{ __html: renderBBCode(item.content) }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}