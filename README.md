# CCSandbox

一个基于MVVM设计的CocosCreator游戏框架，数据和视图实现数据绑定  多渠道 多皮肤 多包名（大厅+子游戏）

# 框架使用的CocosCreator版本 2.2.2

框架解决的问题
---
* 解决多渠道打包特别频繁，出包特别慢，出包步骤太多的问题，框架内包含出包配置插件，可视化配置渠道参数，一键出包 傻瓜式操作
* 解决了一个项目更换多套皮肤的工作量，对数据、逻辑、视图进行隔离，换皮就是更换视图层，而视图层代码量是最少的，一套数据和逻辑层对应N套视图层，从而大大提高了项目在换皮这方面的工作进度，配合一键换肤插件，出包时只需选择使用哪套皮肤点击保存即可打出对应的包出来，并且资源也是完全独立，不会有多余的资源包含在内
* 多语言可视化配置，同时可以创建多套语言包，在出包时可以快速的选择对应的语言包
* 按模块划分功能，每个模块在创建时同时会创建一套规范的目录结构和typescript脚本来保证每个模块的目录结构和代码风格统一，便于项目管理和维护
* 一套完整的热更新管理 子包zip压缩 版本号根据模块内容改变来自动递增
* 模块内事件通知解耦模块内部功能  跨模块事件通知解耦多个模块

考虑后续更新内容
---
* 网络模块
* 一键换肤
* 检查资源错误引用
* iOS/Android 的 sdk 可视化配置 告别原生IDE 真正的一键打包

目录说明
---
* mainModules 目录存放主模块 游戏启动时会更新这个目录的模块资源
* subModules 目录存放子模块，游戏过程中选择性的安装子模块，（子游戏下载/更新）
* languages 目录是由出包配置生成的多语言typescript脚本


主要抽象类描述
---
* AbstractModule: 模块抽象类，持有本模块的 model 和 viewModel
* AbstractModel: model抽象类 每个模块的model都要继承它 每个模块可以有一个或多个model和viewModel
* AbstractViewModel: viewModel抽象类 只能持有一个model
* AbstractView: view抽象类 只能持有一个viewModel 每个UI脚本都要继承它


类装饰器描述
---
* @Model(model:AbstractModel) 使用在viewModel中 用来指定当前的viewModel 持有的model

* @Inject(module:string,model:AbstractModel) 使用在viewModel中 
  - module:要注入的模块名 
  - model:要注入的model 指定后会将指定的model中的变量绑定到当前的viewModel 中 例如通用的服务器通知，不需要每个model都去监听，只需要注入一个通用的model即可，当被注入的model中的字段改变时会被通知

* @Model 和 @Inject的区别是 @Model只能使用本模块下的model并且可以在当前的viewModel去改变他的值，@Inject注入进来的是其他模块的model,只能被通知，无法修改注入model的字段

* @ViewModel(module:string , viewModel:AbstractViewModel,autoInjectCommands?:boolean) 使用在view中 每个view只能持有一个viewModel
  - module:指定当前模块名， 
  - viewModel：要使用的viewModel  
  - autoInjectCommands：用来确定是否将viewModel的方法注入到本view中

属性装饰器描述
---
* @Mutable 用在model中 用来修饰一个变量 当这个变量有改变是会通知到viewModel同名变量中
* @Bindable 用在viewModel中 用来修饰一个和model中同名的变量 只有被它修饰的变量才会和model同名变量产生绑定关系
* @InjectBind 用在viewModel中 用来修饰一个被注入的变量 就是使用@Inject注入的model中的同名变量来接收改变通知
* @Binding 用在view中 被它修饰的变量会和viewModel中同名变量产生绑定关系，当变量改变时view刷新页面内容

框架内包含几个测试模块 展示了如何使用这些装饰器

测试
---
* 打开工程
* 点击cocos creator 顶部菜单栏 沙盒包->出包配置
* 创建一个公司，创建包名 配置本地热更新地址（项目根目录包含一个node服务器server 方便真机测试）
* 选择使用的皮肤 使用的语言包 选择包名 
* 本地资源服务器路径选择项目根目录 server/hotUpdate 
* 点击保存，此时查看resources 目录下会生成 company.json runtime.json 这两个文件
* 配置本地热更新地址  然后把本地node服务器开启
* 打开cocos creator 的构建面板 选择平台和配置后 点击构建->编译->运行即可(首次安装包到手机上才需要点击编译->运行)
* 之后在项目里随便修改点什么 然后点击构建即可 然后重启手机即可查看最新修改

框架内部有几个简单的模块用来简单的说明使用方法，具体可以自行阅读代码


如果有问题欢迎一起探讨 也欢迎有兴趣的朋友贡献代码 一起学习交流 icipiqkm@gmail.com


