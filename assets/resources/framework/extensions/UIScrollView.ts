/**
 * 对 ScrollView 的扩展 可以优化数量较多的item 循环利用item
 * 支持下拉刷新 上拉加载 可以用来实现类似app应用的渐进式分页功能
 */
const { ccclass, property, menu, inspector, executeInEditMode } = cc._decorator;
export enum UIScrollViewBoundEventType {
    STOP,
    REFRESH,
    LOAD,
    REFRESH_HANDLER,
    LOAD_HANDLER,
}
export enum UIScrollViewDirection {
    HORIZONTAL,
    VERTICAL,
    NONE,
}
@ccclass
@menu("UI扩展/UIScrollView")
@inspector("packages://extension/UIScrollViewInspector.js")
@executeInEditMode()
export default class UIScrollView extends cc.ScrollView {
    private direction: UIScrollViewDirection = UIScrollViewDirection.NONE
    /** 最大item数 */
    private _maxItemCount: number = 0
    public get maxItemCount() { return this._maxItemCount }
    public set maxItemCount(value: number) {
        this._maxItemCount = value || 0
        this._maxItemCount = this._maxItemCount < 0 ? 0 : this._maxItemCount
        this.checkLength()
        this.resetView()
    }
    public setItemCount(itemCount: number): this {
        this.maxItemCount = itemCount
        this.layoutContent()
        return this
    }
    public addItemCount(itemCount: number): this {
        if (itemCount < 0) return
        if (this.maxItemCount == 0) {
            this.setItemCount(itemCount)
        } else {
            if (itemCount !== 0) {
                this.stopAutoScroll()
            }
            this.maxItemCount += itemCount || 0
        }
        return this
    }
    public remItemCount(itemCount: number): this {
        if (itemCount < 0) return
        this.maxItemCount -= itemCount || 0
        return this
    }
    public get view(): cc.Node { return this['_view'] }

    private cacheItems: cc.Node[] = []

    private prevScrollOffset: cc.Vec2 = cc.Vec2.ZERO

    private curItemCount: number = 0

    private boundEventType: UIScrollViewBoundEventType = UIScrollViewBoundEventType.STOP
    @property({
        displayName: "向上传递Touch事件",
        tooltip: "注意！向上传递事件只会发送当前滑动相反方向,如果开启horizontal则会发送vertical事件。如果开启vertical则会发送horizontal事件。同时开启horizontal和vertical 不会发送任何事件"
    }) isTransmitEvent: boolean = false
    @property({
        displayName: "开启优化"
    }) isOptimization: boolean = false

    @property({
        displayName: "下拉刷新偏移量"
    }) refreshOffset: number = 0

    @property({
        displayName: "上拉加载偏移量"
    }) loadOffset: number = 0

    @property _spacing: cc.Vec2 = cc.Vec2.ZERO
    @property({
        displayName: "item间隔"
    })
    get spacing() { return this._spacing }
    set spacing(value: cc.Vec2) {
        this.layoutContent()
    }
    @property(cc.Component.EventHandler) _boundaryEvents: cc.Component.EventHandler[] = []
    @property({
        type: cc.Component.EventHandler,
        displayName: "边界事件",
        tooltip: "下拉刷新,上拉加载"
    })
    get boundaryEvents() { return this._boundaryEvents }
    set boundaryEvents(value) {
        this._boundaryEvents = value
    }

    @property(cc.Component.EventHandler) _refreshItemEvents: cc.Component.EventHandler[] = []
    @property({
        type: cc.Component.EventHandler,
        displayName: "刷新item事件",
    })
    get refreshItemEvents() { return this._refreshItemEvents }
    set refreshItemEvents(value) {
        this._refreshItemEvents = value
    }

    @property _horizontal: boolean = false
    @property({ override: true })
    get horizontal() { return this._horizontal }
    set horizontal(value: boolean) {
        this._horizontal = value
        if (CC_EDITOR) {
            this.layoutContent()
        }
    }
    @property _vertical: boolean = true
    @property({ override: true })
    get vertical() { return this._vertical }
    set vertical(value: boolean) {
        this._vertical = value
        if (CC_EDITOR) {
            this.layoutContent()
        }
    }

    private _fixedNode: cc.Node = null
    private get fixedNode() {
        if (!this._fixedNode) {
            this._fixedNode = new cc.Node("fixedNode")
            this.node.addChild(this._fixedNode)
            this._fixedNode.width = this.node.width
            this._fixedNode.height = this.node.height
        }
        return this._fixedNode
    }
    private _viewWidget: cc.Widget
    private get viewWidget(): cc.Widget {
        if (!this._viewWidget) {
            this._viewWidget = this.view.getComponent(cc.Widget)
            if (!this._viewWidget) {
                this._viewWidget = this.view.addComponent(cc.Widget)
            }
        }
        return this._viewWidget
    }
    onLoad() {
        if (!this.content || this._horizontal && this._vertical) {
            this.isOptimization = false
            this.isTransmitEvent = false
        }
        this.brake = 0.618
        if (!this.isOptimization) return
        this.node.anchorX = 0.5
        this.node.anchorY = 0.5
        if (this.content) {
            if (this._horizontal) this.content.anchorX = 0
            if (this._vertical) this.content.anchorY = 1
            var layout = this.content.getComponent(cc.Layout)
            if (layout) {
                cc.warn("UIScrollView -> 请删除content节点上的cc.Layout组件")
                this.content.removeComponent(cc.Layout)
            }
        }
    }
    private _onTouchBegan(event: cc.Event.EventTouch, captureListeners: any) {
        super['_onTouchBegan'](event, captureListeners)
        this.direction = UIScrollViewDirection.NONE
        if (this.isTransmitEvent) {
            this.transmitEvent(event, cc.Node.EventType.TOUCH_START)
        }
    }
    private _onTouchMoved(event: cc.Event.EventTouch, captureListeners: any) {
        if (!this.isTransmitEvent) {
            super['_onTouchMoved'](event, captureListeners)
            return
        }
        if (this.direction == UIScrollViewDirection.NONE) {
            var start = event.getStartLocation()
            var curre = event.getLocation()
            var xOffset = Math.abs(start.x - curre.x)
            var yOffset = Math.abs(start.y - curre.y)
            if (xOffset > yOffset) {
                // 本ScrollView滑动方向过程中达到一定偏移量是也可以向上发送事件
                // if (this.vertical) {
                //     if (xOffset - yOffset > 50) {
                //         this.direction = UIScrollViewDirection.HORIZONTAL
                //     }
                // }
                this.direction = UIScrollViewDirection.HORIZONTAL

            } else if (yOffset > xOffset) {
                // 本ScrollView滑动方向过程中达到一定偏移量是也可以向上发送事件
                // if (this.horizontal) {
                //     if (yOffset - xOffset > 50) {
                //         this.direction = UIScrollViewDirection.VERTICAL
                //     }
                // }
                this.direction = UIScrollViewDirection.VERTICAL

            }
        }
        var canTransmit = (this.vertical && this.direction === UIScrollViewDirection.HORIZONTAL) || this.horizontal && this.direction == UIScrollViewDirection.VERTICAL
        if (canTransmit) {
            this.transmitEvent(event, cc.Node.EventType.TOUCH_MOVE)

            let deltaMove = event.touch.getLocation().sub(event.touch.getStartLocation()).mag()
            if (event.target !== this.node && event.target.getComponent(cc.Button) && deltaMove > 7) {
                //如果这里直接发TOUCH_CANCEL事件取消按钮点击也会让CCScrollView收到取消事件,导致无法自动滑动,所以修改button内部的_pressed,暂没好办法
                let bt = event.target.getComponent(cc.Button)
                bt._pressed = false
            }
        } else {
            super['_onTouchMoved'](event, captureListeners)
        }
    }
    private _onTouchEnded(event: cc.Event.EventTouch, captureListeners: any) {
        super['_onTouchEnded'](event, captureListeners)
        this.direction = UIScrollViewDirection.NONE
        if (this.isTransmitEvent) {
            this.transmitEvent(event, cc.Node.EventType.TOUCH_END)
        }
    }
    private _onTouchCancelled(event: cc.Event.EventTouch, captureListeners: any) {
        super['_onTouchCancelled'](event, captureListeners)
        if (this.isTransmitEvent) {
            this.transmitEvent(event, cc.Node.EventType.TOUCH_CANCEL)
        }
    }
    private _onMouseWheel(event: cc.Event.EventTouch, captureListeners: any) {
        super['_onMouseWheel'](event, captureListeners)
        if (this.isTransmitEvent) {
            this.transmitEvent(event, cc.Node.EventType.MOUSE_WHEEL)
        }
    }
    private transmitEvent(event: cc.Event.EventTouch, eventType: string) {
        var e = new cc.Event.EventTouch(event.getTouches(), event.bubbles)
        e.type = eventType
        e.touch = event.touch
        event.target.parent.dispatchEvent(e)
    }
    private checkLength() {
        if (!this.content) return
        if (this.cacheItems.length == 0) {
            this.cacheItems = Object.assign([], this.content.children)
        }
        for (let i = 0; i < this.cacheItems.length; i++) {
            const child = this.cacheItems[i];
            if (i < this._maxItemCount) {
                if (child.parent != this.content) {
                    child.parent = this.content
                    child.active = true
                }
            } else {
                if (child.parent != this.node) {
                    child.parent = this.node
                    child.active = false
                }
            }
        }
    }
    private resetView() {
        if (this.boundEventType === UIScrollViewBoundEventType.STOP) return
        this.viewWidget.isAlignTop = true
        this.viewWidget.isAlignBottom = true
        this.viewWidget.isAlignLeft = true
        this.viewWidget.isAlignRight = true
        this.viewWidget.top = 0
        this.viewWidget.bottom = 0
        this.viewWidget.right = 0
        this.viewWidget.left = 0
        this.viewWidget.updateAlignment()
        this.bounceDuration = 0.618
        this.stop()
    }
    private viewByRefresh() {
        if (this.horizontal) {
            this.viewWidget.left = this.refreshOffset
            this.viewWidget.right = 0
        } else {
            this.viewWidget.top = this.refreshOffset
            this.viewWidget.bottom = 0
        }
        this.viewWidget.updateAlignment()
        this.bounceDuration = 0.2
        this.boundEventType = UIScrollViewBoundEventType.REFRESH_HANDLER
        cc.Component.EventHandler.emitEvents(this.boundaryEvents, this.boundEventType)
    }
    private viewByLoad() {
        if (this.horizontal) {
            this.viewWidget.left = 0
            this.viewWidget.right = this.loadOffset
        } else {
            this.viewWidget.top = 0
            this.viewWidget.bottom = this.loadOffset
        }
        this.viewWidget.updateAlignment()
        this.bounceDuration = 0.2
        this.boundEventType = UIScrollViewBoundEventType.LOAD_HANDLER
        cc.Component.EventHandler.emitEvents(this.boundaryEvents, this.boundEventType)
    }
    private layoutContent() {
        if (!this.isOptimization) return
        if (this.horizontal) {
            this.content.width = 0
        } else if (this.vertical) {
            this.content.height = 0
        }
        this.stopAutoScroll()
        var prev: cc.Vec2 = cc.Vec2.ZERO
        for (let i = 0; i < this.content.childrenCount; i++) {
            const child = this.content.children[i]
            if (!child.active) continue
            child.name = i.toString()
            if (this.horizontal) {
                child.anchorX = 0.5
                let width = child.width * child.scaleX
                child.x = width * 0.5 + prev.x + this.spacing.x * i
                prev.x += width
                this.content.width += width
                if (i > 0) {
                    this.content.width += this.spacing.x
                }
            } else if (this.vertical) {
                child.anchorY = 0.5
                let height = child.height * child.scaleY
                child.y = -height * 0.5 - prev.y - this.spacing.y * i
                prev.y += height
                this.content.height += height
                if (i > 0) {
                    this.content.height += this.spacing.y
                }
            }
            if (!CC_EDITOR) {
                cc.Component.EventHandler.emitEvents(this.refreshItemEvents, child, i)
            }
        }
        this.curItemCount = this.content.childrenCount
    } 

    private _dispatchEvent(event) {
        super['_dispatchEvent'](event)
        if (!this.isOptimization) return

        if (this.horizontal) {
            this.horizontalHandler()
        } else if (this.vertical) {
            this.verticalHandler()
        }
        this.prevScrollOffset = this.getScrollOffset()
    }
    private _onScrollBarTouchEnded() {
        super['_onScrollBarTouchEnded']()
        switch (this.boundEventType) {
            case UIScrollViewBoundEventType.STOP:
                this.resetView()
                break
            case UIScrollViewBoundEventType.REFRESH:
                this.viewByRefresh()
                break
            case UIScrollViewBoundEventType.LOAD:
                this.viewByLoad()
                break
        }

    }
    private horizontalHandler() {
        if (this.prevScrollOffset.x == this.getScrollOffset().x) return
        var header = this.content.children[0]
        var footer = this.content.children[this.content.childrenCount - 1]
        if (!header || !footer) return
        if (this.prevScrollOffset.x > this.getScrollOffset().x) {
            if (header.getBoundingBoxToWorld().xMax + this.spacing.x < this.fixedNode.getBoundingBoxToWorld().xMin) {
                if (this.curItemCount < this.maxItemCount) {
                    header.setSiblingIndex(this.content.childrenCount)
                    header.x = footer.x + header.width * header.scaleX + this._spacing.x
                    header.x += (footer.width * footer.scaleX - header.width * header.scaleX) * 0.5
                    this.content.width += header.width * header.scaleX + this._spacing.x
                    let index = parseInt(footer.name) + 1
                    header.name = index.toString()
                    cc.Component.EventHandler.emitEvents(this.refreshItemEvents, header, index)
                    this.curItemCount++
                }
            }
        } else if (this.prevScrollOffset.x < this.getScrollOffset().x) {
            if (footer.getBoundingBoxToWorld().xMin - this.spacing.x > this.fixedNode.getBoundingBoxToWorld().xMax) {
                if (this.getScrollOffset().x < 0) {
                    if (this.curItemCount - 1 >= this.content.childrenCount) {
                        footer.setSiblingIndex(0)
                        footer.x = header.x - footer.width * footer.scaleX - this._spacing.x
                        footer.x -= (header.width * header.scaleX - footer.width * footer.scaleX) * 0.5
                        this.content.width -= (footer.width * footer.scaleX + this._spacing.x)
                        let index = parseInt(header.name) - 1
                        footer.name = index.toString()
                        cc.Component.EventHandler.emitEvents(this.refreshItemEvents, footer, index)
                        this.curItemCount--
                    }
                }
            }
        }

        if (this.boundEventType !== UIScrollViewBoundEventType.LOAD_HANDLER && this.boundEventType !== UIScrollViewBoundEventType.REFRESH_HANDLER) {
            if (this.isScrolling()) {
                if (this.getScrollOffset().x >= this.refreshOffset) {
                    this.refresh()
                } else if (Math.abs(this.getScrollOffset().x) - this.loadOffset > this.getMaxScrollOffset().x) {
                    this.load()
                } else {
                    this.stop()
                }
            }
        }

    }
    private verticalHandler() {
        if (this.prevScrollOffset.y == this.getScrollOffset().y) return
        var header = this.content.children[0]
        var footer = this.content.children[this.content.childrenCount - 1]
        if (!header || !footer) return
        if (this.prevScrollOffset.y < this.getScrollOffset().y) {
            if (header.getBoundingBoxToWorld().yMin - this.spacing.y > this.fixedNode.getBoundingBoxToWorld().yMax) {
                if (this.curItemCount < this.maxItemCount) {
                    header.setSiblingIndex(this.content.childrenCount)
                    header.y = footer.y - header.height * header.scaleY - this._spacing.y
                    header.y -= (footer.height * footer.scaleY - header.height * header.scaleY) * 0.5
                    this.content.height += header.height * header.scaleY + this._spacing.y
                    let index = parseInt(footer.name) + 1
                    header.name = index.toString()
                    cc.Component.EventHandler.emitEvents(this.refreshItemEvents, header, index)
                    this.curItemCount++
                }
            }
        } else if (this.prevScrollOffset.y > this.getScrollOffset().y) {
            if (footer.getBoundingBoxToWorld().yMax + this.spacing.y < this.fixedNode.getBoundingBoxToWorld().yMin) {
                if (this.getScrollOffset().y > 0) {
                    if (this.curItemCount - 1 >= this.content.childrenCount) {
                        footer.setSiblingIndex(0)
                        footer.y = header.y + footer.height * footer.scaleY + this._spacing.y
                        footer.y += (header.height * header.scaleY - footer.height * footer.scaleY) * 0.5
                        this.content.height -= footer.height * footer.scaleY + this._spacing.y
                        let index = parseInt(header.name) - 1
                        footer.name = index.toString()
                        cc.Component.EventHandler.emitEvents(this.refreshItemEvents, footer, index)
                        this.curItemCount--
                    }
                }
            }
        }
        if (this.boundEventType !== UIScrollViewBoundEventType.LOAD_HANDLER && this.boundEventType !== UIScrollViewBoundEventType.REFRESH_HANDLER) {
            if (this.isScrolling()) {
                if (this.getScrollOffset().y < -this.refreshOffset) {
                    this.refresh()
                } else if (this.getScrollOffset().y - this.loadOffset > this.getMaxScrollOffset().y) {
                    this.load()
                } else {
                    this.stop()
                }
            }
        }
    }
    private refresh() {
        if (this.refreshOffset <= 0) return
        if (this.boundEventType !== UIScrollViewBoundEventType.REFRESH) {
            this.boundEventType = UIScrollViewBoundEventType.REFRESH
            cc.Component.EventHandler.emitEvents(this.boundaryEvents, this.boundEventType)
        }
    }
    private load() {
        if (this.loadOffset <= 0) return
        if (this.boundEventType !== UIScrollViewBoundEventType.LOAD) {
            this.boundEventType = UIScrollViewBoundEventType.LOAD
            cc.Component.EventHandler.emitEvents(this.boundaryEvents, this.boundEventType)
        }
    }
    private stop() {
        if (this.boundEventType !== UIScrollViewBoundEventType.STOP) {
            this.boundEventType = UIScrollViewBoundEventType.STOP
            cc.Component.EventHandler.emitEvents(this.boundaryEvents, this.boundEventType)
        }
    }
    onEnable() {
        super.onEnable()
        this.addContentEventListeners()
    }
    onDisable() {
        super.onDisable()
        this.removeContentEventListeners()
    }
    private addContentEventListeners() {
        if (!CC_EDITOR) return
        cc.director.on(cc.Director.EVENT_AFTER_UPDATE, this.layoutContent, this);
    }
    private removeContentEventListeners() {
        if (!CC_EDITOR) return
        cc.director.off(cc.Director.EVENT_AFTER_UPDATE, this.layoutContent, this);
    }
}

