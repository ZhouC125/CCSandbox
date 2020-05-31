
import { Observer } from "../Observer";
type Handler = (...params: any[]) => any
export interface IObservable {
    addObserver(callback: Handler, context: any): void
    removeObserver(callback: Handler, context: any): void
}
/** 
 * 可观察对象(被观察者)抽象类
*/
export abstract class AbstractObservable implements IObservable {
    protected listeners: Array<Observer> = []
    public isObservable(value: any) {
        return !!(undefined !== value && value['addObserver'])
    }
    /**
     * 添加监听
     * @param callback 监听回调
     * @param context 传 this
     */
    public addObserver(callback: Handler, context: any): void {
        var index = this.listeners.findIndex(item => {
            return item.compar(callback, context)
        })

        if (-1 === index) {
            this.listeners.push(new Observer(callback, context, false))
        }
    }
    /**
     * 移除监听
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
    protected notify(...params: any[]) {
        this.listeners.forEach(observer => observer.notify(params[0], params[1]))
    }
}