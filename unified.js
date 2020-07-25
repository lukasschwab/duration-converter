/**
 * INPUT-TO-DATE UTILS.
 */

// NOTE: warning visibility is controlled from the selected parser.
const warning = document.getElementById('warning');

const msParser = (ms) => moment.duration(ms, "milliseconds");

const sParser = (s) => moment.duration(s, "seconds");

const isoParser = (iso) => moment.duration(iso);

var error;

// showErrorIfInvalid displays an error callout and returns true iff the
// duration is invalid.
const showErrorIfInvalid = (duration) => {
  if (!moment.isDuration(duration)) {
    error.style.display = "block";
    return true;
  } else {
    error.style.display = "none";
    return false;
  }
}

/**
 * DATE-TO-OUTPUT UTILS.
 */

const toHumanizedOutput = (d) => {
  // Override default humanization for small durations.
  const secs = d.asSeconds();
  if (secs < 1) {
    return `${d.asMilliseconds()} milliseconds`;
  } else if (secs < 2) {
    return "a second";
  }
  return d.humanize()
}

const toMillisecondsOutput = (d) => d.asMilliseconds();

const toSecondsOutput = (d) => d.asSeconds();

const toISOOutput = (d) => d.toISOString();

const toBeforeOutput = (d) => moment().subtract(d);
const toBeforeOutputSecondary = (d) => moment().subtract(d).toISOString()

const toFromOutput = (d) => moment().add(d);
const toFromOutputSecondary = (d) => moment().add(d).toISOString();

const outputsAndGenerators = new Map([
  [document.getElementById('humanized-output'), toHumanizedOutput],
  [document.getElementById('milliseconds-output'), toMillisecondsOutput],
  [document.getElementById('seconds-output'), toSecondsOutput],
  [document.getElementById('iso-output'), toISOOutput],
  [document.getElementById('before-output'), toBeforeOutput],
  [document.getElementById('before-output-secondary'), toBeforeOutputSecondary],
  [document.getElementById('from-output'), toFromOutput],
  [document.getElementById('from-output-secondary'), toFromOutputSecondary],
]);

/**
 * ADD EVENT LISTENERS.
 */

// Changing the input updates the outputs.
const input = document.getElementById('input');

const setOutputs = () => {
  const duration = inputParser(input.value);
  const invalid = showErrorIfInvalid(duration);
  outputsAndGenerators.forEach((generator, output) => {
    output.innerHTML = invalid ? "Invalid Duration" : generator(duration);
  });
}

input.addEventListener('input', setOutputs);

/**
 * SWITCHING UI.
 */

const dropdown = document.getElementById("somedropdown");

const switchToMsLink = document.getElementById("switch-to-milliseconds");
const msError = document.getElementById("ms-error");

const switchToISOLink = document.getElementById("switch-to-iso");
const isoError = document.getElementById("iso-error");

const switchToSLink = document.getElementById("switch-to-seconds");
const sError = document.getElementById("s-error");

// (String | Number) => Date
var inputParser;
// (Date) => String | Number
var msToValidInput;

const getCurrentMs = () => inputParser
  ? inputParser(input.value).asMilliseconds()
  : 0;

function switchToMs() {
  dropdown.innerText = "Milliseconds";
  msToValidInput = (ms) => ms;
  input.value = msToValidInput(getCurrentMs());
  inputParser = msParser;
  input.type = "number";
  switchToMsLink.classList.add("active");
  switchToISOLink.classList.remove("active");
  switchToSLink.classList.remove("active");
  error = msError;
}

switchToMsLink.addEventListener('click', () => {
  switchToMs();
});

function switchToS() {
  dropdown.innerText = "Seconds";
  msToValidInput = (ms) => ms / 1000;
  input.value = msToValidInput(getCurrentMs());
  inputParser = sParser;
  input.type = "number";
  switchToSLink.classList.add("active");
  switchToMsLink.classList.remove("active");
  switchToISOLink.classList.remove("active");
  error = sError;
}

switchToSLink.addEventListener('click', () => {
  switchToS();
});

function switchToISO() {
  dropdown.innerText = "ISO 8601";
  msToValidInput = (ms) => msParser(ms).toISOString();
  input.type = "text";
  input.value = msToValidInput(getCurrentMs());
  inputParser = isoParser;
  switchToISOLink.classList.add("active");
  switchToMsLink.classList.remove("active");
  switchToSLink.classList.remove("active");
  error = isoError;
}

switchToISOLink.addEventListener('click', () => {
  switchToISO();
});

/**
 * INITIALIZATION
 */

// If there's a query string, start with that duration.
const queried = decodeURIComponent(window.location.search.substring(1));
if (queried && queried.length > 0) {
  console.log("Initializing with query value", queried)
  if (isNaN(queried)) {
    console.log("Switching on query to ISO");
    switchToISO();
  } else {
    switchToMs();
  };
  input.value = queried;
  setOutputs();
} else {
  // Without a query, default to milliseconds.
  switchToMs();
  setOutputs();
}
