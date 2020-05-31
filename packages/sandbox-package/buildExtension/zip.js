
const archiver = require("archiver");
const fs = require('fs-extra')
const path = require('path')
// const utils = require('./utils')
module.exports={
    start(source, target) {
        if (!fs.existsSync(path.dirname(target))) {
            utils.mkdirsSync(path.dirname(target))
        }
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(target + ".zip")
            const archive = archiver("zip", {
                forceLocalTime: true
            })
            output.on("close", function () {
                resolve(output.path)
            });
            archive.on("error", reject)
            archive.pipe(output)
            archive.directory(source, false)
            // archive.file(source)
            archive.finalize()
        })
    }
}