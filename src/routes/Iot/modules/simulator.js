import { createActions } from 'redux-actions';
import mqtt from 'mqtt'

const { receiveMessage, setIntervalId, clearIntervalId } = createActions('RECEIVE_MESSAGE', 'SET_INTERVAL_ID', 'CLEAR_INTERVAL_ID');

const guid = (() => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
})();

const defaultConfig = {
    id: guid,
    mac: '00:22:68:11:e5:69',
    softversion: '1.0.0',
    hardversion: '1.1.0',
    passwords: [{start:11111, end:22222, value:'1111111', message:'111111'}],
    qrcode:null,
    scene_id:1,
    time:1111,
    update:'http://a.update.bin'
};

const mqttUrl = "wss://lancertech.net:9001";
const mqttTopicPrefix = '/broker/smartlock1/';
let mqttClient = null;

const parseMessage = (message) => {
    var obj = JSON.parse (message);
    var config = {};
    switch (obj.cmd) {
    case 'register_ack':
        config.id = obj.id;
        break;
    case 'heartbeat_ack':
        config.time = obj.time;
        break;
    case 'qrcode_ack':
        config.qrcode = obj.url;
        break;
    case 'send_scene_id':
        config.scene_id = obj.scene_id;
        break;
    case 'password':
        config.password = obj.password;
        break;
    case 'update':
        config.update = obj.url;
        break;
    case 'reset':
        config.passwords = [];
        break;
    case 'open':
        console.log ("need Open Door!");
        if (mqttClient) mqttClient.publish(mqttTopicPrefix + 'server', JSON.stringify({ cmd:"cmd_ack", errcode:0, cmd_id: obj.cmd_id}) );
        break;
        
    case 'get_config':
    case 'log':
    default:
        break;
    }
    console.log ("config", config, "message", message, "obj", obj);
    return config;
}

export const init = (id) => {
    if (!mqttClient) {
        mqttClient = mqtt.connect ("ws://lancertech.net:9002")
        /*mqttClient = mqtt.connect (mqttUrl, {
            keepalive: 10,
            clientId: id,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            rejectUnauthorized: false,
        });*/
    }
    return (dispatch) => {
        //mqttClient.unsubscribe (mqttTopicPrefix+id);
        mqttClient.subscribe (mqttTopicPrefix+id);
        mqttClient.on("message", function (topic, message) {
            var msg = message.toString();
            var cfg = parseMessage (msg);
            dispatch(receiveMessage({topic, message: msg, config:cfg}))
        })
    }
}

export const deinit = () => (dispatch) => {
    dispatch (clearIntervalId());
    if (mqttClient) {
        mqttClient.end ();
        mqttClient = null;
    }
}

export const emit2Server = (id, message) => (dispatch) => {
    if (mqttClient) mqttClient.publish(mqttTopicPrefix + 'server', message);
}

export const emitRegister = () => (dispatch) => {
    if (mqttClient) mqttClient.publish(mqttTopicPrefix + 'server', JSON.stringify({ cmd:"register",id:defaultConfig.id,mac:defaultConfig.mac }) );
}

export const startHeartBeat = (id, interval) => (dispatch) => {
    var intervalId = setInterval(() => {
        if (mqttClient) mqttClient.publish(mqttTopicPrefix + 'server', JSON.stringify ({ cmd: 'heartbeat', id: id }));
    }, interval);
    dispatch (setIntervalId(intervalId));
}

export const stopHeartBeat = () => (dispatch) => {
    dispatch (clearIntervalId());
}

const LOCKS_ACTION_HANDLERS = {
    ['RECEIVE_MESSAGE']: (state, action) => { 
        var newcfg = { ...state.config, ...action.payload.config };
        console.log ("newcfg", newcfg);
        return ({ ...state, config: newcfg, cache: state.cache.concat(action.payload.message), message: action.payload.message })
    },
    ['SET_INTERVAL_ID']: (state, action) => {
        return {...state, intervalId: action.payload };
    },
    ['CLEAR_INTERVAL_ID']: (state, action) => {
        if (state.intervalId) clearInterval (state.intervalId);
        return {...state, intervalId: null };
    }
}

const initialState = { config: defaultConfig, cache: [], message: '', intervalId: null }
export default function simulatorReducer(state = initialState, action) {
    const handler = LOCKS_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
