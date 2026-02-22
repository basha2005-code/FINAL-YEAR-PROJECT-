import { useState } from "react";
import { authenticateUser, registerTeacher } from "../../services/api";
import { Button } from "../../components/ui/button";

interface LoginPageProps {
  onLogin: (role: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [role, setRole] = useState("teacher");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isRegister, setIsRegister] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    if (isRegister) {
      await registerTeacher(rollNumber, password, secretKey);
      alert("Teacher Registered. Please Login.");
      setIsRegister(false);
      return;
    }

    const data = await authenticateUser(rollNumber, password);

    console.log("LOGIN RESPONSE:", data); // 🔥 DEBUG

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);

    onLogin(data.role);
  } catch (err: any) {
    alert(err.message);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded">

        {/* Role Selector */}
        <select
          className="border p-2 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>

        <input
          type="text"
          placeholder="Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="border p-2 w-full"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
          required
        />

        {isRegister && role === "teacher" && (
          <input
            type="text"
            placeholder="Secret Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="border p-2 w-full"
            required
          />
        )}

        <Button type="submit" className="w-full bg-black text-white">
          {isRegister ? "Register Teacher" : "Login"}
        </Button>

        {role === "teacher" && (
          <p
            className="text-sm text-blue-600 cursor-pointer text-center"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Back to Login" : "New Teacher? Register Here"}
          </p>
        )}
      </form>
    </div>
  );
}
