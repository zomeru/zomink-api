import nodemailer, { SendMailOptions } from 'nodemailer';
import { google } from 'googleapis';
import smtpTransport from 'nodemailer-smtp-transport';

import log from './logger';

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN as string,
});

async function sendEmail(payload: SendMailOptions) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport(
      smtpTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.SMTP_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken: accessToken as string,
        },
      })
    );

    const mailOptions = {
      from: `ZOMINK - ${process.env.SMTP_USER}`,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: `<h1>${payload.text}</h1>`,
    };

    const result = await transport.sendMail(mailOptions, (err, info) => {
      if (err) {
        log.error(err, 'res Error sending email');
      }

      log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    });

    return result;
  } catch (error) {
    log.error(error, 'catch Error sending email');
  }
}

export default sendEmail;
