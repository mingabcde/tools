// 创建闭包，防止污染内部环境
var MY = (function () {
    // 定义对象，将之前的mystudy.js面向过程的函数改为面向对象的方法
    var my = {};
    // 封装方法getchildNodes（dom）获取有效节点
    // 不包括空白字符的文本节点
    my.getchildNodes = function(dom) {
        var arr = [];
        // 定义正则
        var reg = /^\s*$/;
        for (var i = 0; i < dom.childNodes.length; i++) {
            if (dom.childNodes[i].nodeType===3) {
                if (!reg.test(dom.childNodes[i].nodeValue)) {
                    arr.push(dom.childNodes[i]);
                }
            }else {
                arr.push(dom.childNodes[i]);
            }
        } 
        return arr;
    }

    //节流方法
    /*****
     * @fn 回调函数
     * @data 为true时为清除定时器
     * @data 为对象时{time：延迟时间, context: 上下文, args:[]传入给回调函数的参数}
     * **************/
    my.throttle_last = function(fn, data) {
        fn.__timebar && clearTimeout(fn.__timebar);
        if (data !== true) {
            var data = data || {};
            var params = {
                time: data.time || 200,
                context: data.context || null,
                args: data.args
            }
            fn.__timebar = setTimeout(function() {
                fn.apply(params.context, params.args);
            }, params.time)
        }
    }
    /***
     * 基于时间的节流
     * @fn 回调函数
     * @data 为对象时{time：延迟时间, context: 上下文, args:[]传入给回调函数的参数}
     * **************/
     my.throttle_time = function(fn, data) {
        if (fn.__lock){return;}
        fn.__lock = true;
        var data = data || {};
        var params = {
                time: data.time || 1000,
                context: data.context || null,
                args: data.args
            };
        fn.apply(params.context, params.args);
        setTimeout(function() {
            fn.__lock = false;
        }, params.time);
    }

    // 封装方法：在节点后插入节点。往元素前插入节点函数已存在API insertBefore()
        // *@parent  父节点
        // *@new_child  父节点中要插入的节点
        // *@old_child  父节点中的参考节点  。如果没有参考节点，只有有第二个参数，就会默认在最后插入新节点
    my.insertAfter = function(parent,new_child,old_child) {
        return parent.insertBefore(new_child,old_child.nextSiblin);
    }
    // 封装方法：在父节点里面头部添加第一个节点。API函数father.appendChild(child)为在最后添加一个子节点。
        // *@parent  父节点
        // *@child  父节点中要插入的节点
    my.prependChild = function(parent,child) {
        return parent.insertBefore(child,parent.firstChild);
    }
    // 封装方法：DOM对象节点后插节点,在dom2后插入dom1
    my.after = function(dom1,dom2){
        return dom2.parentNode.insertBefore(dom1,dom2.nextSiblin);
    }
    // 封装方法：节点前插方法, 在dom1前插入dom2
    my.before = function(dom1,dom2){
        return dom2.parentNode.insertBefore(dom1,dom2);
    }

    //  判断浏览器支持window的getComputedStyle()方法的能力，设计封装函数getStyle()，、
    //  使浏览器不管支不支持都可以通过该方法得到计算样式。 
    //     *@obj   元素对象
    //     *@key   属性名称
    //     *@return 获取的样式 //注：带单位
    my.getStyle = function(obj,key){
        if (window.getComputedStyle){
            // 方法一
            return getComputedStyle(obj)[key];
            // 方法二
            // 将驼峰转为横杆式
            // key = key.replace(/([A-Z])/g, function(match,$1) {
            //     return '-' + $1.toLowerCase();
            // })
            // return getComputedStyle(obj).getPropertyValue(key);
        }
        else {
            //低版本IE浏览器能力检测
            var style = obj.currentStyle;
            if (style){
                key.replace(/-([a-z])?/g,function(match,$1) {
                    return ($1 || '').toUpperCase();
                });
                return style[key];
            }
            else{
                console.log('你的浏览器不支持获取计算样式');
            }
        }
    }

    // 封装绑定事件函数bindEvent()
        // *@dom      dom对象元素
        // *@type     事件类型
        // *@fn       回调函数
    my.bindEvent = function(dom, type, fn) {
        // 火狐浏览器监测
        if(type === 'mousewheel' && /firefox/i.test(navigator.userAgent)) {
            type = 'DOMMouseScroll';
        }
        //浏览器能力检测
        //针对dom2级事件绑定
        if (dom.addEventListener) {
            dom.addEventListener(type,fn);
        }
        //针对IE事件绑定
        // 要修改this指向，因为attachEvent默认指向window
        else if (dom.attachEvent) {
            dom.attachEvent('on' + type, function(e) {
                // 兼容性
                // e.target = e.srcElement;
                // e.currentTarget = this;
                fn.call(dom,e);
            });
        }
        //针对dom0级事件绑定
        else {
            // 事件缓存
            var oldfn = dom['on' + type];
            dom['on' + type] = function(e) {
                // 如果之前已绑定dom0事件，先执行之前的
                //兼容事件对象的获取.IE低版本Dom0级事件没有将事件对象传递给事件函数，
                //必须需访问window.event获取（注.其他高级浏览器也有window.event)。
                oldfn && oldfn(e || window.event); 
                fn(e || window.event);
            };
        }
    }
    // 封装移除事件函数：注：移除事件的回调函数必须是有名字的函数。
    // 此函数没有第四个参数，所以只能移除冒泡阶段事件。
    my.removeEvent = function(dom, type, fn) {
        // 火狐浏览器监测
        if(type === 'mousewheel' && /firefox/i.test(navigator.userAgent)) {
            type = 'DOMMouseScroll';
        }
        // dom2级事件移除
        // if (arguments.length === 3) {
        if (dom.removeEventListener) {
            dom.removeEventListener(type, fn);
        }
        // IE attachEvent事件移除
        else if (dom.detachEvent) {
            dom.detachEvent('on' + type, fn);
        }
        // }   
        else {
            dom['on' + type] = null;
        }
    }

    my.p = function(key) {
        return key==='opacity' ? '' : 'px';
    }
    // *实现animate方法
    // *@dom  dom对象
    // *@style  样式对象
    // *@time   执行时间，若时间null，默认为1秒
    // *@callback  动画结束后，执行的函数
    my.animate = function(dom, style, time, callback) {
        var count = 0; //当前执行次数
        var num = parseInt((time || 1000)/30); //需执行的总次数
        var sty_ = {};
        // 获取当前样式
        for (var key in style) {
            sty_[key] = parseInt(my.getStyle(dom,key));
        }
        // 获取步长
        var step = {};
        for (var key in style) {
            step[key] = (parseInt(style[key]) - sty_[key]) / num;
        }
        var timebar = setInterval(function() {
            count++;
            for (var key in step) {
                dom.style[key] = sty_[key] + step[key] * count + my.p(key);
            }
            if (count >= num) {
                //修正样式
                for (var key in step) {
                    dom.style[key] = parseInt(style[key]) + my.p(key);
                    // dom.style[key] = typeof style[key] ==='string' ? style[key] : style[key] + 'px';
                }
                clearInterval(timebar);
                callback && callback();
            }
        },30)
    }

    // 封装设置样式的方法
    my.css = function(dom, key, value) {
        if (typeof key === 'string') {
            dom.style[key] = value;
        }
        else {
            for (var name in key) {
                my.css(dom, name, key[name]);
            }
        } 
    }

    // 方法offset(dom),和jquery中的offset功能相同。注：这个距离好像是dom的border边到页面的距离，
    // jquery中的position方法直接获得的是定位值，而my.css中书写的定位值是从margin边到父定位元素border（包含父元素padding）的距离。？？？
    // 注意：offsetLeft和offsetTop是border边到父定位元素border（包含父元素padding）的距离。
    my.offset = function(dom) {
        // 获取当前元素定位值
        var result = {
            top: dom.offsetTop,
            left: dom.offsetLeft
        };
        while (dom.offsetParent) {
        // 获取当前元素的父定位元素
        dom = dom.offsetParent;
        //   累加结果，在高级浏览器下，offsetLeft,offsetTop,不包括父定位元素边框
        result.top += dom.offsetTop + dom.clientTop;  
        result.left += dom.offsetLeft + dom.clientLeft;  
        }
        return result;
    }

    // 制作京东放大器插件
    // *@dom 元素
    // *@url 图片地址
    // *@width height  盒子宽高
    my.imageZoom = function(dom, url, width, height) {
        // 创建图片有两种方式 1、new Image() 2、document.createElement('img');
        var mask = document.createElement('div');
        var big = document.createElement('div');
        dom.appendChild(mask);
        dom.appendChild(big);
        my.css(dom,{
            width: width + 'px',
            height: height + 'px',
            // border: '1px solid black',
            position: 'relative',
            backgroundImage: 'url('+url+')',
            backgroundSize: 'cover',
            cursor: 'move'
        });
        my.css(mask, {
            width: (width / 2) + 'px',
            height: (height / 2) + 'px',
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'yellow',
            opacity: 0.5,
            display: 'none'
        });
        my.css(big, {
            position: 'absolute',
            top: 0,
            left: '100%',
            backgroundImage: 'url('+url+')',
            width: width + 'px',
            height: height + 'px',
            display: 'none'
        }) 
        var x, y;
        // 利用封装函数offset获得dom的内border边到页面的距离。- dom.offsetLeft ;- dom.offsetTop
        var offset_dom_x = my.offset(dom).left;
        var offset_dom_y = my.offset(dom).top;
        my.bindEvent(dom, 'mouseenter', function(e) {
            my.css(mask, {
                display: 'block'
            });
            my.css(big, {
                display: 'block'
            });
            my.bindEvent(dom, 'mousemove', function(e) {
                // 获取新的定位值，mask层没margin，不用考虑margin的影响了
                x = e.pageX - offset_dom_x - width / 4;
                y = e.pageY - offset_dom_y - height / 4;
                x = x < 0 ? 0 : x;
                y = y < 0 ? 0 : y;
                x = x > width / 2 ? width / 2 : x;
                y = y > height / 2 ? height /2 : y;
                my.css(mask, {
                    left: x + 'px',
                    top: y + 'px'
                });
                my.css(big, {
                    backgroundPositionX: x * -2 + 'px',
                    backgroundPositionY: y * -2 + 'px'
                });
            })
        });
        my.bindEvent(dom, 'mouseleave', function() {
            my.css(mask, {
                display: 'none'
            })
            my.css(big, {
                display: 'none'
            })
        })
        my.bindEvent(big, 'mouseenter', function() {
            my.css(mask, {
                display: 'none'
            })
            my.css(big, {
                display: 'none'
            })
        })
    }

    // 封装插件 dealImage(dom, url)
    my.dealImage = function(dom, url) {
        // 创建图片，但没组装进dom
        var img = new Image();
        img.src = url;
        // 图片加载完成后，处理
        img.onload = function() {
            // 获取背景的宽高
            var width = img.width;
            var height = img.height;
            // 创建元素：暗层，遮盖层，小圆点
            var blackBox = document.createElement('div');
            var mask = document.createElement('div');
            var dot = document.createElement('div');
            // 组装
            dom.appendChild(blackBox);
            dom.appendChild(mask);
            mask.appendChild(dot);
            // 设置样式
            my.css(dom, {
                width: width + 'px',
                height: height + 'px',
                border: '2px solid red',
                backgroundImage: 'url('+ url +')',
                position: 'relative'
            });
            my.css(blackBox, {
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                backgroundColor: 'black',
                opacity: 0.5
            });
            // 默认遮盖层150*150
            my.css(mask, {
                width:'150px',
                height: '150px',
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: 'move',
                backgroundImage: 'url('+ url +')'
            });
            my.css(dot, {
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'red',
                position: 'absolute',
                right: '-5px',
                bottom: '-5px',
                cursor: 'default'
            })
            // 交互
            // 小圆点交互
            var x, y, ox, oy, omousex, omousey, mousex, mousey, maskoffsetx, maskoffsety;
            my.bindEvent(dot, 'mousedown',function(e) {
                e.preventDefault();//阻止默认事件
                e.stopPropagation();//阻止冒泡
                // 获取当前遮盖层宽高
                ox = parseInt(my.getStyle(mask, 'width'));
                oy = parseInt(my.getStyle(mask, 'height'));
                // 获取鼠标距离
                omousex = e.clientX;
                omousey = e.clientY;
                // 获取遮盖层较图片盒子偏移量
                maskoffsetx = mask.offsetLeft;
                maskoffsety = mask.offsetTop;
                // 绑定鼠标移动事件
                my.bindEvent(document, 'mousemove', moveDot)
            })
            function moveDot(e) {
                // 获取当前鼠标距离
                mousex = e.clientX;
                mousey = e.clientY;
                // 计算当前需要改变为的mask层宽高
                x = ox + mousex - omousex;
                y = oy + mousey - omousey;
                // 限值处理
                x = x < 0 ? 0 : x;
                y = y < 0 ? 0 : y;
                x = x > (width - maskoffsetx) ? (width - maskoffsetx) : x;
                y = y > (height - maskoffsety) ? (height - maskoffsety) : y;
                my.css(mask, {
                    width: x + 'px',
                    height: y + 'px'
                });
            }
            // // 鼠标弹起，清除mousemove事件
            my.bindEvent(document, 'mouseup', function() { 
                my.removeEvent(document, 'mousemove', moveDot);
            })

            // 遮盖层交互
            var oldmx, oldmy, newmx, newmy, mw, mh, oldmox, oldmoy, newmox, newmoy;
            my.bindEvent(mask, 'mousedown', function(e) {
                e.preventDefault(); //阻止默认事件
                // 获取当前鼠标
                oldmx = e.clientX;
                oldmy = e.clientY;
                // 获取遮盖层宽高，用作限值
                mw = parseInt(my.getStyle(mask, 'width'));
                mh = parseInt(my.getStyle(mask, 'height'));
                // 获取当前遮盖层偏移量，（定位值）
                oldmox = mask.offsetLeft;
                oldmoy = mask.offsetTop;
                // 鼠标移动事件
                my.bindEvent(document, 'mousemove', movemask);
            })
            function movemask(e) {
                // 获取新的鼠标
                newmx = e.clientX;
                newmy = e.clientY;
                // 计算新的偏移量（定位值）
                newmox = newmx - oldmx + oldmox;
                newmoy = newmy - oldmy + oldmoy;
                // 限值
                newmox = newmox < 0 ? 0 : newmox;
                newmoy = newmoy < 0 ? 0 : newmoy;
                newmox = newmox > (width - mw) ? (width - mw) : newmox;
                newmoy = newmoy > (height - mh) ? (height - mh) : newmoy;
                my.css(mask, {
                    backgroundPositionX: -newmox + 'px',
                    backgroundPositionY: -newmoy + 'px',
                    left: newmox + 'px',
                    top: newmoy + 'px'
                });
            }
            // 鼠标弹起，移除mask层事件
            my.bindEvent(document, 'mouseup', function() {
                my.removeEvent(document, 'mousemove', movemask);
            })
        };
    
    }

    // 观察者模式
    my.Observer = (function() {
        var _msg = {};
        return {
            // 注册消息
            on: function(type, fn) {
                if(_msg[type]) {
                    _msg[type].push(fn);
                }else {
                    _msg[type] = [fn];
                }
            },
            // 发布消息
            trigger: function(type) {
                if (_msg[type]) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    for (var i = 0; i < _msg[type].length; i++) {
                        _msg[type][i].apply(null, args);
                    }
                }
            },
            // 注销消息，注：匿名消息无法注销
            off: function(type, fn) {
                // 注销全部队列
                if (type === undefined) {
                    _msg = {};
                    return;
                }
                if (fn) {
                    for (var i = _msg[type].length - 1; i >= 0; i--) {
                        if (_msg[type][i] === fn) {
                            _msg[type].splice(i, 1);
                            return;
                        }
                        
                    }
                }else {
                    _msg[type] = [];
                }
            },
            // 单次订阅
            once: function(type, fn) {
                var me = this;
                // 定义一个回调函数，将此函数放入订阅队列，并在此函数里执行用户单次订阅事件，
                // 在此函数中可以监测有没有发布过消息，如果发布了在此函数中注销该订阅
                function callback() {
                    // 先注销再执行(已经执行到这来，说明执行了一次）。先运行后订阅会产生问题：用户在订阅函数中订阅消息，无限循环
                    me.off(type, callback);
                    fn.apply(null, arguments);
                }
                this.on(type, callback);
            }
        }
    })();

    // 寄生组合式继承
    my.inherit = function(child, parent) {
        // 定义寄生类
        function F() {
           this.constructor = child;
        }
        F.prototype = parent.prototype;
        child.prototype = new F();
        // 对静态数据继承
        for (let key in parent) {
            if (parent.hasOwnProperty(key)) {
                child(key) = parent[key];
            }
        }
        return child;
    }

    
    // 封装方法ajax ,返回一个Promise 对象，可以使用then，catch等监听结果
        //options 对象{
        //     url:   //请求地址
        //     method: // 请求方式
        //     data:   // GET请求，url中query数据 或者是POST请求时请求体数据，可以写对象，也可以写字符串
        //     header:  // 要设置的请求头内容(是个对象)
        //     sync:   //是否异步请求
        // }
    my.ajax = function(options) {
        // 适配参数options
        options = Object.assign({
            url: '',
            method: 'GET',
            data: '',
            header: {},
            sync: true
        }, options);
        // 适配options的data数据
        // 如果是对象，转为字符串格式
        if (!(typeof options.data === 'string')) {
            let str = '';
            for (let key in options.data) {
                str += `&${key}=${options.data[key]}`
            }
            options.data = str.slice(1)
        }
        //GET请求url添加query数据
        if (options.method === 'GET' && options.data) {
            options.url += '?' + options.data;
        }
        return new Promise((resolve, reject) => {
            // 获取ajax对象，
            // 功能检查
            let xhr;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                xhr = new ActiveXObject();
            } else {
                alert('你的浏览器不支持ajax');
                reject('你的浏览器不支持ajax')
            }
            // 监听
            xhr.onreadystatechange = function() {
                // console.log(111, )
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 304) {
                        //建议传递json数据
                        if (xhr.responseXML) {
                            resolve(xhr.responseXML)
                        } else if (xhr.responseText) {
                            resolve(JSON.parse(xhr.responseText))
                        }
                    } else {
                        reject('请求失败')
                    }
                }
            }
            // 建立连接
            xhr.open(options.method, options.url, options.sync);
            // 设置请求头
            if (options.header) {
                for (let key in options.header) {
                    xhr.setRequestHeader(key, options.header[key])
                }
            }
            // 发送请求
            xhr.send(options.data)
        })
    }

    // 实现表单序列化方法，传递一个from的dom , 返回此表单的数列化的query形式数值
    my.serialize = function(form) {
        let str = '';
         //    使用element,获取表单全部元素，是一个类数组
         // 遍历类数组对象
         Array.from(form.elements, item => {
             if (item.name) {
                 if (item.type === 'checkbox') {
                     if (item.checked) {
                         str += `&${item.name}=${item.value}`
                     }
                 } else {
                     str += `&${item.name}=${item.value}`
                 }
             }
         })
         return str.slice(1);
     }

    // 简单定义模板引擎函数
    // tpl:模板内容 data：适配过的数据对象
    // function formatTpl(tpl, data) {
    //     return tpl.replace(/{{(\w+)}}/g, (match, $0) => {
    //         return data[$0] || '';
    //     })
    // }
    // 优化后的模板引擎
    // tpl:模板内容 data：数据对象
    function formatTpl(tpl, data) {
        //先使用正则将{{}}及里面内容分组出来，根据.符号分隔成数组，再用reduce 累次对象调用，最终将tpl{{}}里内容替换为对应属性值
        return tpl.replace(/{{([\w\.]+)}}/g, (match, $0) => {
            return $0.split('.').reduce((res, item) => res[item] === undefined ? '' : res[item], data);
        })
    }
    my.formatTpl = formatTpl;
    
    //返回闭包
    return my;
})();

var _ = MY;
