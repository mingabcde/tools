// define(function(require) {
//     // commonjs规范,引用后，其后就能使用
//     require('my');
//     console.log(MY)
// });
define(['tail/tail', 'require', 'jquery', 'css!./tyle.css'], function(tail, require, $) {
    // module transports规范，前面引用，回调函数中使用
    // 通过require方法引入指定id模块（这里的require是异步方法，commonjs规范是无法引入具有id的模块
    require(['tail'], function(tail){
        console.log(tail)
    })
    console.log(tail, $().jquery);
}); 