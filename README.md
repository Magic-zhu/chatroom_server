### 介绍

这是一个用于学习node 所写的仿网页微信的即时聊天的<span style='color:red'>服务端</span><br>
主要数据库是redis和mysql。

#### 结构（偷懒^v^）

+ redis用来存储token & 离线消息暂存 & 离线好友请求暂存
+ mysql 存储基本信息
+ 本地存储聊天记录 

#### 安装依赖

```bash
npm install
```
#### 启动项目

```bash
npm start
```
服务的默认端口号是8086,关于数据库的配置,请在config文件夹下面修改.
