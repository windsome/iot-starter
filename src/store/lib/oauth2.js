//import 'whatwg-fetch';

export const OAUTH2_REQUEST = 'OAUTH2_REQUEST'
export const OAUTH2_SUCCESS = 'OAUTH2_SUCCESS'
export const OAUTH2_FAILURE = 'OAUTH2_FAILURE'

export function oauth2Request () {
    return {
        type: OAUTH2_REQUEST
    }
}

export function oauth2Success (value) {
    return {
        type: OAUTH2_SUCCESS,
        payload: value
    }
}

export function oauth2Failure (error) {
    return {
        type: OAUTH2_FAILURE,
        error
    }
}

export const handleOauth2 = (user) => {
    return (dispatch) => {
        dispatch(oauth2Request())
        
        return fetch("/apis/oauth2", 
                     { method: 'POST',
                       headers: { "Content-Type": "application/json; charset=utf-8",
                                  "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTIzLCJpYXQiOjE0NzQ3MjEzMDMsImV4cCI6MTQ3NDcyNDkwM30.nML-8UQ8_ye8RyzpNuPTB7LH4zwSBariylkJna7AuaM"
                       },
                       mode: 'cors',
                       cache: 'default',
                       body: JSON.stringify(user) })
            .then(data => data.json())
            .then(retcode => dispatch(oauth2Success(retcode)))
            .catch((error) => {
                console.log('fetch error: ' + error.message);
                dispatch(oauth2Failure({ errcode: -1, msg: error.message }))
            });
    }
}

export const actions = {
    oauth2Request,
    oauth2Success,
    oauth2Failure,
    handleOauth2
}

const OAUTH2_ACTION_HANDLERS = {
    [OAUTH2_REQUEST]: (state) => { return ({ ...state, fetching: true, error:null })},
    [OAUTH2_SUCCESS]: (state, action) => { return ({ ...state, ooauth2: action.payload, fetching: false, error:null }) },
    [OAUTH2_FAILURE]: (state, action) => { return ({ ...state, ooauth2: null, fetching: false, error: action.error }) }
}

const initialState = { fetching: false, ooauth2: null, error: null }
export default function oauth2Reducer(state = initialState, action) {
    const handler = OAUTH2_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
