import { client } from "../index.js";
import { sendEmails } from "../utils/email.js";

export const sendBulkEmails = async (req, res, next) => {
  const emails = req.body.to;

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
        createdAt: new Date(Date.now()),
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
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          epm: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ])
    .toArray();

  res.status(200).json({
    status: "success",
    data: emailsByUser,
    user: currentUser,
  });
};
