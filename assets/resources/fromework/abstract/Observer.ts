export class Observer {
    /** 回调函数 */
    private callback: Function = null
    /** 上下文 */
    private context: any = null
    /** 监听一次 */
    private once: boolean = false

    public get isOnce(): boolean { return this.once }
    constructor(callback: Function, context: any, once: boolean) {
        this.callback = callback
        this.context = context
        this.once = once
    }
    /**
     * 发送通知
     * @param args 不定参数
     */
    public async notify(...args: any[]) {
        return this.callback.call(this.context, ...args)
    }
    /**
     * 判断该观察者内的上下文和回调方法与传入的是否相同（如果没传入回调方法则只比较上下文）
     * @param callback 
     * @param context 
     */
    public compar(callback: Function, context: any): boolean {
        if (callback) {
            return context == this.context && callback == this.callback
        } else {
            return context == this.context
        }
    }


}