
export default abstract class AbstractObserverArray {
    protected abstract notify(key: string, value: any)

    protected obArray(key: string, value: any) {
        // 如果需要检测数组可以打开
        return
        if (Array.isArray(value)) {
            this.observerArray(key, value, value)
        } else if (typeof (value) === 'object') {
            this.observerObject(key, value, value)
        }
    }
    private observerObject(key: string, originValue: any, value: any) {
        if (!value) return
        Object.keys(value).forEach(k => {
            if (Array.isArray(value[k])) {
                this.observerArray(key, originValue, value[k])
            } else if (typeof (value[k]) === "object") {
                this.observerObject(key, originValue, value[k])
            }
        })
    }
    private observerArray(key: string, originValue: any, value: any): boolean {
        var origin = Array.prototype
        var self = this
        if (Array.isArray(value)) {
            var methods: Array<string> = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
            var arrayPush = {}
            methods.forEach(function (item) {
                var original = Array.prototype[item]
                arrayPush[item] = function () {
                    original.apply(this, arguments)
                    self.notify(key, originValue)
                    return
                }
            })
            value['__proto__'] = arrayPush
            Object.getOwnPropertyNames(origin).forEach(name => {
                if (!methods.includes(name)) {
                    value['__proto__'][name] = Array.prototype[name]
                }
            })
            return true
        }
    }

}
