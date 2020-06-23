const _ = require("lodash");
const moment = require("moment");
const stripe = require("./stripe");
const logHttpRequestsAsCurl = require("./interceptHttpAsCurl");
const { successfulAccount, addressFailsAccount, germanExternalAccount } = require("./exampleAccounts");

logHttpRequestsAsCurl();

;(async () => {
  try {
    const account = await stripe.accounts.create(germanExternalAccount);

    console.log("Created account", account);
  } catch (error) {
    console.error(error);
  }
})();


module.exports = {successfulAccount, addressFailsAccount}
