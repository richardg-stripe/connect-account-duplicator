const _ = require("lodash");
const Mitm = require("mitm")
const stripe = require("./stripe");

const mitm = Mitm()

mitm.on("request", function(req, res) {
  console.log(req)
})

npm inst
;(async () => {
  try {
    const paymentIntent = await stripe.;
    console.log(paymentIntent);
  } catch (error) {
    console.error(error);
  }
})();
