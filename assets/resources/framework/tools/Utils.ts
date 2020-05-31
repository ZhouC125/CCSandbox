const crypto = require('crypto');
export default class Utils {
    /**
     * 是否需要热更新
     */
    static get isHotUpdate(): boolean {
        return cc.sys.isNative && !cc.sys.isBrowser && !CC_PREVIEW
    }
    static md5String(str: string): string {
        // 可任意多次调用update()
        return crypto.createHash('md5').update(str, 'utf8').digest('hex')
    }
    static beautySub(str: string, len: number, flow?: string): string {
        flow = flow || "..."
        var reg = /[\u4e00-\u9fa5]/g,
            slice = str.substring(0, len),
            chineseCharNum = (~~(slice.match(reg) && slice.match(reg).length)),
            realen = slice.length * 2 - chineseCharNum;
        return str.substr(0, realen) + (realen < str.length ? flow : "");
    }
    static formatBytes(a: number, b?: number): string {
        if (0 == a) return "0 Bytes"
        var c = 1024, d = b || 2, e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], f = Math.floor(Math.log(a) / Math.log(c))
        return parseFloat((a / Math.pow(c, f)).toFixed(d)) + "" + e[f]
    }
}
cc['Utils'] = Utils