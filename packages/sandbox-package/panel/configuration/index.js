const fs = require("fs-extra")
const path = require('path')
const localProfile = require(Editor.url("packages://sandbox-package/localProfile.js"))
const languages = require(Editor.url("packages://sandbox-package/languagesProfile.js"))

const fileUtils = require(Editor.url("packages://sandbox-package/fileUtils.js"))
Editor.Panel.extend({
    style: fs.readFileSync(Editor.url("packages://sandbox-package/panel/configuration/index.css"), "utf-8"),
    template: fs.readFileSync(Editor.url("packages://sandbox-package/panel/configuration/index.html"), "utf-8"),

    async ready() {
        this.profile = localProfile.load()
        this.vue = new window.Vue({
            el: this.shadowRoot,
            methods: {
                onGetCompanys: this.onGetCompanys.bind(this),
                onGetCurrentCompany: this.onGetCurrentCompany.bind(this),
                onGetCompany: this.onGetCompany.bind(this),
                onGetCompanyID: this.onGetCompanyID.bind(this),
                onGetTemplates: this.onGetTemplates.bind(this),
                onGetCompanyTemplate: this.onGetCompanyTemplate.bind(this),
                onGetCurrentPackage: this.onGetCurrentPackage.bind(this),
                onGetPackages: this.onGetPackages.bind(this),
                onGetAppName: this.onGetAppName.bind(this),
                onGetFileName: this.onGetFileName.bind(this),
                onGetDevelopmentModel: this.onGetDevelopmentModel.bind(this),
                onGetHotUpdateUrl: this.onGetHotUpdateUrl.bind(this),
                onGetServerHost: this.onGetServerHost.bind(this),
                onGetIcon: this.onGetIcon.bind(this),
                onGetAppID: this.onGetAppID.bind(this),
                onGetLaunch: this.onGetLaunch.bind(this),
                onGetAppSecret: this.onGetAppSecret.bind(this),
                onGetLanguageTemplate: this.onGetLanguageTemplate.bind(this),
                onGetLanguageTemplates: this.onGetLanguageTemplates.bind(this),
                onChangeLanguageTemplate: this.onChangeLanguageTemplate.bind(this),


                onChangeAppSecret: this.onChangeAppSecret.bind(this),
                onChangeAppID: this.onChangeAppID.bind(this),
                onChangeHotUpdateUrl: this.onChangeHotUpdateUrl.bind(this),
                onChangeServerHost: this.onChangeServerHost.bind(this),
                onChangePackage: this.onChangePackage.bind(this),
                onChangeDevelopmentModel: this.onChangeDevelopmentModel.bind(this),
                onChangeCompanyTemplate: this.onChangeCompanyTemplate.bind(this),

                onChangePlatform: this.onChangePlatform.bind(this),
                onChangeFileName: this.onChangeFileName.bind(this),
                onChangeAppName: this.onChangeAppName.bind(this),
                onChangeCompany: this.onChangeCompany.bind(this),
                onEditorCompany: this.onEditorCompany.bind(this),
                onCreateCompany: this.onCreateCompany.bind(this),
                onEditorPackage: this.onEditorPackage.bind(this),
                onCreatePackage: this.onCreatePackage.bind(this),
                getLocalServerPath: this.getLocalServerPath.bind(this),
                onOpenFileToLocalServerPath: this.onOpenFileToLocalServerPath.bind(this),
                onOpenLocalServerPath: this.onOpenLocalServerPath.bind(this),

                onSave: this.onSave.bind(this),
            }
        });
        this.vue.$data = {
            showLoader: false,
            show: true,
            editorCompanyName: "",
            editorCompanyID: "",
            editorCompanyError: "",
            editorCompanyError: "",
            editorPackageError: "",
            editorPackageName: "",
            isCreateCompanying: false,
            isCreatePackageing: false,
            platform: 'android'
        }
        console.log(this.profile.data)
    },
    onGetCompanys() {
        return this.profile.data.companys
    },
    onGetCurrentCompany() {
        return this.profile.data.currentCompany
    },
    onGetCompany() {
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        return company
    },
    onGetCompanyID() {
        if (this.profile.data.companys.length == 0) return ""
        return this.onGetCompany().id
    },
    onGetCompanyTemplate() {
        if (this.profile.data.companys.length == 0) return ""
        return this.onGetCompany().template
    },
    onGetTemplates() {
        return this.profile.data.templates || []
    },
    onGetPackages() {
        if (this.profile.data.companys.length == 0) return []
        return this.onGetCompany().packages
    },
    onGetCurrentPackage() {
        if (this.profile.data.companys.length == 0) return ""
        return this.onGetCompany().currentPackage
    },
    onGetPackage() {
        if (this.profile.data.companys.length == 0) return undefined
        var company = this.onGetCompany()
        return company.packages[company.currentPackage]
    },
    onGetAppName() {
        if (this.profile.data.companys.length == 0) return ""
        var mpackage = this.onGetPackage()
        return mpackage ? mpackage.appName : ""
    },
    onGetFileName() {
        if (this.profile.data.companys.length == 0) return ""
        var mpackage = this.onGetPackage()
        return mpackage ? mpackage.fileName : ""
    },
    onGetDevelopmentModel() {
        if (this.profile.data.companys.length == 0) return ""
        var mpackage = this.onGetPackage()
        return mpackage.developmentModel || ""
    },
    onGetHotUpdateUrl() {
        if (this.profile.data.companys.length == 0) return ""
        var mpackage = this.onGetPackage()
        return mpackage.configurations[mpackage.developmentModel].hotUpdateUrl
    },
    onGetServerHost() {
        if (this.profile.data.companys.length == 0) return ""
        var mpackage = this.onGetPackage()
        return mpackage.configurations[mpackage.developmentModel].serverHost
    },
    onGetIcon() {
        if (this.profile.data.companys.length == 0) return ""
        var company = this.onGetCompany()
        var iconPath = path.join(
            fileUtils.getProjectPath(),
            "build-bundle/sdk",
            this.vue.$data.platform,
            "res",
            company.id,
            company.currentPackage,
            this.vue.$data.platform === "android" ? "mipmap-xxhdpi/ic_launcher.png" : "AppIcon.appiconset/icon-512.png"
        )
        return iconPath
    },
    onGetAppID() {
        if (this.profile.data.companys.length == 0) return ""
        var mpackage = this.onGetPackage()
        return mpackage.appid
    },
    onGetAppSecret() {
        if (this.profile.data.companys.length == 0) return ""
        var mpackage = this.onGetPackage()
        return mpackage.appsecret
    },
    onGetLaunch() {
        if (this.profile.data.companys.length == 0) return ""
        var company = this.onGetCompany()
        var launchPath = path.join(
            fileUtils.getProjectPath(),
            "build-bundle/sdk",
            this.vue.$data.platform,
            "res",
            company.id,
            company.currentPackage,
            this.vue.$data.platform === "android" ? "drawable/splash.png" : "LaunchImage.launchimage/LaunchImage-2688-1242@3x.png"
        )
        return launchPath
    },

    onGetLanguageTemplate() {
        return this.profile.data.currentLanguageTemplage || ""
    },
    onGetLanguageTemplates() {
        var profile = languages.load()
        return profile.data.templates
    },
    onChangeLanguageTemplate(event) {
        this.profile.data.currentLanguageTemplage = event.detail.value
        this.profile.save()
    },

    onChangeAppSecret() {
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        var mpackage = company.packages[company.currentPackage]
        mpackage.appsecret = event.detail.value
        this.profile.save()
    },
    onChangeAppID() {
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        var mpackage = company.packages[company.currentPackage]
        mpackage.appid = event.detail.value
        this.profile.save()
    },
    onChangeHotUpdateUrl(event) {
        if (this.profile.data.companys.length == 0) return ""
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        var mpackage = company.packages[company.currentPackage]
        mpackage.configurations[mpackage.developmentModel].hotUpdateUrl = event.detail.value
        this.profile.save()
    },
    onChangeServerHost(event) {
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        var mpackage = company.packages[company.currentPackage]
        mpackage.configurations[mpackage.developmentModel].serverHost = event.detail.value
        this.profile.save()
    },
    onChangeDevelopmentModel(event) {
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        var mpackage = company.packages[company.currentPackage]
        mpackage.developmentModel = event.detail.value
        this.profile.save()
        this.refresh()
    },
    onChangePackage(event) {
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        company.currentPackage = event.detail.value
        this.profile.save()
        this.refresh()
    },
    onChangeCompanyTemplate(event) {
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        company.template = event.detail.value
        this.profile.save()
        this.refresh()
    },
    onChangeCompany(event) {
        this.profile.data.currentCompany = event.detail.value
        this.profile.save()
        this.refresh()
    },
    onChangeFileName(event) {
        if (!event.detail.value) {
            return
        }
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        company.packages[company.currentPackage].fileName = event.detail.value
        this.profile.save()
    },
    onChangeAppName(event) {
        if (!event.detail.value) {
            return
        }
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        company.packages[company.currentPackage].appName = event.detail.value
        this.profile.save()
    },
    onEditorCompany() {
        this.vue.$data.editorCompanyError = ""
        this.vue.$data.editorCompanyName = ""
        this.vue.$data.editorCompanyID = ""
        this.vue.$data.isCreateCompanying = true
    },
    onCreateCompany(isCreate) {
        if (!isCreate) {
            return this.vue.$data.isCreateCompanying = false
        }
        if (!this.vue.$data.editorCompanyName) {
            return this.vue.$data.editorCompanyError = "请输入公司名称"
        }
        if (!this.vue.$data.editorCompanyID) {
            return this.vue.$data.editorCompanyError = "请输入公司ID"
        }
        for (let i = 0; i < this.profile.data.companys.length; i++) {
            const company = this.profile.data.companys[i];
            if (company.id == this.vue.$data.editorCompanyID) {
                return this.vue.$data.editorCompanyError = "公司ID重复"
            }
        }
        this.profile.data.companys.push({
            id: this.vue.$data.editorCompanyID,
            name: this.vue.$data.editorCompanyName,
            packages: {}
        })
        this.vue.$data.isCreateCompanying = false
        if (!this.profile.data.currentCompany) {
            this.profile.data.currentCompany = "0"
        }
        this.profile.save()
        this.refresh()
    },

    onEditorPackage() {
        this.vue.$data.editorPackageError = ""
        this.vue.$data.editorPackageName = ""
        this.vue.$data.isCreatePackageing = true
    },
    onCreatePackage(isCreate) {
        if (!isCreate) {
            return this.vue.$data.isCreatePackageing = false
        }
        if (!this.vue.$data.editorPackageName) {
            return this.vue.$data.editorPackageError = "请输入包名"
        }
        var company = this.profile.data.companys[this.profile.data.currentCompany]
        if (company.packages[this.vue.$data.editorPackageName]) {
            return this.vue.$data.editorPackageError = "包名不能重复！"
        }
        var configurations = [
            {
                hotUpdateUrl: "",
                serverHost: "",
            },
            {
                hotUpdateUrl: "",
                serverHost: "",
            }
        ]
        var icons = {
            android: {},
            ios: {},
        }
        company.packages[this.vue.$data.editorPackageName] = {
            configurations: configurations,
            icons: icons,
            launch: {},
        }
        this.vue.$data.isCreatePackageing = false
        this.profile.save()
        this.refresh()
    },

    onChangePlatform(type) {
        this.vue.$data.platform = type
    },

    onOpenFileToLocalServerPath() {
        let res = Editor.Dialog.openFile({
            defaultPath: fileUtils.getProjectPath(),
            properties: ['openDirectory'],
        })
        if (res !== -1) {
            // this.profile.data.localServerPath = res[0].replace(fileUtils.getProjectPath(), "")
            this.profile.data.localServerPath = res[0]
            this.profile.save()
            this.refresh()
        }
    },
    onOpenLocalServerPath() {
        location.href = 'file://' + this.getLocalServerPath()
    },
    getLocalServerPath() {
        return path.join(this.profile.data.localServerPath)
    },
    refresh() {
        this.vue.$data.show = false
        setTimeout(() => {
            this.vue.$data.show = true
        }, 1)
    },
    async onSave(event) {
        this.vue.$data.showLoader = true
        localProfile.save(this.profile)
        setTimeout(() => {
            this.vue.$data.showLoader = false
            Editor.success("保存成功")
        }, 100)
    },
});