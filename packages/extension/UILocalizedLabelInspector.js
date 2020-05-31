const fs = require("fs-extra")
Vue.component("extension-UILocalizedLabelInspector", {
    dependencies: ["packages://inspector/share/blend.js"],
    template: fs.readFileSync(Editor.url("packages://extension/UILocalizedLabelInspector.html"), "utf-8"),
    props: {
        target: {
            twoWay: !0,
            type: Object
        },
        multi: {
            type: Boolean
        },
    },
    methods: {

        T: Editor.T,
        _isBMFont() {
            return this.target._bmFontOriginalSize.value > 0
        },
        _isSystemFont() {
            return this.target.useSystemFont.value
        },
        _hiddenWrapText() {
            let t = this.target.overflow.value;
            return 0 === t || 3 === t
        },
        _hiddenActualFontSize() {
            return 2 !== this.target.overflow.value
        },
        _showFilterSymbol() {
            return this.target.overflow.value == 1
        },
        _onStringBlur() {
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: "stringBlur",
                type: "string",
                value: ""
            })
        },
        _onKeyBlur() {
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: "keyBlur",
                type: "string",
                value: ""
            })
        }
    },
});