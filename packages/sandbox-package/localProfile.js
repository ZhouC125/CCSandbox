const path = require('path')
const fileUtils = require('./fileUtils')
const languagesProfile = require('./languagesProfile')
const fs = require("fs-extra")
const modules = require('./modules')
const write = require('./sdk/write')

module.exports = {

    load() {
        var sandboxSetting = {
            localServerPath: "",
            // 公司配置
            companys: [],
            templates: {},
            currentCompany: "",
            currentTemplate: ""
        }

        var profile = Editor.Profile.load('profile://project/sandboxSetting.json')
        for (const key in sandboxSetting) {
            if (sandboxSetting.hasOwnProperty(key)) {
                const value = sandboxSetting[key];
                if (!profile.get(key)) {
                    profile.set(key, value)
                }
            }
        }
        return profile
    },
   
    save(profile) {
        for (const key in profile.data.templates) {
            if (profile.data.templates.hasOwnProperty(key)) {
                const template = profile.data.templates[key];
                for (const k in template) {
                    if (template.hasOwnProperty(k)) {
                        const info = template[k];
                        var isSubModule = path.join(modules.getSubModulesPath(), k)
                        template[k].isSubpackage = fs.existsSync(isSubModule)
                    }
                }
            }
        }
        profile.save()
        this.saveRuntime(profile)
        this.saveCompany(profile)
        this.saveBuilder(profile)
        this.saveLanguages(profile)
    },
    async saveLanguages(profile) {
        var languagesdb = "db://assets/resources/languages/"
        if (!Editor.assetdb.remote.exists(languagesdb)) {
            await this.create(languagesdb).catch(err => console.error(err))
        }
        if (!Editor.assetdb.remote.exists(`${languagesdb}Sprite.ts`)) {
            await this.create(`${languagesdb}Sprite.ts`, {}).catch(err => console.error(err))
        }
        if (!Editor.assetdb.remote.exists(`${languagesdb}Text.ts`)) {
            await this.create(`${languagesdb}Text.ts`, {}).catch(err => console.error(err))
        }
        if (!Editor.assetdb.remote.exists(`${languagesdb}Audio.ts`)) {
            await this.create(`${languagesdb}Audio.ts`, "").catch(err => console.error(err))
        }
        if (!Editor.assetdb.remote.exists(`${languagesdb}i18n.ts`)) {
            await this.create(`${languagesdb}i18n.ts`, "").catch(err => console.error(err))
        }
        // await this.refresh("languages")

        var language = languagesProfile.load()

        // 文本
        var textKeyValueMap = language.data.textKeyValueMap[profile.data.currentLanguageTemplage]
        var script = this.createLanguages(textKeyValueMap, "Text")
        var target = `${languagesdb}Text.ts`
        await this.saveExists(target, script.join('\n')).catch(err => console.error(err))

        // 精灵
        var spriteKeyValueMap = language.data.spriteKeyValueMap[profile.data.currentLanguageTemplage]
        var script = this.createLanguages(spriteKeyValueMap, "Sprite")
        var target = `${languagesdb}Sprite.ts`
        await this.saveExists(target, script.join('\n')).catch(err => console.error(err))

        // 音效
        var audioKeyValueMap = language.data.audioKeyValueMap[profile.data.currentLanguageTemplage]
        var script = this.createLanguages(audioKeyValueMap, "Audio")
        var target = `${languagesdb}Audio.ts`
        await this.saveExists(target, script.join('\n')).catch(err => console.error(err))



        var i18n = []

        i18n.push(`import Notify from '../fromework/cores/Notify'`)
        i18n.push(`export enum Languages {`)
        i18n = i18n.concat(this.getLanguages(language))
        i18n.push(`}`)

        i18n.push(`export class i18n {`)
        i18n.push(`\tprivate static _language: Languages = Languages.zh_cn`)
        i18n.push(`\tpublic static get language() { return this._language }`)
        i18n.push(`\tpublic static set language(value: Languages) {`)
        i18n.push(`\t\tif (this._language === value) return`)
        i18n.push(`\t\tthis._language = value`)
        i18n.push(`\t\tNotify.instance.emit("__i18n__", 'refresh')`)
        i18n.push("\t}")

        // Text
        i18n.push("\tpublic static readonly text = {")
        i18n = i18n.concat(this.getKeyValueString(textKeyValueMap))
        i18n.push("\t}")
        // Sprite
        i18n.push("\tpublic static readonly sprite = {")
        i18n = i18n.concat(this.getKeyValueString(spriteKeyValueMap))
        i18n.push("\t}")
        // Audio
        i18n.push("\tpublic static readonly audio = {")
        i18n = i18n.concat(this.getKeyValueString(audioKeyValueMap))
        i18n.push("\t}")

        i18n.push(`}`)

        await this.saveExists(`${languagesdb}i18n.ts`, i18n.join('\n')).catch(err => console.error(err))
    },
    createLanguages(keyValueMap, scriptName) {
        var script = []
        script.push(`export default class ${scriptName}{`)
        for (const key in keyValueMap) {
            if (keyValueMap.hasOwnProperty(key)) {
                const value = keyValueMap[key];
                script.push(`\t/** ${value.note} */`)
                script.push(`\tpublic static readonly ${key} = {`)
                for (const k in value) {
                    if (value.hasOwnProperty(k)) {
                        const v = value[k];
                        if (k == 'note') continue
                        script.push(`\t\t${k}:'${v}',`)
                    }
                }
                script.push(`\t}`)
            }
        }
        script.push(`}`)
        return script
    },
    getKeyValueString(keyValueMap) {
        var script = []
        for (const key in keyValueMap) {
            if (keyValueMap.hasOwnProperty(key)) {
                const value = keyValueMap[key];
                script.push(`\t\t/** ${value.note} */`)
                script.push(`\t\t${key}:"${key}",`)
            }
        }
        return script
    },
    getLanguages(language) {
        var script = []
        for (let i = 0; i < language.data.languages.length; i++) {
            const value = language.data.languages[i];
            script.push(`\t${value} = "${value}",`)
        }
        return script
    },
    saveRuntime(profile) {
        var runtime = {
            template: profile.get('currentTemplate'),
            modules: {},
        }
        var templates = profile.get('templates')
        var template = templates[profile.get('currentTemplate')]
        if (template) {
            for (const key in template) {
                if (template.hasOwnProperty(key)) {
                    const info = template[key];
                    if (!runtime.modules[key]) {
                        runtime.modules[key] = {}
                    }
                    runtime.modules[key].isSubpackage = info.isSubpackage
                    runtime.modules[key].layout = info.layout
                    runtime.modules[key].skin = info.skin
                }
            }
        }
        console.log("保存配置", runtime)
        var target = path.join(fileUtils.getProjectPath(), 'assets/resources/runtime.json')
        fs.writeJSONSync(target, runtime, { spaces: "  " })
        return this.refresh("runtime.json")
    },
    saveCompany(profile) {
        if (!profile.data.currentCompany) return
        var package = {}
        var company = profile.data.companys[profile.data.currentCompany]
        if (company) {
            package.id = company.id
            package.name = company.name
            package.template = company.template
            package.package = company.currentPackage

        }
        if (company.packages[company.currentPackage]) {
            var configurations = company.packages[company.currentPackage].configurations[company.packages[company.currentPackage].developmentModel]
            package.developmentModel = company.packages[company.currentPackage].developmentModel
            if (configurations) {
                package.serverHost = configurations.serverHost
                package.hotUpdateUrl = configurations.hotUpdateUrl
            }
            package.appid = company.packages[company.currentPackage].appid
            package.appsecret = company.packages[company.currentPackage].appsecret
        }
        var target = path.join(fileUtils.getProjectPath(), 'assets/resources/company.json')
        fs.writeJSONSync(target, package, { spaces: "  " })
        return this.refresh("company.json")
    },
    removeCompany() {
        var target = path.join(fileUtils.getProjectPath(), 'assets/resources/company.json')
        if (fs.existsSync(target)) {
            fs.removeSync(target)
        }
        return this.refresh("company.json")
    },

    saveBuilder(profile) {
        var builder = Editor.Profile.load('profile://project/builder.json')
        var company = profile.data.companys[profile.data.currentCompany]
        if (!company) return
        builder.data.android.packageName = company.currentPackage
        builder.data.ios.packageName = company.currentPackage
        if (company.packages[company.currentPackage]) {
            builder.data.title = company.packages[company.currentPackage].fileName
        }
        builder.save()
    },

    delete(db) {
        return new Promise((resolve, reject) => {
            if (Editor.assetdb.delete) {
                Editor.assetdb.delete(db, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            } else {
                Editor.assetdb.remote.delete(db, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()

                })
            }
        })
    },
    create(db, data) {
        return new Promise((resolve, reject) => {
            if (Editor.assetdb.create) {
                Editor.assetdb.create(db, data, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            } else {
                Editor.assetdb.remote.create(db, data, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            }
        })
    },
    saveExists(db, data) {
        return new Promise((resolve, reject) => {
            if (Editor.assetdb.saveExists) {
                Editor.assetdb.saveExists(db, data, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            } else {
                Editor.assetdb.remote.saveExists(db, data, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            }
        })
    },
    refresh(file) {
        return new Promise((resolve, reject) => {
            var db = "db://assets/resources"
            if (file) {
                db += "/" + file
            }
            if (Editor.assetdb.refresh) {
                Editor.assetdb.refresh(db, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            } else {
                Editor.assetdb.remote.refresh(db, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            }
        })

    },

    syncTemplateModules() {
        var profile = this.load()
        var mods = modules.getModules()
        //不够补上
        for (const key in profile.data.templates) {
            if (profile.data.templates.hasOwnProperty(key)) {
                const template = profile.data.templates[key];
                for (let i = 0; i < mods.length; i++) {
                    const mod = mods[i];
                    if (!template[mod]) {
                        template[mod] = {
                            layout: "layout_0",
                            skin: "skin_0",
                        }
                    }
                }
            }
        }
        // 多余的删除
        for (const key in profile.data.templates) {
            if (profile.data.templates.hasOwnProperty(key)) {
                const template = profile.data.templates[key];
                for (const k in template) {
                    if (template.hasOwnProperty(k)) {
                        if (!mods.includes(k)) {
                            delete template[k]
                        }
                    }
                }
            }
        }
        this.save(profile)
    },
    /**
     * 当前包名
     */
    currentPackage(profile) {
        var currentCompany = this.currentCompany(profile)
        return currentCompany ? currentCompany.currentPackage : ""
    },
    /**
     * 当前公司
     */
    currentCompany(profile) {
        var companys = profile.get('companys')
        if (!companys) return null
        var currentCompany = profile.get('currentCompany')
        if (!companys[currentCompany]) return null
        return companys[currentCompany]
    }

}