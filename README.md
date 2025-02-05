# react-native-multibundler
基于react native的metro bundler的配置化开发来处理分包，支持iOS和Android，metro bundler为官方打包的工具，使用官方分包方法更灵活稳定，比网上的一些方法更实用可靠。

现在更新到v2.1版本，该版本修复了基础包过滤不精确的问题、并支持debug

metro官方：https://facebook.github.io/metro/


支持react native 0.57~0.60，由于采用的是官方metro拆包，理论上日后的rn版本无需修改就能兼容

iOS和Android都有加载多bundle实例，经测试稳定可靠

### demo使用说明：

     1、进入项目文件夹：npm install

     2、android：使用android studio打开android项目 iOS：使用xcode打开iOS项目

     3、直接运行android或iOS项目，jsbundle包已经事先打好
     
<img src="https://github.com/smallnew/react-native-multibundler/raw/master/demo.gif" width="250" alt="Demo Android"></img>
     

### 如何接入原有项目：
#### android

    1、拷贝除了demo文件夹下的所有代码文件到项目
    
    2、根据自己的需要自定义platformDep.js和platform57.config.js，这里确定基础包包含的js module
    
    3、根据自己的需要确定你的业务入口js和buz57.config.js，这里确定业务包包含的js代码
    
    4、打包：根据底下给出的打包命令打包
    
    5、业务的UI入口使用继承自AsyncReactActivity的activity，重写getScriptPath和getScriptPathType确定业务bundle路径，重写getMainComponentName确定加载的业务module
    
    6、根据需要事先加载基础包，如果没有事先加载基础包，AsyncReactActivity会自动加载，加载基础包代码如下
    
    ReactInstanceManager reactInstanceManager = ((ReactApplication)getApplication()).getReactNativeHost().getReactInstanceManager();
        reactInstanceManager.createReactContextInBackground();//这里会先加载基础包platform.android.bundle，也可以不加载
        
      
    7、重写ReactApplication返回基础包的位置
    
#### iOS

    1、暴露RCTBridge的executeSourceCode方法，做法为将本项目中的RCTBridge添加到自己的工程
    
    2～4、与android的做法一样，见上方
    
    5、事先加载基础包：
    
    jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"platform.ios" withExtension:@"bundle"];
    bridge = [[RCTBridge alloc] initWithBundleURL:jsCodeLocation
                                 moduleProvider:nil
                                  launchOptions:launchOptions];
                                  
    6、加载业务包：
    
    NSURL *jsCodeLocationBuz = [[NSBundle mainBundle] URLForResource:bundleName withExtension:@"bundle"];
      NSError *error = nil;
      NSData *sourceBuz = [NSData dataWithContentsOfFile:jsCodeLocationBuz.path
                                             options:NSDataReadingMappedIfSafe
                                               error:&error];
      [bridge.batchedBridge executeSourceCode:sourceBuz sync:NO];
      
    7、创建RCTRootView，并绑定业务代码
    
    RCTRootView* view = [[RCTRootView alloc] initWithBridge:bridge moduleName:moduleName initialProperties:nil];
    

### DEBUG
```
从2.1版本之后加入了debug调试功能，主要工作原理：将需要debug的业务模块代码复制到debug入口文件MultiDebugEntry.js中，然后在原生端加载该入口文件来调试；
使用步骤：
1、配置需要调试的业务入口文件DegbugBuzEntrys.json，在这个json数组中加入业务入口js文件相对主工程的相对路径
2、在Android中的ScriptLoadUtil.java中的MULTI_DEBUG变量设置成true，或者在iOS中将MULTI_DEBUG设置为true
3、主工程目录下执行：node multiDebug.js
4、启动你的原生app，开始调试

```

### js项目结构：

```
.
├── App.js               业务界面1
├── App2.js              业务界面2
├── App3.js              业务界面3
├── LICENSE
├── README.md
├── android              android项目目录
├── app.json 
├── buzDep.json        UI打包中，打业务包的中间产物，这里面包含的是当前业务包的依赖
├── buz.config.js      业务包的打包配置
├── buz-ui.config.js     UI打业务包配置
├── index.js             业务1入口js
├── index2.js            业务2入口js
├── index3.js            业务3入口js
├── ios ios目录
├── multibundler         包含着debug配置和公用方法模块
├── multiDebug.js        debug node命令行工具
├── multiDebugEntry.js   debug生成的rn调试入口，里面拼接着需要调试模块的入口代码     
├── multibundler_cmd.txt 打包命令
├── package.json
├── platform-ui.config.js UI打基础包配置
├── platformDep-ui.js    UI打基础包入口
├── platform.config.js 基础包打包配置
├── platformDep.js       基础包打包入口
├── platform-import.js   UI打包中生成的基础包依赖的模块import代码
└── platformDep.json     UI打包中生成的基础包所依赖模块的配置文件
```
### android目录结构
```
.
├── AndroidManifest.xml
├── assets
│   ├── index.android.bundle   业务包
│   ├── index2.android.bundle  
│   └── platform.android.bundle 基础包
└── java
    └── com
        ├── facebook
        │   └── react
        │       ├── AsyncReactActivity.java 重要！rn业务加载入口，业务activity重写该类
        │       ├── ReactUtil.java
        │       └── bridge
        └── reactnative_multibundler
            ├── FileUtils.java
            ├── ScriptLoadUtil.java
            └── demo   demo目录，集成项目可删除
                ├── Buz1Activity.java
                ├── Buz2Activity.java
                ├── MainActivity.java
                └── MainApplication.java
```




### UI打包(现在支持mac os，windows)：
     使用方式：到package-ui-bin目录解压需要的平台打包工具，双击解压后的可执行文件
     选择打包选项后点击打包,该方法可代替命令打包并帮助计算业务包依赖并去重
<img src="https://github.com/smallnew/react-native-multibundler/raw/master/package-ui-demo.png" width="650" alt="Demo Android"></img>


打包命令如下：
## android
### 打android基础包
node ./node_modules/react-native/local-cli/cli.js bundle --platform android --dev false --entry-file platformDep.js --bundle-output ./android/app/src/main/assets/platform.android.bundle --assets-dest android/app/src/main/res/ --config /{你的绝对路径}/platform57.config.js
### 打android业务包
node ./node_modules/react-native/local-cli/cli.js bundle --platform android --dev false --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/ --config /{你的绝对路径}/buz57.config.js


## iOS
### 打iOS基础包
node ./node_modules/react-native/local-cli/cli.js bundle --platform ios --dev false --entry-file platformDep.js --bundle-output ./ios/platform.ios.bundle --assets-dest ./ios/ --config /{你的绝对路径}/platform57.config.js
### 打iOS业务包
node ./node_modules/react-native/local-cli/cli.js bundle --platform ios --dev false --entry-file index.js --bundle-output ./ios/index.ios.bundle --assets-dest ./ios/ --config /{你的绝对路径}/buz57.config.js
