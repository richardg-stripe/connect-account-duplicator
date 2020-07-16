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
const { keypress } = require("./common");

const createAccount = async createObject => {
  console.log("creating account");
  const account = await stripe.accounts.create(createObject);
  console.log("press any key to continue with account update");
  await keypress();
  return account;
};

const doesAccountNeedMigration = async account => {
  console.log(account);
  const transfersResponse = await stripe.transfers.list({
    destination: account.id,
    limit: 3
  });
  console.log(transfersResponse)
  return _.isEmpty(transfersResponse.data) && !account.payouts_enabled;
};

const findRestrictedAccountsToMigrate = async () => {
  const accounts = [];
  for await (const account of stripe.accounts.list({ limit: 3 })) {
    if (await doesAccountNeedMigration(account)) {
      accounts.push(account);
    }
  }
  return accounts;
};

(async () => {
  try {
    const accountsToMigrate = await findRestrictedAccountsToMigrate()
    console.log(JSON.stringify(accountsToMigrate ,null ,2));
  } catch (error) {
    console.error(error);
  }
})();
