import Logo from "../components/logo";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-full bg-black">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm p-12 bg-neutral-900 rounded-2xl border border-neutral-800">
        <Logo height={90} width={100} />

        <div className="text-center">
          <h1 className="text-white text-xl font-medium mb-2">
            Log in to your account
          </h1>
          <p className="text-neutral-400 text-sm">
            Connect with Spotify to continue
          </p>
        </div>

        <a href="/api/spotify/login" className="w-full ">
          <button className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-medium rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer">
            Continue with Spotify
          </button>
        </a>

        {/* <p className="text-neutral-600 text-xs text-center leading-relaxed border-t border-neutral-800 pt-6 w-full">
          By continuing, you agree to our
          <span className="text-neutral-400 underline cursor-pointer">
            Terms of Service
          </span>
          <span className="text-neutral-400 underline cursor-pointer">
            Privacy Policy
          </span>
        </p> */}
      </div>
    </div>
  );
}
