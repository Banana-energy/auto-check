const nodemailer = require("nodemailer");

const sendMail = (to, subject, html) => {
  // 创建一个smtp客户端配置
  const config = {
    host: "smtp.qq.com",
    port: 465,
    secureConnection: true,
    auth: {
      // 发件人邮箱账号
      user: '372728339@qq.com',
      //发件人邮箱的授权码 这里可以通过qq邮箱获取 并且不唯一
      pass: 'ujkkzistkceucaif' //授权码生成之后，要等一会才能使用，否则验证的时候会报错
    }
  }
  const transporter = nodemailer.createTransport(config)
  //创建一个收件人对象
  const mail = {
    // 发件人 邮箱 '昵称<发件人邮箱>'
    from: `"AutoCheck"<372728339@qq.com>`,
    // 主题
    subject: subject,
    // 收件人 的邮箱
    to: to,
    //这里可以添加html标签
    html: html
  }

  transporter.sendMail(mail, (error, res) => {
    if (error) {
      console.log(error);
    }
    transporter.close()
    console.log('mail sent:', res.response)
  })
}

module.exports = sendMail

