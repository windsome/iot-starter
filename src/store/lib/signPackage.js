export const REQUEST_SIGN = 'REQUEST_SIGN'
export const RECIEVE_SIGN = 'RECIEVE_SIGN'
export const SAVE_CURRENT_SIGN = 'SAVE_CURRENT_SIGN'

export function requestSign (url) {
    return {
        type: REQUEST_SIGN,
        url
    }
}

let availableId = 0;
export function recieveSign (value) {
    return {
        type: RECIEVE_SIGN,
        payload: {
            value,
            id: availableId++
        }
    }
}

export const fetchSign = (url) => {
    return (dispatch) => {
        dispatch(requestSign(url))

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        return fetch('/apis/getSignPackage', { method: "POST", headers: myHeaders, body: JSON.stringify({ url:url }) })
            .then(data => data.json())
            .then(text => dispatch(recieveSign(text)))
            .catch((error) => {
                console.log('fetch error: ' + error.message);
                dispatch(recieveSign({}))
            });
    }
}

export const actions = {
    requestSign,
    recieveSign,
    fetchSign
}

const SIGN_ACTION_HANDLERS = {
    [REQUEST_SIGN]: (state, action) => { return ({ ...state, fetching:true, url:action.url, pkg: null })},
    [RECIEVE_SIGN]: (state, action) => { return ({ ...state, fetching:false, url:state.url, pkg: action.payload })}
}

const initialState = { fetching: false, url: null, pkg: null }
export default function signReducer(state = initialState, action) {
    const handler = SIGN_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
