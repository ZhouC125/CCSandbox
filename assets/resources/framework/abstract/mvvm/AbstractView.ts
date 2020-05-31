import { AbstractViewModel, Listener } from './AbstractViewModel';
import { PropertyDecorator } from "../PropertyDecorator";
import Facade from '../../cores/Facade';
import AbstractModule from "./AbstractModule";
import Notify from "../../cores/Notify";
import Utils from '../../tools/Utils';
const { ccclass, property } = cc._decorator;
@ccclass
export default abstract class AbstractView<TViewModel extends AbstractViewModel = AbstractViewModel, TModule extends AbstractModule = AbstractModule> extends cc.Component {

    private _module: TModule

    private _isBindings: boolean = false

    public get module(): TModule { return this._module }

    public readonly moduleName: string

    public readonly viewModel: TViewModel

    public readonly viewModelName: string
    
    constructor() {
        super()

        if (CC_EDITOR || !this.moduleName) return

        this._module = Facade.getModule(this.moduleName) as TModule

        if (!this.module) return

        if (!this.viewModel) return

        this.viewModel = this.module.getViewModel(this.viewModel, this.viewModelName) as TViewModel

        this.ackOnLoad()

        this.ackOnDestroy()

    }
    /**绑定所有被修饰的命令 */
    private commands(keys: string[] = []) {
        keys.forEach((key: string) => this[key] = (...params: any[]) => {
            if (this.viewModel[key]) {
                this.viewModel[key](params)
            }
        })
    }
    private bindings(keys: string[] = []) {
        if (this._isBindings) return
        keys.forEach(key => {
            this.viewModel.bind(key, this[key], this)
        })
        this._isBindings = true
    }

    private ackOnLoad() {
        let originOnLoad = this.onLoad
        this.onLoad = () => {
            if (originOnLoad) {
                originOnLoad.apply(this)
            }
            this.commands(this.constructor['commands'] || [])
            this.restoreBindings()
        }
    }

    private unbindings(keys: string[] = []) {
        if (!this._isBindings) return
        keys.forEach(key => {
            this.viewModel.unbind(key, this[key], this)
        })
        this._isBindings = false
    }

    private ackOnDestroy() {
        let originOnDestroy = this.onDestroy
        this.onDestroy = () => {
            this.module.notify.offContext(this)
            Notify.instance.offContext(this)
            if (this.viewModel) {
                this.viewModel.unbindAll(this).offAll(this)
            }
            if (originOnDestroy) {
                originOnDestroy.apply(this)
            }
        }
    }

    /**
     * 恢复所有 @Binding 绑定
     */
    public restoreBindings(): void {
        this.bindings(this.constructor['bindings'] || [])
        this.bindings(this.constructor['injectbinds'] || [])
    }
    /**
     * 暂停所有 @Binding 绑定
     * 注意！这个操作不会取消 bind 绑定的字段
     */
    public pauseBindings(): void {
        this.unbindings(this.constructor['bindings'] || [])
        this.unbindings(this.constructor['injectbinds'] || [])
    }
    /**
     * 设置一个字段
     * @param property 字段名
     * @param value 值
     */
    public set(property: string, value: any): void {
        this.viewModel[property] = value
    }
    /**
     * 获取一个字段值
     * @param property 字段名
     */
    public get(property: string): any {
        return this.viewModel[property]
    }
    /**
     * 绑定字段
     */
    public bind(key: string, callback: Function): void {
        this.viewModel.bind(key, callback, this)
    }
    /**
     * 取消字段绑定
     */
    public unbind(key: string, callback: Function): void {
        this.viewModel.unbind(key, callback, this)
    }
    /**
     * 注意！取消本view的所有字段绑定 包括 @Binding 绑定的字段
     * 如果要恢复 @Binding 绑定 请使用 restoreBindings
     */
    public unbindAll(): void {
        this.viewModel.unbindAll(this)
    }
    /**
     * 绑定命令
     * @param command 命令
     * @param callback 回调
     */
    public on(command: string, callback: Listener): void {
        this.viewModel.on(command, callback, this)
    }
    /**
     * 取消命令绑定
     * @param command 命令
     * @param callback 回调
     */
    public off(command: string, callback: Listener): void {
        this.viewModel.off(command, callback, this)
    }
    /**
     * 取消本view的所有命令绑定
     */
    public offAll(): void {
        this.viewModel.offAll(this)
    }
}
export let Binding = PropertyDecorator.bind(null, 'bindings')
export function ViewModel<T extends AbstractViewModel>(moduleName: string, viewModel: { new(params): T }, autoInjectCommands?: boolean) {
    const f: any = function (...args) {
        if (autoInjectCommands) {
            var commands = args[0].prototype.constructor['commands'] || []
            commands = commands.concat(viewModel.prototype.constructor['commands'] || [])
            args[0].prototype.constructor['commands'] = commands
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                args[0].prototype[command] = (...params: any[]) => { }
            }
        }
        args[0].prototype.viewModelName = Utils.md5String(viewModel.toString())
        if (CC_EDITOR) return
        args[0].prototype.moduleName = moduleName
        args[0].prototype.viewModel = viewModel
    }
    return f
}
export function Extends(baseCtor: any[]) {
    const f: any = function (...args) {
        if (!CC_EDITOR) return
        baseCtor.forEach(base => {
            Object.getOwnPropertyNames(base.prototype).forEach(name => {
                if (name !== "constructor" && name !== "__classname__" && name !== "__cid__" && name !== "__scriptUuid") {
                    args[0].prototype[name] = base.prototype[name];
                }
            })
        })
    }
    return f
}