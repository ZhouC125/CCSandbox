
const fileUtils = require('../fileUtils')
const zip = require('./zip')
const localProfile = require('../localProfile')
const fs = require("fs-extra")
const path = require('path')
const manifest = require('./manifest')
const version = require('./version')
const projectManifest = "project.manifest"
const versionManifest = "version.manifest"
// const reference = require('../moduleReference/main')
module.exports = {
    setCustom(flag) {
        this.isCustom = flag
    },
    async onBuildStart(options, callback) {
        if (options.title === "__CUSTOM__") {
            // reference.onBuildStart(options, callback)
            return
        }
        if (options.actualPlatform == "android" || options.actualPlatform == "ios") {
            await localProfile.removeCompany()
        }
        callback()
    },
    async onBuildFinish(options, callback) {
        if (options.title === "__CUSTOM__") {
            // reference.onBuildFinish(options, callback)
            return
        }
        if (options.actualPlatform !== "android" && options.actualPlatform !== "ios") {
            Editor.success("---------------------------非热更新模式---------------------------")
            return callback()
        }
        this.profile = localProfile.load()
        var localServerPath = path.join(this.profile.data.localServerPath)
        if (this.profile.data.localServerPath == "" || !fs.existsSync(localServerPath)) {
            Editor.error("没有找到本地资源服务器路径")
            return callback()
        }
        var modules = this.profile.data.templates[this.profile.data.currentTemplate]
        var source_subpackages_path = path.join(options.dest, "subpackages")
        for (const module in modules) {
            if (modules.hasOwnProperty(module)) {
                const moduleInfo = modules[module];

                if (!moduleInfo.isSubpackage) continue
                var modulePath = path.join(source_subpackages_path, module)
                var mft = manifest.getMainfest()
                mft = manifest.start(options, modulePath, mft)
                var project_manifest = path.join(modulePath, projectManifest)
                if (this.profile.data.companys[this.profile.data.currentCompany].developmentModel == 0) {
                    fs.writeJSONSync(project_manifest, mft, { spaces: "   " })
                } else {
                    fs.writeJSONSync(project_manifest, mft)
                }
                version.start(this.profile, module, project_manifest)
                mft.version = moduleInfo.version
                fs.writeJSONSync(project_manifest, mft, { spaces: "   " })
                delete mft.assets
                delete mft.searchPaths
                var version_manifest = path.join(modulePath, versionManifest)
                fs.writeJSONSync(version_manifest, mft, { spaces: "   " })
                var zipPath = await zip.start(modulePath, modulePath).catch(Editor.error)
                await fileUtils.moveFolderAsync(zipPath, path.join(modulePath, module + ".zip")).catch(Editor.error)
            }
        }
        var main_res_path = path.join(options.dest, "res")
        var main_src_path = path.join(options.dest, "src")
        var mft = manifest.getMainfest()
        mft = manifest.start(options, main_res_path, mft)
        mft = manifest.start(options, main_src_path, mft)
        var project_manifest = path.join(options.dest, projectManifest)
        fs.writeJSONSync(project_manifest, mft, { spaces: "   " })
        version.start(this.profile, "fromework", project_manifest)
        mft.version = this.profile.data.fromework.version
        fs.writeJSONSync(project_manifest, mft, { spaces: "   " })
        delete mft.assets
        delete mft.searchPaths
        var version_manifest = path.join(options.dest, versionManifest)
        fs.writeJSONSync(version_manifest, mft, { spaces: "   " })

        var remote_path = path.join(localServerPath, this.profile.data.currentTemplate)

        if (fs.existsSync(remote_path)) fs.removeSync(remote_path)
        var target_subpackages_path = path.join(remote_path, "subpackages")
        await fileUtils.moveFolderAsync(source_subpackages_path, target_subpackages_path).catch(Editor.error)
        fs.mkdirSync(source_subpackages_path)

        await fileUtils.copyFolderAsync(main_res_path, path.join(remote_path, "res")).catch(Editor.error)
        await fileUtils.copyFolderAsync(main_src_path, path.join(remote_path, "src")).catch(Editor.error)
        await fileUtils.copyFolderAsync(project_manifest, path.join(remote_path, projectManifest)).catch(Editor.error)
        await fileUtils.copyFolderAsync(version_manifest, path.join(remote_path, versionManifest)).catch(Editor.error)
        await fileUtils.moveFolderAsync(version_manifest, path.join(options.dest, "res", versionManifest)).catch(Editor.error)
        await fileUtils.moveFolderAsync(project_manifest, path.join(options.dest, "res", projectManifest)).catch(Editor.error)
        // Editor.log("将资源拷贝到本地资源服务器 完成")

        localProfile.save(this.profile)
        var company_source = path.join(fileUtils.getProjectPath(), 'assets/resources/company.json')
        var company_target = path.join(options.dest, "res/company.json")
        await fileUtils.copyFolderAsync(company_source, company_target).catch(Editor.error)

        // await sdk.start(options)

        callback()
    },
}   