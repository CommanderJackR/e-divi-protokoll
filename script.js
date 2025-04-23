// GCS-Berechnung
function updateGCS() {
  const augen = parseInt(document.getElementById("gcs-augen").value) || 0;
  const verbal = parseInt(document.getElementById("gcs-verbal").value) || 0;
  const motorik = parseInt(document.getElementById("gcs-motorik").value) || 0;

  const gcsGesamt = augen + verbal + motorik;
  let interpretation = "Keine Bewertung";

  if (gcsGesamt <= 8) interpretation = "Schwere Bewusstseinsstörung";
  else if (gcsGesamt <= 12) interpretation = "Mittelschwere Störung";
  else interpretation = "Leichte Beeinträchtigung";

  document.getElementById("gcsResult").textContent = `GCS: ${gcsGesamt} (${interpretation})`;
}

// NRS-Auswertung mit Medikamentenempfehlung
function updateNRS() {
  const nrs = parseInt(document.getElementById("nrs").value);
  let med = "";

  if (nrs >= 0 && nrs <= 3) med = "Paracetamol";
  else if (nrs <= 6) med = "Novalgin";
  else med = "Morphin (nur unter ärztlicher Anweisung)";

  document.getElementById("medEmpfehlung").textContent = `Empfohlen: ${med}`;
}

// Signatur-Funktion
let canvas = document.getElementById("signature");
let ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// PDF-Erstellung & Discord Webhook
document.getElementById("divi-form").addEventListener("submit", function (e) {
  e.preventDefault();

  // Screenshot + PDF
  html2canvas(document.querySelector(".container")).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("DIVI-Protokoll.pdf");

    // Webhook Senden
    const discordWebhook = "https://discord.com/api/webhooks/1363882854903447842/13mqoN8AnCIpmG0JXjY4BHBx4s90QlqlT8Ovbcm0yOsEnNT76P2jWYO8FjfhMr3Hyy9U";
    const patient = document.getElementById("patient-name").value || "Unbekannt";
    const datum = new Date().toLocaleString();

    fetch(discordWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "📋 Neues E-DIVI Protokoll",
            color: 15158332,
            fields: [
              { name: "🧍 Patient", value: patient, inline: true },
              { name: "📅 Datum", value: datum, inline: true },
              { name: "📎 Status", value: "PDF wurde generiert & gespeichert" }
            ]
          }
        ]
      })
    });
  });
});
