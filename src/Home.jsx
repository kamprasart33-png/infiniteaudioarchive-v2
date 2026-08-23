import AudioUpload from "./components/AudioUpload";

export default function Home() {
  return (
    <div>
      <h1>InfiniteAudioArchive v2</h1>
      <AudioUpload />
    </div>
  );
}
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Infinite Audio Archive API',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Infinite Audio Archive API',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});
