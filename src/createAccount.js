const _ = require("lodash");
const moment = require("moment");
const fs = require("fs");
const stripe = require("./stripe");
const logHttpRequestsAsCurl = require('./interceptHttpAsCurl')

logHttpRequestsAsCurl()

;(async () => {
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
      country: "BE",
      requested_capabilities: ["transfers"], // Transfers only - don't need payments
      email: "mikebrewer@wheelerdealers.com", //not needed but helpful to identify customers!
      tos_acceptance: {
        date: moment().unix(),
        ip: "1.1.1.1", //mike's IP address
        user_agent: "Chrome",
      },
      business_type: "individual",
      business_profile: {
        product_description: "Refund Mike for Part Exchange Vehicle"
      },
      individual: {
        // address: {
        //   line1: "11 Downing Street",
        //   country: "GB",
        //   postal_code: "SW1A 2AA"
        // },
        dob: {
          day: 1,
          month: 1,
          year: 1970
        },
        first_name: "Mike",
        last_name: "Brewer",
        // verification: {
        //   document: {
        //     front: uploadedPassport.id
        //   },
        //   additional_document: {
        //     front: uploadedProofOfAddress.id
        //   }
        // }
      }
    });
    
    console.log('Created account', account);

  } catch (error) {
    console.error(error);
  }
})();
