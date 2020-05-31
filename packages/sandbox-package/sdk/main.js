const fileUtils = require('../fileUtils')
const fs = require("fs-extra")
const path = require('path')
const platformMain = require('./injectPlatformMain')
module.exports = {
    start(options) {
        return new Promise(async (resolve, reject) => {
            this.clear(options)
            await platformMain.inject(options)
            resolve()
        })
    },

    clear(options) {
        var localPlatformPath = path.join(fileUtils.getProjectPath(), 'build-bundle/sdk', options.actualPlatform)
        if (!fs.existsSync(localPlatformPath)) {
            Editor.error(`${localPlatformPath} 不存在`)
            return
        }
        if (options.actualPlatform === "android") {
            this.clearAndroid(options)
        }

    },
    clearAndroid(options) {
        var appPath = path.join(options.dest, 'frameworks/runtime-src/proj.android-studio/app')
        var srcPath = path.join(appPath, 'src')
        var arr = options.android.packageName.split('.')
        if (arr[0] == 'org') {
            var packagePath = path.join(srcPath, arr[0], arr[1])
        } else {
            var packagePath = path.join(srcPath, arr[0])
        }
        if (fs.existsSync(packagePath)) {
            fs.removeSync(packagePath)
        }
    },
} 