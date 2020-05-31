/**
 * viewModel层
 * 负责处理业务逻辑，提供接口给view层调用，例如向服务器发消息，例如一些和UI显示无关的业务逻辑
 * 它是view和model的粘合层，使用@Bindable来绑定model的同名变量 只有绑定了变量，view才会收到通知
 * 如果未使用@Bindable 则不会收到 model 的通知
 */
import { AbstractViewModel, Model } from '../../../fromework/abstract/mvvm/AbstractViewModel';
import launch_model from './launch_model';
import Runtime from '../../../fromework/singles/Runtime';
import Company from '../../../fromework/singles/Company';
import { HotUpdateProgressEvent } from '../../../fromework/cores/Update';
import ModuleUpdate from '../../../fromework/singles/ModuleUpdate';
import Facade from '../../../fromework/cores/Facade';
/**
 * @Model 固定写法，指定当前 viewModel 的 model
 */
@Model(launch_model)
export default class launch_view_model extends AbstractViewModel<launch_model> {
    protected loaded() {
    }
    protected unload() {
    }
    private __progressEventData: HotUpdateProgressEvent
    private __percentByByte: number
    public async initLaunch() {
        var runtime = await Runtime.instance.load()
        var company = await Company.instance.load()
        cc.log("company:", company)
        cc.log("runtime:", runtime)

        var isRestart = await this.install()
        if (isRestart) {
            cc.audioEngine.stopAll()
            cc.game.restart()
            return
        }


        // 启动通用模块
        Facade.getModule("common")

        // 下载登录模块
        await this.install("login")

        // 下载大厅模块
        await this.install("lobby")

        // 去登录
        this.module.notify.emitModule('login', 'scene', 'enter')
    }
    /** 安装模块 */
    public install(name?: string) {
        return new Promise(async (resolve, reject) => {
            await ModuleUpdate.instance.getTask(name).install(this.progressEvent.bind(this)).then(result => {
                resolve(result)
            }).catch(cc.error)
        })
    }
    private progressEvent(event: HotUpdateProgressEvent) {
        this.__progressEventData = event
        this.__percentByByte = event.percentByByte
    }
}
