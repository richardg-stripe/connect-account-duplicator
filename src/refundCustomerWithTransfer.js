const _ = require("lodash");
const stripe = require("./stripe");



;(async () => {
  try {
    const paymentIntent = await makePayment(400000);
    console.log(paymentIntent);
  } catch (error) {
    console.error(error);
  }
})();
