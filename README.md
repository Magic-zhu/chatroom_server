### 介绍

![image](https://img.shields.io/badge/Version-1.0.1-red.svg)

这是一个用于学习node 所写的仿网页微信的即时聊天的<span style='color:red'>服务端</span><br>
主要数据库是redis和mysql。

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

#### api文档 ---未完成❎

##### 登录接口

请求地址：47.105.210.34:8086/upload
|字段名字|数据类型|是否必填|备注
|---|---|---|---

返回示例
```json
{
    errcode:0,
    msg:"",
    data:{
        
    }
}
```

##### 上传文件接口

请求地址：`post` 47.105.210.34:8086/upload
|字段名字|数据类型|是否必填|备注
|---|---|---|---
|token|String|是|

返回示例
```json
{
    errcode:0,
    msg:"",
    data:{
        
    }
}
```