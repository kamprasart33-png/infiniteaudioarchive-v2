import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AudioUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadAudio = async () => {
    if (!file) return;

    setUploading(true);

    const filePath = `audio/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("audio")
      .upload(filePath, file);

    setUploading(false);

    if (error) {
      console.error("Upload error:", error);
      return;
    }

    console.log("Uploaded:", data);
  };

  return (
    <div>
      <h2>Upload Audio</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={uploadAudio} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
