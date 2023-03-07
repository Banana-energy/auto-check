const puppeteer = require('puppeteer')
const fs = require('fs')
const dayjs = require('dayjs')
const sendMail = require('./sendMail')

process.on('uncaughtException', (err) => {
  console.log(err);
  sendMail('372728339@qq.com', '程序报错', '程序报错，请重启')
})

process.on('unhandledRejection', (err) => {
  console.log(err);
  sendMail('372728339@qq.com', '程序报错', '程序报错，请重启')
})

module.exports = class AutoCheckInClass {
  static HalfHour = 30 * 60 * 1000
  preSendTime
  input
  button
  timeoutTimer
  intervalTimer
  page = 'https://www.douyu.com/6566671'
  sendButtonSelector = '#layout-Player-aside > div.layout-Player-chat > div > div.ChatSpeak > div.ChatSend > div.ChatSend-button'
  inputSelector = '#layout-Player-aside > div.layout-Player-chat > div > div.ChatSpeak > div.ChatSend > textarea'
  loginButtonSelector = '#layout-Player-aside > div.layout-Player-chat > div > div.ChatSpeak > div.ChatSend > div.MuteStatus.is-noLogin > span'

  constructor() {
    const preSendTime = fs.readFileSync('time.log', {
      encoding: 'utf-8',
      flag: 'a+'
    })
    if (preSendTime) {
      this.preSendTime = +preSendTime
    } else {
      this.preSendTime = dayjs().subtract(30, 'minute').valueOf()
    }
    this.userDataPath = __dirname + '\\User Data'
  }

  async getInput() {
    const browser = await puppeteer.launch({
      headless: true,
      userDataDir: this.userDataPath,
      args: [
        '--no-sandbox',                    // 沙盒模式
        '--disable-setuid-sandbox',        // uid沙盒
        '--disable-dev-shm-usage',         // 创建临时文件共享内存
        '--disable-accelerated-2d-canvas', // canvas渲染
        '--disable-gpu',                   // GPU硬件加速
      ]
    })
    const page = (await browser.pages())[0]
    const blockedResourceTypes = [
      'image',
      'media',
      'font',
      'texttrack',
      'object',
      'beacon',
      'csp_report',
      'imageset',
    ]
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      if (blockedResourceTypes.includes(request.resourceType())) {
        request.abort()
      } else {
        request.continue()
      }
    })
    await page.goto(this.page)
    const result = await Promise.race([page.waitForSelector(this.loginButtonSelector), page.waitForSelector(this.inputSelector)])
    const isNotLogin = await result.evaluate(node => node.textContent)
    if (isNotLogin) {
      // TODO
      //  发送二维码给邮箱
      //  扫码完成后，捕获回调
      sendMail('372728339@qq.com', '登录', '请检查是否登录')
      return false
    }
    this.input = result
    this.button = await page.$(this.sendButtonSelector)
    return true
  }

  async sendMessage() {
    if (!this.input || !this.button) {
      sendMail('372728339@qq.com', '登录', '请检查是否登录')
      return
    }
    await this.input.type('#打卡')
    await this.button.click()
    this.preSendTime = dayjs().valueOf()
    fs.writeFileSync('time.log', this.preSendTime.toString())
    console.log(`当前发送时间：` + dayjs().format('YYYY-MM-DD HH:mm:ss'))
  }

  async autoCheckIn() {
    const diff = dayjs().diff(dayjs(this.preSendTime), 'millisecond')
    if (diff > AutoCheckInClass.HalfHour) {
      this.clearTimeout()
      await this.sendMessage()
      this.intervalTimer = setInterval(() => {
        this.sendMessage()
      }, AutoCheckInClass.HalfHour + 1000)
    } else {
      this.clearInterval()
      this.timeoutTimer = setTimeout(() => {
        this.sendMessage()
        this.intervalTimer = setInterval(() => {
          this.sendMessage()
        }, AutoCheckInClass.HalfHour + 1000)
      }, AutoCheckInClass.HalfHour - diff)
    }
  }

  clearInterval() {
    clearInterval(this.intervalTimer)
    this.intervalTimer = null
  }

  clearTimeout() {
    clearTimeout(this.timeoutTimer)
    this.timeoutTimer = null
  }
}
