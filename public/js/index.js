import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { signup } from './signup';
import { displayMap } from './mapbox';
const L = require('leaflet');
// import leaflet from 'leaflet';
// console.log(leaflet);
// import("https://unpkg.com/leaflet@1.8.0/dist/leaflet.css")
// import { L } from 'https://unpkg.com/leaflet@1.8.0/dist/leaflet.js';
// DOM elements
const mapBox = document.getElementById('map');
const logInForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');
console.log('fghjkiolik');
// Delegation
// if (mapBox)
//////

if (logInForm)
  logInForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
if (logOutBtn)
  logOutBtn.addEventListener('click', (e) => {
    logout();
  });
if (userDataForm) {
  console.log('form is here');
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    // const email = document.getElementById('email').value;
    // const name = document.getElementById('name').value;
    await updateSettings(form, 'data');
    setTimeout(() => {
      location.reload(true);
    }, 500);
  });
}
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { password, passwordConfirm, passwordCurrent },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value =
      document.getElementById('password').value =
      document.getElementById('password-confirm').value =
        '';
  });
if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    console.log(tourId);
    bookTour(tourId);
  });
if (signupForm)
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('It has been clicked');
    const email = document.getElementById('email__signup').value;
    const password = document.getElementById('password__signup').value;
    const name = document.getElementById('name__signup').value;
    const passwordConfirm = document.getElementById(
      'passwordConfirm__signup'
    ).value;
    signup(email, password, passwordConfirm, name);
  });
// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations);
//   displayMap(locations);
// }
var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap',
}).addTo(map);
var marker = L.marker([51.5, -0.09]).addTo(map);
