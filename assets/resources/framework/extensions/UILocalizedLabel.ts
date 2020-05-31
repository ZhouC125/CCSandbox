import Notify from '../cores/Notify'
import Text from '../../languages/Text'
import { i18n } from '../../languages/i18n'
const { ccclass, property, menu, inspector } = cc._decorator
const OUTLINE_SUPPORTED = cc.js.isChildClassOf(cc.LabelOutline, cc.Component)
@ccclass
@menu("UI扩展/多语言/UILocalizedLabel")
@inspector("packages://extension/UILocalizedLabelInspector.js")
export default class UILocalizedLabel extends cc.Label {
    private __params: any = []
    private __isInit: boolean
    private shareLabelInfo: any = {
        fontAtlas: null,
        fontFamily: "",
        fontDesc: "Arial",
        fontSize: 0,
        lineHeight: 0,
        hAlign: 0,
        vAlign: 0,
        hash: "",
        color: cc.Color.WHITE,
        isOutlined: false,
        out: cc.Color.WHITE,
        margin: 0,
    }
    private context: any
    private currentFontFamily
    private assemblerData: any
    @property _key: string = ""
    @property({
        displayName: "本地化Key"
    })
    get key() { return this._key }
    set key(value: string) {
        if (value == this._key) return
        this._key = value
        if (Text[value]) {
            this.setString(value)
        }
    }
    @property
    set keyBlur(a) {
        if (this._key && !Text[this._key]) {
            this.key = ""
            this.setString("")
        }
    }
    @property({ override: true })
    get string(): string { return this['_string'] }
    set string(value) {
        if (!CC_EDITOR) {
            value = this.updateomitted(value)
        }
        let oldValue = this['_string']
        this['_string'] = '' + value
        if (this.string !== oldValue) {
            this['_lazyUpdateRenderData']()
        }
        this['_checkStringEmpty']()

    } 
    @property({
        displayName: "省略符",
        tooltip: "文本内容超出限制宽度时使用特定符号进行省略"
    }) omitted: string = ""

    @property
    set stringBlur(a) {
        if (this._key) {
            this.refresh()
        } else {
            this.string = this.updateomitted(this.string)
        }
    }
    onEnable() {
        super.onEnable()
        Notify.instance.on("__i18n__", 'refresh', this.refresh, this)
        this.node.on(cc.Node.EventType.SIZE_CHANGED, this.refresh, this)
    }
    onDisable() {
        super.onDisable()
        Notify.instance.off("__i18n__", 'refresh', this.refresh, this)
        this.node.off(cc.Node.EventType.SIZE_CHANGED, this.refresh, this)
    }
    onFocusInEditor() {
        this.refresh()
    }
    onDestroy() {
        super.onDestroy()
        // Notify.instance.off("__i18n__", 'refresh', this.refresh, this)
    }
    /**
     * 设置文本
     * @param key 本地化key
     * @param params 可以传递多个key 或 其他字符串
     */
    public setString(key: string, ...params) {
        var value = ""
        this.__params = params
        var arr = [key, ...params]
        for (let i = 0; i < arr.length; i++) {
            const k = arr[i]
            if (Text[k]) {
                value += Text[k][i18n.language]
            } else {
                value += k
            }
        }
        if (CC_EDITOR) {
            this.string = this.updateomitted(value)
        } else {
            this.string = value
        }
    }
    /**
     * 强制刷新
     */
    public forceUpdateRenderData() {
        this['_forceUpdateRenderData']()
        this.__isInit = true
    }
    /**
     * 获取省略文本
     * @param text 原文本
     * @param maxWidth 最大宽度
     * @param omitted 省略符
     */
    public getOmittedString(text: string, maxWidth: number, omitted: string = "..."): string {
        var result = ""
        var isAppend = false
        if (this.cacheMode == cc.Label.CacheMode.CHAR) {
            var currentWidth = 1
            this.calculationWidth(omitted, (character: string, width: number) => {
                currentWidth += width + this.spacingX
                return true
            })
            this.calculationWidth(text, (character: string, width: number) => {
                currentWidth += width + this.spacingX
                if (currentWidth > maxWidth) {
                    isAppend = true
                    return false
                }
                result += character
                return true
            })
        } else {
            var allWidth = 0
            var flowWidth = 0
            this.calculationWidth(omitted, (msg: string, width: number) => {
                flowWidth = width
            })
            this.calculationWidth(text, (msg: string, width: number) => {
                allWidth = width
            })
            var text = cc['textUtils'].fragmentText(text, allWidth, maxWidth - flowWidth, this.measureText(this.context))
            isAppend = text.length > 0
            result = text[0]
        }
        result = result || text
        result += isAppend ? omitted : ""
        return result
    }
    /**
     * 计算字符串宽度
     * @param text 要计算的字符串
     * @param pipe 
     */
    public calculationWidth(text: string, pipe: Function) {
        var outline = OUTLINE_SUPPORTED && this.getComponent(cc.LabelOutline)
        var margin = outline && outline.enabled ? outline.width : 0
        if (this.cacheMode == cc.Label.CacheMode.CHAR) {
            if (!this.__isInit) {
                this.forceUpdateRenderData()
            }
            this.shareLabelInfo.fontAtlas = cc.Label['_shareAtlas']
            this.shareLabelInfo.color = this.node.color
            this.shareLabelInfo.lineHeight = this.lineHeight
            this.shareLabelInfo.fontSize = this.fontSize
            this.shareLabelInfo.margin = margin
            this.shareLabelInfo.fontFamily = this.getFontFamily()
            this.shareLabelInfo.fontDesc = this.getLetterFontDesc()
            this.shareLabelInfo.hash = this.computeHash(this.shareLabelInfo)
            for (let i = 0; i < text.length; i++) {
                let character = text.charAt(i)
                let letter = this.shareLabelInfo.fontAtlas.getLetterDefinitionForChar(character, this.shareLabelInfo)
                if (!pipe(character, letter.xAdvance)) {
                    break
                }
            }
        } else {
            this.assemblerData = this['_assembler']._getAssemblerData()
            this.context = this.assemblerData.context
            var fontDesc = this.getFontDesc()
            this.context.font = fontDesc
            var width = cc['textUtils'].safeMeasureText(this.context, text)
            width += margin * text.length * 2
            pipe(text, width)
        }
    }
    private getLetterFontDesc() {
        let fontDesc = this.shareLabelInfo.fontSize.toString() + 'px '
        fontDesc = fontDesc + this.shareLabelInfo.fontFamily
        if (this['_isBold']) {
            fontDesc = "bold " + fontDesc
        }
        return fontDesc
    }
    private computeHash(labelInfo) {
        let hashData = ''
        let color = labelInfo.color.toHEX("#rrggbb")
        let out = ''
        if (labelInfo.isOutlined) {
            out = out + labelInfo.margin + labelInfo.out.toHEX("#rrggbb")
        }
        return hashData + labelInfo.fontSize + labelInfo.fontFamily + color + out
    }
    private updateomitted(str: string): string {
        if (this.overflow === cc.Label.Overflow.CLAMP) {
            if (this.omitted && str) {
                var value = str.replace(this.omitted, "")
                var newValue = this.getOmittedString(value, this.node.width, this.omitted)
                return newValue
            }
        }
        return str
    }

    private getFontDesc() {
        let fontDesc = this.fontSize.toString() + 'px '
        fontDesc = fontDesc + this.currentFontFamily
        if (this['_isBold']) {
            fontDesc = "bold " + fontDesc
        }
        if (this['_isItalic']) {
            fontDesc = "italic " + fontDesc
        }
        return fontDesc
    }
    private measureText(ctx) {
        return function (string) {
            return cc['textUtils'].safeMeasureText(ctx, string)
        }
    }
    private getFontFamily() {
        if (!this.useSystemFont) {
            if (this.font) {
                if (this.font['_nativeAsset']) return this.font['_nativeAsset']
                cc.loader.load(this.font.nativeUrl, (err, asset) => {
                    this.font['_nativeAsset'] = asset
                })
                return 'Arial'
            }
            return 'Arial'
        }
        else {
            return this.fontFamily || 'Arial'
        }
    }
    private refresh() {
        if (!this.key) return
        this.setString(this.key, ...this.__params)
    }
}

