# 简介
此项目是一个微信智能硬件第三方平台，包含公司网站，微信第三方平台及其他业务逻辑。

# 环境搭建
## 使用nvm管理
下载nvm-git代码到~/.nvm目录  
```
git clone https://github.com/creationix/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`
```
编辑环境变量配置文件~/.bashrc,添加``` source ~/.nvm/nvm.sh ```到末尾，保存退出  
```
cd  
vim .bashrc  
+ source ~/.nvm/nvm.sh
```
+ 可以使用nvm list 查看本地当前安装的node版本  
+ 使用nvm ls-remote 查看可以安装的版本  
+ 使用nvm install 5.11.1安装指定版本号版本  
## 使用淘宝镜像作为npm镜像
```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```
以后可以使用 cnpm替代npm

# 使用forever作为linux开机服务
reference: https://www.exratione.com/2011/07/running-a-nodejs-server-as-a-service-using-forever/

在bin/下有一个文件node-forever，根据自己的目录不同适当修改后拷贝到/etc/init.d/下
```
+edit node-forever
sudo cp node-forever /etc/init.d/
cd /etc/rc2.d
ln -s ../init.d/node-forever S23node
cd /etc/rc3.d
ln -s ../init.d/node-forever S23node
cd /etc/rc4.d
ln -s ../init.d/node-forever S23node
cd /etc/rc5.d
ln -s ../init.d/node-forever S23node
cd /etc/rc0.d
ln -s ../init.d/node-forever K23node
cd /etc/rc1.d
ln -s ../init.d/node-forever K23node
cd /etc/rc6.d
ln -s ../init.d/node-forever K23node
```
注意要安装forever, ``` sudo npm install -g forever ```
用sudo可能不成功，可以su -,进入root再操作  
再注意，node环境在root下要重新安装，参照普通用户nvm方式进行  

# 作为单向https服务器

# 作为双向https服务器

# 动态加载css/js到页面
公司网站需要使用bootstrap.css，而公众号页面需要weui.css，我们不能将其写在index.html中，需要动态加载  
[dynamic load javascript/css 1](http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml)  
[dynamic load javascript/css 2](http://www.javascriptkit.com/javatutors/loadjavascriptcss2.shtml)    
 
# API列表
## 门锁后台服务相关 service-lock
```
主要负责门锁(LOCK)与门锁后台服务(SERVICE)的交互及其他应用子系统(APP)与门锁后台服务的交互。其他子系统与门锁的交互完全通过门锁后台中转。API分为门锁向门锁服务的mqtt请求部分、门锁服务供其他应用子系统调用的接口、门锁服务调用应用子系统的接口描述（其他系统需要实现这些接口）
注意：因为mqtt相关操作可能会有延时及不确定性（比如：锁收到消息后，可能突然断电，导致服务端未收到成功消息，此时需要服务器重发），为避免重复，需要对每一个操作指定一个事物号，用来唯一确定一个动作，事物号使用UUID。  
✔1, MQTT: register, 锁出厂前初始化获取基础信息命令，上传MAC地址，获取CA证书、UUID、（是否获取微信硬件QRCODE？）
    命令过程:  
        这条命令的执行是因为锁本身没有基础的锁信息，没有UUID。为了能使通讯进行，锁首先生成一个临时UUID，并将mqtt订阅到该UUID对应的topic(/broker/smartlock/temp-UUID)。
        锁的生成一条register命令。
        锁publish该命令到mqtt服务端topic（/broker/smartlock/server），如果通讯出问题或者终端在5秒内未收到反馈则一直重发。
        服务端收到register命令后动态生成一个uuid，（如果用到微信设备，则从devices表中获取一个锁类型设备的device_id,qrcode）存放在数据库Locks表中，并将该记录包含ca信息返回给锁。服务端如果收到多条相同mac地址的register命令（如何判断相同？从数据库中找到mac地址对应的设备），将数据库中资料发送出去。
        锁将收到的消息解析存于flash中。errcode == 0的消息是正确的返回，否则不保存并重发register消息。
        保存消息后，锁重启，会有心跳消息发送到服务端。（在工厂测试页面，应该停在一个画面，这个画面监测register消息，收到消息后提示过程，并在界面中缓存设备的mac地址和uuid，并提示该设备发出的消息，让工厂人员能够确保锁register成功了）。 
    direct: LOCK->SERVICE, MQTT  
    input: {cmd:'register', id: 'temp-UUID', mac:'mac'}  
    output: {errcode:0, errmsg:'', ca1:'', ca2:'', ca3:'', id:'NEW-UUID', qrcode:''}  
    注意：此消息在厂测模式下运行，无需使用register_ack命令进行确认，人工看界面即可。  
✔2，MQTT: heartbeat, 锁心跳命令，定时向mqtt发送消息，校准时间，及获取mqtt服务端缓存着的命令  
    direct: LOCK->SERVICE, MQTT  
    input: {cmd:'heartbeat', id:'UUID'}  
    output: {errcode: 0, errmsg:'', time:timestamp}  
    注意：此命令如果只是为了heartbeat，没有返回其他命令也不需进行ACK确认  
✔3，MQTT: log, 锁日志上传命令，锁上电的空闲时间段上传日志  
    direct: LOCK->SERVICE, MQTT  
    input: {cmd:'log', id:'UUID', log:[{action:scan, time:timestamp},{action:password, time:timestamp},...]}  
    output: {errcode: 0, errmsg:''}  
✔4.1，MQTT: qrcode, 锁获取临时场景二维码命令qrcode  
    命令过程：  
      锁端生成一个scene_id，这是个1-100000之间的随机数。  
      锁将scene_id发到锁服务端的mqtt服务器  
      如果使用的是微信的场景二维码，则调用微信公众号接口生成qrcode。如果是其他方式生成二维码，则用相应方式生成。也可以在我们自己平台生成一个10分钟时效的二维码。  
      返回二维码及有效时间给锁，锁得到二维码后可以显示在屏幕上，由用户扫描。  
    direct: LOCK->SERVICE, MQTT  
    input: {cmd:'qrcode', id:'UUID', scene_id:'GENERATED_SCENE_ID', expire: TIME_IN_SECONDS}  
    output: {errcode: 0, errmsg:'', qrcode:'GENERATED_QRCODE', expire:600}  
✔4.2，API: /apis/lock/send_scene_id, 用户通过公众号页面（或微信扫一扫，或其他应用子系统）扫码后，发送scene_id给锁服务端，并由锁服务端发送给锁终端，在锁端对scene_id进行匹配校验  
    命令过程：  
      用户扫描锁上面通过qrcode命令得到的二维码（微信二维码用微信扫一扫，其他平台调用相应API，自己系统生成的二维码，则使用自己系统的扫描界面）  
      扫描后，应用子系统会得到scene_id（微信则是由微信服务器发送给第三方平台，通过XML消息方式，我们可以提取其中的scene_id）  
      应用子系统（或微信第三方平台）得到scene_id后，调用send_scene_id，将scene_id发送到锁服务端  
    direct: APP->SERVICE->LOCK  
    input: {id:'UUID', scene_id:'GENERATED_SCENE_ID'}  
    output: {errcode: 0, errmsg:''}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
✔4.3，MQTT: send_scene_id, 锁服务端发送scene_id到锁端命令，锁检查scene_id是否匹配  
    命令过程：  
      锁服务端收到4.2的命令后，通过mqtt发送给锁  
    direct: SERVICE->LOCK, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', cmd:'send_scene_id', id:'UUID', scene_id:'GENERATED_SCENE_ID'}  
    output: {errcode: 0, errmsg:''}  
4.4，MQTT: cmd_ack, 锁返回send_scene_id的处理结果
    命令过程：  
      锁服务端收到锁反馈的ack命令后，将ack更新到LockCmd中，并发送通知给APP，不用再回复给LOCK  
    direct: LOCK->SERVICE->APP, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', cmd:'cmd_ack', id:'UUID', errcode: 0}  
✔5，API: /apis/lock/find, 应用子系统通过UUID得到某把锁的信息，主要是判断该锁是否存在，一般用在应用子系统中用户添加锁的时候  
    命令过程：  
      用户在APP中输入锁的UUID或MAC，（如果是微信锁，则扫描微信二维码，得到qrcode/device_id），组成查询字符串  
      锁服务端，根据条件查找锁信息，（是否将此锁置为已被使用，之后再扫描则失效并返回错误信息？）并返回。（未来是否要加强条件，如何判断该锁确实属于此用户？）  
    direct: APP->SERVICE, 同步命令  
    input: {where: {id:'INPUT-UUID', mac:'INPUT-MAC', qrcode:'SCAN-QRCODE', device_id:'SCAN-DEVICE_ID'}}, where中的条件只需填写一项就行  
    output: {errcode: 0, errmsg:'', data: {...}}  

✔6.1，API: /apis/lock/password, 应用子系统生成一个6位密码或者用户输入一个6位密码，给锁服务端，并由锁服务端发送给锁终端保存，供用户使用密码开门  
    命令过程：  
      用户订房，或者管理员设置开门密码等情况下，需要发送密码给锁  
    direct: APP->SERVICE->LOCK  
    input: {id:'UUID', password:'MD5-PASSWORD'}  
    output: {errcode: 0, errmsg:''}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
✔6.2，MQTT: password, 锁服务端发送密码到锁端命令  
    命令过程：  
      锁服务端收到6.1的命令后，通过mqtt发送给锁  
    direct: SERVICE->LOCK, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', cmd:'password', id:'UUID', password:'MD5-PASSWORD', user:'system'} or {cmd_id: 'ID_IN_LOCK_CMD', cmd:'password', id:'UUID', password:'MD5-PASSWORD', start:TIMESTAMP, end:TIMESTAMP, user:'windsome'}  
    output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD'}  
6.3，MQTT: cmd_ack, 锁返回password的处理结果  
    命令过程：  
      锁服务端收到锁反馈的ack命令后，将缓存记录从LockCmd中删除，并发送通知给APP，不用再回复给LOCK  
    direct: LOCK->SERVICE->APP, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', cmd:'cmd_ack', id:'UUID', errcode: 0}  
7.1, API: /apis/lock/config, 配置某个锁(类似password)[管理员功能]  
    命令过程：  
      配置锁，一般模式下不能配置锁ID，管理模式可以配置锁ID  
    direct: APP->SERVICE->LOCK  
    input: {id:'UUID', mqtt_server:'', mqtt_topic_base:'/broker/newlock/', heartbeat_interval:600, other_supported_properties}  
    output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD'}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
7.2，MQTT: config, 配置锁  
    direct: SERVICE->LOCK, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', cmd:'config', ...LAST_STEP_CONFIG_CONTENT}  
7.3，MQTT: cmd_ack, 锁返回处理结果  
    direct: LOCK->SERVICE->APP, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', cmd:'cmd_ack', id:'UUID', errcode: 0}  
8.1, API: /apis/lock/reset, 重置锁，清空存在的密码相关信息[管理员功能]  
    命令过程：  
      配置锁，一般模式下不能配置锁ID，管理模式可以配置锁ID  
    direct: APP->SERVICE->LOCK  
    input: {id:'UUID', mqtt_server:'', mqtt_topic_base:'/broker/newlock/', heartbeat_interval:600, other_supported_properties}  
    output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD'}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
8.2，MQTT: reset, 重置锁  
    direct: SERVICE->LOCK, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', cmd:'reset', ...LAST_STEP_CONFIG_CONTENT}  
8.3，MQTT: cmd_ack, 锁返回处理结果  
    direct: LOCK->SERVICE->APP, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', cmd:'cmd_ack', id:'UUID', errcode: 0}  
✔9, MQTT转发API消息（send_scene_id, password, config, reset都是此类消息），都是异步消息，可以写一个通用方法供其他api调用。该系列函数通过一个cmd_id来标识所处理的命令。  
✔9.1, APP调用API，SERVICE会将命令缓存进数据库LockCmd表，并返回ID，继续发向MQTT  
    命令过程：  
      APP调用API后，首先将命令存进LockCmd，并返回ID  
      调用MQTT将包含CMD_ID的命令publish到锁  
      进入查询循环，每隔1秒查一次，过了超时时间仍未返回，则API调用返回CMD_ID及命令正在处理中的消息  
      APP可以根据CMD_ID进行手动查询，或者APP获得锁的返回内容  
    direct: APP->SERVICE->LOCK  
    input: {id:'UUID', ...CMD_CONTENTS}  
    output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD'}  
✔9.2, MQTT publish消息  
    direct: SERVICE->LOCK, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', ...CMD_CONTENTS, cmd:'OVERRIDE_CMD_NAME' }  
✔9.3, MQTT: cmd_ack, 锁返回处理结果给锁服务端  
    命令过程：  
      锁服务端根据cmd_id更新LockCmd表中相应记录的ack字段  
    direct: LOCK->SERVICE->APP, MQTT  
    input: {cmd_id: 'ID_IN_LOCK_CMD', cmd:'cmd_ack', id:'UUID', errcode: 0, ...OTHER_RESPONSE_MESSAGE}  
✔9.4, API: check_cmd, APP主动从锁服务端查询命令执行结果，一般再命令超时未完成的情况下过段时间后主动调用。  
    命令过程：  
      去LockCmd表查询命令是否完成返回，并返回命令的结果  
    direct: APP->SERVICE  
    input: {cmd_id: 'ID_IN_LOCK_CMD'}  
    output: {LockCmd.ack字段内容}  
✔10.1-3, API: /apis/lock/get_config, 获取锁信息(类似password)[管理员功能]
    direct: APP->SERVICE->LOCK  
    input: {id:'UUID', cmd:'get_config'}  
    output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD',id:'', ca1:'', ca2:'', ca3:'',software_version:'1.1.1',hardware_version:'1.0.1',mac:'MAC', ...OTHER_CONFIG}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
✔10.2, MQTT publish  
10.3, MQTT cmd_ack  
✔11.1-3, API: /apis/lock/update, 升级锁软件(类似password)[管理员功能]  
    direct: APP->SERVICE->LOCK  
    input: {id:'UUID', cmd:'update', url:'https://......'}  
    output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD'}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
✔11.2, MQTT publish  
11.3, MQTT cmd_ack  
✔12.1-3, API: /apis/lock/get_password_list, 获取锁的密码列表(类似password)[管理员功能]  
    direct: APP->SERVICE->LOCK  
    input: {id:'UUID', cmd:'update', url:'https://......'}  
    output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD'}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
✔12.2, MQTT publish  
12.3, MQTT cmd_ack  
✔13, API: /apis/lock/get_lock_list, 获取锁列表  
    direct: APP->SERVICE  
    input: {id:'UUID', where:{}, offset:0, limit:10}  
    output: {errcode: 0, errmsg:'', data:[{LOCK-INFO-IN-DB},{LOCK-INFO-IN-DB}]}  
✔14.1-3, API: /apis/lock/open, 开门  
    direct: APP->SERVICE->LOCK  
    input: {id:'UUID', cmd:'open', ...OTHER_OPEN_DOOR_NEED_INFO}  
    output: {errcode: 0, errmsg:''}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
14.2, MQTT publish  
14.3, MQTT cmd_ack  
```
## API模拟测试（send_scene_id, password, config, reset）
```
注意：手动测试需要速度比较快，API超时时间默认为20秒，可以将expire时间设置得长一点，方便测试的时候去填写命令中的ID_IN_LOCK_CMD。
* 步骤：
1,启动新终端，运行mosquitto_sub，用来监听消息，查看cmd_id
2,在又一个新终端运行curl命令调用api
3,读取mosquitto_sub监听到的cmd_id
4,再起一个新终端，修改export CMDSTR='{"errcode":0,"cmd":"cmd_ack","cmd_id":"ID_IN_LOCK_CMD","id":"1"}' 中的ID_IN_LOCK_CMD，并重新export，注意中间无空格
5,看api终端的返回值
* 监听server，用以读取ID_IN_LOCK_CMD
mosquitto_sub -t /broker/smartlock1/server -v --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 
* APP调用send_scene_id：
curl 'http://localhost:3000/apis/lock/send_scene_id?id=1&scene_id=2'
export CMDSTR='{"errcode":0,"cmd":"cmd_ack","cmd_id":"ID_IN_LOCK_CMD","id":"1"}'
mosquitto_pub -t /broker/smartlock1/server --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m $CMDSTR 
* APP调用password：
curl 'http://localhost:3000/apis/lock/password?id=1&password=223456'
export CMDSTR='{"errcode":0,"cmd":"cmd_ack","cmd_id":"ID_IN_LOCK_CMD","id":"1"}'
mosquitto_pub -t /broker/smartlock1/server --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m $CMDSTR
* APP调用config(管理员接口，其他人要调需向管理员认证)：
curl 'http://localhost:3000/apis/lock/config?id=1&password=223456'
export CMDSTR='{"errcode":0,"cmd":"cmd_ack","cmd_id":"ID_IN_LOCK_CMD","id":"1"}'
mosquitto_pub -t /broker/smartlock1/server --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m $CMDSTR
* APP调用reset(管理员接口，其他人要调需向管理员认证)：
curl 'http://localhost:3000/apis/lock/reset?id=1'
export CMDSTR='{"errcode":0,"cmd":"cmd_ack","cmd_id":"ID_IN_LOCK_CMD","id":"1"}'
mosquitto_pub -t /broker/smartlock1/server --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m $CMDSTR
```
## LOCK主动消息模拟测试
```
* subscribe to topic
mosquitto_sub -t /broker/smartlock1/\# -v --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883
mosquitto_sub -t /broker/smartlock1/server -v --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 
* 锁获取access_token
mosquitto_pub -t /broker/smartlock1/server --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m '{"uuid":"ll_02330df03ffd9","cmd":"get_access_token"}'
* 锁注册register
mosquitto_pub -t /broker/smartlock1/server --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m '{"cmd":"register","id":"1","mac":"00:22:68:11:e5:68"}'
* 锁心跳heartbeat
mosquitto_pub -t /broker/smartlock1/server --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m '{"cmd":"heartbeat","id":"1"}'
* 锁日志log
mosquitto_pub -t /broker/smartlock1/server --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m '{"cmd":"log","id":"1","log":[{"action":"open", "time":12342},{"action":"close","time":12345}]}'
* 锁获取qrcode
mosquitto_pub -t /broker/smartlock1/server --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m '{"cmd":"qrcode","id":"1","scene_id":12345,"expire": 600}'

LOCK接收消息测试：
* 锁注册响应register_ack
mosquitto_pub -t /broker/smartlock1/1 --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m '{"cmd":"register_ack","id":"1"}'
* 锁心跳响应heartbeat_ack
mosquitto_pub -t /broker/smartlock1/1 --cafile /download/ca.crt -h mqtt.lancertech.net -p 8883 -m '{"cmd":"heartbeat_ack","time":"11111111"}'

```
## 门锁超级用户管理系统
```
功能：超级管理员管理所有的锁，功能包含：  
× 锁列表及按条件查询（list_lock）
× 锁信息（ID，MAC，MQTT-INFO，GPS-INFO，当前时间，欢迎图片，硬件版本，软件版本，CA证书等）查看修改(get_config)    
× 锁中密码列表(get_password_list)，重置所有密码(reset)，设置密码(password)  
× 锁日志查看(读取数据库内容)  
× 软件升级（update）  
× Admin用户管理，包含列表、授权、取消授权，将有权限的用户openid登记在Admin表中  
界面列表  
1, 设备列表页面，分页列出所有锁
/apis/lock/get_lock_list
{ where: { createAt: {$bg: 123413422} },
  offset:0,
  limit:10
}
2, 设备详情页面，最上面为设备详细信息，下面为功能按钮（得到密码列表，重置所有密码，设置密码，升级，读取日志），下面为命令返回的内容
3, 是否需要批量功能？
```
## 普通用户开锁子系统
### 通过公众号页面扫描开锁
### 通过微信扫一扫开锁
### 通过输入密码开锁 （不需与服务器联系，不需使用手机）
```
功能：用户通过公众号页面扫描二维码， 
× 锁列表及按条件查询（list_lock）
2, /apis/db/list_user 获取数据库中用户列表  
    支持POST/GET两种方式  
    参数：
        offset：开始记录index，默认为0
        count: 获取记录条数，默认为10
        where：获取记录条件
    例子：
    GET模式：
    curl 'http://localhost:3000/apis/db/list_lock?offset=0&count=10&where={"owner":"247f215e-31cc-4648-8eb4-b3c913ac67b6"}'
    POST模式：http://localhost:3000/apis/db/list_lock
    {
        offset:0,
        count:10,
        where: {
            owner: '247f215e-31cc-4648-8eb4-b3c913ac67b6'
        }
    }
```
## api测试
```
curl 'http://localhost:3000/apis/db/create_user?openid=1&info=a'
echo ' '
curl 'http://localhost:3000/apis/db/create_user?openid=2&info=b'
echo ' '
curl 'http://localhost:3000/apis/db/create_user?openid=3&info=c'
echo ' '
curl 'http://localhost:3000/apis/db/create_user?openid=4&info=d'
echo ' '

#curl http://localhost:3000/apis/db/update_user?id=29b1cda2-09a5-46dd-88ad-e3e6ea280fe2&info=f
#curl http://localhost:3000/apis/db/list_user

echo 'create lock: '
curl 'http://localhost:3000/apis/db/create_lock?thing=\{"info":"d","owner":"247f215e-31cc-4648-8eb4-b3c913ac67b6"\}'

echo 'update lock: '
curl 'http://localhost:3000/apis/db/update_lock?thing=\{"id":"fcacd15d-7fdf-406d-a82e-e50864fa0e9a","info":"d"\}'

echo 'list all locks '
curl 'http://localhost:3000/apis/db/list_lock'

echo 'list lock of user:'
curl 'http://localhost:3000/apis/db/list_lock?where=\{"owner":"247f215e-31cc-4648-8eb4-b3c913ac67b6"\}'
echo ' '
echo ' '
```
# TIPS
## JS中!, !!, !!! 的使用
```
227         debug ("undefined expire", expire, "!expire", !expire, "!!expire", !!expire, "!!!expire", !!!expire);
228         expire = null;
229         debug ("null expire", expire, "!expire", !expire, "!!expire", !!expire, "!!!expire", !!!expire);
230         expire = 0;
231         debug ("0 expire", expire, "!expire", !expire, "!!expire", !!expire, "!!!expire", !!!expire);
232         expire = "";
233         debug ("\"\" expire", expire, "!expire", !expire, "!!expire", !!expire, "!!!expire", !!!expire);
234         expire = 1;
235         debug ("1 expire", expire, "!expire", !expire, "!!expire", !!expire, "!!!expire", !!!expire);
236         expire = "11";
237         debug ("\"11\" expire", expire, "!expire", !expire, "!!expire", !!expire, "!!!expire", !!!expire);
238         expire = {};
239         debug ("{} expire", expire, "!expire", !expire, "!!expire", !!expire, "!!!expire", !!!expire);
240         expire = {a:'a'};
241         debug ("{a} expire", expire, "!expire", !expire, "!!expire", !!expire, "!!!expire", !!!expire);
结果：
  app:server:apis undefined expire +18s undefined !expire true !!expire false !!!expire true
  app:server:apis null expire +0ms null !expire true !!expire false !!!expire true
  app:server:apis 0 expire +0ms 0 !expire true !!expire false !!!expire true
  app:server:apis "" expire +0ms  !expire true !!expire false !!!expire true
  app:server:apis 1 expire +0ms 1 !expire false !!expire true !!!expire false
  app:server:apis "11" expire +0ms 11 !expire false !!expire true !!!expire false
  app:server:apis {} expire +0ms {} !expire false !!expire true !!!expire false
  app:server:apis {a} expire +16ms { a: 'a' } !expire false !!expire true !!!expire false
```

## 比较好的markdown编辑器retext
```apt-get install retext```

## 使用redux-form时，使用initialValues作为初始值，但初始值在redux-form组件中改变后并不更新？
原因是创建redux-form时需要增加enableReinitialize:true选项  
```
export default reduxForm({
    form: 'lock',  // a unique identifier for this form
    enableReinitialize: true // if you change initialValues, you need do it to take effect.
})(EditLockForm)
```
*重要问题，我始终没弄明白redux-form例子“Initialize From State”并没有设置该属性却表现正常能够动态改变初始值，为什么它可以？

## 攻击破解锁系统
1,假冒锁，获取锁中的ca证书及锁uuid，用程序模仿锁，获得相关数据  
2,攻击锁服务器  

