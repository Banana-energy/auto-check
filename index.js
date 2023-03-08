const AutoCheckInClass = require("./AutoCheckIn");

async function main() {
  const banana = new AutoCheckInClass()
  await banana.getInput()
  await banana.sendMessage()
  process.exit(0)
}

main()
