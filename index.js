const AutoCheckInClass = require("./AutoCheckIn");

function main() {
  const banana = new AutoCheckInClass()
  banana.getInput().then(async (res) => {
    if (res) {
      await banana.autoCheckIn()
    }
  })
}

main()
