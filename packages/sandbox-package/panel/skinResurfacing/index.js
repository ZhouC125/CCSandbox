const fs = require("fs-extra")
const localProfile = require(Editor.url("packages://sandbox-package/localProfile.js"))
const modules = require(Editor.url("packages://sandbox-package/modules.js"))
Editor.Panel.extend({
    style: fs.readFileSync(Editor.url("packages://sandbox-package/panel/skinResurfacing/index.css"), "utf-8"),
    template: fs.readFileSync(Editor.url("packages://sandbox-package/panel/skinResurfacing/index.html"), "utf-8"),
    async ready() {
        this.profile = localProfile.load()
        this.vue = new window.Vue({
            el: this.shadowRoot,
            methods: {
                onCreateTemplate: this.onCreateTemplate.bind(this),
                onSave: this.onSave.bind(this),
            },
        });
        this.checkTemplateModules()
        this.vue.$data = {
            setting: this.profile.data,
            isCreateTemplate: 0,
            templateName: "",
            modules: this.collectModules(),
            errMsg: "",
            showLoader: false,
            loadMsg: ""
        }
        localProfile.save(this.profile)
    },




    /**
     * 创建模版
     */
    onCreateTemplate(event) {
        if (this.vue.$data.templateName == '') {
            return this.vue.$data.errMsg = "请输入模版名称！"
        }
        if (!this.profile.data.templates) {
            this.profile.data.templates = {}
        }
        if (this.profile.data.templates[this.vue.$data.templateName]) {
            return this.vue.$data.errMsg = "模版名称重复！"
        }
        this.profile.data.templates[this.vue.$data.templateName] = {}
        this.checkTemplateModules()
        this.vue.$data.isCreateTemplate = 0
        this.vue.$data.errMsg = ""
        localProfile.save(this.profile)
    },
    checkTemplateModules() {
        var mods = modules.getModules()
        //不够补上
        for (const key in this.profile.data.templates) {
            if (this.profile.data.templates.hasOwnProperty(key)) {
                const template = this.profile.data.templates[key];
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
        for (const key in this.profile.data.templates) {
            if (this.profile.data.templates.hasOwnProperty(key)) {
                const template = this.profile.data.templates[key];
                for (const k in template) {
                    if (template.hasOwnProperty(k)) {
                        if (!mods.includes(k)) {
                            delete template[k]
                        }
                    }
                }
            }
        }
    },
    collectModules() {
        var mods = modules.getModules()
        var result = {}
        for (let i = 0; i < mods.length; i++) {
            const mod = mods[i];
            result[mod] = {}
            var layouts = modules.getLayouts(mod)
            for (let j = 0; j < layouts.length; j++) {
                const layout = layouts[j];
                const skins = modules.getSkins(mod, layout)
                result[mod][layout.replace(/\./g, "")] = []
                for (let l = 0; l < skins.length; l++) {
                    const skin = skins[l].replace(/\./g, "");
                    result[mod][layout.replace(/\./g, "")].push(skin)
                }
            }
        }
        return result
    },
    onSave(event) {
        // this.vue.$data.showLoader = true
        localProfile.save(this.profile)

        // resurfacing.start(this.profile, (msg) => {
        //     this.vue.$data.loadMsg = msg
        // }).then(() => {
        //     this.vue.$data.showLoader = false
        //     // this.profile.save()
        //     localProfile.save(this.profile)
        // }).catch((err) => {
        //     if (err instanceof Array) {
        //         for (let i = 0; i < err.length; i++) {
        //             const e = err[i];
        //             Editor.error(e)
        //         }
        //     } else {
        //         Editor.error(err)
        //     }
        //     this.vue.$data.showLoader = false
        // })
    },
})