
import Utils from "../tools/Utils"
export default class Company {
    private company: any = null
    private static _instance: Company = null
    public static get instance(): Company {
        if (this._instance === null) {
            this._instance = new Company()
        }
        return this._instance
    }
    public get id(): string {
        return this.company ? this.company.id : ""
    }
    public get name(): string {
        return this.company ? this.company.name : ""
    }
    public get template(): string {
        return this.company ? this.company.template : ""
    }
    public get serverHost(): string {
        return this.company ? this.company.serverHost : ""
    }
    public get hotUpdateUrl(): string {
        return this.company ? this.company.hotUpdateUrl : ""
    }
    public set hotUpdateUrl(value: string) {
        if (!this.company) return
        this.company.hotUpdateUrl = value
    }

    public get developmentModel(): string {
        return this.company ? this.company.developmentModel : "0"
    }
    public get package(): string {
        return this.company ? this.company.package : ""
    }
    public get app_id(): string {
        return this.company ? this.company.appid : ""
    }
    public get app_secret(): string {
        return this.company ? this.company.appsecret : ""
    }
    public async load(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!Utils.isHotUpdate) {
                cc.loader.loadRes("company", cc.Asset, (err, res) => {
                    if (err) {
                        return reject(err)
                    } else {
                        this.company = res.json
                        return resolve(this.company)
                    }
                })
            } else {
                this.loadLocal().then(resolve).catch(reject)
            }
        })
    }
    /**
     * 加载原始runtime
     */
    private loadLocal(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.company == null) {
                var company_path = "./res/company.json"

                if (!jsb.fileUtils.isFileExist(company_path)) {
                    return reject(`找不到原始 ${company_path} 配置文件`)
                }
                var str = jsb.fileUtils.getStringFromFile(company_path)
                this.company = JSON.parse(str)
                resolve(this.company)
            } else {
                resolve(this.company)
            }
        })
    }
}