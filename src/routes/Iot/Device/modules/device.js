import { URL_API_DEVICE_GETDEVICELIST } from './apiurl'

export const DEVICES_REQUEST = 'DEVICES_REQUEST'
export const DEVICES_SUCCESS = 'DEVICES_SUCCESS'
export const DEVICES_FAILURE = 'DEVICES_FAILURE'

export function devicesRequest () {
    return {
        type: DEVICES_REQUEST
    }
}

export function devicesSuccess (value) {
    return {
        type: DEVICES_SUCCESS,
        payload: value
    }
}

export function devicesFailure (error) {
    return {
        type: DEVICES_FAILURE,
        error
    }
}

export const fetchDevices = (start, count) => {
    return (dispatch) => {
        dispatch(devicesRequest())
        
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json; charset=utf-8");
        
        return fetch(URL_API_DEVICE_GETDEVICELIST , 
                     { method: 'POST',
                       headers: myHeaders,
                       mode: 'cors',
                       cache: 'default',
                       body: JSON.stringify({page:0, start:start, count:count}) })
            .then(data => data.json())
            .then(text => dispatch(devicesSuccess(text)))
            .catch((error) => {
                console.log('fetch error: ' + error.message);
                dispatch(devicesFailure(error))
            });
    }
}

export const actions = {
    devicesRequest,
    devicesSuccess,
    devicesFailure,
    fetchDevices
}

const DEVICE_ACTION_HANDLERS = {
    [DEVICES_REQUEST]: (state) => { return ({ ...state, fetching:true, error:null })},
    [DEVICES_SUCCESS]: (state, action) => { return ({ ...state, devices: state.devices.concat(action.payload), fetching:false, error:null })},
    [DEVICES_FAILURE]: (state, action) => { return ({ ...state, fetching:false, error:action.error}) }
}

const initialState = { fetching: false, error: null, devices: [] }
export default function deviceReducer(state = initialState, action) {
    const handler = DEVICE_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
