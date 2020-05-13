const _ = require("lodash");
const moment = require("moment");
const fs = require("fs");
const stripe = require("./stripe");

/* Questions 
Business url? 

*/


(async () => {
  try {
    var passport = fs.readFileSync("images/passport.png");
    var proofOfAddress = fs.readFileSync("images/proofOfAddress.png");

    var uploadedPassport = await stripe.files.create({
      purpose: "identity_document",
      file: {
        data: passport,
        name: "passport.png",
        type: "application/octet-stream"
      }
    });

    console.log(uploadedPassport);

    var uploadedProofOfAddress = await stripe.files.create({
      purpose: "additional_verification",
      file: {
        data: proofOfAddress,
        name: "proofOfAddress.png",
        type: "application/octet-stream"
      }
    });

    const account = await stripe.accounts.create({
      type: "custom",
      country: "GB",
      requested_capabilities: ["transfers"], // Transfers only - don't need payments
      email: "mikebrewer@wheelerdealers.com",
      tos_acceptance: {
        date: moment().unix(),
        ip: "1.1.1.1",
        user_agent: "Chrome",
        service_agreement: "limited" // this is not documented in Stripe docs. Allows limited payees.
      },
      business_type: "individual",
      individual: {
        address: {
          line1: "10 Downing Street",
          country: "GB",
          postal_code: "SW1A 2AA"
        },
        dob: {
          day: 1,
          month: 1,
          year: 1970
        },
        first_name: "Mike",
        last_name: "Brewer",
        verification: {
          document: {
            front: uploadedPassport.id
          },
          additional_document: {
            front: uploadedProofOfAddress.id
          }
        }
      }
    });
    console.log(account);
  } catch (error) {
    console.error(error);
  }
})();
