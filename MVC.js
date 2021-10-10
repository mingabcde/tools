let MVC = (function() {
    // 定义模型层
    let Model =(function() {
        let _Model = {};
        return {
            // 添加数据，实现属性连点添加
            set(key, value) {
                let arrKey = key.split('.');
                // 弹出最后一个属性名
                let lastKey = arrKey.pop();
                let result = _Model;
                arrKey.forEach(item => {
                    // console.log(item)
                    if (result[item] === undefined) {
                        result[item] = {}
                    } 
                    if (result[item] != null && (typeof result[item] === 'object' || typeof result[item] === 'function')) {
                        result = result[item];
                    } else {
                        throw new Error(`${result[item]} 的类型是: ${typeof result[item]}, 不能添加属性`)
                    }
                   
                })
                result[lastKey] = value;
                // console.log(_Model, this.get(key))
            },
            // 获取数据
            get(key) {
                let result = _Model;
                //分割
                let arrKey = key.split('.');
                arrKey.some(item => {
                    result = result[item]
                    return result === undefined;
                })
                return result;
            }
        }
    })()
    //视图层
    let View = (function() {
        let _View = {};
        return {
            // 添加视图
            add(key, fn) {
                _View[key] = fn;
            },
            // 提供渲染视图的方法
            render(key) {
                // 返回视图模块的运行结果 如dom元素,渲染视图时传递Model模块，实现视图访问模型层
                return _View[key] && _View[key](Model);
            }
        }
    })()
    // 控制器层
    let Ctrl = (function() {
        let _Ctrl = {};
        return {
            // 添加控制器
            add(key, fn) {
                _Ctrl[key] = fn;
            },
            // 安装一个控制器
            init(key) {
                //运行并传递模型和视图模块
                return _Ctrl[key] && _Ctrl[key](Model, View);
            },
            // 安装全部控制器
            install() {
                for (let key in _Ctrl) {
                    this.init(key)
                }
            }
        }
    })()
    return {
        addModel(key, value) {
            Model.set(key, value);
        },
        addView(key, value) {
            View.add(key, value)
        },
        addCtrl(key, value) {
            Ctrl.add(key, value)
        },
        install() {
            Ctrl.install();
        }
    }
})()
