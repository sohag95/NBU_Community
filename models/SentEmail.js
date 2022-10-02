const nodemailer=require("nodemailer")
const dotenv = require('dotenv')
dotenv.config()

let SentEmail=function(data){
  this.transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:process.env.SENDER_EMAIL_ID,
      pass:process.env.SENDER_EMAIL_PASSWORD
    }
  })
  
  this.mailOptions={
    from:"NBU Community",
  }
}


SentEmail.prototype.sentEmailToSingleAccount=function(emailId){
  return new Promise(async (resolve, reject) => {
    try{
      this.mailOptions.to=emailId
      let info=await this.transporter.sendMail(this.mailOptions)
      console.log("Sending email info :",info)
      resolve()
    }catch{
      console.log("This code ran.")
      reject()
    }
  })
}

SentEmail.prototype.sentEmailToMultipleAccount=function(emailIds){
  return new Promise(async (resolve, reject) => {
    try{
      for(let i in emailIds){
        this.mailOptions.to=emailIds[i]
        await this.transporter.sendMail(this.mailOptions)
      }
      resolve()
    }catch{
      console.log("This code ran.")
      reject()
    }
  })
}

SentEmail.prototype.mailAsAccountCreated=function(emailId,verificationCode,regNumber,password){
  return new Promise(async (resolve, reject) => {
    try{
      let message=`  
      <div>
        <h3>Congratulatons!!Your NBU Community account has been created.</h3>
        <hr>
        <h3>Your Verification Code Is : ${verificationCode}</h3>
        <p style="color:red">(You have to provide 'THE CODE' to verifier to verify your account)</p>
        <hr>
        <p>You will be considered as a community member after verification of your account.Please wait for your verification.Your account will be verified sooner.</p>
        <hr>
        <p><strong>Your Registration Number is : ${regNumber}</strong></p>
        <p><strong>Your Password is : ${password}</strong></p>
        <hr>
        <p><strong>Thanking You</strong></p>
        <p><strong>Behalf of NBU Community</strong></p>
        <p><strong>-Sohag Roy (Community Controller)</strong></p>
      </div>`
      //let message="Sorry i am using random email id to learn sending email through node application."
      this.mailOptions.subject="test",
      this.mailOptions.html=message
      await this.sentEmailToSingleAccount(emailId)
      resolve()
    }catch{
      console.log("This code ran.")
      reject()
    }
  })
}


SentEmail.prototype.mailAsAccountVerified=function(emailId,verifierData){
  return new Promise(async (resolve, reject) => {
    try{
      
      let message=`  
      <div>
        <h3>CONGRATULATIONS!!!Your account has been verified.Now you are an activie member of NBU Community.</h3>
        <hr>
        <h3>Your account verified by :</h3>
        <p><strong>Verifier : ${verifierData.verifierType}</strong></p>
        <p><strong>Name : ${verifierData.userName}</strong></p>
        <p><strong>Verification Date : ${verifierData.verificationDate}</strong></p>
        <hr>
        <h3>Welcome to NBU Community!!</h3>
      </div>`
      this.mailOptions.subject="NBU Community Account Verified!!!",
      this.mailOptions.html=message
      await this.sentEmailToSingleAccount(emailId)
      resolve()
    }catch{
      console.log("This code ran.")
      reject()
    }
  })
}

SentEmail.prototype.sentResetPasswordOTPDetails=function(emailId,OTPDetails){
  return new Promise(async (resolve, reject) => {
    try{
      
      let message=`  
      <div>
        <h3>Request for reset password received!! </h3>
        <hr>
        <h3>Your OTP Details :</h3>
        <p><strong>Your OTP is: ${OTPDetails.OTP}</strong></p>
        <p><strong>Validation Time : ${OTPDetails.validationTime}</strong></p>
        <hr>
        <h3>Do not share your OTP with anyone.Please inform ,if you didn't request to reset password!!</h3>
      </div>`
      this.mailOptions.subject="OTP for reset NBU Community Account's Password!!!",
      this.mailOptions.html=message
      await this.sentEmailToSingleAccount(emailId)
      resolve()
    }catch{
      console.log("This code ran.")
      reject()
    }
  })
}


SentEmail.prototype.mailAsActivityCreated=function(emailIds){
  return new Promise(async (resolve, reject) => {
    try{
      let message="New activity created.Please join the activity."
      this.mailOptions.subject="New activity created!!",
      this.mailOptions.html=message
      await this.sentEmailToMultipleAccount(emailIds)
      resolve()
    }catch{
      console.log("This code ran.")
      reject()
    }
  })
}


SentEmail.prototype.sentMail=function(){
  return new Promise(async (resolve, reject) => {
    try{
      let message="Hello there i am sohag roy."
      this.mailOptions.subject="Testing Email Sending",
      this.mailOptions.html=message
      await this.transporter.sendMail(this.mailOptions)
      resolve()
    }catch{
      console.log("This code ran.")
      reject()
    }
  })
}

module.exports=SentEmail

// let htmlMessage=`<!DOCTYPE html>
//       <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width,initial-scale=1">
//         <meta name="x-apple-disable-message-reformatting">
//         <title></title>
//         <!--[if mso]>
//         <noscript>
//           <xml>
//             <o:OfficeDocumentSettings>
//               <o:PixelsPerInch>96</o:PixelsPerInch>
//             </o:OfficeDocumentSettings>
//           </xml>
//         </noscript>
//         <![endif]-->
//         <style>
//           table, td, div, h1, p {font-family: Arial, sans-serif;}
//         </style>
//       </head>
//       <body style="margin:0;padding:0;">
//         <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
//           <tr>
//             <td align="center" style="padding:0;">
//               <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
//                 <tr>
//                   <td align="center" style="padding:40px 0 30px 0;background:#70bbd9;">
//                     <img src="https://assets.codepen.io/210284/h1.png" alt="" width="300" style="height:auto;display:block;" />
//                   </td>
//                 </tr>
//                 <tr>
//                   <td style="padding:36px 30px 42px 30px;">
//                     <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
//                       <tr>
//                         <td style="padding:0 0 36px 0;color:#153643;">
//                           <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">Creating Email Magic</h1>
//                           <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed. Morbi porttitor, eget accumsan et dictum, nisi libero ultricies ipsum, posuere neque at erat.</p>
//                           <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;">In tempus felis blandit</a></p>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style="padding:0;">
//                           <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
//                             <tr>
//                               <td style="width:260px;padding:0;vertical-align:top;color:#153643;">
//                                 <p style="margin:0 0 25px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><img src="https://assets.codepen.io/210284/left.gif" alt="" width="260" style="height:auto;display:block;" /></p>
//                                 <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed. Morbi porttitor, eget accumsan dictum, est nisi libero ultricies ipsum, in posuere mauris neque at erat.</p>
//                                 <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;">Blandit ipsum volutpat sed</a></p>
//                               </td>
//                               <td style="width:20px;padding:0;font-size:0;line-height:0;">&nbsp;</td>
//                               <td style="width:260px;padding:0;vertical-align:top;color:#153643;">
//                                 <p style="margin:0 0 25px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><img src="https://assets.codepen.io/210284/right.gif" alt="" width="260" style="height:auto;display:block;" /></p>
//                                 <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Morbi porttitor, eget est accumsan dictum, nisi libero ultricies ipsum, in posuere mauris neque at erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed.</p>
//                                 <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;">In tempus felis blandit</a></p>
//                               </td>
//                             </tr>
//                           </table>
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td style="padding:30px;background:#ee4c50;">
//                     <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
//                       <tr>
//                         <td style="padding:0;width:50%;" align="left">
//                           <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#ffffff;">
//                             &reg; Someone, Somewhere 2021<br/><a href="http://www.example.com" style="color:#ffffff;text-decoration:underline;">Unsubscribe</a>
//                           </p>
//                         </td>
//                         <td style="padding:0;width:50%;" align="right">
//                           <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
//                             <tr>
//                               <td style="padding:0 0 0 10px;width:38px;">
//                                 <a href="http://www.twitter.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/tw_1.png" alt="Twitter" width="38" style="height:auto;display:block;border:0;" /></a>
//                               </td>
//                               <td style="padding:0 0 0 10px;width:38px;">
//                                 <a href="http://www.facebook.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/fb_1.png" alt="Facebook" width="38" style="height:auto;display:block;border:0;" /></a>
//                               </td>
//                             </tr>
//                           </table>
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>
//         </table>
//       </body>
//       </html>`