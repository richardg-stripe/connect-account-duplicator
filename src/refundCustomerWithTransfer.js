const _ = require("lodash");
const Mitm = require("mitm");
const stripe = require("./stripe");

const mitm = Mitm();

mitm.on("request", function(req, res) {
  console.log(req);
});
(async () => {
  try {
    const paymentIntent = await stripe.accounts.create(
      {
        type: "custom",
        country: "US",
        email: "jenny.rosen@example.com",
        requested_capabilities: ["transfers"]  // Transfers only - don't need card
      },
      function(err, account) {
        // asynchronously called
      }
    );
    console.log(paymentIntent);
  } catch (error) {
    console.error(error);
  }
})();
