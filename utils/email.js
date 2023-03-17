import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: Boolean(process.env.EMAIL_SECURE),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: "Dhananjay P <pdhananjay@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: Boolean(process.env.EMAIL_SECURE),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: "Dhananjay P <pdhananjay@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

export const sendEmails = async (options) => {
  console.log(options);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: Boolean(process.env.EMAIL_SECURE),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: options.from,
    to: options.emails,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log(`Message sent: ${info.messageId}`);
  });
};
