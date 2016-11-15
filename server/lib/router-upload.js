import _debug from 'debug'
const debug = _debug('app:server:upload')

const uuid = require("uuid")
const path = require("path")
//const mount = require("koa-mount")
const parse = require("async-busboy")
const dateformat = require("dateformat")
const fs = require("fs")
const mkdirp = require("mkdirp")
const getRawBody = require('raw-body')
const contentType = require('content-type')

export default class Uploader {
    constructor (opts) {
        // save opts.
        this.opts = opts || {};

        // init router for apis.
        var router = require('koa-router')(this.opts.router);
        this.router = router;
        // routers start.........
        // ......................
        router.post('/upload/base64/:filename', this.uploadBase64.bind(this));
        router.post('/upload/form', this.uploadForm.bind(this));
    }

    async uploadBase64 (ctx, next) {
        //console.log (ctx.req);
        var filename = ctx.params.filename;
        var charset = 'utf-8';
        try {
            charset = contentType.parse(ctx.req).parameters.charset;
            //console.log ("get charset", charset);
        } catch (e) {
            console.log ("parse charset error!", e);
            charset = 'utf-8';
        }
        var rawText = await getRawBody(ctx.req, {
            encoding: charset
        });
        var destfile = `${path.basename(filename, path.extname(filename))}-${dateformat(new Date(), "yyyymmdd")}-${uuid.v4()}${path.extname(filename)}`
        //console.log (rawText);
        var matches = rawText.match(/^data:.+\/(.+);base64,(.*)$/);
        var ext = matches[1];
        var base64_data = matches[2];
        var buffer = new Buffer(base64_data, 'base64');

        const folder = path.join(process.cwd(), this.opts.folder);
        const filepath = path.join(folder, destfile);
        fs.writeFileSync (filepath, buffer);
        ctx.body = { errcode:0, file: destfile };

/*
        var data_url = req.body.file;
        var matches = data_url.match(/^data:.+\/(.+);base64,(.*)$/);
        var ext = matches[1];
        var base64_data = matches[2];
        var buffer = new Buffer(base64_data, 'base64');

        fs.writeFile(__dirname + '/media/file', buffer, function (err) {
            res.send('success');
        });
        var filename = ctx.params.filename;
        ctx.body = { errcode:0, filename: filename };
*/
        return;
    }

    async uploadForm (ctx, next) {
        // Validate Request
        if (!ctx.request.is("multipart/*")) {
            return await next()
        }

        // Parse request for multipart
        const {files, fields} = await parse(ctx.req)

        // Generate oss path
        let result = {}
        files.forEach(file => {
            result[file.filename] = `${path.basename(file.filename, path.extname(file.filename))}-${dateformat(new Date(), "yyyymmdd")}-${uuid.v4()}${path.extname(file.filename)}`
        })
        
        const folder = path.join(process.cwd(), this.opts.folder);
        // Upload to OSS or folders
        try {
            await Promise.all(files.map(file => { return this.put(folder, result[file.filename], file) }))
        } catch (err) {
            ctx.status = 500
            //ctx.body = `Error: ${err}`
            ctx.body = {errcode: -1, errmsg: err.message};
            return
        }
        //ctx.res.setHeader("Content-Type", "application/json")
        ctx.status = 200;
        ctx.body = { errcode: 0, files: result };
        // // Return result
        // ctx.status = 200
        // // Support < IE 10 browser
        // ctx.res.setHeader("Content-Type", "text/html")
        // ctx.body = JSON.stringify(store.get(result))
        return
    }

    put (folder, filename, file) {
        return new Promise((resolve, reject) => {
            const filepath = path.join(folder, filename)
            mkdirp.sync(path.dirname(filepath))
            const stream = fs.createWriteStream(filepath)
            file.pipe(stream)
            file.on("end", () => { return resolve(filename) })
        })
    }
    
}
