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
## 用户发布房间信息，订房，开门子系统流程
### 通过微信扫一扫开锁
如果用户还未关注公众号，则用户可以关注公众号，关注后微信会将带场景值关注事件推送给开发者。此时，第三方后台收到微信发来的xml消息，转成json为{MsgType:'event', Event:'subscribe',EventKey:'qrscene_123123'}。
如果用户已经关注公众号，则微信会将带场景值扫描事件推送给开发者。此时，第三方后台收到微信发来的xml消息，转成json为{MsgType:'event',Event:'SCAN',EventKey:'SCENE_VALUE'}。
第三方后台收到微信消息，解析并处理场景二维码，返回文字信息或图文消息（是否可以返回LINK页面？）到用户公众号页面。该消息大体描述了开门结果，有权限开门或无权限开门，点击图文消息进入详情页面，可以根据指导申请开门权限。
该详情页面是房间的详细描述，包含已预订时间段等信息。（延时退房等情况怎么设计？）
### 通过公众号页面扫描场景二维码开锁（是否需要？）
公众号菜单中有一项，扫描开门，点击后进入扫描界面，将扫描后的内容不经过微信直接发送到第三方后台。
### 通过输入密码开锁 （不需与服务器联系，不需使用手机）
### 用户通过微信公众号发布房间信息
点击菜单发布房间，进入发布房间的页面，引导用户扫描锁的二维码，如果有大门锁，则将大门锁与该锁也关联，即用户订房时将同时有两把锁的权限。在设计上可以用大房间套小房间的概念，用户创建房间后，允许创造该房间下面的小房间。
房间描述中，1,扫描锁背后二维码，2,最多8张图片，3,选择房间具有的设施：淋浴，浴缸，马桶，蹲便器，空调，IPTV电视，有线电视，有线网口，无线网络，吹风机，床，干净被褥，毛巾，浴巾，4,其他推广信息
### 用户订房流程
点击菜单我要订房，选择订房时间及地点，搜索出满足条件的房间信息，用户选择一个进入详情，点击订房，订下房间，返回订房成功信息，短信通知用户房间密码等信息
1, 点击“我要订房”菜单，进入房间搜索页面，页面元素有：目的地点，起止时间（默认入住开始时间为14点，退房时间中午12点，中间预留两个小时用作清理和缓冲，特殊时段用房，用户可以自己选择时间段），搜索按钮。
2, 在所有用户操作页面，头部有一个用户个人信息条（在用户浏览全过程中存在），包含元素有本人头像（点击进入个人详细信息），搜索框（点击进入搜索页面）。个人详细信息包含，个人资料，订单管理，房间管理，评价管理等。
3, 用户点击搜索后，进入列表页面，类似自如，列表列出基本信息及图片，超过一天的列出日均价格，不超过6小时的列出每小时价格。上拉到头刷新，下拉到尾加载下一页。
4, 点击某一项后，进入房间详细介绍页面。页首是图片轮转，下面是房间配备的设备列表，然后是价格栏及预订按钮、收藏按钮，接下来是房东信息，评价分数，文字描述，注意事项，评价信息等
5, 点击预订后，进入支付流程。首先支付确认，支付完成或失败，返回已完成订单或未完成订单列表。
### 语音订房流程
在公众号页面输入语音，自动识别出地点和时间，进入相应搜索页面
### 用户发布房间流程
1,点击“发布房间”菜单，进入房间发布页面，分为多个步骤发布
    a）房源类型、几张床（默认1）、最多允许几个人住（默认2）、几个卫生间（默认1）。至于床多大，在详细描述中可以写，具体情况照片中可以看出来
    b）房源位置（由地图确定，默认停在当前GPS位置）、门牌号（由输入框描述）
    c）是否使用微信锁（扫描微信锁二维码，微信屏幕工程模式可以调出锁的设备二维码），如果有多把微信锁，则添加锁。
    d）上传8张照片，至少1张，可以以后再增删。
    e）设置一个精彩的标题，选择一堆标签，一段房间描述（位置，禁忌）
    f）设置日历，将某些日子设为不出租。入住时间，退房时间
    g）预览及发布
    注意：如果发布不存在的房间，被发现后一个月内不能发布信息
2,点击“我的自助”菜单（或者有子菜单：我的发布，我的预订，我的收藏），能查看自己发布的房间及自己预订的房间。
## 订房系统超级用户管理子系统
### 用户信息管理（微信用户管理）
### 房间信息管理（包含锁管理）
## 用户发布及订房APP对应的数据库
1, 用户相关表
用户基础信息表user{id, password, name, email, telephone, cardid, addr, desc, avatar[pictureId], createAt, updateAt}
---微信用户信息表WechatUser（可以不需要，每次直接从微信服务器获取） {id, [userId], openid, subscribe, nickname, sex, language, city, province, country, headimgurl, subscribe_time, unionid, remark, groupid, tagid_list:[128,2]}
---用户标签表WechatUserTag(不是SQL数据库表)，直接从微信获取，保存在缓存数据库中，并且能动态更新，建议在解析某个用户的标签列表时发现有不匹配情况时，更新该用户信息和标签表信息，使其跟微信服务器一致。
2, 房间信息表
房间信息表room{id, [ownerId], rentType{时租房HOUR，日租房DAY，月租房MONTH}, priceHour, priceDay, priceMonth, [currencyId---], title, address, gpsLatitude, gpsLongitude, peopleCount, washRoom, bedRoom, bedCount, checkIn, checkOut, [roomTypeId---], [headimgId]}
房间图片(多对多关系表)roomPicture{id, [roomId], [pictureId]}
房间锁(多对多关系表)roomLock{id, [roomId], [LockId]}
---房间类型表roomType(不是SQL数据库表，作为全局变量，暂时不要){id, name{公寓，整套房子......}}
---货币种类表currency(不是SQL数据库表，作为全局变量，暂时不要){id, desc{￥, $}, type{AED,ARS,AUD,BGN,BRL,CAD,CHF,CLP,CNY,COP,CRC,CZK,DKK,EUR,GBP,HKD,HRK,HUF,IDR,ILS,JPY,KRW,MAD,MXN,MYR,NOK,NZD,PEN,PHP,PLN,RON,RUB,SAR,SEK,SGD,THB,TRY,TWD,UAH,USD,UYU,VND,ZAR}}
收藏房间(多对多关系表) RoomFaver {id, [userId], [roomId], createAt, updateAt}
预订表 booking {id, [userId], [roomId], startTime, endTime, status{init, payed, checkin, finish}, [paymentId], createAt, updateAt}
评价表 Rating {id, [bookingId],[userId], accuracy,communication,cleanliness,location,checkin,value}
资金流水表 payment{id, [userId], amount/money, status, finishTime, createAt, updateAt},除了订房的支付，所有支付都在这里有记录。
3, 公共表
图片表picture{id, path, name, desc, (origin, big, middle, small,? in cache?) createAt, updateAt}

## 用户房间系统API列表
1, 用户

## airbnb发布房间过程
房源类型：公寓,独立屋,宾馆,整层楼,住宿加早餐,公寓,小木屋,别墅,阁楼,连栋住宅,小平房,城堡,宿舍,树屋,船,飞机,露营车/房车,冰屋,灯塔,蒙古包,圆锥形帐篷,洞穴,岛屿,牧人小屋,土房,小屋,火车,帐篷,其它

有几张床：1-16
床类型：实体床,平拉式沙发,气垫床,日式床垫,沙发
房间能住几位客人：1-16

有几个卫生间 0, 0.5-8

房源位于何处？
国家列表：刚果,刚果民主共和国,马其顿,阿尔巴尼亚,阿尔及利亚,阿富汗,阿根廷,阿拉伯联合酋长国,阿鲁巴,阿曼,阿塞拜疆,埃及,埃塞俄比亚,爱尔兰,爱沙尼亚,安道尔,安哥拉,安圭拉,安提瓜和巴布达,奥地利,奥兰群岛,澳大利亚,澳门,巴巴多斯,巴布亚新几内亚,巴哈马,巴基斯坦,巴拉圭,巴勒斯坦领土,巴林,巴拿马,巴西,白俄罗斯,百慕大,保加利亚,北马里亚纳群岛,贝宁,比利时,冰岛,波多黎各,波兰,波斯尼亚和黑塞哥维那,玻利维亚,伯利兹,博茨瓦纳,不丹,布基纳法索,布隆迪,赤道几内亚,丹麦,德国,东帝汶,多哥,多米尼加,多米尼加共和国,俄罗斯,厄瓜多尔,厄立特里亚,法国,法罗群岛,法属波利尼西亚,法属圭亚那,法属圣马丁,梵蒂冈,菲律宾,斐济,芬兰,佛得角,福克兰群岛（马尔维纳斯群岛）,冈比亚,哥伦比亚,哥斯达黎加,格林纳达,格陵兰,格鲁吉亚,根西岛,古巴,瓜德罗普岛,关岛,圭亚那,哈萨克斯坦,海地,韩国,荷兰,荷兰加勒比,荷属圣马丁,黑山共和国,洪都拉斯,基里巴斯,吉布提,吉尔吉斯斯坦,几内亚,几内亚比绍,加拿大,加纳,加蓬,柬埔寨,捷克共和国,津巴布韦,喀麦隆,卡塔尔,开曼群岛,科科斯群岛,科摩罗,科威特,克罗地亚,肯尼亚,库克群岛,库拉索,拉脱维亚,莱索托,老挝,黎巴嫩,立陶宛,利比里亚,利比亚,列支敦士登,留尼汪,卢森堡,卢旺达,罗马尼亚,马达加斯加,马尔代夫,马耳他,马拉维,马来西亚,马里,马绍尔群岛,马提尼克,马约特,曼岛,毛里求斯,毛里塔尼亚,美国,美属萨摩亚,美属维京群岛,蒙古,蒙塞拉特,孟加拉国,秘鲁,密克罗尼西亚联邦,缅甸,摩尔多瓦,摩洛哥,摩纳哥,莫桑比克,墨西哥,纳米比亚,南非,南乔治亚岛和南桑威齐群岛,南苏丹,瑙鲁,尼加拉瓜,尼泊尔,尼日尔,尼日利亚,纽埃,挪威,诺福克岛,帕劳,皮特凯恩群岛,葡萄牙,日本,瑞典,瑞士,萨尔瓦多,萨摩亚,塞尔维亚,塞拉利昂,塞内加尔,塞浦路斯,塞舌尔,沙特阿拉伯,圣巴泰勒米,圣诞岛,圣多美和普林西比,圣赫勒拿,圣基茨和尼维斯,圣卢西亚,圣马力诺,圣皮埃尔和密克隆群岛,圣文森特和格林纳丁斯,斯里兰卡,斯洛伐克,斯洛文尼亚,斯瓦尔巴特和扬马延,斯威士兰,苏里南,所罗门群岛,索马里,塔吉克斯坦,台湾,泰国,坦桑尼亚,汤加,特克斯和凯科斯群岛,特立尼达和多巴哥,突尼西亞,图瓦卢,土耳其,土库曼斯坦,托克劳,瓦利斯和富图纳,瓦努阿图,危地马拉,委内瑞拉,文莱,乌干达,乌克兰,乌拉圭,乌兹别克斯坦,希腊,西班牙,西撒哈拉,香港,象牙海岸,新加坡,新喀里多尼亚,新西兰,匈牙利,牙买加,亚美尼亚,也门,伊拉克,以色列,意大利,印度,印度尼西亚,英国,英属维京群岛,英属印度洋领地,约旦,越南,赞比亚,泽西岛,乍得,直布罗陀,智利,中非共和国,中国
地图位置： 建议直接拖拽地图，默认在当前位置
门牌号：填写小区名及门牌号即可

您提供的便利设施有哪些？
生活必需品（毛巾、床单、香皂和卫生纸）,无线上网,洗发水,壁橱/抽屉,电视,暖气,空调,早餐、咖啡、茶,书桌/工作区,壁炉,熨斗,吹风机,屋內有宠物
安全措施：烟雾报警器,一氧化碳报警器,急救包,安全卡,灭火器,卧室带锁

房客可以使用哪些区域？厨房,洗衣机,干衣机,停车,电梯,游泳池,按摩浴缸,健身房,

成为Airbnb房东
床、浴室和便利设施等等 更改
场景设置 照片、简短描述、标题
准备好接待房客 预订设置、日历、价格

我的房源靠近 。。。
你会爱上我的房源，因为。。。（标签）
我的房源适合： 情侣,独自旅行的冒险家,商务旅行者,有小孩的家庭,大型团体,毛茸茸的伙伴（宠物）
生成一个文字描述，用于检索

为您的房源起个名称

查看Airbnb房客要求
已确认邮箱，确认电话号码，个人头像，付款信息
同意您的《房屋守则》，告诉您他们的旅程目的
已向Airbnb提交政府颁发的身份证明，受到其他房东推荐，而且没有负面评价

为房客制定《房屋守则》
适合儿童入住（2-12岁） 
适合婴幼儿入住（2岁以下） 
适合宠物入住 
允许吸烟 
允许举办活动或聚会 
添加更多守则：

房客预订方式：即时预订
只要房客符合以下条件，他们便可以即时预订可租日期：
获得其他房东推荐，并且没有负面评价
符合Airbnb的房客要求
同意您的《房屋守则》
告诉您他们的旅程目的
告诉您同行人数
不符合您的要求的房客必须发送预订申请。

要求所有房客发送预订申请
勾选方框以确认您已理解：
对于所有预订申请，您都将需要在24小时内回复
您的房源在搜索结果中显示的频率将会降低
您可能只会获得一半数量的预订
您知道吗？ 超过900,000的房东允许房客即时预订住宿，因为这样他们可以轻松获得两倍的预订。

成功出租始于您的日历

在房客抵达前，您需要提前多久收到通知？1,2,3,7

房客可以提前多久预订？任何时候,3个月,6个月,一年,默认不开放的日期

房客可以住多久？最少晚数，最多晚数

更新您的日历

您想如何设置房源价格？根据需求调整价格 固定价格 

选择货币,AED,ARS,AUD,BGN,BRL,CAD,CHF,CLP,CNY,COP,CRC,CZK,DKK,EUR,GBP,HKD,HRK,HUF,IDR,ILS,JPY,KRW,MAD,MXN,MYR,NOK,NZD,PEN,PHP,PLN,RON,RUB,SAR,SEK,SGD,THB,TRY,TWD,UAH,USD,UYU,VND,ZAR

## api列表
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
  app:server:apis null expire +0ms      null      !expire true !!expire false !!!expire true
  app:server:apis 0 expire +0ms         0         !expire true !!expire false !!!expire true
  app:server:apis "" expire +0ms                  !expire true !!expire false !!!expire true
  app:server:apis 1 expire +0ms         1         !expire false !!expire true !!!expire false
  app:server:apis "11" expire +0ms      11        !expire false !!expire true !!!expire false
  app:server:apis {} expire +0ms        {}        !expire false !!expire true !!!expire false
  app:server:apis {a} expire +16ms     { a: 'a' } !expire false !!expire true !!!expire false
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

## 使用node-redis时，默认是使用callback的异步模式，怎么改成async/await模式？
```
1, callback模式：
    redis._redisClient.hget ([hkey], [key], function(err,res){
        if (err) {
            console.log('Error:'+ err);
            return;
        }
        console.dir(res);
    });

    redis._redisClient.del ([hkey],key);
    这种模式查询或处理结果从异步的callback返回，对于koa2的服务器来说编程很困难。
2, async/await模式，写一个通用的用来处理redis方法的函数，并调用此函数返回一个Promise，特别适合koa2
const redis_fn = function (fn, arg) {
    if (arguments.length > 2) arg = Array.prototype.slice.call(arguments, 1);
    return new Promise(function (resolve, reject) {
        fn.apply (redis._redisClient, arg.concat( function (err, res) {
            console.log ("redis_fn result", err, res);
            if (err) return reject(err);
            if (arguments.length > 2) res = slice.call(arguments, 1);
            resolve(res);
        }));
    });
}
用法：
    var scene_value = await redis_fn(redis._redisClient.hget, 'qrscene',qrscene);
    console.log ("scene_value", scene_value);
    await redis_fn(redis._redisClient.del, 'qrscene',qrscene);
```
参考：
[thunkify和co的结合](http://www.cnblogs.com/wofeiwofei/p/5462387.html)  
[JavaScript里function函数实现可变参数(多态）](http://www.oschina.net/question/54100_15938)  
## html编辑页面控件相关
[relax](http://demo.getrelax.io/admin)  
[tsurupin](http://staging.tsurupin.com/cms/posts/1/edit)  
## 下拉加载，上拉刷新
[react + iscroll5 实现完美 下拉刷新，上拉加载](http://www.cnblogs.com/qq120848369/p/5920420.html)  
## window.getComputedStyle()获取计算后的元素样式
语法如下：
var style = window.getComputedStyle("元素", "伪类");
例如：
var dom = document.getElementById("test"),
    style = window.getComputedStyle(dom , ":after");

## 动态加载css/js到页面
公司网站需要使用bootstrap.css，而公众号页面需要weui.css，我们不能将其写在index.html中，需要动态加载  
[dynamic load javascript/css 1](http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml)  
[dynamic load javascript/css 2](http://www.javascriptkit.com/javatutors/loadjavascriptcss2.shtml)    
[React中动态加载css文件](http://stackoverflow.com/questions/28386125/dynamically-load-a-stylesheet-with-react)  
## 图片上传
使用formdata方式上传或使用``` Content-Type: application/octet-stream ```方式上传
参考
[理解DOMString、Document、FormData、Blob、File、ArrayBuffer数据类型](http://www.zhangxinxu.com/wordpress/2013/10/understand-domstring-document-formdata-blob-file-arraybuffer/)
[Ajax file upload with pure JavaScript](http://igstan.ro/posts/2009-01-11-ajax-file-upload-with-pure-javascript.html)
[FileReader.readAsDataURL()](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL)
[使用 JavaScript File API 实现文件上传](http://www.ibm.com/developerworks/cn/web/1101_hanbf_fileupload/index.html)
[Canvas API](http://javascript.ruanyifeng.com/htmlapi/canvas.html)
[js图片压缩上传](http://www.cnblogs.com/tonyjude/p/4261930.html)
[Using files from web applications](https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications)
[File Uploading over AJAX using HTML5](http://www.nickdesteffen.com/blog/file-uploading-over-ajax-using-html5)
### 使用FormData对象
测试例子见 src/static/demos/fileupload_FormData.html
后台见 apis/upload/form
[FormData](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData)
[HTMLFormElement](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLFormElement)
### 使用DataUrl来上传图片
测试例子见 src/static/demos/fileupload_base64.html
后台见 apis/upload/base64/a.png
[FileReader.readAsDataURL upload to express.js](http://stackoverflow.com/questions/13069769/filereader-readasdataurl-upload-to-express-js)

## react-redux-nodejs-koa 授权相关
[react中添加授权](https://auth0.com/blog/adding-authentication-to-your-react-flux-app/)  
[授权](https://scotch.io/tutorials/build-a-react-flux-app-with-user-authentication)  
## 微信填坑
1, pushState不支持问题，因Android6.2以下浏览器版本低的原因， [Android6.2以下浏览器版本低](http://www.jianshu.com/p/c4f216b0c080)  
2, invalid signature问题，可能是时间戳基准不一样 [第三方后台时间与微信服务器时间](http://m.blog.csdn.net/article/details?id=49451359)  
## emacs中以utf-8编码读取文件
查看当前buffer的编码：M-x　describe-coding-system  
按C-x <RET> r <TAB> 列出所有编码  
以指定编码重读当前buffer：C-x <RET> r utf-8，(revert-buffer-with-coding-system)  
改变当前buffer的编码：C-x <RET> f uft-8，(set-buffer-file-coding-system)  
## 攻击破解锁系统
1,假冒锁，获取锁中的ca证书及锁uuid，用程序模仿锁，获得相关数据  
2,攻击锁服务器  

