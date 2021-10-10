// 注：在引入模块时，当用./或../引入，都是参考的当前模块的目录
// 当不写./或../时 都是相当于根路径js（main.j所在目录为根目录）
// 自己总结：根目录下的文件引入，就不写./或../了，直接写绝对地址
//         不是根目录下的文件，可以通过paths配置，如jquery:'../lib/jquery-3.6.0'
// 这样方便定义id模块的id和模块地址统一(貌似)

require.config({
    // 简化路径
    paths: {
        lib: '../lib',
        // jquery: '../lib/jquery-3.6.0',
        MY: '../lib/MY',
    },
    
    // 文件转模块
    shim: {
        'MY': {
            deps: [],
            exports: 'MY'
        },
        'lib/jquery-3.6.0': {
            deps: [],
            exports: '$'
        },
        'lib/jquery-360': {
            deps: [],
            exports: '$'
        }
        // 'jquery': {
        //     deps: [],
        //     exports: '$'
        // },
    },
    // 配置模块文件，如：head模块和tail模块都使用jquery简化的路径引入jquery.js,但两个模块引入的版本不同
    map: {
        'head/head': {
            'jquery': 'lib/jquery-3.6.0'
        },
        'tail/tail': {
            'jquery': 'lib/jquery-360'
        },
        '*': {
            css: 'lib/css'
        }
    },
})
require(['head/head']);



