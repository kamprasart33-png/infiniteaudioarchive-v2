<!-- Supabase client -->
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script>
  // Replace with your actual Supabase URL and Anon Key
  const SUPABASE_URL = "https://abcd1234.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
  
  // Renamed to avoid name shadowing conflict
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const audioListEl = document.getElementById("audioList");
  const waveCanvas = document.getElementById("waveCanvas");
  const waveModeLabel = document.getElementById("waveModeLabel");
  const playlistSelect = document.getElementById("playlistSelect");

  let audioItems = [];
  let brutalMode = false;
  let currentWaveUrl = null;

  // ---------- Library ----------

  async function loadAudioList() {
    audioListEl.innerHTML = "";
    audioItems = [];

    const { data, error } = await supabaseClient.storage
      .from("audio")
      .list("", { limit: 200 });

    if (error) {
      console.error("Error loading files:", error);
      audioListEl.innerHTML = `<div style="color:var(--muted); font-size:12px; padding:8px;">Failed to load audio files. Check browser console for details.</div>`;
      return;
    }

    if (!data || data.length === 0) {
      audioListEl.innerHTML = `<div style="color:var(--muted); font-size:12px; padding:8px;">No audio files found.</div>`;
      return;
    }

    data.forEach(file => {
      if (file.name === ".emptyFolderPlaceholder") return;

      const item = document.createElement("div");
      item.className = "audio-item";
      item.dataset.name = file.name.toLowerCase();

      const main = document.createElement("div");
      main.className = "audio-main";

      const nameEl = document.createElement("div");
      nameEl.className = "audio-name";
      nameEl.textContent = file.name;

      const metaEl = document.createElement("div");
      metaEl.className = "audio-meta";
      metaEl.textContent = "Size: " + (file.metadata?.size || "?") + " bytes";

      main.appendChild(nameEl);
      main.appendChild(metaEl);

      const actions = document.createElement("div");
      actions.className = "audio-actions";

      const playBtn = document.createElement("button");
      playBtn.className = "secondary small";
      playBtn.textContent = "Waveform";
      playBtn.onclick = () => renderWaveformForFile(file.name);

      const addBtn = document.createElement("button");
      addBtn.className = "secondary small";
      addBtn.textContent = "Add to playlist";
      addBtn.onclick = () => addToPlaylist(file.name);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "danger small";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteAudio(file.name);

      actions.appendChild(playBtn);
      actions.appendChild(addBtn);
      actions.appendChild(deleteBtn);

      item.appendChild(main);
      item.appendChild(actions);

      audioListEl.appendChild(item);
      audioItems.push(item);
    });
  }

  async function uploadAudio() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) {
      alert("Choose an audio file first.");
      return;
    }

    const { data, error } = await supabaseClient.storage
      .from("audio")
      .upload(file.name, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
      return;
    }

    alert("Uploaded: " + file.name);
    fileInput.value = "";
    loadAudioList();
  }

  async function deleteAudio(filename) {
    const { error } = await supabaseClient.storage
      .from("audio")
      .remove([filename]);

    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete file.");
      return;
    }

    alert("Deleted: " + filename);
    loadAudioList();
  }

  function filterAudioList() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    audioItems.forEach(item => {
      const name = item.dataset.name;
      item.style.display = name.includes(query) ? "flex" : "none";
    });
  }

  // ---------- Playlists ----------

  async function createPlaylistFromInput() {
    const name = document.getElementById("playlistNameInput").value.trim();
    if (!name) {
      alert("Enter a playlist name.");
      return;
    }
    await createPlaylist(name);
    document.getElementById("playlistNameInput").value = "";
  }

  async function createPlaylist(name) {
    const option = document.createElement("option");
    option.value = "local-" + name;
    option.textContent = name;
    playlistSelect.appendChild(option);
    alert("Playlist created: " + name);
  }

  async function addToPlaylist(filename) {
    const playlistId = playlistSelect.value;
    if (playlistId === "all") {
      alert("Select a playlist first.");
      return;
    }
    alert("Added " + filename + " to playlist: " + playlistSelect.options[playlistSelect.selectedIndex].text);
  }

  async function loadPlaylist() {
    loadAudioList();
  }

  // ---------- Waveform / Visualizer ----------

  async function renderWaveformForFile(filename) {
    const { data } = supabaseClient.storage
      .from("audio")
      .getPublicUrl(filename);

    const url = data.publicUrl;
    currentWaveUrl = url;
    drawWaveform(url);
  }

  async function drawWaveform(url) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 300;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const ctx = waveCanvas.getContext("2d");
      let shift = 0;
      let pulse = 1;
      let pulseDirection = 1;
      let jitter = 0;
      let shake = 0;
      let flash = 0;

      function animate() {
        const width = waveCanvas.width = waveCanvas.clientWidth;
        const height = waveCanvas.height = waveCanvas.clientHeight;

        if (brutalMode) {
          shake = Math.random() * 20 - 10;
          ctx.save();
          ctx.translate(shake, shake);
        } else {
          ctx.save();
        }

        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(shift, 0, width + shift, 0);
        gradient.addColorStop(0, brutalMode ? "#ff0000" : "#ff3366");
        gradient.addColorStop(0.5, brutalMode ? "#ff00ff" : "#ff7a45");
        gradient.addColorStop(1, brutalMode ? "#0000ff" : "#4a90e2");
        ctx.fillStyle = gradient;

        const barWidth = width / samples;
        const bassEnergy = filteredData.slice(0, 50).reduce((a, b) => a + b, 0) / 50;
        const targetPulse = brutalMode ? 1 + bassEnergy * 8 : 1 + bassEnergy * 4;

        if (pulseDirection === 1) {
          pulse += brutalMode ? 0.12 : 0.05;
          if (pulse >= targetPulse) pulseDirection = -1;
        } else {
          pulse -= brutalMode ? 0.12 : 0.05;
          if (pulse <= 1) pulseDirection = 1;
        }

        jitter = bassEnergy > 0.03 ? (Math.random() * (brutalMode ? 20 : 10) - (brutalMode ? 10 : 5)) : 0;

        if (brutalMode && bassEnergy > 0.04) {
          flash = 1;
        }
        flash *= 0.85;

        if (brutalMode && flash > 0.1) {
          ctx.fillStyle = `rgba(255,255,255,${flash})`;
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = gradient;
        }

        filteredData.forEach((val, i) => {
          let barHeight = val * height * pulse;

          if (brutalMode && Math.random() < bassEnergy * 3) {
            barHeight *= (1.5 + Math.random() * 2.5);
          } else if (!brutalMode && bassEnergy > 0.02) {
            barHeight *= 1.3;
          }

          const tearOffset = brutalMode ? Math.random() * 15 - 7 : 0;
          const x = i * barWidth + jitter + tearOffset;

          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        });

        ctx.restore();

        shift += brutalMode ? 10 : 4;
        requestAnimationFrame(animate);
      }

      animate();
    } catch (err) {
      console.error("Error rendering waveform:", err);
    }
  }

  function toggleBrutalMode() {
    brutalMode = !brutalMode;
    waveModeLabel.textContent = brutalMode ? "Brutal++" : "Gradient";
    if (currentWaveUrl) {
      drawWaveform(currentWaveUrl);
    }
  }

  // Initial load
  loadAudioList();
</script>
