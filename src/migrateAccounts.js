const fs = require("fs");
const _ = require("lodash");
const moment = require("moment");
const yargs = require("yargs");
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
  console.log(transfersResponse);
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

const getParameters = () => {
  return yargs
    .command("migrated accounts to RBO")
    .option("delay", {
      type: "number",
      description: "Delay between account migrations (seconds)",
      default: 5
    })
    .option("accounts-since", {
      type: "string",
      description: "ISO date RBO was turned on",
      default: moment().add(1, 'day').format()
    })
    .option("dry-run", {
      type: "boolean",
      description: "Should migration write any records to Stripe",
      default: true
    }).argv;
};

(async () => {
  try {
    console.log(getParameters())
    // const accountsToMigrate = await findRestrictedAccountsToMigrate();
    // console.log(JSON.stringify(accountsToMigrate, null, 2));
    // fs.writeFileSync(
    //   "./accountsToMigrate.json",
    //   JSON.stringify(accountsToMigrate, null, 2)
    // );
  } catch (error) {
    console.error(error);
  }
})();
