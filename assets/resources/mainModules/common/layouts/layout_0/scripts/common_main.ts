import { ViewModel, Binding } from '../../../../../framework/abstract/mvvm/AbstractView';
import common_view_model from '../../../scripts/common_view_model';
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
@ViewModel('common', common_view_model)
export default class common_main extends AbstractView<common_view_model> {
    @property(cc.Label)
    label: cc.Label = null
    @property
    text: string = 'hello'
    onLoad() {

    }
    /**
     * 绑定到viewModel同名变量__testVar  并在__testVar改变时收到通知
     * @param value model 或 viewModel 中 __testVar的当前值
     */
    @Binding __testVar(value: string) {
        cc.log(value)
    }


}
