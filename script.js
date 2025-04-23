// GCS-Berechnung
function calculateGCS() {
  const auge = parseInt(document.querySelector('[name="gcs_auge"]').value);
  const sprache = parseInt(document.querySelector('[name="gcs_sprache"]').value);
  const motorik = parseInt(document.querySelector('[name="gcs_motorik"]').value);
  const total = auge + sprache + motorik;
  document.getElementById("gcsResult").innerText = `GCS Gesamt: ${total}`;
}

// NRS-Auswertung + Medikamentenempfehlung
function recommendMed() {
  const nrs = parseInt(document.getElementById("nrs").value);
  let empfehlung = "";

  if (nrs <= 3) {
    empfehlung = "Empfehlung: Paracetamol 500mg oral";
  } else if (nrs <= 6) {
    empfehlung = "Empfehlung: Ibuprofen 400mg oder Novalgin";
  } else if (nrs <= 8) {
    empfehlung = "Empfehlung: Metamizol i.v. oder Tramadol";
  } else {
    empfehlung = "Empfehlung: Piritramid oder Morphin (nach Rücksprache)";
  }

  document.getElementById("medEmpfehlung").innerText = empfehlung;
}

// Signature
const canvas = document.getElementById("signature");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", () => (drawing = true));
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchstart", () => (drawing = true));
canvas.addEventListener("touchend", () => (drawing = false));
canvas.addEventListener("touchmove", drawTouch);

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

function drawTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  draw({
    offsetX: touch.clientX - rect.left,
    offsetY: touch.clientY - rect.top
  });
}

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// PDF & Webhook
document.getElementById("diviForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  let data = "";
  formData.forEach((value, key) => {
    data += `${key}: ${value}\n`;
  });

  const gcs = document.getElementById("gcsResult").innerText;
  const med = document.getElementById("medEmpfehlung").innerText;
  data += `${gcs}\n${med}\n`;

  const pdfBlob = new Blob([data], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const a = document.createElement("a");
  a.href = pdfUrl;
  a.download = "E-DIVI-Protokoll.pdf";
  a.click();

  const webhookUrl = "https://discord.com/api/webhooks/1363882854903447842/13mqoN8AnCIpmG0JXjY4BHBx4s90QlqlT8Ovbcm0yOsEnNT76P2jWYO8FjfhMr3Hyy9U";
  const embed = {
    embeds: [
      {
        title: "📋 Neues E-DIVI Protokoll",
        description: data,
        color: 16711680,
        footer: { text: "LSMD - E-DIVI System" }
      }
    ]
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(embed)
  });
});
