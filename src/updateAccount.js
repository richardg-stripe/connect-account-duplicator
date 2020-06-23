const _ = require("lodash");
const moment = require("moment");
const stripe = require("./stripe");
const logHttpRequestsAsCurl = require("./interceptHttpAsCurl");
const {successfulAccount} = require("./createAccount");

logHttpRequestsAsCurl();

;(async () => {
  try {
    const account = await stripe.accounts.create(successfulAccount);

    console.log("Created account", account);
  } catch (error) {
    console.error(error);
  }
})();
