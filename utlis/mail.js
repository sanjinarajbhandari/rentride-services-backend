const nodemailer = require("nodemailer");

const sendBookingMail = (userEmail, body) => {
  const email_client = userEmail;
  const model = body.model;
  const price = body.price;
  const email_host = "rajbhandarisanjina3@gmail.com";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email_host,
      pass: process.env.GMAIL_PASS,
    },
    secure: true,
  });

  const mailData = {
    from: email_host,
    to: email_client,
    subject: "Booking Confirmation",
    text: "Your Vehicle booking has been confirmed",
    html: `
    <p>The vehicle you have choose to book is booked successfull.
    Booking Details:
    Model: ${model}
    at Price : Rs ${price}/day
    </p>
`,
  };

  transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    console.log(info, "Mail has been sent Successfully");
  });
};

const sendPasswordResetMail = (token, email) => {
  console.log("token", token);
  console.log("email", email);

  const email_client = email;
  const email_host = "rajbhandarisanjina3@gmail.com";
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email_host,
      pass: process.env.GMAIL_PASS,
    },
    secure: true,
  });

  const mailData = {
    from: email_host,
    to: email_client,
    subject: "Reset Password",
    text: "Change your password",
    html: `
    <p>Click on the button below to change your password:</p>
    <a href="http://localhost:3000/resetForm?token=${token}&email=${email_client}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
`,
  };

  transporter.sendMail(mailData, function (err, info) {
    // if (err) console.log(err);
    // console.log(info, "Mail has been sent Successfully");

    if (err) {
      console.log(err);
    } else {
      console.log(info, "Mail has been sent Successfully");
    }
  });
};

module.exports = sendPasswordResetMail;
module.exports = sendBookingMail;
``;
