const AutoCheckInClass = require("./AutoCheckIn");

function main() {
  const banana = new AutoCheckInClass()
  banana.getInput().then(async () => {
    await banana.autoCheckIn()
  })
}

main()
