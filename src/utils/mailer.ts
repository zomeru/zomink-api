import nodemailer, { SendMailOptions } from 'nodemailer';

import log from './logger';

// async function createTestCreds() {
//   const creds = await nodemailer.createTestAccount();
//   console.log({ creds });
// }

// createTestCreds();

const smtp = {
  user: process.env.SMTP_USER as string,
  pass: process.env.SMTP_PASS as string,
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_USER),
};

const transporter = nodemailer.createTransport({
  ...smtp,
  auth: {
    user: smtp.user,
    pass: smtp.pass,
  },
});

async function sendEmail(payload: SendMailOptions) {
  transporter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(err, 'Error sending email');
    }

    log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
}

export default sendEmail;
