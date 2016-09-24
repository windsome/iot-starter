export const REQUEST_ZEN = 'REQUEST_ZEN'
export const RECIEVE_ZEN = 'RECIEVE_ZEN'
export const SAVE_CURRENT_ZEN = 'SAVE_CURRENT_ZEN'

export function requestZen () {
    return {
        type: REQUEST_ZEN
    }
}

let availableId = 0;
export function recieveZen (value) {
    return {
        type: RECIEVE_ZEN,
        payload: {
            value,
            id: availableId++
        }
    }
}

export function saveCurrentZen () {
    return {
        type: SAVE_CURRENT_ZEN
    }
}

export const fetchZen = () => {
    return (dispatch) => {
        dispatch(requestZen())
        
        return fetch('https://api.github.com/zen')
            .then(data => data.text())
            .then(text => dispatch(recieveZen(text)))
    }
}

export const actions = {
    requestZen,
    recieveZen,
    fetchZen,
    saveCurrentZen
}

const ZEN_ACTION_HANDLERS = {
    [REQUEST_ZEN]: (state) => { return ({ ...state, fetching:true })},
    [RECIEVE_ZEN]: (state, action) => { return ({ ...state, zens: state.zens.concat(action.payload), current: action.payload.id, fetching:false })},
    [SAVE_CURRENT_ZEN]: (state) => { return state.current != null ? ({ ...state, saved: state.saved.concat(state.current)}) : state }
}

const initialState = {fetching:false, current: null, zens:[], saved:[]}
export default function zenReducer(state = initialState, action) {
    const handler = ZEN_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
