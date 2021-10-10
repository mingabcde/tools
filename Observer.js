let Observer = (function() {
    // 消息对象，用来存储消息管道
    let _msg = {};
    return {
        // 订阅
        on(type, fn) {
            if (_msg[type]) {
                _msg[type].push(fn);
            } else {
                _msg[type] = [fn];
            }
        },
        // 发布
        trigger(type, ...args) {
            if (_msg[type]) {
                _msg[type].forEach(fn => {
                    fn && fn(...args);
                })
            }   
        },
        // 注销
        off(type, fn) {
            if (type === undefined) {
                return ;
            }
            if (fn) {
                _msg[type] = _msg[type].filter(item => item !== fn);
            } else {
                _msg[type] = [];
            }
            
        },
        // 单次订阅
        once(type, fn) {
            let callback = (...args) => {
                // 先注销再执行(已经执行到这来，说明执行了一次）。先运行后订阅会产生问题：用户在订阅函数中订阅消息，无限循环
                this.off(type, callback);
                fn(...args)
            }
            this.on(type, callback)
        }
    }
})();