import React, { useState } from "react";
import { User } from "../types";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Veuillez saisir un email et un mot de passe.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Email ou mot de passe incorrect.");
        } else {
          setError("Erreur lors de la connexion. Veuillez réessayer.");
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      // data.user_id est renvoyé, les autres champs sont vides pour l'instant
      const user: User = {
        email: email,
        camion: "",
        service: "",
      };
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setError(
        "Une erreur est survenue lors de la connexion. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-b-lg p-8">
          <img
            src="/logo-ariane-rema.png"
            alt="Logo REMA"
            className="h-40 w-40 inline-block"
          />
          <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
            Connexion
          </h1>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-400 rounded-md px-3 py-2 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                placeholder="votre.email@exemple.com"
                required
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-400 rounded-md px-3 py-2 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                placeholder="********"
                required
              />
            </div>
            <div className="h-6 mb-4 text-center">
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
        <footer className="text-center text-sm text-gray-500 mt-6">
          <p>Version 1.0</p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
