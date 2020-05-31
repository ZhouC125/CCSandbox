const fs = require("fs-extra")
const path = require("path")
const localProfile = require(Editor.url("packages://sandbox-package/localProfile.js"))
const languages = require(Editor.url("packages://sandbox-package/languagesProfile.js"))
const modules = require(Editor.url("packages://sandbox-package/modules.js"))
Editor.Panel.extend({
    style: fs.readFileSync(Editor.url("packages://sandbox-package/panel/languages/index.css"), "utf-8"),
    template: fs.readFileSync(Editor.url("packages://sandbox-package/panel/languages/index.html"), "utf-8"),
    async ready() {
        this.profile = languages.load()
        this.vue = new window.Vue({
            el: this.shadowRoot,
            methods: {
                onCreateTemplage: this.onCreateTemplage.bind(this),
                onChangeTemplate: this.onChangeTemplate.bind(this),
                onCreateLanguage: this.onCreateLanguage.bind(this),
                onShowKeyInfos: this.onShowKeyInfos.bind(this),
                onShowKeyInfo: this.onShowKeyInfo.bind(this),
                onKeyInfos: this.onKeyInfos.bind(this),
                onChangeLangValue: this.onChangeLangValue.bind(this),
                isKeyValueOk: this.isKeyValueOk.bind(this),


                getTextKeyValueMap: this.getTextKeyValueMap.bind(this),
                getSpriteKeyValueMap: this.getSpriteKeyValueMap.bind(this),
                getAudioKeyValueMap: this.getAudioKeyValueMap.bind(this),

                onCreateTextKey: this.onCreateTextKey.bind(this),
                onCreateSpriteKey: this.onCreateSpriteKey.bind(this),
                onCreateAudioKey: this.onCreateAudioKey.bind(this),

                onDeleteText: this.onDeleteText.bind(this),
                onDeleteSprite: this.onDeleteSprite.bind(this),
                onDeleteAudio: this.onDeleteAudio.bind(this),
            },
        });
        this.vue.$data = {
            show: true,
            showState: true,
            isDelete: false,
            setting: this.profile.data,
            isCreateTemplage: false,
            isCreateLanguage: false,
            createTemplageInput: "",
            createLanguateInput: "",
            createKeyInput: "",
            keyInfos: [],

            isCreateTextKey: false,
            isCreateSpriteKey: false,
            isCreateAudioKey: false,
        }
        console.error(this.profile.data)
        // localProfile.save(this.profile)
    },
    onCreateTemplage(event) {
        if (!event) {
            return alert('创建模板失败 - 名称不能为空')
        }
        if (this.profile.data.templates.includes(event)) {
            return alert('创建模板失败 - 名称已存在')
        }
        this.profile.data.templates.push(event)
        this.vue.$data.createTemplageInput = ""
        this.vue.$data.isCreateTemplage = false
        this.profile.save()
        this.refresh()
    },
    onChangeTemplate(event) {
        this.profile.save()
    },
    onCreateLanguage(event) {
        if (!event) {
            return alert('创建语言失败 - 名称不能为空')
        }
        if (this.profile.data.languages.includes(event)) {
            return alert('创建语言失败 - 名称已存在')
        }
        this.profile.data.languages.push(event)
        this.vue.$data.createLanguateInput = ""
        this.vue.$data.isCreateLanguage = false
        this.profile.save()
        this.refresh()
    },
    onCreateTextKey(event) {
        if (!event) {
            this.vue.$data.isCreateTextKey = false
            this.vue.$data.isDelete = false
            return
        }
        var template = this.getTextKeyValueMap()

        this.createKeyHandler(template, event)
        this.vue.$data.isCreateTextKey = false
        this.vue.$data.isDelete = false
        this.profile.save()
        this.refresh()
    },
    onCreateSpriteKey(event) {
        if (!event) {
            this.vue.$data.isCreateSpriteKey = false
            this.vue.$data.isDelete = false
            return
        }
        var template = this.getSpriteKeyValueMap()
        this.createKeyHandler(template, event, true)
        this.vue.$data.isCreateSpriteKey = false
        this.vue.$data.isDelete = false
        this.profile.save()
        this.refresh()
    },
    onCreateAudioKey(event) {
        if (!event) {
            this.vue.$data.isCreateAudioKey = false
            this.vue.$data.isDelete = false
            return
        }
        var template = this.getAudioKeyValueMap()
        this.createKeyHandler(template, event, true)
        this.vue.$data.isCreateAudioKey = false
        this.vue.$data.isDelete = false
        this.profile.save()
        this.refresh()
    },
    createKeyHandler(template, event, isModule) {
        try {
            var object = JSON.parse(event)
            for (let i = 0; i < object.length; i++) {
                const data = object[i];
                var key = Object.keys(data)[0]
                if (!template[key]) {
                    template[key] = {}
                }
                // 注释信息
                template[key].note = data[key].note || ""
                if (isModule) {
                    template[key].module = data[key].module || ""
                }
                for (const k in data[key]) {
                    if (data[key].hasOwnProperty(k)) {
                        const info = data[key][k];
                        if (k == 'note') continue
                        if (k == 'module') continue
                        template[key][k] = info
                        if (!this.profile.data.languages.includes(k)) {
                            this.profile.data.languages.push(k)
                        }
                    }
                }
            }
            // 同步所有key
            for (let i = 0; i < this.profile.data.languages.length; i++) {
                const key = this.profile.data.languages[i];
                for (const k in template) {
                    if (template.hasOwnProperty(k)) {
                        const v = template[k];
                        if (!v[key]) {
                            v[key] = ""
                        }
                    }
                }
            }
        } catch (err) {
            alert(err)
        }
    },
    /**
     * 获取文本键值对
     */
    getTextKeyValueMap() {
        if (!this.profile.data.textKeyValueMap[this.profile.data.currentTemplage]) {
            this.profile.data.textKeyValueMap[this.profile.data.currentTemplage] = {}
        }
        return this.profile.data.textKeyValueMap[this.profile.data.currentTemplage]
    },
    /**
     * 获取精灵键值对
     */
    getSpriteKeyValueMap() {
        if (!this.profile.data.spriteKeyValueMap[this.profile.data.currentTemplage]) {
            this.profile.data.spriteKeyValueMap[this.profile.data.currentTemplage] = {}
        }
        return this.profile.data.spriteKeyValueMap[this.profile.data.currentTemplage]
    },
    getAudioKeyValueMap() {
        if (!this.profile.data.audioKeyValueMap[this.profile.data.currentTemplage]) {
            this.profile.data.audioKeyValueMap[this.profile.data.currentTemplage] = {}
        }
        return this.profile.data.audioKeyValueMap[this.profile.data.currentTemplage]
    },

    /**
     * 展开所语言包
     */
    onShowKeyInfos() {
        if (this.vue.$data.keyInfos.length > 0) {
            return this.vue.$data.keyInfos = []
        }
        var textKeyValueMap = this.getTextKeyValueMap()
        for (const key in textKeyValueMap) {
            if (textKeyValueMap.hasOwnProperty(key)) {
                this.vue.$data.keyInfos.push(key)
            }
        }
        var spriteKeyValueMap = this.getSpriteKeyValueMap()
        for (const key in spriteKeyValueMap) {
            if (spriteKeyValueMap.hasOwnProperty(key)) {
                this.vue.$data.keyInfos.push(key)
            }
        }
    },
    /**
     * 删除文本key 或 语言文本
     */
    onDeleteText(key, langKey) {
        var keyValue = this.getTextKeyValueMap()
        this.deleteHandler(key, langKey, keyValue)
    },
    /**
     * 删除精灵key 或 语言精灵
     */
    onDeleteSprite(key, langKey) {
        var keyValue = this.getSpriteKeyValueMap()
        this.deleteHandler(key, langKey, keyValue)
    },
    /**
     * 删除音效key 或 语言精灵
     */
    onDeleteAudio(key, langKey) {
        var keyValue = this.getAudioKeyValueMap()
        this.deleteHandler(key, langKey, keyValue)
    },
    deleteHandler(key, langKey, keyValue) {
        if (key && langKey) {
            let code = Editor.remote.Dialog.messageBox({
                message: `是否确定删除 ${langKey} 语言？此操作会同步删除所有Key的${langKey}语言包`,
                buttons: ["取消", "确定"]
            });
            if (1 === code) {
                for (const k in keyValue) {
                    if (keyValue.hasOwnProperty(k)) {
                        const value = keyValue[k];
                        delete value[langKey]
                    }
                }
                var index = this.profile.data.languages.findIndex(item => item == langKey)
                if (index !== -1) {
                    this.profile.data.languages.splice(index, 1)
                }
                this.profile.save()
                this.refresh()
            }
        } else {
            let code = Editor.remote.Dialog.messageBox({
                message: `是否确定删除 ${key} ?`,
                buttons: ["取消", "确定"]
            });
            if (1 === code) {
                delete keyValue[key]
                this.profile.save()
                this.refresh()
            }
        }
    },
    onShowKeyInfo(key) {
        if (!this.vue.$data.keyInfos.includes(key)) {
            this.vue.$data.keyInfos.push(key)
        } else {
            var index = this.vue.$data.keyInfos.findIndex(item => item == key)
            this.vue.$data.keyInfos.splice(index, 1)
        }
    },
    onKeyInfos(key) {
        var textKeyValueMap = this.getTextKeyValueMap()
        return textKeyValueMap[key]
    },

    onChangeLangValue() {
        this.profile.save()
        this.vue.$data.showState = false
        setTimeout(() => this.vue.$data.showState = true, 1)
    },
    isKeyValueOk(value) {
        var ok = true
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                const v = value[key];
                if (!v) {
                    ok = false
                    break
                }
            }
        }
        return ok
    },
    refresh() {
        this.vue.$data.show = false
        setTimeout(() => {
            this.vue.$data.show = true
        }, 1)
    },
    trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "")
    }
})