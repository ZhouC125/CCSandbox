
import AbstractObserverArray from "./AbstractObserverArray";
import AbstractModel from "./AbstractModel";
import { Observer } from "../Observer";
import { PropertyDecorator } from "../PropertyDecorator";
import AbstractModule from "./AbstractModule";
import Facade from '../../cores/Facade';
import Utils from '../../tools/Utils';
export interface IViewModel {
    bind(property: string, callback: Function, context: any): this
    unbind(property: string, callback: Function, context: any): this
    unbindAll(context: any): this
    on(command: string, callback: Listener<this>, context: any): this
    off(command: string, callback: Listener<this>, context: any): this
    offAll(context: any): this
}
export type Listener<TViewModel extends IViewModel = IViewModel> = (vm: TViewModel, ...params: any[]) => void
export abstract class AbstractViewModel<TModel extends AbstractModel = AbstractModel, TModule extends AbstractModule = AbstractModule> extends AbstractObserverArray {
    private propagation = true
    private _module: TModule
    public get module(): TModule { return this._module }
    private _model: TModel
    public get model(): TModel { return this._model }
    public readonly modelName: string
    protected abstract loaded()
    protected abstract unload()
    protected injectModel: AbstractModel
    private readonly inject: { module: string, model: string, modelName: string }
    private bindListener: { [key: string]: Array<Observer> } = {}
    private commandListener: { [key: string]: Array<Observer> } = {}
    constructor(module: TModule) {
        super()
        if (CC_EDITOR) return
        this._module = module
        this._model = this.module.getModel(this.model, this.modelName, this.injectHandler(), this.observer, this) as TModel
        this.commands(this.constructor['commands'] || [])
        this.bindables(this.constructor['bindables'] || [])
        this.loaded()
    }
    /**
     * 添加属性key的观察者，传入的回调为上下文context(一般指view)中的方法
     * @param key 属性名称
     * @param callback 回调方法
     * @param context 上下文，通常指view
     */
    public bind(key: string, callback: Function, context: any): this {
        var parent = this.getDescriptor(key)
        if (parent) {
            this.cascade(key, parent)
        } else {
            this.define(key)
        }
        if (!this.bindListener[key]) this.bindListener[key] = []
        var observer = new Observer(callback, context, false)
        observer.notify(this[key])
        this.bindListener[key].push(observer)
        return this
    }
    /**
     * 移除属性名称为key的与view相关的所有观察者
     * @param key 
     * @param callback 
     * @param context 
     */
    public unbind(key: string, callback: Function, context: any): this {
        var observers = this.bindListener[key]
        if (observers) {
            for (let i = 0; i < observers.length; i++) {
                const observer = observers[i];
                if (observer.compar(callback, context)) {
                    observers.splice(i, 1)
                    if (callback) {
                        return
                    } else {
                        i--
                    }
                }
            }
        }
        return this
    }
    /**
     * 移除context对象的所有订阅
     * @param context 上下文对象
     */
    public unbindAll(context: any): this {
        for (const key in this.bindListener) {
            if (this.bindListener.hasOwnProperty(key)) {
                const observers = this.bindListener[key];
                for (let i = 0; i < observers.length; i++) {
                    const observer = observers[i];
                    if (observer.compar(null, context)) {
                        observers.splice(i, 1)
                        i--
                    }
                }
            }
        }
        return this
    }
    /**
     * 监听一个命令事件
     * @param command 命令名
     * @param callback 命令回调
     * @param context 传 this
     */
    public on(command: string, callback: Listener<this>, context: any): this {
        if (!this.commandListener[command]) {
            this.commandListener[command] = []
        }
        this.commandListener[command].push(new Observer(callback, context, false))
        return this
    }
    /**
     * 移除一个命令事件
     * @param command 命令
     * @param callback 回调
     * @param context 上下文对象
     */
    public off(command: string, callback: Listener<this>, context: any): this {
        var observers = this.commandListener[command]
        if (observers) {
            for (let i = 0; i < observers.length; i++) {
                const observer = observers[i];
                if (observer.compar(callback, context)) {
                    observers.splice(i, 1)
                    if (callback) {
                        return
                    } else {
                        i--
                    }
                }
            }
        }
        return this
    }
    /**
     * 移除 对象内所有命令
     * @param context 传this
     */
    public offAll(context: any): this {
        for (const key in this.commandListener) {
            if (this.commandListener.hasOwnProperty(key)) {
                const observers = this.commandListener[key];
                for (let i = 0; i < observers.length; i++) {
                    const observer = observers[i];
                    if (observer.compar(null, context)) {
                        observers.splice(i, 1)
                        i--
                    }
                }
            }
        }
        return this
    }
    /**
    * 清理
    */
    public destroy() {
        this.model.removeObserver(this.observer, this)
        if (this.injectModel) {
            this.injectModel.removeObserver(this.oberverInject, this)
        }
        this.bindListener = {}
        this.commandListener = {}
        this.unload()
    }
    private oberverInject(key: string, value: any) {
        this.model[key] = value
        this[key] = value
    }
    private observer(key: string, value: any) {
        if (!this.propagation) return
        if ((this.constructor['bindables'] || []).includes(key)) {
            this[key] = value
        }
    }
    /**
     * viewModel添加属性名为key的对象parent
     * @param key 
     * @param parent 
     */
    private cascade(key: string, parent: PropertyDescriptor) {
        if (this.bindListener[key]) return
        if (!delete this[key]) {
            return
        }
        Object.defineProperty(this, key, {
            get: parent.get && parent.get.bind(this),
            set: (value: any) => {
                if (parent.set) {
                    this.propagation = false
                    parent.set.call(this, value)
                    this.propagation = true
                }
                this.notify(key, value)
            },
            configurable: true
        })
    }
    /**
     * viewModel 增加名称为key的属性
     * @param key 
     */
    private define(key: string) {
        if (this.bindListener[key]) return
        var value = this[key]
        this.obArray(key, value)
        Object.defineProperty(this, key, {
            get: () => value,
            set: (newValue: any) => {
                value = newValue
                this.obArray(key, value)
                this.notify(key, value)
            },
            configurable: true
        })
    }
    /**订阅命令事件 */
    private commands(keys: string[] = []) {
        keys.forEach((property: string) => {
            this[property] = (...params: any[]) => {
                const result = Object.getPrototypeOf(this)[property].apply(this, ...params);
                ; (this.commandListener[property] || []).forEach(
                    listener => {
                        listener.notify([this].concat(...params))
                    }
                )
                return result
            }
        })
    }
    private bindables(keys: string[] = []) {
        keys.forEach((key: string) => {
            const parent = this.getDescriptor(key)
            if (!parent) {
                Object.defineProperty(this, key, {
                    get: () => {
                        return this.model[key]
                    },
                    set: value => {
                        this.model[key] = value
                    },
                    configurable: true
                })
            }
        })
    }

    /**
     * 获取viewModel中指定属性对象（非继承）
     * @param key 属性名称
     */
    private getDescriptor(key: string): PropertyDescriptor | null {
        let object = this, descriptor
        do {
            //返回指定对象所有自身属性（非继承属性）的指定描述对象
            descriptor = Object.getOwnPropertyDescriptor(object, key)
            object = Object.getPrototypeOf(object)
            if (descriptor) {
                return descriptor.get || descriptor.set ? descriptor : null
            }
        } while (object)
        return null
    }

    /**
     * 对属性key的所有观察者发送value通知
     * @param key 
     * @param value 
     */
    protected notify(key: string, value: any) {
        var observers = this.bindListener[key]
        if (!observers) return
        observers.forEach(observer => observer.notify(value))
    }
    /**
     * 注入依赖的model字段
     */
    private injectHandler(): any {
        var injectData = {}
        try {
            if (this.inject) {
                this.injectModel = Facade.getModule(this.inject.module).getModel(this.inject.model, this.inject.modelName)
                if (this.injectModel) {
                    var bindables = this.constructor['injectbinds'] || []
                    bindables.forEach(field => {
                        if (this.injectModel.hasOwnProperty(field)) {
                            injectData[field] = this.injectModel[field]
                            this[field] = this.injectModel[field]
                        }
                    });
                    this.injectModel.addObserver(this.oberverInject, this)
                }
            }
        } catch (err) {
            cc.error(err)
        }
        return injectData
    }
}
export let Bindable = PropertyDecorator.bind(null, 'bindables')
export let Command = PropertyDecorator.bind(null, 'commands')
export let InjectBind = PropertyDecorator.bind(null, 'injectbinds')
export function Model<T extends AbstractModel>(model: { new(mod: any, data: any, observer: any, context: any): T }) {
    const f: any = function (...args) {
        args[0].prototype.modelName = Utils.md5String(model.toString())
        if (CC_EDITOR) return
        args[0].prototype._model = model
    }
    return f
}
export function Inject<T extends AbstractModel = AbstractModel>(module: string, model: { new(mod, data): T }) {
    const f: any = function (...args) {
        if (CC_EDITOR) return
        args[0].prototype.inject = {
            module: module,
            model: model,
            modelName: Utils.md5String(model.toString())
        }
    }
    return f
}