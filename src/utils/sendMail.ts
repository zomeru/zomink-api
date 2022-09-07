import nodemailer, { SendMailOptions } from 'nodemailer';
import hbs, {
  NodemailerExpressHandlebarsOptions,
} from 'nodemailer-express-handlebars';
import path from 'path';

import log from './logger';

const handlebarOptions: NodemailerExpressHandlebarsOptions = {
  viewEngine: {
    partialsDir: path.resolve(__dirname, '../../templates'),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, '../../templates'),
};

const sendEmail = async (options: SendMailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'sendinblue',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.use('compile', hbs(handlebarOptions));
  transporter.sendMail(options, (error, info) => {
    if (error != null) {
      log.error(`Error sending email: ${error.message}`);
    } else {
      log.info(`Email sent: ${info.response}`);
    }
  });
};

export default sendEmail;
