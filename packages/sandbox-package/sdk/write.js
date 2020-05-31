const fs = require("fs-extra")
const readline = require('readline')
const os = require('os')
const { exec } = require('child_process')
module.exports = {
    start(source, target, writes, isNextLine) {
        return new Promise((resolve, reject) => {
            var fRead = fs.createReadStream(source)
            var fWrite = fs.createWriteStream(target)
            var objReadline = readline.createInterface({
                input: fRead,
            })
            objReadline.on('line', (line) => {
                var newLines = []
                var newLine = undefined
                for (let i = 0; i < writes.length; i++) {
                    const info = writes[i];
                    if (info.reg.test(line)) {
                        if (info.lines) {
                            newLines = info.lines
                        } else if (info.replace) {
                            newLine = line.replace(info.reg, info.replace)
                        }
                        break
                    }
                }
                if (newLines.length === 0) {
                    if (newLine) {
                        fWrite.write(newLine + os.EOL)
                    } else {
                        fWrite.write(line + os.EOL)
                    }
                } else {
                    if (isNextLine) {
                        fWrite.write(line + os.EOL)
                    }
                    fWrite.write(`${newLines.join(os.EOL)}${os.EOL}`)
                }
            })
            objReadline.on('close', () => {
                Editor.success(target)
                resolve()
            })
            objReadline.on('error', reject)
        })
    },
    toExec(cmd, showError = true) {
        return new Promise((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    if (showError) {
                        Editor.error(err)
                    }
                }
                Editor.log(stdout)
                resolve()
            })
        })

    }
}