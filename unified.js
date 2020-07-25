/**
 * INPUT-TO-DATE UTILS.
 */

import { moment } from "./moment.min.js"

// NOTE: warning visibility is controlled from the selected parser.
const warning = document.getElementById('warning');

const msParser = (ms) => moment.duration(ms, "milliseconds")

const sParser = (s) => moment.duration(s, "seconds")

const isoParser = (iso) => moment.duration(iso)

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

const toDefaultOutput = (d) => toString(d.asMilliseconds());

const toSecondsOutput = (d) => toString(d.asSeconds());

const toISOOutput = (d) => d.toISOString();

const outputsAndGenerators = new Map([
  [document.getElementById('default-output'), toDefaultOutput],
  [document.getElementById('seconds-output'), toSecondsOutput],
  [document.getElementById('iso-output'), toISOOutput],
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
    output.innerHTML = invalid ? "Invalid Duration" : generator(date);
  });
}

input.addEventListener('input', setOutputs);

const reset = () => {
  input.value = msToValidInput(0);
  setOutputs();
}

// Clicking the reset link sets to the input to the current timestamp.
Array.from(document.getElementsByClassName("reset-to-now")).forEach(
  link => link.addEventListener("click", reset)
);

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

function switchToMs() {
  dropdown.innerText = "Milliseconds";
  input.type = "number";
  inputParser = msParser;
  // Needs to be a number rather than a string.
  msToValidInput = (ms) => ms;
  switchToMsLink.classList.add("active");
  switchToISOLink.classList.remove("active");
  switchToSLink.classList.remove("active");
  error = msError;
}

switchToMsLink.addEventListener('click', () => {
  switchToMs();
  reset();
});

function switchToS() {
  dropdown.innerText = "Milliseconds";
  input.type = "number";
  inputParser = msParser;
  // Needs to be a number rather than a string.
  msToValidInput = (ms) => ms / 1000;
  switchToMsLink.classList.add("active");
  switchToISOLink.classList.remove("active");
  switchToSLink.classList.remove("active");
  error = sError;
}

switchToSLink.addEventListener('click', () => {
  switchToS();
  reset();
});

function switchToISO() {
  dropdown.innerText = "ISO 8601";
  input.type = "text"
  inputParser = isoParser;
  msToValidInput = (ms) => msParser(ms).toISOString();
  switchToISOLink.classList.add("active");
  switchToMsLink.classList.remove("active");
  switchToSLink.classList.remove("active");
  error = isoError;
}

switchToISOLink.addEventListener('click', () => {
  switchToISO();
  reset();
});

/**
 * INITIALIZATION
 */

// If redirected from search.html, start with the searched timestamp rather than
// the current timestamp.
const queried = decodeURIComponent(window.location.search.substring(1));
if (queried && queried.length > 0) {
  console.log("Initializing with query value", queried)
  if (queried.match(/^\d+$/g)) {
    console.log("Switching on query to Unix");
    switchToUnix();
  } else if (!isNaN((new Date(queried)).getTime())) {
    console.log("Switching on query to ISO");
    switchToISO();
  } else {
    console.log("Defaulting on query to Mongo");
    switchToMongo();
  }
  input.value = queried;
  setOutputs();
} else {
  // Without a query, default to Unix.
  switchToMs();
  reset();
}
