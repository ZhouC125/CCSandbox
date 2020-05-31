
import { Observer } from "../Observer"
import { PropertyDecorator } from "../PropertyDecorator"
import AbstractObserverArray from "./AbstractObserverArray"
import AbstractModule from "./AbstractModule"
type Handler = (...params: any[]) => any
export interface IModel { }
export interface IObservable {
    addObserver(callback: Handler, context: any): void
    removeObserver(callback: Handler, context: any): void
}
export default abstract class AbstractModel<TModule extends AbstractModule = AbstractModule> extends AbstractObserverArray {
    protected abstract loaded()
    protected abstract unload()
    private listeners: Array<Observer> = []
    private _module: TModule
    public get module() { return this._module }

    /**
     * 构造实例对象
     * @param module 模块
     * @param model 实体
     * @param observer 观察者方法
     * @param context 上下文
    */
    constructor(module: TModule, model: IModel, observer?: Handler, context?: any) {
        super()
        this._module = module
        this.assign(model, observer, context)
        this.mutables(this.constructor['mutables'] || [])
        this.loaded()
    }

    /**
     * 向实体对象中的监听数组里添加上下文(view)观察者
     * @param callback 
     * @param context 
     */
    public addObserver(callback: Handler, context: any): void {
        var index = this.listeners.findIndex(item => item.compar(callback, context))
        if (index === -1) {
            this.listeners.push(new Observer(callback, context, false))
        }
    }
    /**
     * 从监听数组中移除监听
     * @param callback 移除监听的回调 如果为null 则移除所有context的监听
     * @param context context 上下文 传 this
     */
    public removeObserver(callback: Handler, context: any): void {
        for (let i = 0; i < this.listeners.length; i++) {
            const listener = this.listeners[i];
            if (listener.compar(callback, context)) {
                this.listeners.splice(i, 1)
                if (callback) {
                    return
                } else {
                    i--
                }
            }
        }
    }
    public destroy() {
        this.unload()
    }
    /**
     * 保存传入的model属性值并保存实力化的一个观察者
     * @param model 
     * @param observer 
     * @param context 
     */
    public assign(model: IModel = {} as IModel, observer?: Handler, context?: any) {
        //将model所有可枚举属性的值复制到目标对象this
        Object.assign(this, model)
        if (observer && context) {
            this.addObserver(observer, context)
        }
        return this
    }
    private mutables(keys: string[] = []): void {
        keys.forEach(key => {
            let value = this.observable(key, this[key])
            Object.defineProperty(this, key, {
                get: () => value,
                set: newValue => {
                    if (value === newValue) return
                    value = this.observable(key, newValue)
                    this.obArray(key, value)

                    this.notify(key, value)
                }
            })
        })
    }
    /**
     * 给观察对象添加观察者并返回观察对象
     * @param key 
     * @param value 
     */
    private observable(key: string, value: any): void {
        if (this.isObservable(value)) {
            (value as IObservable).addObserver((subKey, value) => {
                this.notify(`${key}.${subKey}`, value)
            }, this)
        }
        return value
    }
    /**
     * 通知本model对象中所有的观察者发送通知
     * @param key 
     * @param value 
     */
    protected notify(key: string, value: any): void {
        this.listeners.forEach(observer => observer.notify(key, value))
    }

    /**
     * 传入的value(属性对象)是否是观察对象
     * @param value 
     */
    private isObservable(value: any): boolean {
        return !!(undefined !== value && value['addObserver'])
    }
}
export let Mutable = PropertyDecorator.bind(null, 'mutables');