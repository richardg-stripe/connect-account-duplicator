const _ = require("lodash");
const moment = require("moment");
const stripe = require("./stripe");

const customerToRefund = {
  email: 'mikebrewer@wheelerdealers.com',
  tos_acceptance: {
        date: moment().unix(),
        ip: '1.1.1.1',
        user_agent: 'netscape navigator lol',
  }
}


(async () => {
  try {
    const paymentIntent = await stripe.accounts.create({
      type: "custom",
      country: "GB",
      requested_capabilities: ["transfers"] // Transfers only - don't need payments
      tos_acceptance: {
      
      }
    }
      ...customerToRefund
    });
    console.log(paymentIntent);
  } catch (error) {
    console.error(error);
  }
})();
