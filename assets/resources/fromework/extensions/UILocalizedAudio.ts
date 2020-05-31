import Audio from '../../languages/Audio';
import { i18n } from '../../languages/i18n';
import Runtime from '../singles/Runtime';
import Notify from '../cores/Notify';
const { ccclass, property, menu, inspector, executeInEditMode } = cc._decorator;
@ccclass
@menu("UI扩展/多语言/UILocalizedAudio")
@executeInEditMode
// @inspector("packages://extension/UILocalizedLabelInspector.js")
export default class UILocalizedAudio extends cc.AudioSource {
    @property _key: string = ""
    @property
    get key() { return this._key }
    set key(value: string) {
        let oldKey = this._key
        this._key = value
        if (this.key !== oldKey) {
            this.setAudio(value)
        }
    }
    constructor() {
        super();
        if (CC_EDITOR) return
        Notify.instance.on("__i18n__", 'refresh', this.refresh, this)
    }
    public async setAudio(key: string) {
        if (Audio[key]) {
            await Runtime.instance.load().catch(cc.error)
            var module = Audio[key].module
            var dirname = Runtime.instance.isSubpackage(module) ? "subModules" : "mainModules"
            var modulePath = cc.path.join(dirname, module)
            var audioPath = cc.path.join(modulePath, "layouts", Runtime.instance.getLayout(module), "skins",
            Runtime.instance.getSkin(module), Audio[key][i18n.language])
            cc.loader.loadRes(audioPath, cc.AudioClip, (err, result) => {
                if (err) return cc.error(err)
                this.clip = result
            })
        } else {
            this.clip = undefined
        }
    }
    onFocusInEditor() {
        this.refresh()
    }
    onEnable() {
        super.onEnable()
        this.setAudio(this.key)
    }
    onDestroy() {
        super.onDestroy()
        Notify.instance.offContext(this)
    }
    private refresh() {
        if (!this.key) return
        this.setAudio(this.key)
    }
}
