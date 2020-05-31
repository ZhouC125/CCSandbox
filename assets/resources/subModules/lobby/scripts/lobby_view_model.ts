/**
 * viewModel层
 * 负责处理业务逻辑，提供接口给view层调用，例如向服务器发消息，例如一些和UI显示无关的业务逻辑
 * 它是view和model的粘合层，使用@Bindable来绑定model的同名变量 只有绑定了变量，view才会收到通知
 * 如果未使用@Bindable 则不会收到 model 的通知
 */
import { AbstractViewModel, Model, Bindable, Command, Inject, InjectBind } from '../../../framework/abstract/mvvm/AbstractViewModel';
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
        /**
         * 方式三 这种也是可以的，要注意的是，使用这种方法的前提是 你也要在本类中 添加如下代码
         * @Bindable __testVar: string
         * 因为这种绑定的方式和view绑定没有任何区别，只有使用了@Bindable 才会收到来自model的通知
         */
        this.bind("__testVar", (value: string) => {
            cc.log("viewModel 通过this.bind的方式获得了通知 value:", value)
        }, this)
    }
    protected unload() {
    }
    /** view 当然也可以绑定来自viewModel定义的变量通知 */
    private __inputValue: string = ''

    /** 使用@InjectBind 绑定@Inject 注入的model同名变量 */
    @InjectBind __common_refresh: number

    /** 方式一 使用 @Bindable 绑定本model的__testVar 变量 */
    @Bindable __testVar: string

    /** 方式二 测试注释掉方式一 */
    // get __testVar() { return this.model.__testVar }
    // @Bindable set __testVar(value: string) {
    //     // 当 __testVar 改变时 我要先做一些事情，但我在这里修改value的值时并不会真的改变__testVar
    //     // 在这里搞点事情...
    //     cc.log("viewModel set value:", value)
    //     this.model.__testVar = value
    // }

    // 当按钮被点击
    @Command onClick() {
        // 试一下看能不能影响注入的变量
        // this.__common_refresh = 1000

        this.__testVar = "__testVar 被 viewModel 修改"
        // 调用model改变一个变量的值
        this.model.change()
    }
    // 当输入框内容改变时 
    @Command onChangeInput(event: string) {
        // 改变__inputValue 并通知view
        this.__inputValue = event
    }
    /** 多语言切换英文 */
    @Command onTabEn() {
        i18n.language = Languages.en
    }
    /** 多语言切换中文 */
    @Command onTabCn() {
        i18n.language = Languages.zh_cn
    }
}
