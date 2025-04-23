//  --- Hilfsfunktionen ---

function $(selector) {
    return document.querySelector(selector);
}

function $<span class="math-inline">\(selector\) \{
return document\.querySelectorAll\(selector\);
\}
function</4\> calculateAge\(birthday\) \{
if \(\!birthday\) return '';
<5\>const birthDate \= new Date\(birthday\);
const today \= new Date\(\);
let age \= today\.getFullYear\(\) \- birthDate\.getFullYear\(\);
const <6\>monthDiff \= today\.getMonth\(\) \- birthDate\.getMonth\(\);</5\>
if \(monthDiff < 0 \|\| \(monthDiff \=\=\= 0 && today\.getDate\(\) < birthDate\.getDate\(\)\)\) \{
age\-\-;
\}
return age;
\}
function calculateBMI\(weight,</6\> height\) \{
if \(\!weight \|\| \!height\) return '';
const heightInMeters \= height / 100;
const bmi \= weight / \(heightInMeters \* heightInMeters\);
return bmi\.toFixed\(2\);
\}
function validateForm\(\) \{
if \(</span>('input[name="patientName"]').value.trim() === '') {
        alert('Bitte geben Sie den Namen des Patienten ein.');
        return false;
    }
    return true;
}

// --- Event Listener und Funktionen ---

$('#dob').addEventListener('change', () => {
    <span class="math-inline">\('\#age'\)\.value \= calculateAge\(</span>('#dob').value);
});

<span class="math-inline">\('\#height'\)\.addEventListener\('change', \(\) \=\> \{
const weight \= parseFloat\(</span>('#weight').value);
    const height = parseFloat($('#height').value);
    $('#bmi').value = calculateBMI(weight, height);
});

<span class="math-inline">\('\#weight'\)\.addEventListener\('change', \(\) \=\> \{
const weight \= parseFloat\(</span>('#weight').value);
    const height = parseFloat($('#height').value);
    $('#bmi').value = calculateBMI(weight, height);
});

$<span class="math-inline">\('select\[name^\="gcs\_"\]'\)\.forEach\(el \=\> \{
el\.addEventListener\('change', \(\) \=\> \{
const eye \= parseInt\(</span>('[name="gcs_eye"]').value) || 0;
        const verbal = parseInt(<span class="math-inline">\('\[name\="gcs\_verbal"\]'\)\.value\) \|\| 0;
const motor \= parseInt\(</span>('[name="gcs_motor"]').value) || 0;
        const total = eye +
