import Notify from '../cores/Notify';
import Runtime from "./Runtime"

export default class SceneManager {
    static readonly SCENE_EVENT_MAIN: string = "SCENE_EVENT_MAIN"
    static readonly SCENE_EVENT_LOAD_BEFOR: string = "SCENE_EVENT_LOAD_BEFOR"
    static readonly SCENE_EVENT_LOAD_DONE: string = "SCENE_EVENT_LOAD_DONE"
    private static _instance: SceneManager = null
    public static get instance(): SceneManager {
        if (this._instance == null) {
            this._instance = new SceneManager()
        }
        return this._instance
    }
    private _currModule: string = ""
    public get currModule() { return this._currModule }
    private _currScene: string = ""
    public get currScene() { return this._currScene }
    private isLoading: boolean = false
    async loadScene(moduleName: string, scene: string, progressCallback?: (speed: number, per: number) => void, loadDoneCallback?: Function) {
        if (this.isLoading) {
            return cc.warn("同时只能跳转一个场景", scene, "跳转失败")
        }
        if (this._currModule == moduleName && this._currScene == scene) {
            return cc.warn("当前场景", scene)
        }
        this.isLoading = true
        Notify.instance.emit("loadScene", "over")
        Notify.instance.emit(SceneManager.SCENE_EVENT_MAIN, SceneManager.SCENE_EVENT_LOAD_BEFOR, {
            fromModule: this._currModule,
            fromScene: this._currScene,
            toModule: moduleName,
            toScene: scene
        })
        // 如果不是原生平台 
        if (!cc.sys.isNative) {
            return this.preloadScene(moduleName, scene, progressCallback, loadDoneCallback)
        }

        // 模块不是子包
        if (!Runtime.instance.isSubpackage(moduleName)) {
            return this.preloadScene(moduleName, scene, progressCallback, loadDoneCallback)
        }
        cc.loader.downloader.loadSubpackage(moduleName, (err) => {
            if (err) {
                return cc.error(err)
            }
            return this.preloadScene(moduleName, scene, progressCallback, loadDoneCallback)
        })
    }
    private preloadScene(moduleName: string, scene: string, progressCallback: (speed: number, per: number) => void, loadDoneCallback: Function) {
        cc.director.preloadScene(scene, (completedCount, totalCount, item) => {
            var speed = completedCount / totalCount;
            var per = Math.floor(completedCount * 100 / totalCount);
            if (progressCallback)
                progressCallback(speed, per)
        }, (err: Error) => {
            cc.director.loadScene(scene, () => {
                this.isLoading = false
                // cc.log(scene, "场景跳转成功")
                if (loadDoneCallback)
                    loadDoneCallback()
                Notify.instance.emit(SceneManager.SCENE_EVENT_MAIN, SceneManager.SCENE_EVENT_LOAD_DONE, {
                    fromModule: this._currModule,
                    fromScene: this._currScene,
                    toModule: moduleName,
                    toScene: scene
                })
                this._currModule = moduleName
                this._currScene = scene
            })
        })
    }
}