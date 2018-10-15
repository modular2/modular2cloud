# modular2Cloud
modulae2Cloud 是一个支持LWM2M协议的轻量级IoT 应用服务器。支持Mbed/modular2 设备快速接入物联网，并且实现数据访问，订阅，存储和数据可视化。
# 可连接的接入平台
+ 中国电信onenet
+ 上海国动LoRa
+ Arm pelion
+ CoAP/UDP 直接接入
+ HTTP 直接接入
# 系统架构
+ 基于mongoDB ，express，angular，和nodeJS（MEAN stack）实现。
+ 支持IPSO 数据库。
+ 三种角色：管理员，用户和设备。
# IPSO 数据库
 IPSO 是LWM2M 的信息模型，它的特点是基于面向对象的信息模型，预定义了大量常用的标准化对象和资源，在协议中使用 设备ID/对象ID/实例/资源ID的URI来读写，订阅数据。简化了设备和服务器，客户端描述对象的过程。
IPSO 也具有局限性：
+ 名称和描述没有中文
+ 标准化的对象和资源还不够
  好在IPSO 提供了私有对象和复合对象的机制。可以扩展IPSO。在modular2Cloud 中，我们提供了对象和资源的中文名称和描述，扩展了一部分常用的对象，并且可以添加和维护私有IPSO对象。
# RESTFull API
+ readData
+ writeData
+ readHistory
+ subscribe
+ publish
+ login
+ logout
+ addDevice
+ deleteDevice
+ addUser
+ deleteUser
+ readIPSO
+ writeIPSO
+ deleteIPSO
