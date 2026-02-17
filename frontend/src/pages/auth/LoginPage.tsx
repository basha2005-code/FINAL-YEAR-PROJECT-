import { useState } from "react";
import { login } from "../../services/api";
import { Button } from "../../components/ui/button";

interface LoginPageProps {
  onLogin: (role: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [rollNumber, setRollNumber] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = await login(rollNumber, "");
    localStorage.setItem("role", data.role);
    onLogin(data.role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Enter Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="border p-3 rounded w-64"
          required
        />
        <Button type="submit" className="w-full bg-black text-white">
          Enter
        </Button>
      </form>
    </div>
  );
}