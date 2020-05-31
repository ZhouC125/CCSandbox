
const path = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')
module.exports = {

    start(options, modulePath, manifest) {
        this.options = options
        this.recursion(modulePath, manifest.assets, this.recursionCallback.bind(this))
        return manifest
    },
    recursion(dir, assetsRef, callback) {
        var stat = fs.statSync(dir)
        if (stat.isDirectory()) {
            var subpaths = fs.readdirSync(dir)
            for (let i = 0; i < subpaths.length; i++) {
                const subpath = subpaths[i];
                if (subpath[0] === '.') continue
                var sub = path.join(dir, subpath)
                stat = fs.statSync(sub)
                if (stat.isDirectory()) {
                    this.recursion(sub, assetsRef, callback)
                }
                if (stat.isFile()) {
                    callback(sub, assetsRef)
                }
            }
        } else if (stat.isFile()) {
            callback(dir, assetsRef)
        }
    },

    recursionCallback(file, assetsRef) {

        var stat = fs.statSync(file)
        var relative = path.relative(this.options.dest, file)
        relative = relative.replace(/\\/g, "/")
        var compressed = path.extname(file).toLowerCase() === '.zip'
        assetsRef[relative] = {
            'size': stat["size"],
            'md5': crypto.createHash('md5').update(fs.readFileSync(file, 'binary')).digest('hex')
        }
        if (compressed) {
            assetsRef[relative].compressed = true
        }
    },
    getMainfest() {
        return {
            version: "0.0.0",
            assets: {},
            searchPaths: []
        }
    },
}