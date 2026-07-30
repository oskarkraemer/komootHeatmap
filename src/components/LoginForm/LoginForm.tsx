"use client";

import { useKomootUser } from "@/src/contexts/KomootUserContext";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useKomootUser();

  async function handleLogin(event: any) {
    event.preventDefault();

    await login(email, password);
  }

  return (
    <div className="w-full h-full flex flex-col items-center">
      <h1>Login Page</h1>
      <div className="flex flex-col">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>

        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>

        <input
          type="submit"
          value="Login"
          className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer"
          onClick={handleLogin}
        ></input>
      </div>
    </div>
  );
}
