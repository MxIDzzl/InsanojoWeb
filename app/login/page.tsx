export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-md">
        <h1 className="text-3xl font-bold text-purple-300">
          Iniciar sesión
        </h1>

        <p className="mt-3 text-white/70 text-sm">
          Inicia sesión con tu cuenta de osu! para registrarte y acceder a
          funciones del torneo.
        </p>

        <a
          href="/api/auth/osu"
          className="mt-6 block w-full text-center px-5 py-3 rounded-2xl bg-purple-600 font-semibold hover:bg-purple-500 transition shadow-lg shadow-purple-500/30"
        >
          Login with osu!
        </a>

        <p className="mt-6 text-xs text-white/40 text-center">
          Solo usamos tu información pública de perfil.
        </p>
      </div>
    </div>
  );
}