const fileUtils = require('../fileUtils')
const localProfile = require("../localProfile")
const fs = require("fs-extra")
const path = require('path')
const write = require('./write')
const xml = require('../xml')
const util = require('util');
module.exports = {
    inject(options) {
        return new Promise(async (resolve, reject) => {
            var localPlatformPath = path.join(fileUtils.getProjectPath(), 'build-bundle/sdk', options.actualPlatform)
            if (options.actualPlatform === "android") {
                await this.injectAndroid(options, localPlatformPath).catch(Editor.error)
            }
            if (options.actualPlatform === 'ios') {
                await this.injectIos(options, localPlatformPath).catch(Editor.error)
            }
            resolve()
        })
    },
    /** ----------------------------------Android-------------------------------------- */
    injectAndroid(options, localPlatformPath) {
        return new Promise(async (resolve, reject) => {
            var appPath = path.join(options.dest, 'frameworks/runtime-src/proj.android-studio/app')
            var profile = localProfile.load()
            var company = localProfile.currentCompany(profile)

            // proguard-rules.pro
            var source = path.join(localPlatformPath, "proguard-rules.pro")
            if (!fs.existsSync(source)) return reject(`${source} 不存在`)
            var target = path.join(appPath, 'proguard-rules.pro')
            await write.start(source, target, [
                {
                    reg: /__LINE__/g,
                    lines: [
                        `-keep public class ${options.android.packageName}.** { *; }`,
                        `-dontwarn ${options.android.packageName}.**`,
                    ]
                }
            ])

            // build.gradle
            var source = path.join(localPlatformPath, 'build.gradle')
            if (!fs.existsSync(source)) return reject(`${source} 不存在`)
            var target = path.join(appPath, 'build.gradle')
            await write.start(source, target, [
                {
                    reg: /defaultConfig/g,
                    lines: [
                        `\t\tapplicationId "${options.android.packageName}"`
                    ]
                }
            ], true)

            // AndroidManifest.xml
            var androidManifest = path.join(localPlatformPath, "AndroidManifest.xml")
            if (fs.existsSync(androidManifest)) {
                var targetManifest = path.join(appPath, "AndroidManifest.xml")
                if (fs.existsSync(targetManifest)) {
                    fs.removeSync(targetManifest)
                }
                fs.copyFileSync(androidManifest, targetManifest)
                var xmlData = await xml.load(targetManifest)
                xmlData.manifest.$.package = options.android.packageName

                xmlData.save({ headless: false })
            }

            // 修改android应用名
            var package = company.packages[company.currentPackage]
            var stringsPath = path.join(options.dest, "frameworks/runtime-src/proj.android-studio/app/res/values/strings.xml")
            var xmlData = await xml.load(stringsPath)
            xmlData.resources.string[0]._ = package.appName
            xmlData.save({ headless: true })

            resolve()
        })
    },
    /** ----------------------------------iOS-------------------------------------- */

    async injectIos(options, localPlatformPath) {
        return new Promise(async (resolve, reject) => {
            var projectPath = path.join(options.dest, 'frameworks/runtime-src/proj.ios_mac')
            var iosPath = path.join(projectPath, 'ios')
            var profile = localProfile.load()
            var company = localProfile.currentCompany(profile)
            // 修改启动页
            var package = company.packages[company.currentPackage]
            var info = path.join(options.dest, "frameworks/runtime-src/proj.ios_mac/ios/Info.plist")
            var cmd = `/usr/libexec/PlistBuddy`
            // 包名
            cmd += ` -c "Set :CFBundleDisplayName ${package.appName}"`
            cmd += ` ${info}`

            await write.toExec(cmd, false)
            resolve()
        })
    },
    copyFolder(source, target) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(source)) return reject(`${source} 不存在`)
            if (fs.existsSync(target)) {
                fs.removeSync(target)
            }
            fileUtils.copyFolderAsync(source, target)
            resolve()
        })

    },

}