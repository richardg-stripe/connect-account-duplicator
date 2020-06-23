const _ = require("lodash");
const moment = require("moment");
const stripe = require("./stripe");
const { successfulAccount, idFailsAccount, addressFailsAccount, germanExternalAccount } = require("./exampleAccounts");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))


const createAndUpdateAccount = (createObject, updateObject) => {
  console.log('creating account')
  let account = await stripe.accounts.create(addressFailsAccount);
  await delay(1000 * 60)
  console.log('updating account')
  account = await stripe.accounts.update(account.id, {
    individual: {
      address: successfulAccount.individual.address
    }
  });
  console.log("Updated account", account);
}

;(async () => {
  try {
    console.log('creating account')
    let account = await stripe.accounts.create(addressFailsAccount);
    await delay(1000 * 60)
    console.log('updating account')
    account = await stripe.accounts.update(account.id, {
      individual: {
        address: successfulAccount.individual.address
      }
    });

    console.log("Created account", account);
  } catch (error) {
    console.error(error);
  }
})();
