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

const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const progressBar = document.getElementById('progressBar');

// === STATE ===
let bookingData = {};
let selectedFlight = null;

// === REALISTIC FLIGHT DURATIONS ===
function getFlightDuration(from, to) {
  const routes = {
    "Manila-Cebu": "1h 15m",
    "Cebu-Manila": "1h 15m",
    "Manila-Davao": "1h 50m",
    "Davao-Manila": "1h 50m",
    "Manila-Iloilo": "1h 10m",
    "Iloilo-Manila": "1h 10m",
    "Cebu-Davao": "1h 5m",
    "Davao-Cebu": "1h 5m",
    "Cebu-Iloilo": "55m",
    "Iloilo-Cebu": "55m",
    "Davao-Iloilo": "1h 25m",
    "Iloilo-Davao": "1h 25m"
  };
  return routes[`${from}-${to}`] || "1h 20m";
}

// === FLIGHT DATABASE (All days in October) ===
const flights = [];
const origins = ["Manila", "Cebu", "Davao", "Iloilo"];
const destinations = ["Manila", "Cebu", "Davao", "Iloilo"];
const terminals = ["Terminal 1", "Terminal 2", "Terminal 3"];

for (let day = 18; day <= 31; day++) {
  const date = `2025-10-${day.toString().padStart(2, '0')}`;
  
  origins.forEach(from => {
    destinations.forEach(to => {
      if (from === to) return; // skip same city
      
      const flightNo = `FL ${100 + day + Math.floor(Math.random() * 50)}`;
      const time = `${8 + Math.floor(Math.random() * 10)}:00`;
      const price = 2500 + Math.floor(Math.random() * 1500);
      const fareType = Math.random() > 0.5 ? "Promo" : "Regular";
      const seats = 30 + Math.floor(Math.random() * 40);
      const duration = getFlightDuration(from, to); // 👈 realistic hours of travel
      const terminal = "T" + (1 + Math.floor(Math.random() * 3));
      
      flights.push({ flightNo, from, to, date, time, price, fareType, seats, duration, terminal });
    });
  });
}

// === UTILITY FUNCTIONS ===
function updateDestinationOptions() {
  const fromValue = fromSelect.value;
  Array.from(toSelect.options).forEach(option => option.hidden = false);
  if (fromValue) {
    const sameOption = Array.from(toSelect.options).find(opt => opt.value === fromValue);
    if (sameOption) sameOption.hidden = true;
  }
}

function updateOriginOptions() {
  const toValue = toSelect.value;
  Array.from(fromSelect.options).forEach(option => option.hidden = false);
  if (toValue) {
    const sameOption = Array.from(fromSelect.options).find(opt => opt.value === toValue);
    if (sameOption) sameOption.hidden = true;
  }
}

function adjustModalHeight() {
  const modal = document.querySelector('.background-process');
  if (modal.scrollHeight > window.innerHeight * 0.8) {
    modal.style.top = '20px';
    modal.style.transform = 'translateX(-50%)';
  } else {
    modal.style.top = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
  }
}
new ResizeObserver(adjustModalHeight).observe(document.querySelector('.background-process'));

// === CORE NAVIGATION ===
function showSection(section) {
  [home, booking, flightsSection, passengerSection, summarySection, successSection]
    .forEach(sec => sec.classList.add('hidden'));
  section.classList.remove('hidden');
  progressBar.style.display = (section === home || section === successSection) ? 'none' : 'flex';
}

function setActiveStep(stepIndex) {
  steps.forEach((s, i) => {
    if (i < stepIndex) s.classList.add('completed');
    else if (i === stepIndex) s.classList.add('active');
    else s.classList.remove('active', 'completed');
  });
}

// === EVENT LISTENERS ===
fromSelect.addEventListener('change', updateDestinationOptions);
toSelect.addEventListener('change', updateOriginOptions);

bookFlightBtn.addEventListener('click', () => {
  showSection(booking);
  setActiveStep(0);
  document.querySelector('.background-process').style.display = 'block';
  document.querySelector('.logo').style.display = 'none';
  document.querySelector('.login-signup').style.display = 'none';
  document.querySelector('.background-img').classList.add('blurred');
});

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const departDate = document.getElementById('departDate').value;
  const returnDate = document.getElementById('returnDate').value;
  const flightType = flightTypeSelect.value;
  const errorDisplay = document.getElementById('bookingError');
  errorDisplay.textContent = '';

  if (flightType === 'round') {
    if (!returnDate) {
      errorDisplay.textContent = 'Please select a return date for a round trip.';
      return;
    }
    const depart = new Date(departDate);
    const ret = new Date(returnDate);
    if (ret <= depart) {
      errorDisplay.textContent = 'Return date must be later than the departure date.';
      return;
    }
  }

  bookingData = {
    from: document.getElementById('from').value.trim(),
    to: document.getElementById('to').value.trim(),
    type: flightType,
    departDate: departDate,
    returnDate: returnDate,
    passengers: parseInt(document.getElementById('passengers').value)
  };

  displayFlights();
  document.querySelector('.flight-selection-process').style.display = 'block';
});

flightTypeSelect.addEventListener('change', () => {
  if (flightTypeSelect.value === 'oneway') {
    returnDateContainer.style.display = 'none';
  } else {
    returnDateContainer.style.display = 'flex';
    returnDateContainer.style.flexDirection = 'column';
  }
  const backgroundProcess = document.querySelector('.background-process');
  backgroundProcess.style.height = backgroundProcess.scrollHeight + 'px';
});

backToBooking.addEventListener('click', () => {
  showSection(booking);
  setActiveStep(0);
  document.querySelector('.flight-selection-process').style.display = 'none';
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
      <strong>Duration:</strong> ${f.duration}<br>
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

function showSummary() {
  showSection(summarySection);
  setActiveStep(3);

  const passengerList = bookingData.passengerDetails.map(p => `
    <li>${p.name} — Age: ${p.age} — Email: ${p.email}</li>
  `).join('');

  const totalPrice = selectedFlight.price * bookingData.passengers;

  summaryDetails.innerHTML = `
    <h3>Flight Information</h3>
    <p>${selectedFlight.flightNo} | ${selectedFlight.from} → ${selectedFlight.to}</p>
    <p>${selectedFlight.date} ${selectedFlight.time}</p>
    <p><strong>Duration:</strong> ${selectedFlight.duration}</p>
    <p><strong>Terminal:</strong> ${selectedFlight.terminal}</p>
    <p><strong>Total Price:</strong> ₱${totalPrice}</p>

    <h3>Passenger Details (${bookingData.passengers})</h3>
    <ul>${passengerList}</ul>
  `;
}

// === BOOK NOW ===
document.getElementById('bookNowBtn').addEventListener('click', () => {
  showSection(successSection);
  steps.forEach(s => s.classList.remove('active'));
});

// === BOOK ANOTHER ===
document.getElementById('backToHomeSuccess').addEventListener('click', () => {
  showSection(home);
  steps.forEach(s => s.classList.remove('active'));
  document.querySelector('.logo').style.display = 'block';
  document.querySelector('.login-signup').style.display = 'flex';
  document.querySelector('.background-process').style.display = 'none';
  document.querySelector('.background-img').classList.remove('blurred');
  document.querySelector('.flight-selection-process').style.display = 'none';
});

const backToHomeBtn = document.getElementById('backToHome');

backToHomeBtn.addEventListener('click', (e) => {
  e.preventDefault(); // Prevent form submission
  showSection(home);
  steps.forEach(s => s.classList.remove('active'));
  document.querySelector('.logo').style.display = 'block';
  document.querySelector('.login-signup').style.display = 'flex';
  document.querySelector('.background-process').style.display = 'none';
  document.querySelector('.background-img').classList.remove('blurred');
  document.querySelector('.flight-selection-process').style.display = 'none';
});
