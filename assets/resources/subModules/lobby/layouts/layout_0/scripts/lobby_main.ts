import { ViewModel, Binding } from '../../../../../framework/abstract/mvvm/AbstractView';
import lobby_view_model from '../../../scripts/lobby_view_model';
import AbstractView from '../../../../../framework/abstract/mvvm/AbstractView';
/**
 * view层 
 * 负责处理显示相关的逻辑
 */
const { ccclass, property } = cc._decorator;
@ccclass
/**
 * @ViewModel
 * @param moduleName 指定当前模块名
 * @param viewModel 指定一个viewModel
 * @param autoInjectCommands 默认为false 如果为true 会自动注入viewModel @Command 的方法到本对象中
 */
@ViewModel('lobby', lobby_view_model, true)
export default class lobby_main extends AbstractView<lobby_view_model> {
    @property(cc.Label) varLabel: cc.Label = null
    @property(cc.Label) showLabel: cc.Label = null
    @property(cc.Label) refreshLabel: cc.Label = null
    onLoad() {
        this.on('onClick', () => {
            cc.log("view层监听到了 viewModel 中的 onClick 被点击")
        })
        this.bind('__testVar', (value: string) => {
            cc.log('view层通过this.bind的方式 监听到了__testVar 被改变', value)
        })
    }
    /**
     * 当__testVar被改变 刷新显示
     * @param value 最新的值
     */
    @Binding __testVar(value: string) {
        this.varLabel.string = value
    }
    /**
     * 当__inputValue被改变 刷新显示
     * @param value 最新的值
     */
    @Binding __inputValue(value: string) {
        this.showLabel.string = value
    }
    /**
     * __common_refresh这个值的更新来自于 common 模块的 common_model
     * @param value 最新的值
     */
    @Binding __common_refresh(value: number) {
        this.refreshLabel.string = `来自注入model的通知 值：${value}`
    }
}