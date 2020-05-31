const fs = require("fs-extra")
const xml2js = require('xml2js')
module.exports = {
    load(path) {
        return new Promise(async (resolve, reject) => {
            var data = fs.readFileSync(path)
            var parser = new xml2js.Parser()
            var result = await parser.parseStringPromise(data).catch(reject)
            result.save = function (options) {
                var _save = result.save
                delete result.save
                var builder = new xml2js.Builder(options);
                // headless
                var xml = builder.buildObject(result);
                fs.writeFileSync(path, xml)
                result.save = _save
            }
            resolve(result)
        })
    },
}