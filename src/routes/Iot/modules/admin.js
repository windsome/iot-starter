import { URL_API_ADMIN_LOCK_LIST, URL_API_ADMIN_FIND_LOCK, URL_API_ADMIN_SET_PASSWORD } from './apiurl'
import { dataMerge, Schemas, normalize, camelizeKeys } from '../../../store/lib/database'
import { createActions } from 'redux-actions';

const { adminLocksSuccess, adminLocksFailure, adminLocksRequest } = createActions(
    'ADMIN_LOCKS_SUCCESS', 'ADMIN_LOCKS_FAILURE','ADMIN_LOCKS_REQUEST');

export const adminFetchLocks = (page, pageSize) => {
    if (!!!pageSize) pageSize = 10;
    if (!!!page) page = 0;

    return (dispatch) => {
        dispatch(adminLocksRequest())
        try {
        return fetch(URL_API_ADMIN_LOCK_LIST, {
            method: 'POST',
            body: JSON.stringify({ offset: page * pageSize, limit: pageSize }),
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
                    dispatch (adminLocksSuccess({ page: page, data: data.result}));
                } else {
                    throw new Error (json.errmsg);
                    //dispatch(adminLocksFailure(json))
                }
            })
            .catch((error) => {
                console.log('fetch error: ' + error.message);
                dispatch(adminLocksFailure(error))
            });
        }catch(e) {
            console.log ("windsome", e);
        }
    }
}

export const actions = {
    adminLocksRequest,
    adminLocksSuccess,
    adminLocksFailure,
    adminFetchLocks
}

const LOCKS_ACTION_HANDLERS = {
    ['ADMIN_LOCKS_REQUEST']: (state) => { return ({ ...state, fetching:true, error:null })},
    ['ADMIN_LOCKS_SUCCESS']: (state, action) => { 
        return ({ ...state, fetching:false, error:null, cache: state.cache.concat(action.payload.data), current: action.payload.data, page: action.payload.page });
    },
    ['ADMIN_LOCKS_FAILURE']: (state, action) => { return ({ ...state, fetching:false, error:action.payload }) }
}

const initialState = { fetching: false, error: null, cache: [], current: [] }
export default function adminLocksReducer(state = initialState, action) {
    const handler = LOCKS_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}

// findLock.
const { findLockSuccess, findLockFailure, findLockRequest } = createActions(
    'FIND_LOCK_SUCCESS', 'FIND_LOCK_FAILURE','FIND_LOCK_REQUEST');

const adminFindLock = (lockId) => {
    return (dispatch) => {
        dispatch(findLockRequest())
        try {
        return fetch(URL_API_ADMIN_FIND_LOCK, {
            method: 'POST',
            body: JSON.stringify({ where: { id: lockId } }),
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
                    var data = normalize(camelizedJson, Schemas.LOCK);
                    dispatch (dataMerge(data.entities));
                    //console.log ("get data", data.result, " result[0]", data.result);
                    dispatch (findLockSuccess({ data: data.result}));
                } else {
                    throw new Error (json.errmsg);
                    //dispatch(findLockFailure(json))
                }
            })
            .catch((error) => {
                console.log('fetch error: ' + error.message);
                dispatch(findLockFailure(error))
            });
        }catch(e) {
            console.log ("windsome", e);
        }
    }
}

function shouldFetchLock(state, lockId) {
    const lock = state.database && state.database.locks && state.database.locks[lockId];
    if (!lock) {
        return true
    }
    //return false
    return true // for test
}

export function fetchLockIfNeeded(lockId) {
    return (dispatch, getState) => {
        if (shouldFetchLock(getState(), lockId)) {
            return dispatch(adminFindLock(lockId))
        } else {
            return dispatch (findLockSuccess({ data: lockId }));
        }
    }
}

const FIND_LOCK_ACTION_HANDLERS = {
    ['FIND_LOCK_REQUEST']: (state) => { return ({ ...state, fetching:true, error:null })},
    ['FIND_LOCK_SUCCESS']: (state, action) => { 
        return ({ ...state, fetching:false, error:null, current: action.payload.data });
    },
    ['FIND_LOCK_FAILURE']: (state, action) => { return ({ ...state, fetching:false, error:action.payload }) }
}

const initialState_findLock = { fetching: false, error: null, cache: [], current: null }
export function findLockReducer(state = initialState_findLock, action) {
    const handler = FIND_LOCK_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}

// set_password.
const { PasswordSuccess, passwordFailure, passwordRequest } = createActions(
    'PASSWORD_SUCCESS', 'PASSWORD_FAILURE','PASSWORD_REQUEST');

export const adminSetPassword = (id, password) => {
    return (dispatch) => {
        dispatch(passwordRequest())
        try {
        return fetch(URL_API_ADMIN_SET_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ id: id, password: password }),
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
                    dispatch (passwordSuccess({ data: data.result}));
                } else {
                    throw new Error (json.errmsg);
                    //dispatch(passwordFailure(json))
                }
            })
            .catch((error) => {
                console.log('fetch error: ' + error.message);
                dispatch(passwordFailure(error))
            });
        }catch(e) {
            console.log ("windsome", e);
        }
    }
}

export function tryAdminSetPassword(values) {
    return (dispatch, getState) => {
        if (values.id && values.password) {
            return dispatch(adminSetPassword(values.id, values.password))
        } else {
            return dispatch(passwordFailure(new Error('check id & password')))
        }
    }
}

const PASSWORD_ACTION_HANDLERS = {
    ['PASSWORD_REQUEST']: (state) => { return ({ ...state, fetching:true, error:null })},
    ['PASSWORD_SUCCESS']: (state, action) => { 
        return ({ ...state, fetching:false, error:null });
    },
    ['PASSWORD_FAILURE']: (state, action) => { return ({ ...state, fetching:false, error:action.payload }) }
}

const initialState_password = { fetching: false, error: null }
export function passwordReducer(state = initialState_password, action) {
    const handler = PASSWORD_ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
