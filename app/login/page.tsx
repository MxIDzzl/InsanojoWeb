export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-md">
        <h1 className="text-3xl font-bold text-purple-300">Login</h1>

        <p className="mt-3 text-white/70 text-sm">
          Login using your osu! account to register for the tournament.
        </p>

        <button className="mt-6 w-full px-5 py-3 rounded-2xl bg-purple-600 font-semibold hover:bg-purple-500 transition shadow-lg shadow-purple-500/30">
          Login with osu!
        </button>

        <p className="mt-6 text-xs text-white/40 text-center">
          We only use your osu! profile information.
        </p>
      </div>
    </div>
  );
}