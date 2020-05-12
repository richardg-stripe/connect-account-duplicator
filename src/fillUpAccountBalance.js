const _ = require("lodash");
const stripe = require("./stripe");
const curlify = require('request-as-curl')
const Mitm = require("mitm")

const mitm = Mitm()

mitm.on("request", function(req, res) {
  console.log(curlify(req))
  console.log(curlify(res.req))
  // console.log(res)
  // console.log(req.res.req.toCurl())
  // console.log(req.request.req.toCurl())
})


const makePayment = async amount => {
  return stripe.paymentIntents.create({
    amount: amount,
    currency: "gbp",
    confirm: true,
    payment_method_data: {
      type: "card",
      card: {
        number: "4242424242424242",
        exp_month: "12",
        exp_year: "24",
        cvc: "123"
      }
    },
    payment_method_types: ["card"]
  });
};

_.times(10, async () => {
  try {
    const paymentIntent = await makePayment(400000);
    console.log(paymentIntent);
  } catch (error) {
    console.error(error);
  }
});
