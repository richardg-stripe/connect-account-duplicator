const _ = require("lodash");
const moment = require("moment");
const stripe = require("./stripe");
const {
  successfulAccount,
  idFailsAccount,
  addressFailsAccount,
  germanExternalAccount
} = require("./exampleAccounts");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const keypress = async () => {
  process.stdin.setRawMode(true)
  return new Promise(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false)
    resolve()
  }))
}

const createAndUpdateAccount = async (createObject, updateObject) => {
  console.log("creating account");
  let account = await stripe.accounts.create(createObject);
  console.log('press any key to continue with account update')
  await keypress();
  console.log("updating account");
  account = await stripe.accounts.update(account.id, updateObject);
  console.log("Updated account", account);
};

(async () => {
  try {
    // createAndUpdateAccount(addressFailsAccount, {
    //   individual: {
    //     address: successfulAccount.individual.address
    //   }
    // });

    createAndUpdateAccount(idFailsAccount, {
      individual: {
        dob: successfulAccount.individual.dob
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
