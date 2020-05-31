const fs = require("fs-extra")

Vue.component("extension-UILocalizedSpriteInspector", {
    dependencies: ["packages://inspector/share/blend.js"],
    template: fs.readFileSync(Editor.url("packages://extension/UILocalizedSpriteInspector.html"), "utf-8"),
    props: {
        target: {
            twoWay: !0,
            type: Object
        },
        multi: {
            twoWay: !0,
            type: Boolean
        }
    },
    data: () => ({
        atlasUuid: "",
        atlasUuids: "",
        atlasMulti: !1,
        spriteUuid: "",
        spriteUuids: "",
        spriteMulti: !1
    }),
    created() {
        this.target && (this._updateAtlas(), this._updateSprite())
    },
    watch: {
        target() {
            this._updateAtlas(),
                this._updateSprite()
        }
    },
    methods: {
        T: Editor.T,
        selectAtlas() {
            console.log("TO DO Show Atlas Panel")
        },
        editSprite() {
            Editor.Panel.open("sprite-editor", {
                uuid: this.target.spriteFrame.value.uuid
            })
        },
        allowTrim() {
            return this.target.type.value === cc.Sprite.Type.SIMPLE
        },
        isFilledType() {
            return this.target.type.value === cc.Sprite.Type.FILLED
        },
        isRadialFilled() {
            return this.target.fillType.value === cc.Sprite.FillType.RADIAL
        },
        _updateAtlas() {
            if (!this.target) return this.atlasUuid = "",
                this.atlasUuids = "",
                this.atlasMulti = !1,
                void 0;
            this.atlasUuid = this.target._atlas.value.uuid,
                this.atlasUuids = this.target._atlas.values.map(t => t.uuid);
            var t = this.atlasUuids[0];
            this.atlasMulti = !this.atlasUuids.every((i, e) => 0 === e || i === t)
        },
        _updateSprite() {
            if (!this.target) return this.spriteUuid = "",
                this.spriteUuids = "",
                this.spriteMulti = !1,
                void 0;
            this.spriteUuid = this.target.spriteFrame.value.uuid,
                this.spriteUuids = this.target.spriteFrame.values.map(t => t.uuid);
            var t = this.spriteUuids[0];
            this.spriteMulti = !this.spriteUuids.every((i, e) => 0 === e || i === t)
        }
    }
});
