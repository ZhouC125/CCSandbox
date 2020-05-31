const modules = require("../modules")
const path = require('path')
const fs = require("fs-extra")
const fileUtils = require('../fileUtils')
const localProfile = require('../localProfile')
const subpackage = require('../subpackage/main')
module.exports = {
    onAssetsMoved(a, b) {
        this.createModule(a, b)
        this.createLayout(a, b)
        this.createSkin(a, b)
        this.createTypescript(a, b)
    },

    onAssetsChanged(a, b) {
        // Editor.log("改变")
    },

    onAssetsDeleted(a, b) {
        this.deletedModule(a, b)

    },

    createModule(a, b) {
        var info = b[0]
        if (path.basename(info.srcPath) !== "New Folder") return
        if (info.type !== "folder") return
        var dirname = path.dirname(info.destPath)
        var moduleName = path.basename(dirname)
        if (moduleName !== 'mainModules' && moduleName !== 'subModules') {
            return
        }
        fileUtils.mkdirsSync(path.join(info.destPath, 'scripts'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'layouts/layout_0/scenes'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'layouts/layout_0/prefabs'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'layouts/layout_0/scripts'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'layouts/layout_0/skins/skin_0/fonts'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'layouts/layout_0/skins/skin_0/spines'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'layouts/layout_0/skins/skin_0/audios'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'layouts/layout_0/skins/skin_0/textures'))
        this.refresh(info.destPath)

        var modName = path.basename(info.destPath)
        var db_module = `${info.url}/scripts/${modName}.ts`
        var db_model = `${info.url}/scripts/${modName}_model.ts`
        var db_view_model = `${info.url}/scripts/${modName}_view_model.ts`
        var db_view = `${info.url}/layouts/layout_0/scripts/${modName}_main.ts`

        var text = fs.readFileSync(Editor.url("packages://sandbox-package/template/module.txt"), "utf-8")
        text = text.replace(/#MODULE#/g, modName)
        Editor.assetdb.create(db_module, text)

        text = fs.readFileSync(Editor.url("packages://sandbox-package/template/model.txt"), "utf-8")
        text = text.replace(/#MODULE#/g, modName)
        Editor.assetdb.create(db_model, text)

        text = fs.readFileSync(Editor.url("packages://sandbox-package/template/viewModel.txt"), "utf-8")
        text = text.replace(/#MODULE#/g, modName)
        Editor.assetdb.create(db_view_model, text)

        text = fs.readFileSync(Editor.url("packages://sandbox-package/template/view.txt"), "utf-8")
        text = text.replace(/#MODULE#/g, modName)
        Editor.assetdb.create(db_view, text)

        localProfile.syncTemplateModules()

        if(moduleName === 'subModules'){
            subpackage.makeSubpackage(info.url)
        }
    },

    createLayout(a, b) {
        var info = b[0]
        if (path.basename(info.srcPath) !== "New Folder") return
        if (info.type !== "folder") return
        var dirname = path.dirname(info.destPath)
        var layoutName = path.basename(dirname)
        if (layoutName !== 'layouts') {
            return
        }
        fileUtils.mkdirsSync(path.join(info.destPath, 'scenes'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'prefabs'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'scripts'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'skins/skin_0/fonts'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'skins/skin_0/spines'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'skins/skin_0/audios'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'skins/skin_0/textures'))
        this.refresh(info.destPath)
    },

    createSkin(a, b) {
        var info = b[0]
        if (path.basename(info.srcPath) !== "New Folder") return
        if (info.type !== "folder") return
        var dirname = path.dirname(info.destPath)
        var skinName = path.basename(dirname)
        if (skinName !== 'skins') {
            return
        }
        fileUtils.mkdirsSync(path.join(info.destPath, 'fonts'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'spines'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'audios'))
        fileUtils.mkdirsSync(path.join(info.destPath, 'textures'))
        this.refresh(info.destPath)
    },

    createTypescript(a, b) {
        var info = b[0]
        if (info.type !== "typescript") return
        var modulesPath = path.relative(path.join(fileUtils.getProjectPath(), "assets/resources"), info.destPath)
        var modulesName = modulesPath.split('/')[0]
        if (modulesName !== "mainModules" && modulesName !== "subModules") return

        var modulePath = path.relative(modulesName, modulesPath)
        var moduleName = modulePath.split('/')[0]

        if (path.extname(moduleName)) return

        var fileName = path.basename(info.destPath)
        var byte = fs.readFileSync(info.destPath, { encoding: 'utf8' })
        var reg = /class(.*)extends/g
        var replace = function () {
            if (reg.test(byte)) {
                byte = byte.replace(reg, `class ${path.parse(fileName).name} extends`)
            } else {
                byte = byte.replace("class NewClass extends", `class ${path.parse(fileName).name} extends`)
            }
        }
        var db = info.url
        if (path.parse(fileName).name == moduleName) {
            replace()
            Editor.assetdb.saveExists(db, byte)
            return
        }
        if (fileName.split('_')[0] !== moduleName) {
            fileName = `${moduleName}_${fileName}`
            db = path.dirname(info.url) + "/" + fileName
            replace()
            Editor.assetdb.move(info.url, db)
        } else {
            replace()
            Editor.assetdb.saveExists(db, byte)
        }
    },
    deletedModule(a, b) {
        var info = b[0]
        if (info.type !== "folder") return
        var dirname = path.dirname(info.path)
        var moduleName = path.basename(dirname)
        if (moduleName !== 'mainModules' && moduleName !== 'subModules') {
            return
        }
        localProfile.syncTemplateModules()
        // Editor.log("删除模块", info)
    },
    refresh(destPath, done) {
        var file = `db://${path.relative(fileUtils.getProjectPath(), destPath)}`
        if (Editor.assetdb.refresh) {
            return Editor.assetdb.refresh(file, done)
        } else {
            return Editor.assetdb.remote.refresh(file, done)
        }
    }
}   