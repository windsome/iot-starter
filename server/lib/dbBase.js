import _debug from 'debug'
const debug = _debug('app:server:apis')

// common database method.
export function dbCreate (table) {
    return async function (ctx) {
        var thing = ctx.request.query.thing || ctx.request.body.thing;
        try {
            if (thing && (typeof thing === 'string')) thing = JSON.parse(thing);
        } catch (e) {
            ctx.body = {errcode: -1, errmsg: e.message};
            return;
        }
        //console.log ("windsome mqtt", this.mqttLock);
        var instance = await table.create(thing);
        var obj = instance && instance.get({ plain: true });
        console.log ("windsome", obj);
        ctx.body = {...obj, errcode: 0};
    }
}

export function dbUpdate (table) {
    return async function (ctx) {
        var thing = ctx.request.query.thing || ctx.request.body.thing;
        try {
            if (thing && (typeof thing === 'string')) thing = JSON.parse(thing);
        } catch (e) {
            ctx.body = {errcode: -1, errmsg: e.message};
            return;
        }
        var id = ctx.request.query.id || ctx.request.body.id || thing.id;

        var instance = await table.findOne({ where: { id: id } });

        if (instance) {
            await instance.update(thing);
            var obj = instance && instance.get({ plain: true });
            console.log ("windsome", obj);
            ctx.body = {...obj, errcode: 0};
        } else {
            ctx.body = {errcode: -1, errmsg: 'no such record!'};
        }
    }
}

export function dbList (table) {
    return async function (ctx) {
        var offset = ctx.request.query.offset || ctx.request.body.offset || 0;
        var count = ctx.request.query.count || ctx.request.body.count || 10;
        var where = ctx.request.query.where || ctx.request.body.where;
        try {
            if (where && (typeof where === 'string')) where = JSON.parse(where);
        } catch (e) {
            ctx.body = {errcode: -1, errmsg: e.message};
            return;
        }
        console.log ("windsome", where, ctx.request.body);
        var instances = await table.findAll({
            where: where,
            offset: offset,
            limit: count
        });
        //console.log ("windsome", locks);
        var objs = instances.map( (instance) => ( instance.get({ plain:true }) ) );
        ctx.body = {errcode: 0, data: objs};
    }
}

export function dbDestroyById (table) {
    return async function (ctx) {
        var id = ctx.request.query.id || ctx.request.body.id;
        var count = await table.destroy({
            where: {
                id: id
            }
        });
        console.log ("windsome", count);
        ctx.body = {errcode: 0, count: count};
    }
}

export function dbDestroy (table) {
    return async function (ctx) {
        var where = ctx.request.query.where || ctx.request.body.where;
        try {
            if (where && (typeof where === 'string')) where = JSON.parse(where);
        } catch (e) {
            ctx.body = {errcode: -1, errmsg: e.message};
            return;
        }
        console.log ("windsome", where, ctx.request.body);

        var count = await table.destroy({ where: where });
        console.log ("windsome", count);
        ctx.body = {errcode: 0, count: count};
    }
}

