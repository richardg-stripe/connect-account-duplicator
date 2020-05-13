const _ = require("lodash");
const moment = require("moment");
const stripe = require("./stripe");

const customerToRefund = {
  email: "mikebrewer@wheelerdealers.com",
  tos_acceptance: {
    date: moment().unix(),
    ip: "1.1.1.1",
    user_agent: "Chrome",
    service_agreement: "limited" // this is not documented in Stripe docs. Allows limited payees.
  }
};
;(async () => {
  try {
    const account = await stripe.accounts.create({
      type: "custom",
      country: "GB",
      requested_capabilities: ["transfers"], // Transfers only - don't need payments
      ...customerToRefund
    });
    console.log(account);
  } catch (error) {
    console.error(error);
  }
})();
