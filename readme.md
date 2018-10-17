# modular2Cloud
modulae2Cloud 是一个支持LWM2M和MQTT协议的轻量级IoT 应用服务器。支持Mbed/modular2 设备快速接入物联网，并且实现数据访问，订阅，存储和数据可视化。
# 可连接的接入平台
+ 中国电信onenet
+ 上海国动LoRa
+ Arm pelion
+ CoAP/UDP 直接接入
+ HTTP 直接接入
+ MQTT 协议
+ 其它LWM2M 接入网
# 系统架构
+ 基于mongoDB ，express，angular，和nodeJS（MEAN stack）实现。
+ 基于MQTT 实现与客户端信息交换。
+ 维护一个内部IPSO 数据库。
+ RESTFull API。支持移动终端APP的实现。
+ 三种角色：管理员，用户和设备。
# 开始一个新的应用项目
+ 注册一个管理员账号
+ 添加设备。编写客户端程序。
+ 添加其它伙伴
# IPSO 数据库
 IPSO 是LWM2M 的信息模型，它的特点是基于面向对象的信息模型，预定义了大量常用的标准化对象和资源，在协议中使用 设备ID/对象ID/实例/资源ID的URI来读写，订阅数据。简化了设备和服务器，客户端描述对象的过程。 
## IPSO 的局限性
+ 名称和描述没有中文。
+ 标准化的对象和资源还不够。
  好在IPSO 提供了私有对象和复合对象的机制。可以扩展IPSO。在modular2Cloud 中，我们提供了对象和资源的中文名称和描述，扩展了一部分常用的对象，并且可以添加和维护私有IPSO对象。
# RESTFull API（V1.0）
+ readData
+ writeData
+ readHistory
+ observeData
+ publish
+ login
+ logout
+ dashboardInfo
+ addDevice
+ activeDevice
+ getDeviceObject
+ deleteDevice
+ getListOfDevice
+ addUser
+ deleteUser
+ getListOfUser
+ readIPSO
+ writeIPSO
+ deleteIPSO
+ getlistOfIPSO 
# 数据库
## 用户文档
<pre><code>
var userSchema = new mongoose.Schema({
	admin:mongoose.Schema.Types.ObjectId,
	name:String,

	password:String,
});
</code></pre>
+ admin- 是管理员id
+ name- 用户名
+ sublist -订阅表
+ password-口令
订阅表格式
一个字符串，订阅的资源的URL 
## 设备文档
<pre><code> var deviceSchema = new mongoose.Schema({
	name:String,
	linkType:Number,
	address:String,
	devEUI:String,
	admin:mongoose.Schema.Types.ObjectId,
	profile:String,
	subscribe:Array,
	status:Number,
	data:Array,
});
 </code>
 </pre>
 注：admin ID 如果等于记录的ID 那么该用户是管理员，否则是普通用户。
 + name 设备名
 + linkType -连接类型
     + 0 CoAP/UDP
     + 1 LoRA
     + 2 oneNet
	 + 3 MQTT
     + 4 Arm Pelion
+ address IP 地址
+ devEUI 设备EUI
+ admin 管理员ID
+ profile 设备的IPSO Json
+ subscribe 订阅表
+ status 设备状态
	+ 0 未激活
	+ 1 已激活

+ data 设备历史数据
# MQTT Broker
  ## 用途
  在modular2cloud 中，利用mosca 建立了一个MQTT Broker，它具有两个作用：
  + 用于云端和客户端App 的即时通讯。
  + 用于modular-2 通过MQTT 协议接入modular2Cloud
  ## topic 命名规则
  + 客户端之间发送的topic
    + topic ："ClientToClient_"+admin_ID
    + payload：Client messages  
  + 服务器发给客户端的订阅topic 
    + topic: "serverToClient_"+admin_ID
	+ payload:CoAP message
  + modular-2 发给服务器
    + topic ："deviceToServer"
	+ payload:CoAP messages
  + 服务器发给modular-2 
    + topic ："ServerToDevice_"+device_ID
	+ payload:CoAP messages
  ## Client message 格式
  <pre><code>
  Client_message={
	  sender:user_id,
	  content:String,
  }
  </code></pre>
  ##  CoAP Message 的格式
  <pre><code>
  CoAP_message=method URL,Options
  CoAP_message="PUT" URL/value
  method=[GET,PUT,POST];
  URL='/'+device_ID+'/'+Object_ID+'/'+Instant_ID+'/'+Resourec_ID
  Option=opt+'='+value
  </code></pre>
# 操作过程说明
## 订阅
+ 只有管理员用户可以向设备发送订阅命令和解除订阅命令格式为
    + URL；obs=1 订阅
    + URL；obs=0 取消订阅
+ 当设备上传了订阅数据后，通过MQTT 发送消息。
## 读数据
+ 任何用户可以向设备发起读操作命令。
## 写数据
+ 只有管理员可以向设备写数据。



