// === DOM ELEMENTS ===
const home = document.getElementById('home');
const booking = document.getElementById('booking');
const flightsSection = document.getElementById('flights');
const passengerSection = document.getElementById('passenger');
const summarySection = document.getElementById('summary');
const successSection = document.getElementById('success');

const bookingForm = document.getElementById('bookingForm');
const flightList = document.getElementById('flightList');
const passengerForm = document.getElementById('passengerForm');
const summaryDetails = document.getElementById('summaryDetails');

const bookFlightBtn = document.getElementById('bookFlightBtn');
const backToBooking = document.getElementById('backToBooking');
const flightTypeSelect = document.getElementById('flightType');
const returnDateContainer = document.getElementById('returnDateContainer');

const steps = [
  document.getElementById('step1'),
  document.getElementById('step2'),
  document.getElementById('step3'),
  document.getElementById('step4')
];

// === STATE ===
let bookingData = {};
let selectedFlight = null;

// === FLIGHT DATABASE (All days in October) ===
const flights = [];
const origins = ["Manila"];
const destinations = ["Cebu", "Davao", "Iloilo"];
const terminals = ["T1", "T2", "T3"];

for (let day = 1; day <= 31; day++) {
  const date = `2025-10-${day.toString().padStart(2, '0')}`;

  destinations.forEach((to, index) => {
    const flightNo = `FL ${100 + day + index}`;
    const from = origins[0];
    const time = `${8 + index * 3}:00`; // 08:00, 11:00, 14:00
    const price = 2500 + index * 500;
    const fareType = index % 2 === 0 ? "Promo" : "Regular";
    const seats = 30 + Math.floor(Math.random() * 40);
    const duration = "1h 20m";
    const terminal = terminals[index % terminals.length];

    flights.push({
      flightNo,
      from,
      to,
      date,
      time,
      price,
      fareType,
      seats,
      duration,
      terminal
    });
  });
}

// === STEP FUNCTIONS ===
function showSection(section) {
  [home, booking, flightsSection, passengerSection, summarySection, successSection]
    .forEach(sec => sec.classList.add('hidden'));
  section.classList.remove('hidden');
}

function setActiveStep(stepIndex) {
  steps.forEach((s, i) => {
    s.classList.toggle('active', i === stepIndex);
  });
}

// === EVENT LISTENERS ===

// Home → Booking
bookFlightBtn.addEventListener('click', () => {
  showSection(booking);
  setActiveStep(0);
});

// Show/hide return date depending on flight type
flightTypeSelect.addEventListener('change', () => {
  returnDateContainer.style.display = flightTypeSelect.value === 'oneway' ? 'none' : 'block';
});

// Booking → Flights
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  bookingData = {
    from: document.getElementById('from').value.trim(),
    to: document.getElementById('to').value.trim(),
    type: flightTypeSelect.value,
    departDate: document.getElementById('departDate').value,
    returnDate: document.getElementById('returnDate').value,
    passengers: parseInt(document.getElementById('passengers').value)
  };
  displayFlights();
});

// Back to booking
backToBooking.addEventListener('click', () => {
  showSection(booking);
  setActiveStep(0);
});

// === FLIGHT LIST GENERATION ===
function displayFlights() {
  showSection(flightsSection);
  setActiveStep(1);
  flightList.innerHTML = '';

  const matches = flights.filter(f => 
    f.from.toLowerCase() === bookingData.from.toLowerCase() &&
    f.to.toLowerCase() === bookingData.to.toLowerCase() &&
    f.date === bookingData.departDate
  );

  if (matches.length === 0) {
    flightList.innerHTML = `<p>No flights available for your search.</p>`;
    return;
  }

  matches.forEach(f => {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.innerHTML = `
      <strong>${f.flightNo}</strong> — ${f.from} → ${f.to}<br>
      <strong>Date:</strong> ${f.date} ${f.time}<br>
      <strong>Price:</strong> ₱${f.price} | <strong>Seats:</strong> ${f.seats}<br>
      <strong>Fare:</strong> ${f.fareType} | <strong>Terminal:</strong> ${f.terminal}
    `;
    const selectBtn = document.createElement('button');
    selectBtn.textContent = 'Select';
    selectBtn.addEventListener('click', () => selectFlight(f));
    card.appendChild(selectBtn);
    flightList.appendChild(card);
  });
}

// === SELECT FLIGHT → PASSENGER INFO ===
function selectFlight(flight) {
  selectedFlight = flight;
  showSection(passengerSection);
  setActiveStep(2);
  passengerForm.innerHTML = '';

  for (let i = 1; i <= bookingData.passengers; i++) {
    passengerForm.innerHTML += `
      <div>
        <label>Passenger ${i} Full Name:</label>
        <input type="text" name="name${i}" required>
      </div>
      <div>
        <label>Passenger ${i} Age:</label>
        <input type="number" name="age${i}" min="1" required>
      </div>
      <div>
        <label>Passenger ${i} Email:</label>
        <input type="email" name="email${i}" required pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$">
      </div>
      <hr>
    `;
  }

  passengerForm.innerHTML += `<button type="submit">Continue to Summary</button>`;
}

// === PASSENGER INFO → SUMMARY ===
passengerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const passengerDetails = [];
  let formValid = true;

  for (let i = 1; i <= bookingData.passengers; i++) {
    const name = e.target[`name${i}`].value.trim();
    const age = parseInt(e.target[`age${i}`].value);
    const email = e.target[`email${i}`].value.trim();

    if (!name || !email || age < 1) {
      formValid = false;
      break;
    }

    passengerDetails.push({ name, age, email });
  }

  if (!formValid) {
    alert('Please fill out all passenger information correctly.');
    return;
  }

  bookingData.passengerDetails = passengerDetails;
  showSummary();
});

// === SHOW SUMMARY ===
function showSummary() {
  showSection(summarySection);
  setActiveStep(3);

  const passengerList = bookingData.passengerDetails.map(p => `
    <li>${p.name} — Age: ${p.age} — Email: ${p.email}</li>
  `).join('');

  summaryDetails.innerHTML = `
    <h3>Flight Information</h3>
    <p>${selectedFlight.flightNo} | ${selectedFlight.from} → ${selectedFlight.to}</p>
    <p>${selectedFlight.date} ${selectedFlight.time}</p>
    <p><strong>Terminal:</strong> ${selectedFlight.terminal}</p>
    <p>₱${selectedFlight.price} x ${bookingData.passengers} passenger(s)</p>

    <h3>Passenger Details (${bookingData.passengers})</h3>
    <ul>${passengerList}</ul>
  `;
}

// === BOOK NOW ===
document.getElementById('bookNowBtn').addEventListener('click', () => {
  showSection(successSection);
  steps.forEach(s => s.classList.remove('active'));
});
