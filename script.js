// GCS Berechnung
function updateGCS() {
  const auge = parseInt(document.getElementById("gcs-auge").value) || 0;
  const verbal = parseInt(document.getElementById("gcs-verbal").value) || 0;
  const motorisch = parseInt(document.getElementById("gcs-motorik").value) || 0;
  const summe = auge + verbal + motorisch;

  let beurteilung = "Keine Angabe";
  if (summe >= 13) beurteilung = "Leichtes Schädel-Hirn-Trauma";
  else if (summe >= 9) beurteilung = "Mittelschweres Schädel-Hirn-Trauma";
  else if (summe > 3) beurteilung = "Schweres Schädel-Hirn-Trauma";
  else if (summe === 3) beurteilung = "Tief bewusstlos";

  document.getElementById("gcs-score").textContent = `GCS: ${summe} – ${beurteilung}`;
}

// NRS → Medikamentenvorschlag
function updateMedikation() {
  const nrs = parseInt(document.getElementById("nrs").value) || 0;
  let medikament = "Keine Angabe";

  if (nrs >= 1 && nrs <= 3) medikament = "Paracetamol";
  else if (nrs >= 4 && nrs <= 6) medikament = "Novalgin (Metamizol)";
  else if (nrs >= 7 && nrs <= 10) medikament = "Ketamin oder Opiat (z.B. Fentanyl, Morphin)";
  else medikament = "Keine Schmerzen";

  document.getElementById("med-empfehlung").textContent = `Empfohlenes Medikament: ${medikament}`;
}

// PDF Download
function downloadPDF() {
  window.print(); // Funktioniert gut als PDF über Browser (mobil/Tablet optimiert)
}

// Unterschrift speichern
function clearCanvas() {
  const canvas = document.getElementById("signature");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Unterschrift erfassen (Touch/Mouse)
function initCanvas() {
  const canvas = document.getElementById("signature");
  const ctx = canvas.getContext("2d");
  let painting = false;

  const startPosition = (e) => {
    painting = true;
    draw(e);
  };

  const endPosition = () => {
    painting = false;
    ctx.beginPath();
  };

  const draw = (e) => {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  canvas.addEventListener("mousedown", startPosition);
  canvas.addEventListener("mouseup", endPosition);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("touchstart", startPosition);
  canvas.addEventListener("touchend", endPosition);
  canvas.addEventListener("touchmove", draw);
}

// Initialisieren
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("gcs-auge").addEventListener("change", updateGCS);
  document.getElementById("gcs-verbal").addEventListener("change", updateGCS);
  document.getElementById("gcs-motorik").addEventListener("change", updateGCS);
  document.getElementById("nrs").addEventListener("change", updateMedikation);
  document.getElementById("downloadBtn").addEventListener("click", downloadPDF);
  initCanvas();
  updateGCS();
  updateMedikation();
});
