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

const createAccountObjectForExistingAccount = async accountId => {
  return { hello: "world" };
};

const readAccountMappings = filePath => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath));
};

const insertAccountMapping = (accountMapping, filePath) => {
  const existingAccountMappings = readAccountMappings(filePath);
  fs.writeFileSync(filePath, JSON.stringify([...existingAccountMappings, accountMapping], null, 2));
};

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

const recreateAccounts = async (oldAccounts, filePath, dryRun = true) => {
  const time = moment().format();
  const accounts = [];
  for (const oldAccount of oldAccounts) {
    const account = await recreateAccount(oldAccount.id, dryRun);
    const accountMapping = {
      oldAccountId: oldAccount.id,
      oldAccountCreated: moment.unix(oldAccount.created).format(),
      newAccountId: account.id
    };
    console.log("accountMapping: ", accountMapping);
    insertAccountMapping(accountMapping, `${time}-${filePath}`);
    insertAccountMapping(accountMapping, filePath);
  }
};

const doesAccountNeedMigration = async (account, beforeDate, afterDate) => {
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
    moment.unix(account.created).isBefore(beforeDate) &&
    moment.unix(account.created).isAfter(afterDate)
  );
};

const findAccountsToMigrate = async (beforeDate, afterDate, batchSize) => {
  const accounts = [];
  for await (const account of stripe.accounts.list({ limit: 100 })) {
    if (await doesAccountNeedMigration(account, beforeDate, afterDate)) {
      accounts.push(account);
    }
  }
  return _.chain(accounts)
    .sortBy("created")
    .take(batchSize)
    .value();
};

const getParameters = () => {
  const parameters = yargs
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
    .option("account-mapping-output-suffix", {
      type: "string",
      description: "ISO date RBO was turned on",
      default: "account-mapping-output.json"
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
  
  console.log('parameters: ', parameters)
  return parameters
};

(async () => {
  try {
    const {
      accountMappingOutputSuffix,
      beforeDate,
      batchSize,
      dryRun
    } = getParameters();
    
    const existingAccountMappings = readAccountMappings(accountMappingOutputSuffix)
    const afterDateString = _.chain(existingAccountMappings).map('oldAccountCreated').max().value()
    const afterDate = afterDateString ? moment(afterDateString) : moment().subtract(1, 'year')
    console.log('afterDate: ', afterDate.format())
    const accountsToMigrate = await findAccountsToMigrate(
      moment(beforeDate),
      moment(afterDate),
      batchSize
    );
    console.log("accountsToMigrate", accountsToMigrate);
    console.log("accountsToMigrate count", _.size(accountsToMigrate));
    await recreateAccounts(
      accountsToMigrate,
      accountMappingOutputSuffix,
      dryRun
    );
    // console.log(JSON.stringify(accountsToMigrate, null, 2));
    // fs.writeFileSync(
    //   "./accountsToMigrate.json",
    //   JSON.stringify(accountsToMigrate, null, 2)
    // );
  } catch (error) {
    console.error(error);
  }
})();
