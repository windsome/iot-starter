import { URL_API_LOCK_LIST } from './apiurl'
import { dataMerge, Schemas, normalize, camelizeKeys } from '../../../store/lib/database'

export const LOCKS_REQUEST = 'LOCKS_REQUEST'
export const LOCKS_SUCCESS = 'LOCKS_SUCCESS'
export const LOCKS_FAILURE = 'LOCKS_FAILURE'

export function locksRequest () {
    return {
        type: LOCKS_REQUEST
    }
}

export function locksSuccess (userId, value) {
    return {
        type: LOCKS_SUCCESS,
        userId: userId,
        payload: value
    }
}

export function locksFailure (error) {
    return {
        type: LOCKS_FAILURE,
        error
    }
}

export const fetchLocks = (userId) => {
    return (dispatch) => {
        dispatch(locksRequest())
        
        return fetch(URL_API_LOCK_LIST, {
            //dataType: 'json',
            method: 'POST',
            body: JSON.stringify({ where: { owner: userId } }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(res => res.json().then(json => ({ json, res }) ) )
            .then( ({json, res}) => {
                if (!res.ok) return Promise.reject(json);
                console.log ("windsome", json);
                if (json.errcode == 0) {
                    const camelizedJson = camelizeKeys(json.data); 
                    var data = normalize(camelizedJson, Schemas.LOCK_ARRAY);
                    dispatch (dataMerge(data.entities));
                    dispatch (locksSuccess(userId, data.result));
                    //dispatch(locksSuccess(userId, json.data))
                } else
                    dispatch(locksFailure(json))
            })
            .catch((error) => {
                console.log('fetch error: ' + error.message);
                dispatch(locksFailure(error))
            });
    }
}

export const actions = {
    locksRequest,
    locksSuccess,
    locksFailure,
    fetchLocks
}

const LOCKS_ACTION_HANDLERS = {
    [LOCKS_REQUEST]: (state) => { return ({ ...state, fetching:true, error:null })},
    [LOCKS_SUCCESS]: (state, action) => { 
        var nState = Object.assign({}, state, {fetching:false, error:null});
        nState[action.userId] = action.payload;
        return nState;
        //return ({ ...state, locks: action.payload, fetching:false, error:null })
    },
    [LOCKS_FAILURE]: (state, action) => { return ({ ...state, fetching:false, error:action.error}) }
}

const initialState = { fetching: false, error: null, locks: [] }
export default function locksReducer(state = initialState, action) {
    const handler = LOCKS_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
