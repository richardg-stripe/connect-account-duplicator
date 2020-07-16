const _ = require("lodash");
const moment = require("moment");
const stripe = require("./stripe");
const logHttpRequestsAsCurl = require("./interceptHttpAsCurl");
const { successfulAccount, addressFailsAccount, germanExternalAccount, existingBankAccount } = require("./exampleAccounts");

logHttpRequestsAsCurl();

;(async () => {
  try {
    // const account = await stripe.accounts.create(existingBankAccount);
    const account = await stripe.tokens.create({bank_account: 'ba_1H3HXvIsdauya5mumLB2WTdt'});

    console.log("Created account", account);
  } catch (error) {
    console.error(error);
  }
})();


module.exports = {successfulAccount, addressFailsAccount}
