const nodemailer = require('nodemailer');

async function createAccount() {
  let testAccount = await nodemailer.createTestAccount();
  console.log(JSON.stringify(testAccount));
}

createAccount().catch(console.error);
