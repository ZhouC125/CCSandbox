/**
 * viewModel层
 * 负责处理业务逻辑，提供接口给view层调用，例如向服务器发消息，例如一些和UI显示无关的业务逻辑
 * 它是view和model的粘合层，使用@Bindable来绑定model的同名变量 只有绑定了变量，view才会收到通知
 * 如果未使用@Bindable 则不会收到 model 的通知
 */
import { AbstractViewModel, Model, Bindable, Command } from '../../../framework/abstract/mvvm/AbstractViewModel';
import login_model from './login_model';
/**
 * @Model 固定写法，指定当前 viewModel 的 model
 */
@Model(login_model)
export default class login_view_model extends AbstractViewModel<login_model> {
    protected loaded() {

    }
    protected unload() {
    }
    @Command goLobby(event: any) {
        // 向服务器发消息等操作
        this.module.notify.emitModule('lobby', 'scene', 'enter')
    }
}
