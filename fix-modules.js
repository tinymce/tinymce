const fs = require('fs')
const path = require('path')
const list = {
  "./fix/Deltas.js": './node_modules/@ephox/snooker/lib/main/ts/ephox/snooker/calc/Deltas.js',
  "./fix/Adjustments.js": './node_modules/@ephox/snooker/lib/main/ts/ephox/snooker/resize/Adjustments.js'
}
Object.keys(list).forEach(fixPath => {
  fs.copyFileSync(path.resolve(__dirname, fixPath), path.resolve(__dirname, list[fixPath]))
})

