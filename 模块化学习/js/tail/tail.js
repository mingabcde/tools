// 给此模块设置id：tail
define('tail', [
    'jquery',
    'MY',
    'exports',
    'module'
], function($, MY, exports, module) {   
    console.log(this) 
    var tail = 'tail';
    // exports.data = {data: 11, jquery: $, my: MY};
    // this.color = 'red';
    // this.msg = 'hello'
    module.exports = [tail, $, MY]
    // return [tail, $, MY]
});
   