import { client } from "../index.js";
import { sendEmails } from "../utils/email.js";
import { ObjectId } from "mongodb";

export const sendBulkEmails = async (req, res, next) => {
  // const emails = await client
  //   .db("emailtool")
  //   .collection("email")
  //   .aggregate([
  //     {
  //       $match: {
  //         userEmail: req.user.email,
  //       },
  //     },
  //   ])
  //   .toArray();
  const emails = req.body.to;
  console.log(req.body);

  try {
    await sendEmails({
      from: req.body.from,
      emails: req.body.to,
      subject: req.body.subject,
      message: req.body.message,
    });

    const emailList = req.body.to.map((el) => {
      return {
        emailTo: el,
        loggedInUserEmail: req.user.email,
        createdAt: new Date(),
      };
    });

    const data = await client
      .db("emailtool")
      .collection("email")
      .insertMany(emailList);

    res.status(200).json({
      status: "success",
      message: "Emails sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "There was an error sending the email. Please try again later.",
    });
  }
};

export const emailData = async (req, res, next) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentUser = req.user.email;

  const emailsByUser = await client
    .db("emailtool")
    .collection("email")
    .aggregate([
      {
        $match: {
          loggedInUserEmail: currentUser,
        },
      },
    ])
    .toArray();
  // console.log(months[emailsByUser[0].createdAt.getMonth()]);

  res.status(200).json({
    status: "success",
    data: emailsByUser,
  });
};
