//const URL_BASE_API = 'http://lancertech.net/farm/douchat/index.php?s=/Home/Device'
const URL_BASE_API = '/apis'
export const URL_API_DEVICE_BIND = URL_BASE_API+'/device/device_bind'
export const URL_API_DEVICE_UNBIND = URL_BASE_API+'/device/device_unbind'
export const URL_API_DEVICE_BINDTOUSER = URL_BASE_API+'/device/bindToUser'
export const URL_API_DEVICE_BINDTOUSER2 = URL_BASE_API+'/device/bindToUser2'
export const URL_API_DEVICE_UNBINDTOUSER2 = URL_BASE_API+'/device/unbindToUser2'
export const URL_API_DEVICE_GETBYQRCODE= URL_BASE_API+'/device/getDeviceByQrcode'
export const URL_API_DEVICE_GETBINDDEVICE= URL_BASE_API+'/device/get_bind_device'
export const URL_API_DEVICE_GETDEVICELIST= URL_BASE_API+'/device/get_device_list'
export const URL_API_DEVICE_DATAX= URL_BASE_API+'/device/datax'
export const URL_API_DEVICE_GETDATAXHISTORY= URL_BASE_API+'/device/getDataxHistory'
export const URL_API_DEVICE_GETDATAXLATESTLIST= URL_BASE_API+'/device/getDataxLatestList'
export const URL_API_DEVICE_FW_UPLOAD= URL_BASE_API+'/device/firmwareUpload'
export const URL_API_DEVICE_FW_DELETE= URL_BASE_API+'/device/firmwareDelete'
export const URL_API_DEVICE_FW_LIST= URL_BASE_API+'/device/firmwareList'
export const URL_API_DEVICE_CMD_UPDATE= URL_BASE_API+'/device/updateCmd'

export const URL_API_USER_LIST= URL_BASE_API+'/db/list_user';
export const URL_API_LOCK_LIST= URL_BASE_API+'/db/list_lock';
export const URL_API_ADMIN_LOCK_LIST = URL_BASE_API+'/lock/get_lock_list';
export const URL_API_ADMIN_FIND_LOCK = URL_BASE_API+'/lock/find';
export const URL_API_ADMIN_SET_PASSWORD = URL_BASE_API+'/lock/password';
