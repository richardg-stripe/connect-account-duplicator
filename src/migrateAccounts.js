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
const { delay } = require("./common");

const createAccountObjectForExistingAccount = async accountId => {
  const account = await stripe.accounts.retrieve(accountId);

  return _.omitBy(
    {
      business_profile: _.omitBy(
        { url: account.business_profile.url },
        _.isNil
      ),
      business_type: "individual",
      country: account.country,
      email: account.email,
      external_account: {},
      individual: _.omitBy(
        {
          address: _.get(account.individual, "address"),
          dob: _.get(account.individual, "dob"),
          email: _.get(account.individual, "email"),
          first_name: _.get(account.individual, "first_name"),
          last_name: _.get(account.individual, "last_name")
        },
        _.isNil
      ),
      requested_capabilities: ["transfers"],
      tos_acceptance: account.tos_acceptance,
      type: "custom"
    },
    _.isNil
  );
};

const readAccountMappings = filePath => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath));
};

const insertAccountMapping = (accountMapping, filePath) => {
  console.log(`writing to: ${filePath}`);
  const existingAccountMappings = readAccountMappings(filePath);
  fs.writeFileSync(
    filePath,
    JSON.stringify([...existingAccountMappings, accountMapping], null, 2)
  );
};

const recreateAccount = async (accountId, dryRun = true) => {
  console.log(`recreating account for accountId: ${accountId}`);
  const createObject = await createAccountObjectForExistingAccount(accountId);
  console.log(
    `create account object: ${JSON.stringify(createObject, null, 2)}`
  );
  let account;
  if (dryRun === false) {
    account = await stripe.accounts.create(createObject);
  } else {
    console.log(`Create Account: ${JSON.stringify(createObject, null, 2)}`);
    account = { id: "acct_dummy123" };
  }
  return account;
};

const recreateAccounts = async (
  oldAccounts,
  filePath,
  delaySeconds,
  dryRun = true
) => {
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
    insertAccountMapping(
      accountMapping,
      `${dryRun ? "dryRun" : ""}${time}-${filePath}`
    );
    if (!dryRun) {
      insertAccountMapping(accountMapping, filePath);
    }
    await delay(delaySeconds * 1000);
  }
};

const doesAccountNeedMigration = async (account, beforeDate, afterDate) => {
  console.log(account);
  const transfersResponse = await stripe.transfers.list({
    destination: account.id,
    limit: 1
  });
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
    .option("delay-seconds", {
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

  console.log("parameters: ", parameters);
  return parameters;
};

(async () => {
  try {
    const {
      accountMappingOutputSuffix,
      beforeDate,
      batchSize,
      delaySeconds,
      dryRun
    } = getParameters();

    const existingAccountMappings = readAccountMappings(
      accountMappingOutputSuffix
    );
    const afterDateString = _.chain(existingAccountMappings)
      .map("oldAccountCreated")
      .max()
      .value();
    const afterDate = afterDateString
      ? moment(afterDateString)
      : moment().subtract(1, "year");
    console.log("afterDate: ", afterDate.format());
    const accountsToMigrate = await findAccountsToMigrate(
      moment(beforeDate),
      moment(afterDate),
      batchSize
    );
    console.log(
      "accountsToMigrate",
      JSON.stringify(accountsToMigrate, null, 2)
    );
    console.log("accountsToMigrate count", _.size(accountsToMigrate));
    await recreateAccounts(
      accountsToMigrate,
      accountMappingOutputSuffix,
      delaySeconds,
      dryRun
    );
  } catch (error) {
    console.error(error);
  }
})();
