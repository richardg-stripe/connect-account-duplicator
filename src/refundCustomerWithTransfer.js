const _ = require("lodash");
const stripe = require("./stripe");



;(async () => {
  try {
    const paymentIntent = await stripe.;
    console.log(paymentIntent);
  } catch (error) {
    console.error(error);
  }
})();
