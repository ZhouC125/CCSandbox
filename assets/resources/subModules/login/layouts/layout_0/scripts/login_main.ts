import { ViewModel, Binding } from '../../../../../fromework/abstract/mvvm/AbstractView';
import login_view_model from '../../../scripts/login_view_model';
import AbstractView from '../../../../../fromework/abstract/mvvm/AbstractView';
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
@ViewModel('login', login_view_model,true)
export default class login_main extends AbstractView<login_view_model> {
 
    
}
