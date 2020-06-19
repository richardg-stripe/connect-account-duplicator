const _ = require("lodash");
const moment = require("moment");
const stripe = require("./stripe");
const logHttpRequestsAsCurl = require("./interceptHttpAsCurl");

logHttpRequestsAsCurl();

const successfulAccount = {
  type: "custom",
  country: "NL",
  requested_capabilities: ["transfers"],
  tos_acceptance: {
    date: moment().unix(),
    ip: "1.1.1.1", //mike's IP address
    user_agent: "Chrome"
  },
  business_type: "individual",
  business_profile: {
    product_description: "Mike Brewer UW Seller"
  },
  individual: {
    // https://stripe.com/docs/connect/testing#test-verification-addresses
    address: {
      line1: "address_full_match", // passes address check
      city: "Amsterdam",
      country: "NL",
      postal_code: "1013gm"
    },
    // 1901-01-01 passes verification checks. https://stripe.com/docs/connect/testing#test-dobs
    dob: {
      day: 1,
      month: 1,
      year: 1901
    },
    first_name: "Mike",
    last_name: "Brewer"
  },
  external_account: {
    object: "bank_account",
    country: "NL",
    currency: "EUR",
    // More account numbers for simulating payouts failing: https://stripe.com/docs/connect/testing#payouts
    account_number: "NL89370400440532013000"
  }
};


const addressFailsAccount = {
  ...successfulAccount,
  individual: {
    ...successfulAccount.individual,
    address: {
      ......successfulAccount.individual.address,
      line1: "address_full_match", // fails address check
    },
  }
}

(async () => {
  try {
    const account = await stripe.accounts.create(successfulAccount);

    console.log("Created account", account);
  } catch (error) {
    console.error(error);
  }
})();
