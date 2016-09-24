export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

export function loginRequest () {
    return {
        type: LOGIN_REQUEST
    }
}

export function loginSuccess (value) {
    return {
        type: LOGIN_SUCCESS,
        payload: value
    }
}

export function loginFailure (error) {
    return {
        type: LOGIN_FAILURE,
        error
    }
}

export const handleLogin = (user) => {
    return (dispatch) => {
        dispatch(loginRequest())
        //console.log ("user:");
        //console.log (user);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json; charset=utf-8");
        myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTIzLCJpYXQiOjE0NzQ3MjEzMDMsImV4cCI6MTQ3NDcyNDkwM30.nML-8UQ8_ye8RyzpNuPTB7LH4zwSBariylkJna7AuaM");
        
        return fetch("/apis/login", 
                     { method: 'POST',
                       headers: myHeaders,
                       mode: 'cors',
                       cache: 'default',
                       body: JSON.stringify(user) })
            .then(data => data.json())
            .then(retcode => dispatch(loginSuccess(retcode)))
            .catch((error) => {
                console.log('fetch error: ' + error.message);
                dispatch(loginFailure({ errcode: -1, msg: error.message }))
            });
    }
}

export const actions = {
    loginRequest,
    loginSuccess,
    loginFailure,
    handleLogin
}

const AUTH_ACTION_HANDLERS = {
    [LOGIN_REQUEST]: (state) => { return ({ ...state, fetching:true, error:null })},
    [LOGIN_SUCCESS]: (state, action) => { return ({ ...state, token: action.payload, fetching: false, error:null }) },
    [LOGIN_FAILURE]: (state, action) => { return ({ ...state, token: null, fetching: false, error: action.error }) }
}

const initialState = { fetching: false, access_token: null, error: null }
export default function authReducer(state = initialState, action) {
    const handler = AUTH_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
