import { Observer } from "../abstract/Observer"
import Facade from "./Facade"
interface IListener { [main: string]: { [sub: string]: Array<Observer> } }
export default class Notify {
    private listeners: IListener = {}
    private _moduleName: string = null
    private static _instance: Notify = null
    public static get instance(): Notify {
        if (this._instance === null) {
            this._instance = new Notify("fromework")
        }
        return this._instance
    }
    constructor(name: string) {
        this._moduleName = name
    }
    public on(main: string, sub: string, callback: Function, context: any, once?: boolean): void {
        if (!callback) return
        if (!this.listeners[main]) {
            this.listeners[main] = {}
        }
        if (!this.listeners[main][sub]) {
            this.listeners[main][sub] = []
        }
        this.listeners[main][sub].push(new Observer(callback, context, once))
    }
    public async emitModuleReturn(moduleName: string, main: string, sub: string, ...args: any[]): Promise<any> {
        var module = Facade.getModule(moduleName)
        if (!module) return undefined
        return module.notify.emitReturn(main, sub, ...args)
    }
    public async emitModule(moduleName: string, main: string, sub: string, ...args: any[]) {
        var module = Facade.getModule(moduleName)
        if (!module) return
        return module.notify.emit(main, sub, ...args)
    }
    public emitModuleSync(moduleName: string, main: string, sub: string, ...args: any[]) {
        var module = Facade.getModule(moduleName)
        if (!module) return
        module.notify.emitSync(main, sub, ...args)
    }
    /**
     * 订阅一次 
     */
    public once(main: string, sub: string, callback: Function, context: any): void {
        this.on(main, sub, callback, context, true)
    }

    /**
     * 发送通知 并获的返回结果，当有多个订阅者时 只要其中任意一个 return 非空数据 将停止继续发送事件 直接返回结果
     */
    public async emitReturn(main: string, sub: string, ...args: any[]): Promise<any> {
        let observers = this.getObservers(main, sub)
        if (!observers) return Promise.resolve(undefined)
        for (let i = 0; i < observers.length; i++) {
            const observer = observers[i];
            var result = await observer.notify(...args).catch(cc.error) as any
            if (observer.isOnce) {
                observers.splice(i, 1)
                i--
            }
            if (!!result) {
                return result
            }
        }
    }

    /**
     * 发送事件通知 等待前一个订阅者异步操作完成时才继续向下发送通知
     */
    public async emit(main: string, sub: string, ...args: any[]) {
        let observers = this.getObservers(main, sub)
        if (!observers) return
        for (let i = 0; i < observers.length; i++) {
            const observer = observers[i];
            await observer.notify(...args).catch(cc.error) as any
            if (observer.isOnce) {
                observers.splice(i, 1)
                i--
            }
        }
    }
    public async emitContext(context: any, main: string, sub: string, ...args: any[]) {
        let observers = this.getObservers(main, sub)
        if (!observers) return
        for (let i = 0; i < observers.length; i++) {
            const observer = observers[i];
            if (!observer.compar(null, context)) continue
            await observer.notify(...args).catch(cc.error) as any
            if (observer.isOnce) {
                observers.splice(i, 1)
                i--
            }
        }
    }
    /**
     * 同步发送事件，不会等待上一个订阅者完成
     */
    public emitSync(main: string, sub: string, ...args: any[]) {
        let observers = this.getObservers(main, sub)
        if (!observers) return
        for (let i = 0; i < observers.length; i++) {
            const observer = observers[i];
            observer.notify(...args)
            if (observer.isOnce) {
                observers.splice(i, 1)
                i--
            }
        }
    }
    /**
     * 取消指定的订阅
     */
    public off(main: string, sub: string, callback: Function, context: any): any {
        if (!this.listeners[main]) return
        if (!this.listeners[main][sub]) return
        let observers: Array<Observer> = this.listeners[main][sub]
        if (!observers) return
        var index = observers.findIndex(observer => {
            return observer.compar(callback, context)
        })
        if (-1 !== index) {
            observers.splice(index, 1)
        }
        if (observers.length === 0) {
            delete this.listeners[main][sub]
        }
    }
    /**
     * 取消一个主命令的所有订阅
     */
    public offMain(main: string) {
        if (!this.listeners[main]) return
        delete this.listeners[main]
    }
    /**
     * 取消一个子命令的所有订阅
     */
    public offSub(main: string, sub: string) {
        if (!this.listeners[main]) return
        return delete this.listeners[main][sub]
    }
    /**
     * 取消一个上下文的所有订阅
     */
    public offContext(context: any) {
        for (const main in this.listeners) {
            if (this.listeners.hasOwnProperty(main)) {
                const subs = this.listeners[main];
                for (const key in subs) {
                    if (subs.hasOwnProperty(key)) {
                        let observers: Array<Observer> = subs[key];
                        for (let i = 0; i < observers.length; i++) {
                            const observer = observers[i];
                            if (observer.compar(null, context)) {
                                observers.splice(i, 1)
                                i--
                            }
                        }
                    }
                }
            }
        }
    }

    private getObservers(main: string, sub: string): Array<Observer> {
        if (!this.listeners[main]) {
            return
        }
        let observers: Array<Observer> = this.listeners[main][sub]
        if (!observers) {
            return
        }
        return observers
    }
}
cc['Notify'] = Notify