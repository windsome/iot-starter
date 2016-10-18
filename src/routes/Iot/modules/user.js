import { URL_API_USER_LIST } from './apiurl'
import { dataMerge, Schemas, normalize, camelizeKeys } from '../../../store/lib/database'

export const USERS_REQUEST = 'USERS_REQUEST'
export const USERS_SUCCESS = 'USERS_SUCCESS'
export const USERS_FAILURE = 'USERS_FAILURE'

export function usersRequest () {
    return {
        type: USERS_REQUEST
    }
}

export function usersSuccess (value) {
    return {
        type: USERS_SUCCESS,
        payload: value
    }
}

export function usersFailure (error) {
    return {
        type: USERS_FAILURE,
        error
    }
}

export const fetchUsers = (start, count) => {
    return (dispatch) => {
        dispatch(usersRequest())
        
        return fetch(URL_API_USER_LIST)
            .then(res => res.json().then(json => ({ json, res }) ) )
            .then( ({json, res}) => {
                if (!res.ok) return Promise.reject(json);
                console.log ("windsome", json);
                if (json.errcode == 0) {
                    const camelizedJson = camelizeKeys(json.data); 
                    var data = normalize(camelizedJson, Schemas.USER_ARRAY);
                    dispatch (dataMerge(data.entities));
                    dispatch (usersSuccess(data.result));
                    //dispatch(usersSuccess(json.data))
                } else
                    dispatch(usersFailure(json))
            })
            .catch((error) => {
                console.log('fetch error: ' + error.message);
                dispatch(usersFailure(error))
            });
    }
}

export const actions = {
    usersRequest,
    usersSuccess,
    usersFailure,
    fetchUsers
}

const USERS_ACTION_HANDLERS = {
    [USERS_REQUEST]: (state) => { return ({ ...state, fetching:true, error:null })},
    [USERS_SUCCESS]: (state, action) => { return ({ ...state, users: action.payload, fetching:false, error:null })},
    [USERS_FAILURE]: (state, action) => { return ({ ...state, fetching:false, error:action.error}) }
}

const initialState = { fetching: false, error: null, users: [] }
export default function usersReducer(state = initialState, action) {
    const handler = USERS_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
