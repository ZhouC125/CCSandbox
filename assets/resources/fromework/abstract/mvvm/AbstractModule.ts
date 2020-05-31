import Notify from "../../cores/Notify";
import { AbstractViewModel } from "./AbstractViewModel";
import AbstractModel from "./AbstractModel";
import { SceneData } from "../Interface";
import SceneManager from "../../singles/SceneManager";
import Runtime from "../../singles/Runtime";
const { ccclass } = cc._decorator;
@ccclass
/**
 * 模块抽象类
 */
export default abstract class AbstractModule extends cc.Component {
    protected abstract clear(): void
    private readonly moduleName: string
    public readonly isDontDestroy: boolean
    public readonly notify: Notify
    public get name(): string { return this.moduleName }

    //持有实体models 和 viewModels(viewModel 用于view和model分离的中间层)
    private models: { [name: string]: AbstractModel } = {}
    private viewModels: { [name: string]: AbstractViewModel } = {}

    constructor() {
        super();
        if (CC_EDITOR) return
        Notify.instance.on(SceneManager.SCENE_EVENT_MAIN, SceneManager.SCENE_EVENT_LOAD_DONE, this.loadSceneDone, this)
    }
    private loadSceneDone(data: SceneData) {
        if (data.fromModule === this.name) {
            this.destroyMVVM()
            cc.loader.releaseResDir(this.skinPath)
            cc.loader.releaseResDir(this.layoutPath)
            this.clear()
        }
    }
    /**获取模块路径 */
    public get modulePath(): string {
        var dirname = Runtime.instance.isSubpackage(this.name) ? "subModules" : "mainModules"
        return cc.path.join(dirname, this.name)
    }
    /**获取布局路径 */
    public get layoutPath(): string {
        var modConfig = Runtime.instance.getModule(this.name)
        if (!!modConfig) {
            return cc.path.join(this.modulePath, "layouts", modConfig.layout)
        }
        return ""
    }
    /**获取皮肤路径 */
    public get skinPath(): string {
        var modConfig = Runtime.instance.getModule(this.name)
        if (!!modConfig) {
            return cc.path.join(this.layoutPath, "skins", modConfig.skin)
        }
        return ""
    }
    /**获取一个viewModel 如果没有则创建一个 */
    public getViewModel(viewModel: any, md5: string): AbstractViewModel {
        if (!this.viewModels[md5]) {
            this.viewModels[md5] = new viewModel(this)
        } else {
        }
        return this.viewModels[md5]
    }

    /**获取一个model 如果没有则创建一个*/
    public getModel(model: any, md5: string, data?: any, observer?: any, context?: any): AbstractModel {
        if (!this.models[md5]) {
            this.models[md5] = new model(this, data, observer, context)
            return this.models[md5]
        }
        return this.models[md5].assign(data, observer, context)
    }

    /**清理 MVVM */
    public destroyMVVM() {
        if (this.isDontDestroy) return
        for (const key in this.viewModels) {
            if (this.viewModels.hasOwnProperty(key)) {
                const viewModel = this.viewModels[key];
                viewModel.destroy()
            }
        }
        this.viewModels = {}
        for (const key in this.models) {
            if (this.models.hasOwnProperty(key)) {
                const model = this.models[key];
                model.destroy()
            }
        }
        this.models = {}
    }
}
export function Module(moduleName: string, isDontDestroy?: boolean) {
    const f: any = function (...args) {
        if (CC_EDITOR) return
        args[0].prototype.moduleName = moduleName
        args[0].prototype.isDontDestroy = isDontDestroy
        args[0].prototype.notify = new Notify(moduleName)
    }
    return f
}