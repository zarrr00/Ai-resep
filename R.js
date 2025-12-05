const camera = document.getElementById("camera");
const snapshot = document.getElementById("snapshot");
const takePhotoBtn = document.getElementById("takePhoto");
const retakeBtn = document.getElementById("retake");
const analyzeBtn = document.getElementById("analyze");
const resultSection = document.getElementById("result");
const resultContent = document.getElementById("resultContent");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    camera.srcObject = stream;
  } catch (err) {
    alert("Tidak dapat mengakses kamera.");
  }
}

takePhotoBtn.addEventListener("click", () => {
  const ctx = snapshot.getContext("2d");
  snapshot.width = camera.videoWidth;
  snapshot.height = camera.videoHeight;
  ctx.drawImage(camera, 0, 0);

  camera.style.display = "none";
  snapshot.style.display = "block";
  takePhotoBtn.style.display = "none";
  retakeBtn.style.display = "inline-block";
  analyzeBtn.style.display = "inline-block";
});

retakeBtn.addEventListener("click", () => {
  camera.style.display = "block";
  snapshot.style.display = "none";
  takePhotoBtn.style.display = "inline-block";
  retakeBtn.style.display = "none";
  analyzeBtn.style.display = "none";
  resultSection.style.display = "none";
});

analyzeBtn.addEventListener("click", async () => {
  resultSection.style.display = "block";
  resultContent.innerHTML = `<div class="loading">Menganalisis...</div>`;

  const imgData = snapshot.toDataURL("image/jpeg");

  try {
    const res = await fetch("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imgData })
    });

    const data = await res.json();

    renderResult(data);

  } catch (err) {
    resultContent.innerHTML = "<p style='color:red'>Gagal menganalisis gambar.</p>";
  }
});

function renderResult(data) {
  resultContent.innerHTML = `
    <p><strong>Bahan Terdeteksi:</strong></p>
    <div style="margin-bottom:15px;">
      ${data.detected.map(i => `<span class="info-badge">${i}</span>`).join("")}
    </div>

    <h2>Pilih Resep:</h2>

    <div class="recipe-grid">
      ${data.recipes.map((r, idx) => `
        <div class="recipe-option" onclick="showDetail(${idx})">
          <h3>${r.name}</h3>
          <p>${r.description}</p>
          <div class="recipe-meta">
            <div class="meta-item">⏱️ ${r.time}</div>
            <div class="meta-item">🍽️ ${r.servings}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  window.showDetail = (index) => {
    const r = data.recipes[index];
    resultContent.innerHTML = `
      <button class="back-button" onclick="location.reload()">← Kembali</button>

      <div class="recipe-card">
        <h3>${r.name}</h3>

        <div class="time-badge">⏱️ ${r.time}</div>

        <div class="ingredients-section">
          <h4>Bahan:</h4>
          ${r.ingredients.map(i => `<div class="ingredient-item">${i}</div>`).join("")}
        </div>

        <div class="steps-section">
          <h4>Langkah:</h4>
          ${r.steps.map((s, i) => `
            <div class="step-item">
              <div class="step-number">${i+1}</div> ${s}
            </div>
          `).join("")}
        </div>

        <p class="tips">💡 Tips: ${r.tips}</p>
      </div>
    `;
  };
}

startCamera();
fetch("http://localhost:3000", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    imageBase64: base64Image
  })
})