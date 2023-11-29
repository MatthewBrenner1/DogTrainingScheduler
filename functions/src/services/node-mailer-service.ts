import {
    BoardingAppointmentData,
    CreateUserInformationFromTrelloRequest,
    DaycareAppointmentData,
    WhiteListUserFromTrelloRequest
} from "../models";
import { IResult, SuccessResult, SuccessWithWarningResult } from "../result/result";
import {NODE_MAILER_TRANSPORT_CONFIG} from "../env";
// const gProcess = require('process');
const nodemailer = require('nodemailer');


type EmailTemplate = {
  subject: string,
  html: string,
}

type Email = "daycare" | "boarding" | "whitelist"
type EmailData = DaycareAppointmentData | BoardingAppointmentData | WhiteListUserFromTrelloRequest

const templates: { [key: string]: (data: any) => EmailTemplate } = {
  daycare: (data: DaycareAppointmentData) => ({
    subject: `ReplacedForPrivacy Daycare Reservation Confirmation`,
    html: `
    <html>

<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');

    body {
      font-family: 'Roboto', sans-serif;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #3f51b5;
      text-align: center;
    }

    a,
    b {
      color: #3f51b5;
    }

    .hr {
      margin-top: 30px;
      margin-bottom: 45px;
      width: 100%;
      border-bottom: 2px solid #3f51b5;
      border-radius: 3px;
      opacity: 0.25;
    }

    .mt-4 {
      margin-top: 30px;
    }

    .subtext {
      font-size: 0.9rem;
      text-align: center;
      color: #747a9f;
    }

    .logo-container {
      width: 100%;
      text-align: center;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: auto;
    }

    .ReplacedForPrivacy-log {
      height: 60px;
      width: 79.62px;
    }

    .reservation {
      width: 100%;
      padding: 21px;
      border-radius: 12px;
      background-color: rgba(64, 81, 181, 0.05);
    }

    .reservation th {
      color: #3f51b5;
    }

    .reservation td {
      padding: 0px 15px;
      text-align: center;
    }

    .thankyou {
      margin-top: 30px;
    }

    .thankyou>p {
      margin: 0;
      margin-top: 15px;
      margin-bottom: 15px;
    }
  </style>
</head>

<body>
  <div class="email-container">
    <div class="logo-container">
      <img class="ReplacedForPrivacy-log"
        src="https://img1.wsimg.com/isteam/ip/39f806bf-4dd7-4ff7-86a6-eb57bc38f2d9/Logo%20color.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=h:1000,cg:true"
        alt="ReplacedForPrivacy Logo">
    </div>
    <h2>Hello ${data.firstName}, your daycare reservation is confirmed.</h2>
    <p class="subtext">-Reservation details-</p>


    <table class="reservation">
      <tr>
        <th>Dogs</th>
        <th>Dates</th>
      </tr>
      <tr>
        <td>${data.dogData.map(dog => dog.dogsName).join(", ")}</td>
        <td>${data.daycareDates.join(", ")}</td>
      </tr>
    </table>

    <div class="thankyou">
      <p>
        We are excited to have your ReplacedForPrivacy come to our Academy!
      </p>
      <p>
        Please be sure to send current vaccination records, including rabies certificate, to <a
          href="mailto:vax@ReplacedForPrivacy.com">vax@ReplacedForPrivacy.com</a>.
      </p>
      <p>
        Please review our school rules <a target="_blank" href="https://ReplacedForPrivacy.com/academy-rules">here</a>.
      </p>
      <p>
        <b>REMINDER:</b> PICKUP AND DROP OFF 7AM-9AM OR 5PM-7PM
      </p>
      <p>
        If you have any questions, please email <a
          href="mailto:questions@ReplacedForPrivacy.com">questions@ReplacedForPrivacy.com</a>
      </p>
      <p>
        We are cheering you on!
      </p>
    </div>
    <div class="hr"></div>
    <footer class="subtext">
      <p>
        <br />
        ReplacedForPrivacy
        <br />
        <a target="_blank" href="https://ReplacedForPrivacy.com">ReplacedForPrivacy.com</a>
        <br />
        <a href="tel:8013960019">(801) 396-0019</a>
      </p>
      <p class="mt-4">If you did not enter this email address when signing up for ReplacedForPrivacy daycare, please
        disregard
        this message.</p>
      <p class="mt-4">789 West 1390 South, Salt Lake City, Utah 84104, United States</p>
      <p class="mt-4">© ${new Date().getFullYear()} ReplacedForPrivacy - All Rights Reserved.</p>
    </footer>
  </div>
</body>

</html>
    `
  }),
  boarding: (data: BoardingAppointmentData) => ({
    subject: `Hello, ${data.firstName}.  This is your boarding confirmation email.`,
    html: `<html>

<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');

    body {
      font-family: 'Roboto', sans-serif;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #3f51b5;
      text-align: center;
    }

    a,
    b {
      color: #3f51b5;
    }

    .hr {
      margin-top: 30px;
      margin-bottom: 45px;
      width: 100%;
      border-bottom: 2px solid #3f51b5;
      border-radius: 3px;
      opacity: 0.25;
    }

    .mt-4 {
      margin-top: 30px;
    }

    .subtext {
      font-size: 0.9rem;
      text-align: center;
      color: #747a9f;
    }

    .logo-container {
      width: 100%;
      text-align: center;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: auto;
    }

    .ReplacedForPrivacy-log {
      height: 60px;
      width: 79.62px;
    }

    .reservation {
      width: 100%;
      padding: 21px;
      border-radius: 12px;
      background-color: rgba(64, 81, 181, 0.05);
    }

    .reservation th {
      color: #3f51b5;
    }

    .reservation td {
      padding: 0px 15px;
      text-align: center;
    }

    .thankyou {
      margin-top: 30px;
    }

    .thankyou>p {
      margin: 0;
      margin-top: 15px;
      margin-bottom: 15px;
    }

    .training {
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="email-container">
    <div class="logo-container">
      <img class="ReplacedForPrivacy-log"
        src="https://img1.wsimg.com/isteam/ip/39f806bf-4dd7-4ff7-86a6-eb57bc38f2d9/Logo%20color.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=h:1000,cg:true"
        alt="ReplacedForPrivacy Logo">
    </div>
    <h2>Hello ${data.firstName}, your boarding reservation is confirmed.</h2>
    <p class="subtext">-Reservation details-</p>


    <table class="reservation">
      <tr>
        <th>Dogs</th>
        <th>Dates</th>
      </tr>
      <tr>
        <td>${data.dogData.map(dog => dog.dogsName).join(", ")}</td>
        <td>${data.startDate} - ${data.endDate}</td>
      </tr>
    </table>

    <div class="training">
      <p>${data.dogData.filter(dog => dog.includeTraining).length ? `${data.dogData.filter(dog =>
      dog.includeTraining).map(dog => dog.dogsName).join(", ")} will receive training.` : "Training not requested."}
      </p>
    </div>

    <div class="thankyou">
      <p>
        We are excited to have your ReplacedForPrivacy come to our Academy!
      </p>
      <p>
        Please be sure to send current vaccination records, including rabies certificate, to <a
          href="mailto:vax@ReplacedForPrivacy.com">vax@ReplacedForPrivacy.com</a>.
      </p>
      <p>
        Please review our school rules <a target="_blank" href="https://ReplacedForPrivacy.com/academy-rules">here</a>.
      </p>
      <p>
        <b>REMINDER:</b> PICKUP AND DROP OFF 7AM-9AM OR 5PM-7PM
      </p>
      <p>
        If you have any questions, please email <a
          href="mailto:questions@ReplacedForPrivacy.com">questions@ReplacedForPrivacy.com</a>
      </p>
      <p>
        We are cheering you on!
      </p>
    </div>
    <div class="hr"></div>
    <footer class="subtext">
      <p>
        <br />
        ReplacedForPrivacy
        <br />
        <a target="_blank" href="https://ReplacedForPrivacy.com">ReplacedForPrivacy.com</a>
        <br />
        <a href="tel:8013960019">(801) 396-0019</a>
      </p>
      <p class="mt-4">If you did not enter this email address when signing up for ReplacedForPrivacy daycare, please
        disregard
        this message.</p>
      <p class="mt-4">789 West 1390 South, Salt Lake City, Utah 84104, United States</p>
      <p class="mt-4">© ${new Date().getFullYear()} ReplacedForPrivacy - All Rights Reserved.</p>
    </footer>
  </div>
</body>

</html>`
  }),
  whitelist: (data: CreateUserInformationFromTrelloRequest) => ({
    subject: `Welcome to ReplacedForPrivacy, ${data.firstName}.  Here's how to get started.`,
    html: `
    <html>

<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');

    body {
      font-family: 'Roboto', sans-serif;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #3f51b5;
    }

    a,
    b {
      color: #3f51b5;
    }

    .hr {
      margin-top: 30px;
      margin-bottom: 45px;
      width: 100%;
      border-bottom: 2px solid #3f51b5;
      border-radius: 3px;
      opacity: 0.25;
    }

    .mt-4 {
      margin-top: 30px;
    }

    .subtext {
      font-size: 0.9rem;
      color: #747a9f;
    }

    .logo-container {
      width: 100%;
      text-align: center;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: auto;
    }

    .ReplacedForPrivacy-log {
      height: 60px;
      width: 79.62px;
    }

    .reservation {
      width: 100%;
      padding: 21px;
      border-radius: 12px;
      background-color: rgba(64, 81, 181, 0.05);
    }

    .reservation th {
      color: #3f51b5;
    }

    .reservation td {
      padding: 0px 15px;
      text-align: center;
    }

    .thankyou {
      margin-top: 60px;
    }

    .thankyou>p {
      margin: 0;
      margin-top: 15px;
      margin-bottom: 15px;
    }
  </style>
</head>

<body>
  <div class="email-container">
    <div class="logo-container">
      <img class="ReplacedForPrivacy-log"
        src="https://img1.wsimg.com/isteam/ip/39f806bf-4dd7-4ff7-86a6-eb57bc38f2d9/Logo%20color.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=h:1000,cg:true"
        alt="ReplacedForPrivacy Logo">
    </div>
    <h2>Hello ${data.firstName},</h2>
    <p>You now have access to schedule daycare or boarding for your dog(s) through the ReplacedForPrivacy
      website.</p>
    <p>Please click <a target="_blank" href="https://ReplacedForPrivacy/auth/login">this link</a> to finalize your account,
      and make sure
      to use your email ${data.email}
      when signing up!</p>

    <div class="thankyou">
      <p>
        We are excited to have your ReplacedForPrivacy come to our Academy!
      </p>
      <p>
        Please be sure to send current vaccination records, including rabies certificate, to <a
          href="mailto:vax@ReplacedForPrivacy.com">vax@ReplacedForPrivacy.com</a>.
      </p>
      <p>
        Please review our school rules <a target="_blank" href="https://ReplacedForPrivacy.com/academy-rules">here</a>.
      </p>
      <p>
        <b>REMINDER:</b> PICKUP AND DROP OFF 7AM-9AM OR 5PM-7PM
      </p>
      <p>
        If you have any questions, please email <a
          href="mailto:questions@ReplacedForPrivacy.com">questions@ReplacedForPrivacy.com</a>
      </p>
      <p>
        We are cheering you on!
      </p>
    </div>
    <div class="hr"></div>
    <footer class="subtext">
      <p>
        <br />
        ReplacedForPrivacy
        <br />
        <a target="_blank" href="https://ReplacedForPrivacy.com">ReplacedForPrivacy.com</a>
        <br />
        <a href="tel:8013960019">(801) 396-0019</a>
      </p>
      <p class="mt-4">If you did not enter this email address when signing up for ReplacedForPrivacy daycare, please
        disregard
        this message.</p>
      <p class="mt-4">789 West 1390 South, Salt Lake City, Utah 84104, United States</p>
      <p class="mt-4">© ${new Date().getFullYear()} ReplacedForPrivacy - All Rights Reserved.</p>
    </footer>
  </div>
</body>

</html>
`
  }),
}


export const sendEmail = async (emailAddress: string, emailType: Email, data: EmailData): Promise<IResult<any>> => {
  return verifyConnection(getTransporter())
    .then(r => r.map((transporter) =>
      transporter.sendMail({
        from: '"ReplacedForPrivacy" <info@ReplacedForPrivacy.com>', // sender address
        to: emailAddress.toLowerCase(), // list of receivers
        subject: templates[emailType](data).subject, // Subject line
        html: templates[emailType](data).html, // html body
      }).then(() =>
        new SuccessResult({})
      ).catch((error: any) =>
        new SuccessWithWarningResult({}, 'Failed to verify connection when attempting to send confirmation email', error))))
}

const getTransporter = () => nodemailer.createTransport(JSON.parse(NODE_MAILER_TRANSPORT_CONFIG));

const verifyConnection = async (transporter: any): Promise<IResult<any>> =>
  transporter.verify()
    .then(() => new SuccessResult(transporter))
    .catch((error: any) => new SuccessWithWarningResult({},
      'Failed to verify connection when attempting to send confirmation email', error));
