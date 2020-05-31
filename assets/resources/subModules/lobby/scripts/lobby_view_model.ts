/**
 * viewModel层
 * 负责处理业务逻辑，提供接口给view层调用，例如向服务器发消息，例如一些和UI显示无关的业务逻辑
 * 它是view和model的粘合层，使用@Bindable来绑定model的同名变量 只有绑定了变量，view才会收到通知
 * 如果未使用@Bindable 则不会收到 model 的通知
 */
import { AbstractViewModel, Model, Bindable, Command, Inject, InjectBind } from '../../../fromework/abstract/mvvm/AbstractViewModel';
import lobby_model from './lobby_model';
import { i18n, Languages } from '../../../languages/i18n';
import common_model from '../../../mainModules/common/scripts/common_model';
/**
 * @Model 固定写法，指定当前 viewModel 的 model
 */
@Model(lobby_model)
@Inject('common', common_model) //注入其他 model 可以收到来自这个model的通知
export default class lobby_view_model extends AbstractViewModel<lobby_model> {
    protected loaded() {

    }
    protected unload() {
    }
    /** view 当然也可以监听来自viewModel定义的变量通知 */
    private __inputValue: string = ''

    /** 使用 @InjectBind 来指定要接收注入model 的哪个变量通知 */
    @InjectBind __common_refresh: number

    /** 使用 @Bindable 来监听来自本model 的变量通知 */
    @Bindable __testVar: string

    // 当按钮被点击
    @Command onClick() {
        // 调用model改变一个变量的值
        this.__testVar = "__testVar 被 viewModel 修改"
        this.model.change()
    }
    // 当输入框内容改变时 
    @Command onChangeInput(event: string) {
        // 改变__inputValue 并通知view
        this.__inputValue = event
    }
    /** 切换英文 */
    @Command onTabEn() {
        i18n.language = Languages.en
    }
    /** 切换中文 */
    @Command onTabCn() {
        i18n.language = Languages.zh_cn
    }
}
