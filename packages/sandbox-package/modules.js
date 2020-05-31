const fileUtils = require('./fileUtils')
const path = require('path')
const fs = require("fs-extra")

module.exports = {
   
    getMainModulesName() {
        return "mainModules"
    },
    getSubModulesName() {
        return "subModules"
    },
    getMainModulesPath() {
        return path.join(fileUtils.getProjectPath(), 'assets/resources', this.getMainModulesName())
    },
    getSubModulesPath() {
        return path.join(fileUtils.getProjectPath(), 'assets/resources', this.getSubModulesName())
    },
    getModulePath(mod) {
        var modPath = path.join(this.getMainModulesPath(), mod)
        if (fs.existsSync(modPath)) {
            return modPath
        } else {
            modPath = path.join(this.getSubModulesPath(), mod)
            return modPath
        }
    },
    getLayoutPath(mod, layout) {
        return path.join(this.getModulePath(mod), 'layouts', layout)
    },
    getSkinPath(mod, layout, skin) {
        return path.join(this.getLayoutPath(mod, layout), 'skins', skin)
    },

    getModules(isFullPath) {
        if (!isFullPath) {
            var modules = fileUtils.getFolderNames(this.getMainModulesPath())
            return modules.concat(fileUtils.getFolderNames(this.getSubModulesPath()))
        } else {
            var modules = fileUtils.getFolderNames(this.getMainModulesPath())
            var result = []
            for (let i = 0; i < modules.length; i++) {
                const mod = modules[i];
                result.push(path.join(this.getMainModulesPath(), mod))
            }
            modules = fileUtils.getFolderNames(this.getSubModulesPath())
            for (let i = 0; i < modules.length; i++) {
                const mod = modules[i];
                result.push(path.join(this.getSubModulesPath(), mod))
            }
            return result
        }

    },
    getLayouts(module) {
        var layouts = fileUtils.getFolderNames(path.join(this.getMainModulesPath(), module, "layouts"))
        layouts = layouts.concat(fileUtils.getFolderNames(path.join(this.getSubModulesPath(), module, "layouts")))
        return layouts
    },
    getSkins(module, layout) {
        var skins = fileUtils.getFolderNames(path.join(this.getMainModulesPath(), module, "layouts", layout, "skins"))
        skins = skins.concat(fileUtils.getFolderNames(path.join(this.getSubModulesPath(), module, "layouts", layout, "skins")))
        return skins
    },
    async getModulesFullPath() {
        var mods = await fileUtils.getFoldersFullPath(this.getMainModulesPath())
        mods.concat(await fileUtils.getFoldersFullPath(this.getSubModulesPath()))
        return mods
    }
}