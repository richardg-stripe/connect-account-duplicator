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

const createAccountObjectForExistingAccount = async accountId => {};

const 

const recreateAccount = async (accountId, dryRun = true) => {
  console.log("creating account");
  const createObject = await createAccountObjectForExistingAccount(accountId);
  let account;
  if (dryRun === false) {
    account = await stripe.accounts.create(createObject);
  } else {
    console.log(`Create Account: ${JSON.stringify(createObject, null, 2)}`);
    account = { id: "acct_dummy123" };
  }
  return account;
};

const recreateAccounts = async (accountIds, dryRun = true) => {
  const accounts = [];
  for (const accountId of accountIds) {
    const account = recreateAccount(accountId, dryRun);
    const accountMapping = {oldAccountId: accountId, newAccountId: account.id}
    console.log('accountMapping: ', accountMapping)
    insertAccounts(accountMapping)
  }
};

const doesAccountNeedMigration = async (account, date) => {
  console.log(account);
  const transfersResponse = await stripe.transfers.list({
    destination: account.id,
    limit: 1
  });
  // console.log(transfersResponse);
  // console.log(account)
  console.log(moment.unix(account.created));
  return (
    _.isEmpty(transfersResponse.data) &&
    !account.payouts_enabled &&
    moment.unix(account.created).isBefore(date)
  );
};

const findAccountsToMigrate = async (beforeDate, batchSize) => {
  const date = moment(beforeDate);
  const accounts = [];
  for await (const account of stripe.accounts.list({ limit: 100 })) {
    if (await doesAccountNeedMigration(account, date)) {
      accounts.push(account);
    }
  }
  return _.chain(accounts)
    .sortBy("created")
    .take(batchSize)
    .value();
};

const getParameters = () => {
  return yargs
    .command("migrated accounts to RBO")
    .option("delay", {
      type: "number",
      description: "Delay between account migrations (seconds)",
      default: 5
    })
    .option("before-date", {
      type: "string",
      description: "ISO date RBO was turned on",
      default: moment()
        .subtract(1, "year")
        .format()
    })
    .option("account-mapping-output", {
      type: "string",
      description: "ISO date RBO was turned on",
      default: moment()
        .subtract(1, "year")
        .format()
    })
    .option("batch-size", {
      type: "number",
      description: "Accounts to migrate at once",
      default: 1
    })
    .option("dry-run", {
      type: "boolean",
      description: "Should migration write any records to Stripe",
      default: true
    }).argv;
};

(async () => {
  try {
    const { beforeDate, batchSize } = getParameters();
    const accountsToMigrate = await findAccountsToMigrate(
      beforeDate,
      batchSize,
      dryRun
    );
    console.log("accountsToMigrate", accountsToMigrate);
    
    const accountIdsToMigrate = _.map(accountsToMigrate, 'id')
    await recreateAccounts(accountIdsToMigrate, dryRun)
    // console.log(JSON.stringify(accountsToMigrate, null, 2));
    // fs.writeFileSync(
    //   "./accountsToMigrate.json",
    //   JSON.stringify(accountsToMigrate, null, 2)
    // );
  } catch (error) {
    console.error(error);
  }
})();
