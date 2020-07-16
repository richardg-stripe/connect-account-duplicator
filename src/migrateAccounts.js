const _ = require("lodash");
const moment = require("moment");
const stripe = require("./stripe");
const {
  successfulAccount,
  idFailsAccount,
  addressFailsAccount,
  germanExternalAccount,
  minorAccount
} = require("./exampleAccounts");
const {
  keypress
} = require("./common");




const createAccount = async createObject => {
  console.log("creating account");
  const account = await stripe.accounts.create(createObject);
  console.log("press any key to continue with account update");
  await keypress();
  return account;
};

const doesAccountNeedMigration = (account) => {
  console.log(account)
  return true
}

const findRestrictedAccountsToMigrate = async () => {
  const accounts = []
  for await (const account of stripe.accounts.list({limit: 3})) {
    if (doesAccountNeedMigration(account)) {
      accounts.push(account)
    }
  }
  return accounts
}


(async () => {
  try {
    console.log(await findRestrictedAccountsToMigrate())
  } catch (error) {
    console.error(error);
  }
})();
