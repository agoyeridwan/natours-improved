import axios from 'axios';
import { showAlert } from './alerts';
// const stripe = Stripe(
//   'pk_test_51LceUXAADNP1LVsDBlQ8O4o340H57ly2KKz3ClSToF2ICSe58iQiVgRmqJAEWBj3i4YJB3isUfxI9O50A0SXBHVE00hFgPO7Em'
// );
export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from api
    console.log(tourId);
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    // 2) Create checkout form + charge credit card
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
    // console.log(session);
    // await fetch(session.data.session.url);
    // console.log(session);
    // console.log(session.data.session.url);
    location.assign(session.data.session.url);
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
