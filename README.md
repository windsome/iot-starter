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
可以使用nvm list 查看本地当前安装的node版本  
使用nvm ls-remote 查看可以安装的版本  
使用nvm install 5.11.1安装指定版本号版本  
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
http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml  
http://www.javascriptkit.com/javatutors/loadjavascriptcss2.shtml  
 
# 使用redux-form时，使用initialValues作为初始值，但初始值在redux-form组件中改变后并不更新？
原因是创建redux-form时需要增加enableReinitialize:true选项  
```
export default reduxForm({
    form: 'lock',  // a unique identifier for this form
    enableReinitialize: true // if you change initialValues, you need do it to take effect.
})(EditLockForm)
```
*重要问题，我始终没弄明白redux-form例子“Initialize From State”并没有设置该属性却表现正常能够动态改变初始值，为什么它可以？

# mqtt消息中转服务
```
 #subscribe to topic
mosquitto_sub -t /broker/smartlock/\# -v --cafile ca.crt -h mqtt.lancertech.net -p 8883
mosquitto_sub -t /broker/smartlock/server -v --cafile ca.crt -h mqtt.lancertech.net -p 8883 
 #publish to topic
mosquitto_pub -t /broker/smartlock/server --cafile ca.crt -h mqtt.lancertech.net -p 8883 -m '{"uuid":"ll_02330df03ffd9","cmd":"get_access_token"}'
```
# API列表
## 门锁后台服务相关 service-lock.js
主要负责门锁(LOCK)与门锁后台服务(SERVICE)的交互及其他应用子系统(APP)与门锁后台服务的交互。其他子系统与门锁的交互完全通过门锁后台中转。  
API分为门锁向门锁服务的mqtt请求部分、门锁服务供其他应用子系统调用的接口、门锁服务调用应用子系统的接口描述（其他系统需要实现这些接口）  
注意：因为mqtt相关操作可能会有延时及不确定性（比如：锁收到消息后，可能突然断电，导致服务端未收到成功消息，此时需要服务器重发），为避免重复，需要对每一个操作指定一个事物号，用来唯一确定一个动作，事物号使用UUID。  
1, 锁出厂前初始化获取基础信息命令register，上传MAC地址，获取CA证书、UUID、（是否获取微信硬件QRCODE？）  
    命令过程:  
        这条命令的执行是因为锁本身没有基础的锁信息，没有UUID。为了能使通讯进行，锁首先生成一个临时UUID，并将mqtt订阅到该UUID对应的topic(/broker/smartlock/temp-UUID)。
        锁的生成一条register命令。
        锁publish该命令到mqtt服务端topic（/broker/smartlock/server），如果通讯出问题或者终端在5秒内未收到反馈则一直重发。
        服务端收到register命令后动态生成一个uuid，（如果用到微信设备，则从devices表中获取一个锁类型设备的device_id,qrcode）存放在数据库Locks表中，并将该记录包含ca信息返回给锁。服务端如果收到多条相同mac地址的register命令（如何判断相同？从数据库中找到mac地址对应的设备），将数据库中资料发送出去。
        锁将收到的消息解析存于flash中。errcode == 0的消息是正确的返回，否则不保存并重发register消息。
        保存消息后，锁重启，会有心跳消息发送到服务端。（在工厂测试页面，应该停在一个画面，这个画面监测register消息，收到消息后提示过程，并在界面中缓存设备的mac地址和uuid，并提示该设备发出的消息，让工厂人员能够确保锁register成功了）。  
    direct: LOCK->SERVICE, MQTT  
    input: {cmd:'register', id: 'temp-UUID', mac:'mac'}  
    output: {errcode:0, errmsg:'', ca1:'', ca2:'', ca3:'', uuid:'', qrcode:''}  
2，锁心跳命令heartbeat，定时向mqtt发送消息，校准时间，及获取mqtt服务端缓存着的命令  
    direct: LOCK->SERVICE, MQTT  
    input: {cmd:'heartbeat', id:'UUID'}  
    output: {errcode: 0, errmsg:'', time:timestamp}  
3，锁日志上传命令log，锁上电的空闲时间段上传日志  
    direct: LOCK->SERVICE, MQTT  
    input: {cmd:'log', id:'UUID', log:[{action:scan, time:timestamp},{action:password, time:timestamp},...]}  
    output: {errcode: 0, errmsg:''}  
4.1，锁获取临时场景二维码命令qrcode  
    命令过程：  
        锁端生成一个scene_id，这是个长字符串，建议使用UUID生成方式。
        锁将scene_id发到锁服务端的mqtt服务器
        如果使用的是微信的场景二维码，则调用微信公众号接口生成qrcode。如果是其他方式生成二维码，则用相应方式生成。也可以在我们自己平台生成一个10分钟时效的二维码。
        返回二维码及有效时间给锁，锁得到二维码后可以显示在屏幕上，由用户扫描。
    direct: LOCK->SERVICE, MQTT  
    input: {cmd:'qrcode', id:'UUID', scene_id:'GENERATED_SCENE_ID'}  
    output: {errcode: 0, errmsg:'', qrcode:'GENERATED_QRCODE', timeout:600}  
4.2，应用子系统发送scene_id给锁服务端check_scene_id，并由锁服务端发送给锁终端，在锁端对scene_id校验  
    命令过程：  
        用户扫描锁上面通过qrcode命令得到的二维码（微信二维码用微信扫一扫，其他平台调用相应API，自己系统生成的二维码，则使用自己系统的扫描界面）
        扫描后，应用子系统会得到scene_id（微信则是由微信服务器发送给第三方平台，通过XML消息方式，我们可以提取其中的scene_id）
        应用子系统（或微信第三方平台）得到scene_id后，调用send_scene_id，将scene_id发送到锁服务端
    direct: APP->SERVICE, API, /apis/lock/check_scene_id  
    input: {id:'UUID', scene_id:'GENERATED_SCENE_ID'}  
    output: {errcode: 0, errmsg:''}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
4.3，锁服务端发送scene_id到锁端命令check_scene_id，锁检查scene_id是否匹配  
    命令过程：  
        锁服务端收到4.2的命令后，通过mqtt发送给锁
    direct: SERVICE->LOCK, MQTT  
    input: {cmd:'send_scene_id', id:'UUID', scene_id:'GENERATED_SCENE_ID'}  
    output: {errcode: 0, errmsg:''}  
5.1，应用子系统生成一个6位密码或者用户输入一个6位密码，给锁服务端，并由锁服务端发送给锁终端保存，供用户使用密码开门，命令set_password  
    命令过程：  
        用户订房，或者管理员设置开门密码等情况下，需要发送密码给锁
    direct: APP->SERVICE, API, /apis/lock/set_password  
    input: {id:'UUID', password:'MD5-PASSWORD'}  
    output: {errcode: 0, errmsg:''}  
    注意：此命令的处理是异步的，我们也可以等待，但有可能导致http超时  
5.2，锁服务端发送密码到锁端命令set_password  
    命令过程：  
        锁服务端收到5.1的命令后，通过mqtt发送给锁
    direct: SERVICE->LOCK, MQTT  
    input: {cmd:'send_scene_id', id:'UUID', password:'MD5-PASSWORD'}  
    output: {errcode: 0, errmsg:''}  
6，应用子系统通过UUID得到某把锁的信息get_lock，主要是判断该锁是否存在，一般用在应用子系统中用户添加锁的时候  
    命令过程：
        用户在APP中输入锁的UUID或MAC，（如果是微信锁，则扫描微信二维码，得到qrcode/device_id），组成查询字符串
        锁服务端，根据条件查找锁信息，（是否将此锁置为已被使用，之后再扫描则失效并返回错误信息？）并返回。（未来是否要加强条件，如何判断该锁确实属于此用户？）
    direct: APP->SERVICE, API, /apis/lock/get_lock
    input: {where: {id:'INPUT-UUID', mac:'INPUT-MAC', qrcode:'SCAN-QRCODE', device_id:'SCAN-DEVICE_ID'}}, where中的条件只需填写一项就行  
    output: {errcode: 0, errmsg:'', data: {...}}  
## 门锁超级用户管理系统
1, /apis/db/list_user 获取数据库中用户列表  
    支持POST/GET两种方式  
    参数：
```
        offset：开始记录index，默认为0
        count: 获取记录条数，默认为10
        where：获取记录条件
```
    例子：
```
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

# 攻击破解锁系统
1,假冒锁，获取锁中的ca证书及锁uuid，用程序模仿锁，获得相关数据  
2,攻击锁服务器  

