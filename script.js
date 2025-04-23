//  --- Hilfsfunktionen ---

// Funktion zum Abrufen eines Formularfelds (vereinfacht den Code)
function $(selector) {
    return document.querySelector(selector);
}

// Funktion zum Abrufen aller Formularfelder mit einem bestimmten Namen
function $$(selector) {
    return document.querySelectorAll(selector);
}

// Funktion zum Berechnen des Alters aus dem Geburtsdatum
function calculateAge(birthday) {
    if (!birthday) return ''; // Wenn kein Geburtsdatum, leeres Feld
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

//  --- Event Listener und Funktionen ---

// 1. Altersberechnung
$('#dob').addEventListener('change', () => {
    $('#age').value = calculateAge($('#dob').value);
});

// 2. GCS-Berechnung
$$('select[name^="gcs_"]').forEach(el => {
    el.addEventListener('change', () => {
        const eye = parseInt($('[name="gcs_eye"]').value) || 0;
        const verbal = parseInt($('[name="gcs_verbal"]').value) || 0;
        const motor = parseInt($('[name="gcs_motor"]').value) || 0;
        const total = eye + verbal + motor;
        let level = " - ";
        if (total <= 8) level = "Schweres Schädel-Hirn-Trauma";
        else if (total <= 12) level = "Mittelschweres Trauma";
        else level = "Leichtes Trauma";
        $('#gcsResult').innerText = `GCS Gesamt: ${total} (${level})`;
    });
});

// 3. NRS-Empfehlung
$('#nrsValue').addEventListener('change', () => {
    const val = parseInt($('#nrsValue').value);
    let text = "-";
    if (val >= 1 && val <= 3) text = "Empfohlen: Paracetamol";
    else if (val >= 4 && val <= 6) text = "Empfohlen: Ibuprofen";
    else if (val >= 7) text = "Empfohlen: Ketamin (RD) oder Opiat";
    $('#nrsSuggestion').innerText = `Empfohlene Maßnahme: ${text}`;
});

// 4. Transportziel-Feld aktivieren/deaktivieren
$$('input[name="transportNeeded"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const destinationLabel = $('#transportDestinationLabel');
        const destinationInput = $('#transportDestination');
        if (radio.value === 'yes') {
            destinationLabel.style.display = 'block';
            destinationInput.style.display = 'block';
            destinationInput.disabled = false;
        } else {
            destinationLabel.style.display = 'none';
            destinationInput.style.display = 'none';
            destinationInput.disabled = true;
            destinationInput.value = ''; // Feld leeren
        }
    });
});

// 5. Signaturfeld
const canvas = $('#signaturePad');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);
canvas.addEventListener('touchmove', drawTouch);

function startDrawing(e) {
    drawing = true;
    draw(e); // Zeichnen sofort beginnen
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath(); // Neuen Pfad beginnen, um Linien zu trennen
}

function draw(e) {
    if (!drawing) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    let offsetX, offsetY;
    if (e.type.startsWith('mouse')) {
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    } else {
        const rect = canvas.getBoundingClientRect();
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
    }

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
}

function drawTouch(e) {
    e.preventDefault(); // Verhindert Scrollen auf Touch-Geräten
    draw(e);
}

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}

// 6. Formular absenden (PDF-Download und Discord Webhook)
$('#diviForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Verhindert das Standardverhalten des Formulars (Seitenneuladen)

    const formData = new FormData($('#diviForm')); // Formulardaten sammeln
    const data = Object.fromEntries(formData.entries()); // In ein Objekt umwandeln

    // PDF generieren (Funktion wird später implementiert)
    const pdfBlob = await generatePDF(data);
    if (pdfBlob) {
        downloadPDF(pdfBlob, 'divi-protokoll.pdf');
    }

    // Discord Webhook senden (Funktion wird später implementiert)
    await sendToDiscordWebhook(data);

    alert('Protokoll wurde abgeschickt und PDF heruntergeladen!'); // Erfolgsmeldung (kann später durch ein schöneres UI ersetzt werden)
    $('#diviForm').reset(); // Formular zurücksetzen
    clearSignature(); // Unterschrift löschen
});

// 7. PDF generieren (jsPDF)
async function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // LSMD Farben
    const lsmdRot = "#E52B2B";
    const lsmdDunkelrot = "#B22222";

    // Logo einbinden (Pfad anpassen!)
    const logo = new Image();
    logo.src = 'lsmd-logo.png'; // Pfad zum Logo
    await logo.decode(); // Sicherstellen, dass das Bild geladen ist
    doc.addImage(logo, 'PNG', 10, 10, 40, 40); // Position und Größe des Logos

    // Überschrift
    doc.setFontSize(20);
    doc.setTextColor(lsmdRot);
    doc.setFont('helvetica', 'bold');
    doc.text("DIVI-Protokoll", 55, 25);

    doc.setFontSize(12);
    doc.setTextColor(lsmdDunkelrot);
    doc.setFont('helvetica', 'normal');
    doc.text("Los Santos Medical Department", 55, 35);

    let y = 60; // Startposition für den Inhalt
    const lineHeight = 10;
    const leftMargin = 10;

    // Funktion zum Hinzufügen von Abschnittsüberschriften
function addSectionTitle(title) {
    doc.setFontSize(16);
    doc.setTextColor(lsmdRot);
    doc.setFont('helvetica', 'bold');
    doc.text(title, leftMargin, y);
    y += lineHeight + 4;
    doc.line(leftMargin, y - 8, 200, y - 8); // Horizontale Linie (angepasst)
    doc.setTextColor("#000000");
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
}

    // Patientendaten
    addSectionTitle("Patientendaten");
    doc.text(`Name: ${data.patientName || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Geburtsdatum: ${data.dob || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Alter: ${data.age || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Geschlecht: ${data.gender || '-'}`, leftMargin, y);
    y += lineHeight + 5;

    // Patientenzustand
    addSectionTitle("Patientenzustand");
    doc.text(`Initialer Patientenzustand: ${data.initialState || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Symptome: ${data.symptoms || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Allergien: ${data.allergies || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Puls: ${data.pulse || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Blutdruck: ${data.bp || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`SPO2: ${data.spo2 || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`GCS: ${$('#gcsResult').innerText || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`NRS: ${$('#nrsSuggestion').innerText || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Temperatur: ${data.temperature || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Blutzucker: ${data.bloodSugar || '-'}`, leftMargin, y);
    y += lineHeight + 5;

    // Einsatzdaten
    addSectionTitle("Einsatzdaten");
    doc.text(`Einsatzdatum: ${data.date || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Fahrzeugkennung: ${data.vehicle || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Einsatzkräfte: ${data.crew || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Einsatzort: ${data.location || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Transport notwendig: ${data.transportNeeded || '-'}`, leftMargin, y);
    y += lineHeight;
    if (data.transportNeeded === 'yes') {
        doc.text(`Transportziel: ${data.transportDestination || '-'}`, 20, y);
        y += lineHeight;
    }
    doc.text(`Transportmittel: ${data.transport || '-'}`, leftMargin, y);
    y += lineHeight;
    doc.text(`Transportart: ${data.transportType || '-'}`, leftMargin, y);
    y += lineHeight + 5;

    // Unterschrift
    addSectionTitle("Unterschrift");
    const signatureDataUrl = canvas.toDataURL();
    doc.addImage(signatureDataUrl, 'PNG', leftMargin, y, 60, 30);

    return doc.output('blob');
}

// 8. PDF herunterladen
function downloadPDF(blob, filename) {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// 9. Discord Webhook senden
async function sendToDiscordWebhook(data) {
    const webhookUrl = 'https://discord.com/api/webhooks/1364256861238329446/MoeFbae5UHjJtZ3PM5GhgHl1M_eU_SqFmnUpCcKnk2L3oLKw9VNW5TQyMisCKzCgWqp9'; // **SICHERHEIT: Nicht im Client-Code!**
    if (!webhookUrl || webhookUrl === 'DEIN_DISCORD_WEBHOOK_URL') {
        console.warn('Discord Webhook URL ist nicht konfiguriert. Daten werden nicht gesendet.');
        return;
    }

    const embed = {
        title: 'Neues DIVI-Protokoll',
        color: 15548997, // Entspricht der Farbe #E52B25 (ungefähr)
        author: {
            name: 'Los Santos Medical Department',
            icon_url: 'https://github.com/CommanderJackR/lsmd-divi-protokoll/blob/main/lsmd-logo.png?raw=true' // Pfad zum Logo (Raw-URL von GitHub)
        },
        fields: [
            { name: 'Patientenname', value: data.patientName || '-', inline: true },
            { name: 'Geburtsdatum', value: data.dob || '-', inline: true },
            { name: 'Alter', value: data.age || '-', inline: true },
            { name: 'Geschlecht', value: data.gender || '-', inline: true },
            { name: 'Initialer Zustand', value: data.initialState || '-' },
            { name: 'Symptome', value: data.symptoms || '-' },
            { name: 'Allergien', value: data.allergies || '-' },
            { name: 'Puls', value: data.pulse || '-', inline: true },
            { name: 'Blutdruck', value: data.bp || '-', inline: true },
            { name: 'SpO2', value: data.spo2 || '-', inline: true },
            { name: 'GCS', value: $('#gcsResult').innerText || '-', inline: true },
            { name: 'NRS', value: $('#nrsSuggestion').innerText || '-', inline: true },
            { name: 'Temperatur', value: data.temperature || '-', inline: true },
            { name: 'Blutzucker', value: data.bloodSugar || '-', inline: true },
            { name: 'Einsatzdatum', value: data.date || '-', inline: true },
            { name: 'Fahrzeug', value: data.vehicle || '-', inline: true },
            { name: 'Einsatzkräfte', value: data.crew || '-', inline: true },
            { name: 'Einsatzort', value: data.location || '-' },
            { name: 'Transport', value: data.transportNeeded || '-', inline: true },
            { name: 'Transportziel', value: data.transportNeeded === 'yes' ? (data.transportDestination || '-') : '-', inline: true },
            { name: 'Transportmittel', value: data.transport || '-', inline: true },
            { name: 'Transportart', value: data.transportType || '-', inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'DIVI-Protokoll'
        }
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] }),
        });

        if (!response.ok) {
            console.error('Fehler beim Senden an Discord:', response.status, response.statusText);
        } else {
            console.log('Daten erfolgreich an Discord gesendet!');
        }
    } catch (error) {
        console.error('Fehler beim Senden an Discord:', error);
    }
}
