// 引入mongodb, 
// 引入MongoClient, ObjectId(用来将id包装成对象， 从而支持通过id 删，改数据) 
let {MongoClient, ObjectId} = require('mongodb')

// 定义错误信息类
// let MESSAGE = {
//     databaseError: {error: 1, msg: '数据库连接错误'},
//     //插入
//     collectionInsertError: {error: 2, msg: '数据插入错误'},
//     collectionInsertNoData: {error: 3, msg: '没有插入数据'},
//     // 删除
//     collectionDeletError: {error: 4, msg: '数据删除错误'},
//     collectionDeletNoData: {error: 5, msg: '没有删除数据'},
//     // 改
//     collectionUpdateError: {error: 6, msg: '更新数据错误'},
//     collectionUpdateNoData: {error: 7, msg: '没有更新数据'},
//     // 查询
//     collectionFindError: {error: 8, msg: '查询数据错误'},
//     collectionFindNoData: {error: 9, msg: '没有查询到数据'}
// }
let { MESSAGE } = require('./index')

// 面向对象
class DateBase {
    constructor(address, datebaseName, collectionName) {
        this.address = address;
        this.datebaseName = datebaseName;
        this.collectionName = collectionName;
    }
    // 修改集合
    collection(newcollectionName) {
        this.collectionName = newcollectionName;
        // 链式调用
        return this;
    }
    // 连接方法，每次操作数据库都要连接
    connect() {
        // 连接数据库
        return new Promise((resolve, reject) => {
            if (this.db) {
                return resolve(this.db)
            }
            MongoClient.connect(this.address, {useNewUrlParser: true}, (err, client) => {
                if (err) {
                    reject(MESSAGE.databaseError)
                } else {
                    this.db = client.db(this.datebaseName),
                    this.client = client;
                    process.on('exit', () => {
                        // 进程接收是关闭数据库
                        client.close();
                    })
                    resolve(this.db)
                }
            })
        })     
    }
    // 插入数据方法
    insertOne(obj) {
        return new Promise((resolve, reject) => {
            // 连接
            this.connect()
                .then(
                    db => {
                        // 插入数据
                        db.collection(this.collectionName).insertOne(obj, (err, data) => {
                          
                            if (err) {
                                // 插入出错
                                reject(MESSAGE.collectionInsertError);
                            } else if (data.result.n > 0) {
                                resolve(data.result);
                            } else {
                                //没有插入数据
                                reject(MESSAGE.collectionInsertNoData);
                            }
                        })
                    },
                    err => reject(err)
                )
        })
    }
    // 插入多条数据
    insertMany(objArr) {
        return new Promise((resolve, reject) => {
            this.connect()
                .then(
                    db => {
                        db.collection(this.collectionName).insertMany(objArr, (err, data) => {
                            if (err) {
                                reject(MESSAGE.collectionInsertError);
                            } else if (data.result.n > 0) {
                                resolve(data.result);
                            } else {
                                reject(MESSAGE.collectionInsertNoData);
                            }
                        })
                    },
                    err => reject(err)
                )
        })
    }
    // 删除一条数据
    deleteOne(obj) {
        return new Promise((resolve, reject) => {
            this.connect()
                .then(
                    db => {
                        // 支持通过_id 删除数据
                        if (obj._id) {
                            obj._id = ObjectId(obj._id);
                        }
                        // 删除数据
                        db.collection(this.collectionName).deleteOne(obj, (err, data) => {
                            if (err) {
                                reject(MESSAGE.collectionDeletError);
                            } else if(data.result.n > 0) {
                                resolve(data.result);
                            } else {
                                reject(MESSAGE.collectionDeletNoData);
                            }
                        })
                    },
                    err => reject(err)
                )
        })
    }
    // 删除多条数据
    deleteMany(objArr) {
       return Promise.all(objArr.map(item => this.deleteOne(item)));
    }
    // 更新一条数据
    updateOne(oldObj, newObj) {
        return new Promise((resolve, reject) => {
            this.connect()
                .then(
                    db => {
                        if (oldObj._id) {
                            oldObj._id = ObjectId(oldObj._id);
                        }
                        db.collection(this.collectionName).updateOne(oldObj, {$set: newObj}, (err, data) => {
                            if (err) {
                                reject(MESSAGE.collectionUpdateError);
                            } else if (data.result.n > 0) {
                                resolve(data.result);
                            } else {
                                reject(MESSAGE.collectionUpdateNoData)
                            }
                        })
                    },
                    err => reject(err)
                )
        })
    }
    // 更新多条数据（不同数据）
    updateMany(objarrArr) {
        return Promise.all(objarrArr.map(item => this.updateOne(...item)));
    }
    //查询一条数据
    findOne(obj) {
        return new Promise((resolve, reject) => {
            // 连接数据库
            this.connect()
                .then(
                    db => {
                        if (obj._id) {
                            obj._id = ObjectId(obj._id)
                        }
                        db.collection(this.collectionName).findOne(obj, (err, data) => {
                            if (err) {
                                reject(MESSAGE.collectionFindError)
                            } else if (data) {
                                resolve(data);
                            } else {
                                reject(MESSAGE.collectionFindNoData)
                            }
                        })
                    },
                    err => reject()
                )
        })
    }
    // 查询多条
    findMany(obj, fn = data => data) {
        return new Promise((resolve, reject) => {
            this.connect()
                .then(
                    db => {
                        let result = db.collection(this.collectionName).find(obj);
                        // 用回调函数处理查询的结果，处理完再用toArray转为数组便于观察
                        // 查询多条数据，允许回调函数中对多条数据倒序sort({_id: -1}), 数组从前部，跳过n条数据skip(n)； 截取n条数据limit(n)
                        fn(result).toArray((err, data) => {
                            if (err) {
                                reject(MESSAGE.collectionFindError);
                            } else if (data.length) {
                                resolve(data);
                            } else {
                                reject(MESSAGE.collectionFindNoData);
                            }
                        })
                    },
                    err => reject(err)
                )
        })
    }

}
module.exports = DateBase;