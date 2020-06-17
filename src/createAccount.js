const _ = require("lodash");
const moment = require("moment");
const fs = require("fs");
const stripe = require("./stripe");
const logHttpRequestsAsCurl = require("./interceptHttpAsCurl");

logHttpRequestsAsCurl();
(async () => {
  try {
    // var passport = fs.readFileSync("images/passport.png");
    // var proofOfAddress = fs.readFileSync("images/proofOfAddress.png");

    // var uploadedPassport = await stripe.files.create({
    //   purpose: "identity_document",
    //   file: {
    //     data: passport,
    //     name: "passport.png",
    //     type: "application/octet-stream"
    //   }
    // });

    // console.log('Uploaded Passport');

    // var uploadedProofOfAddress = await stripe.files.create({
    //   purpose: "additional_verification",
    //   file: {
    //     data: proofOfAddress,
    //     name: "proofOfAddress.png",
    //     type: "application/octet-stream"
    //   }
    // });

    // console.log('Uploaded Proof of Address');

    const account = await stripe.accounts.create({
      type: "custom",
      country: "NL",
      requested_capabilities: ["transfers"], // Transfers only - don't need payments
      tos_acceptance: {
        date: moment().unix(),
        ip: "1.1.1.1", //mike's IP address
        user_agent: "Chrome"
      },
      business_type: "individual",
      business_profile: {
        product_description: "Mike Brewer UW Seller"
      },
      individual: {
        address: {
          line1: "address_full_match",
          city: "Amsterdam",
          country: "NL",
          postal_code: "1013gm"
        },
        dob: {
          day: 1,
          month: 1,
          year: 1901
        },

        first_name: "Mike",
        last_name: "Brewer"
        // verification: {
        //   document: {
        //     front: uploadedPassport.id
        //   },
        //   additional_document: {
        //     front: uploadedProofOfAddress.id
        //   }
        // }
      },
      external_account: {
        object: "bank_account",
        country: "NL",
        currency: "EUR",
        account_number: "NL89370400440532013000"
      }
    });

    console.log("Created account", account);
    const capabilities = await stripe.accounts.retrieveCapability(
      account.id,
      "transfers"
    );
    console.log("capabilities", JSON.stringify(capabilities, null, 2));
  } catch (error) {
    console.error(error);
  }
})();
