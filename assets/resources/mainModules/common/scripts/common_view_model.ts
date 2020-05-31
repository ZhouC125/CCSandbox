/**
 * viewModel层
 * 负责处理业务逻辑，提供接口给view层调用，例如向服务器发消息，例如一些和UI显示无关的业务逻辑
 * 它是view和model的粘合层，使用@Bindable来绑定model的同名变量 只有绑定了变量，view才会收到通知
 * 如果未使用@Bindable 则不会收到 model 的通知
 */
import { AbstractViewModel, Model, Bindable, Command } from '../../../fromework/abstract/mvvm/AbstractViewModel';
import common_model from './common_model';
/**
 * @Model 固定写法，指定当前 viewModel 的 model
 */
@Model(common_model)
export default class common_view_model extends AbstractViewModel<common_model> {
    protected loaded() {

    }
    protected unload() {
    }
    /**
     * @Bindable 有这里绑定了model层的__testVar变量是 才会收到 model层的实时通知
     * 注意！这里只是绑定，不要给变量默认值
     */
    @Bindable __testVar: string

    /**
     * @Command 
     * @ViewModel('common', common_view_model,true) 如果在view层最后一个参数为ture 则 这个方法会被自动注入到view中
     * 这个方法被触发时可以被监听 例如  this.on('onClick', () => { }, this)
     */
    @Command onClick(event: any) {
        // 向服务器发消息等操作
    }
}
