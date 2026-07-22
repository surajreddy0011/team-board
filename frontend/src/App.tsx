import { useState } from "react";
import { login, signup, ApiError } from "./api";

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    try {
      if (isSignup) {
        await signup(email, password, name);
      }
      const res = await login(email, password);
      localStorage.setItem("token", res.token);
      setToken(res.token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
            Team Board
          </h1>

          {isSignup && (
            <input
              className="border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-400"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            className="bg-indigo-600 text-white rounded-lg py-2 font-semibold hover:bg-indigo-700 transition"
            onClick={handleSubmit}
          >
            {isSignup ? "Sign up" : "Log in"}
          </button>

          <button
            className="text-sm text-slate-500 underline"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Already have an account? Log in" : "No account? Sign up"}
          </button>
        </div>
      </div>
    );
  }

  return <div className="p-8">Logged in! Board UI goes here next.</div>;
}

export default App;