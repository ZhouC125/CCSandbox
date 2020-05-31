
const fs = require('fs-extra')
const crypto = require('crypto')
module.exports = {
    start(profile, moduleName, project_manifest) {
        var md5 = ""
        if (!!project_manifest) {
            md5 = crypto.createHash('md5').update(fs.readFileSync(project_manifest, 'binary')).digest('hex')
        }
        if (moduleName == "fromework") {
            if (!profile.get(moduleName)) {
                profile.set(moduleName, {
                    version: "0.0.0",
                    md5: ""
                })
            }
            var origin = profile.get(moduleName)
            if (origin.md5 !== md5) {
                origin.version = this.getVersion(origin.version)
                origin.md5 = md5
                Editor.success(`${moduleName} 版本更新到 ${origin.version}`)
            }
            return
        }

        var template = profile.data.templates[profile.data.currentTemplate]
        if (!template[moduleName].version) {
            template[moduleName].version = "0.0.0"
            template[moduleName].md5 = ""
        }
        var origin = template[moduleName]
        if (origin.md5 !== md5) {
            var version = origin.version.split(".")
            version[version.length - 1] = parseInt(version[version.length - 1]) + 1
            origin.version = version.join(".")
            origin.md5 = md5
            Editor.success(`${moduleName} 版本更新到 ${origin.version}`)
        }
    },

    getVersion(versionStr) {
        var version = versionStr.split(".")
        version[version.length - 1] = parseInt(version[version.length - 1]) + 1
        return version.join(".")
    }
}