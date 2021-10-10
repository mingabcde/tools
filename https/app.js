// 加载模块
let http = require('http');
let https = require('https');
let fs = require('fs');
let path = require('path')

// 获取指令执行位置
let root = process.cwd();
// 文件目录
let MINE_TYPES = {
    'html':     'text/html',
    'xml':      'text/xml',
    'txt':      'text/plain',
    'css':      'text/css',
    'js':       'text/javascript',
    'json':     'application/json',
    'pdf':      'application/pdf',
    'swf':      'application/x-shockwave-flash',
    'svg':      'image/svg+xml',
    'tiff':     'image/tiff',
    'png':      'image/png',
    'gif':      'image/gif',
    'ico':      'image/x-icon',
    'jpg':      'image/jpeg',
    'jpeg':     'image/jpeg',
    'wav':      'audio/x-wav',
    'wma':      'audio/x-ms-wma',
    'wmv':      'video/x-ms-wmv',
    'woff2':    'application/font-woff2'
};

async function main(req, res) {
    // 获取文件路径，并对中文地址解码
    let filepath = path.join(root, decodeURIComponent(req.url));
    // 文件路径默认处理
    if (!path.extname(filepath)) {
        filepath = path.join(filepath, './index.html')
    }
    // 解析文件路径
    let fileobj = path.parse(filepath);
    // 获取拓展名
    let extname = fileobj.ext.slice(1);
    // 判断文件是否存在
    let isExist = await new Promise(resolve => {
        fs.exists(filepath, result => resolve(result))
    })
    if (isExist) {
        // 获取文件内容
        let data = await new Promise(resolve => {
            fs.readFile(filepath, (err, data) => resolve(data))
        })
        if (data) {
            res.writeHead(200, {
                'Content-Type':  MINE_TYPES[extname || 'txt'] + '; charset=utf-8'
            })
            return res.end(data)
        }
    }
    else {
        res.writeHead(404, {
            'Content-Type':  MINE_TYPES.txt + '; charset=utf-8'
        })
        res.end(req.url + ' not found!')
    }
}
let key = fs.readFileSync(path.join(root, './ssl/privatekey.pem'));
let cert = fs.readFileSync(path.join(root, './ssl/certificate.pem'));
// let js = fs.readFileSync(path.join(root, './ssl/private.pem'))
console.log(key, cert)
// 监听
http.createServer(main).listen(80, () => {
    console.log('listen at 80')
})
https.createServer({key, cert}, main).listen(443, () => {
    console.log('listen at 443')
})