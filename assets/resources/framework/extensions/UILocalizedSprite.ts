import Notify from '../cores/Notify';
import { i18n } from '../../languages/i18n';
import Sprite from '../../languages/Sprite';
import Runtime from '../singles/Runtime';
const { ccclass, property, menu, inspector } = cc._decorator;
@ccclass
@menu("UI扩展/多语言/UILocalizedSprite")
@inspector("packages://extension/UILocalizedSpriteInspector.js")
export default class UILocalizedSprite extends cc.Sprite {
    @property _key: string = ""
    @property
    get key() { return this._key }
    set key(value: string) {
        let oldKey = this._key
        this._key = value
        if (this.key !== oldKey) {
            this.setSprite(value)
        }
    }

    private async setSprite(key: string) {
        if (Sprite[key]) {
            await Runtime.instance.load().catch(cc.error)
            var module = Sprite[key].module
            var dirname = Runtime.instance.isSubpackage(module) ? "subModules" : "mainModules"
            var modulePath = cc.path.join(dirname, module)
            var spritePath = cc.path.join(modulePath, "layouts", Runtime.instance.getLayout(module), "skins",
                Runtime.instance.getSkin(module), Sprite[key][i18n.language])
            cc.loader.loadRes(spritePath, cc.SpriteFrame, (err, result) => {
                if (err) return cc.error(err)
                this.spriteFrame = result
            })
        } else {
            this.spriteFrame = undefined
        }
    }
    constructor() {
        super();
        if (CC_EDITOR) return
        Notify.instance.on("__i18n__", 'refresh', this.refresh, this)
    }
    onFocusInEditor() {
        this.refresh()
    }
    onDestroy() {
        super.onDestroy()
        Notify.instance.offContext(this)
    }
    private refresh() {
        if (!this.key) return
        this.setSprite(this.key)
    }
}
