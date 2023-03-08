const puppeteer = require('puppeteer')
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
  input
  button
  page = 'https://www.douyu.com/6566671'
  sendButtonSelector = '#layout-Player-aside > div.layout-Player-chat > div > div.ChatSpeak > div.ChatSend > div.ChatSend-button'
  inputSelector = '#layout-Player-aside > div.layout-Player-chat > div > div.ChatSpeak > div.ChatSend > textarea'
  loginButtonSelector = '#layout-Player-aside > div.layout-Player-chat > div > div.ChatSpeak > div.ChatSend > div.MuteStatus.is-noLogin > span'

  constructor() {
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
      if (blockedResourceTypes.includes(request.resourceType().toString())) {
        request.abort()
      } else {
        request.continue()
      }
    })
    await page.goto(this.page)
    const result = await Promise.race([page.waitForSelector(this.loginButtonSelector), page.waitForSelector(this.inputSelector)])
    const isNotLogin = await result.evaluate(node => node.textContent)
    if (isNotLogin) {
      await result.click()
      const response = await page.waitForResponse((
          response => response.url() === 'https://passport.douyu.com/scan/generateCode' && response.status() === 200
      ))
      const loginUrl = (await response.json()).data.url
      sendMail('372728339@qq.com', '登录', loginUrl)
      await page.waitForResponse((response => response.url() === 'https://ucp.douyucdn.cn/ucp.do' && response.status() === 200))
      await page.reload()
      this.input = await page.waitForSelector(this.inputSelector)
      this.button = await page.$(this.sendButtonSelector)
    } else {
      this.input = result
      this.button = await page.$(this.sendButtonSelector)
    }
  }

  async sendMessage() {
    if (!this.input || !this.button) {
      sendMail('372728339@qq.com', '登录', '请检查是否登录')
      return
    }
    await this.input.type('#打卡')
    await this.button.click()
    console.log(`当前发送时间：` + dayjs().format('YYYY-MM-DD HH:mm:ss'))
  }
}
