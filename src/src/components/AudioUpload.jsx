import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytesResumable } from "firebase/storage";

export default function AudioUpload() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    if (!file) return;

    const storageRef = ref(storage, `audio/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percent);
      },
      (error) => {
        console.error("Upload error:", error);
      },
      () => {
        console.log("Upload complete!");
      }
    );
  };

  return (
    <div>
      <h2>Upload Audio</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>
      <p>Progress: {progress.toFixed(0)}%</p>
    </div>
  );
}
