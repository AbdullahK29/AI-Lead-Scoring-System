// main.js
// Handles form submission via Fetch API (no page reload) and animates the result.

const form          = document.getElementById('leadForm');
const submitBtn     = document.getElementById('submitBtn');
const btnText       = document.getElementById('btnText');
const btnLoader     = document.getElementById('btnLoader');
const emptyState    = document.getElementById('emptyState');
const resultDisplay = document.getElementById('resultDisplay');


form.addEventListener('submit', async function (e) {
  e.preventDefault();   // Stop browser from reloading the page on submit

  setLoading(true);

  // Collect all form values into a plain object
  const payload = {
    total_visits:  document.getElementById('total_visits').value,
    time_on_site:  document.getElementById('time_on_site').value,
    page_views:    document.getElementById('page_views').value,
    lead_source:   document.getElementById('lead_source').value,
    last_activity: document.getElementById('last_activity').value,
    occupation:    document.getElementById('occupation').value,
  };

  try {
    // Send to Flask's /predict route as JSON
    const response = await fetch('/predict', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      showResult(result.score, result.label, result.color);
    } else {
      alert('Prediction error: ' + result.error);
    }
  } catch (err) {
    alert('Cannot connect to server. Is app.py running?');
    console.error(err);
  }

  setLoading(false);
});


function showResult(score, label, color) {
  emptyState.classList.add('hidden');
  resultDisplay.classList.remove('hidden');

  // Animate number counting up from 0 to score
  animateNumber(document.getElementById('scoreNumber'), 0, score, 900);

  // Animate the ring filling (circumference of r=50 circle = 2π×50 ≈ 314)
  // stroke-dashoffset = 314 → empty ring
  // stroke-dashoffset = 0   → full ring
  // For score 74%: offset = 314 × (1 - 0.74) = 81.6
  const ring = document.getElementById('ringFill');
  ring.style.strokeDashoffset = 314 * (1 - score / 100);
  ring.style.stroke = color;

  // Update label badge color
  const badge = document.getElementById('labelBadge');
  badge.textContent     = label;
  badge.style.background = color + '20';   // color at 12% opacity
  badge.style.color      = color;

  resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


function animateNumber(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - (1 - progress) * (1 - progress);   // easeOutQuad
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


function setLoading(on) {
  submitBtn.disabled = on;
  btnText.classList.toggle('hidden', on);
  btnLoader.classList.toggle('hidden', !on);
}


function resetForm() {
  form.reset();
  emptyState.classList.remove('hidden');
  resultDisplay.classList.add('hidden');
  // Reset ring to empty
  const ring = document.getElementById('ringFill');
  ring.style.strokeDashoffset = '314';
  ring.style.stroke = '#7F77DD';
}