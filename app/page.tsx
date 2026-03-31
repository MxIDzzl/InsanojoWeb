export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-bold">
          Insanojo Mania 4K Cup
        </h1>

        <p className="mt-4 text-lg text-gray-500">
          Competitive osu!mania 4K Tournament
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/participants"
            className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:opacity-80 transition"
          >
            Participants
          </a>

          <a
            href="/rules"
            className="px-6 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition"
          >
            Rules
          </a>
        </div>
      </div>
    </main>
  );
}
