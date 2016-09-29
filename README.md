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
