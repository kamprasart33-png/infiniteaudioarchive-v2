import { classifyMood } from "../../ai/mood/moodModel.js";
import { clusterGenres } from "../../ai/genre/genreCluster.js";
import { generateEmbedding } from "../../ai/semantic/embeddings.js";
import { runAIPipeline } from "../../ai/pipeline/aiPipeline.js";
import AudioUpload from "./components/AudioUpload";

export default function Home() {
  return (
    <div>
      <h1>InfiniteAudioArchive v2</h1>
      <AudioUpload />
    </div>
  );
}
