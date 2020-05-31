
import Utils from "../tools/Utils"
import Facade from "../cores/Facade"
import Update, { HotUpdateProgressEvent } from "../cores/Update"
import Runtime from "./Runtime"
type UpdateQueue = {
    [name: string]: UpdateTask
}
type ProgressEventCallback = (event: HotUpdateProgressEvent) => void
class UpdateTask {
    name: string
    isInstalling: boolean = false
    hotUpdate: Update = null
    isStartup: boolean = false
    constructor(name: string) {
        this.name = name
    }
    /**
     * 检查更新
     */
    public async checkUpdate(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            // 如果已经启动 跳过检查
            if (this.isStartup) return resolve(false)
            // 如果未安装 需要更新
            if (!this.isInstalled) return resolve(true)
            // 创建一个更新任务
            this.hotUpdate = new Update(this.name)
            this.hotUpdate.checkUpdate().then(async (isUpdate) => {
                if (!isUpdate) {
                    // 如果不需要热更新 直接启动
                    await this.startup()
                }
                resolve(isUpdate)
            }).catch(reject)
        })
    }
    /**
     * 安装模块
     */
    public async install(progressEvent?: ProgressEventCallback): Promise<any> {
        return new Promise(async (resolve, reject) => {
            // 如果已经启动 则说明已经安装成功了
            if (this.isStartup) return resolve(false)
            // 创建一个更新任务
            this.hotUpdate = new Update(this.name)
            if (this.isInstalled) {
                // 已安装 走热更新流程
                this.hotUpdate.startUpdate(progressEvent).then((isRestart) => {
                    this.startup().then(() => {
                        resolve(isRestart)
                    }).catch(reject)
                }).catch(reject)
            } else {
                // 未安装 走安装流程
                this.hotUpdate.install(progressEvent).then(() => {
                    this.startup().then(resolve).catch(reject)
                }).catch(reject)
            }
        })
    }
    public startup(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.name || this.isStartup) {
                resolve()
                return
            }
            if (CC_PREVIEW || !Runtime.instance.isSubpackage(this.name)) {
                Facade.getModule(this.name)
                this.isStartup = true
                resolve(true)
            } else {
                cc.loader.downloader.loadSubpackage(this.name, (err) => {
                    if (err) {
                        cc.error(err)
                        return reject()
                    }
                    Facade.getModule(this.name)
                    this.isStartup = true
                    resolve(true)
                })
            }
        })
    }
   
    /**是否以安装 */
    public get isInstalled(): boolean {
        // 不是热更新环境
        if (!Utils.isHotUpdate) return true
        // 框架
        if (!this.name) return true
        // 不是子包
        if (!Runtime.instance.isSubpackage(this.name)) return true
        // 是子包 判断入口是否存在
        var modulePath: string = cc.path.join(jsb.fileUtils.getWritablePath(), "remote-assets/subpackages", this.name, "index.js")
        return jsb.fileUtils.isFileExist(modulePath)
    }

}
export default class ModuleUpdate {
    private static _instance: ModuleUpdate = null
    public static get instance(): ModuleUpdate {
        if (this._instance === null) this._instance = new ModuleUpdate()
        return this._instance
    }
    private updateQueue: UpdateQueue = {}
    /**
     * 安装一个模块
     * @param name 模块名 如果为null 则更新框架
     */
    public getTask(name?: string): UpdateTask {
        if (!this.updateQueue[name]) {
            var task = new UpdateTask(name)
            this.updateQueue[name] = task
        }
        return this.updateQueue[name]
    }
}