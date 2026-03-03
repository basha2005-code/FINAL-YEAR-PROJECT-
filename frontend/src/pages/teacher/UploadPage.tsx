import { useState } from "react";
import { uploadCSV } from "../../services/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await uploadCSV(file, Number(semester));

      setMessage("✅ Upload successful!");
      setFile(null);
      setSemester("");
    } catch (err: any) {
      setMessage("❌ Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">
        Upload Student Data
      </h1>

      <div className="bg-white border rounded-lg p-6 w-full max-w-md">

        {/* 🔥 FILE INPUT FIXED */}
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full border p-2 rounded"
        />

        {/* 🔥 SEMESTER */}
        <input
          type="number"
          placeholder="Semester (e.g. 1)"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="mb-4 w-full border p-2 rounded"
        />

        {/* 🔥 BUTTON */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Uploading..." : "Upload CSV"}
        </button>

        {/* 🔥 MESSAGE */}
        {message && (
          <p className="mt-4 text-sm text-center">{message}</p>
        )}
      </div>
    </div>
  );
}