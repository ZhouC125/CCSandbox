
export default class Runtime {
    private readonly DEFAULT_LAYOUT = "layout_0"
    private readonly DEFAULT_SKIN = "skin_0"
    private readonly DEFAULT_VERSION = "skin_0"
    private runtime: any = null
    private static _instance: Runtime = null
    public static get instance(): Runtime {
        if (this._instance === null) {
            this._instance = new Runtime()
        }
        return this._instance
    }
    public load(): Promise<any> {
        return new Promise((resolve, reject) => {

            if (!this.runtime) {
                cc.loader.loadRes("runtime", cc.JsonAsset, (err, res) => {
                    if (err) {
                        return reject(err)
                    } else {
                        this.runtime = res.json
                        resolve(this.runtime)
                    }
                })
            } else {
                resolve(this.runtime)
            }
        })
    }
    
    public get template(): string {
        if (this.runtime) {
            return this.runtime.template
        }
        return ""
    }

    // 获取模块配置
    public getModule(moduleName: string): any {
        if (!!this.runtime && !!this.runtime.modules[moduleName]) {
            return this.runtime.modules[moduleName]
        }
        return null
    }
    /**
     * 获取布局
     */
    public getLayout(moduleName: string): string {
        var mod = this.getModule(moduleName)
        return !!mod ? mod.layout : this.DEFAULT_LAYOUT
    }
    /**
     * 获取皮肤
     */
    public getSkin(moduleName: string): string {
        var mod = this.getModule(moduleName)
        return !!mod ? mod.skin : this.DEFAULT_SKIN
    }
    /**
     * 获取版本
     */
    public getVersion(moduleName: string): string {
        var mod = this.getModule(moduleName)
        return !!mod ? mod.version : this.DEFAULT_VERSION
    }
    /**
     * 是否是子包
     */
    public isSubpackage(moduleName: string): boolean {
        var mod = this.getModule(moduleName)
        return !!mod ? mod.isSubpackage : true
    }
}