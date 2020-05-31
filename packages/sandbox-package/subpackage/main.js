
const fileUtils = require('../fileUtils')
const modules = require('../modules')
module.exports = {


    start() {
        return new Promise(async (resolve, reject) => {
            await this.clearChildFolders(modules.getMainModulesPath())
            await this.clearChildFolders(modules.getSubModulesPath())
            await this.makeMainSubpackage()
            await this.makeSubSubpackage()
            Editor.success("-----------制作完成------------")
            resolve()
        })
    },
    async makeSubpackage(dbPath) {
        await this.setMeta(dbPath, true)
    },
    makeMainSubpackage() {
        return new Promise(async (resolve, reject) => {
            var mods = fileUtils.getFolderNames(modules.getMainModulesPath())
            for (let i = 0; i < mods.length; i++) {
                const mod = mods[i];
                var db = `db://assets/resources/${modules.getMainModulesName()}/${mod}`
                await this.setMeta(db, false)
                Editor.success(`设置主包: ${mod}`)
            }
            resolve()
        })
    },

    makeSubSubpackage() {
        return new Promise(async (resolve, reject) => {
            var mods = fileUtils.getFolderNames(modules.getSubModulesPath())
            for (let i = 0; i < mods.length; i++) {
                const mod = mods[i];
                var db = `db://assets/resources/${modules.getSubModulesName()}/${mod}`
                await this.setMeta(db, true)
                Editor.success(`设置子包: ${mod}`)
            }
            resolve()
        })
    },
    clearChildFolders(dir) {
        return new Promise(async (resolve, reject) => {
            var folders = await fileUtils.getAllFolders(dir).catch(err => Editor.error(err))
            for (let i = 0; i < folders.length; i++) {
                const folder = folders[i];
                const db = "db://" + folder.replace(fileUtils.getProjectPath() + "/", "")
                await this.setMeta(db, false)
                Editor.log(`重置成功：${db}`)
            }
            resolve()
        })

    },
    async setMeta(db, isSubpackage) {
        var results = await this.queryMetas(db).catch(err => Editor.error(err))
        for (const meta of results) {
            meta.isSubpackage = isSubpackage
            await this.saveMetas(meta.uuid, this.metaToJsonStr(meta)).catch(err => Editor.error(err))
        }
    },
    async queryMetas(dbPath) {
        return new Promise(function (res, rej) {
            Editor.assetdb.queryMetas(dbPath, "folder", async function (err, results) {
                if (err) {
                    rej(err)
                } else {
                    res(results)
                }
            })
        })
    },
    async saveMetas(uuid, metaStr) {
        return new Promise(function (res, rej) {
            Editor.assetdb.saveMeta(uuid, metaStr, async function (err, meta) {
                if (err) {
                    rej(err)
                } else {
                    res(meta)
                }
            })
        })
    },
    metaToJsonStr(meta) {
        var cache = [];
        return JSON.stringify(meta, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    return;
                }
                cache.push(value);
            }
            return value;
        });
    },
}