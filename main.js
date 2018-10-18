/* modular2Cloud Ver 1.0 */
const dgram       = require('dgram')
    , packet      = require('coap-packet')
    , parse       = packet.parse
    , generate    = packet.generate
    , payload     = new Buffer('Hello World')
	, message     = generate({code:69,messageId: 1, payload: payload })
    , port        = 5684
    , client      = dgram.createSocket("udp4")
	, server      = dgram.createSocket("udp4")
const LoRaAnabled=false;	
const HTTP_PORT =1234;
const LORA_HOST="ws://www.guodongiot.com:92";	
const WebSocket = require('ws');
var CryptoJS = require("crypto-js");	
var mosca = require('mosca');
var ascoltatore = {
  //using ascoltatore
  type: 'mongo',		
  url: 'mongodb://127.0.0.1:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
};
var moscaSettings = {
  http: {
    port: 15681,
	//backend: ascoltatore,
    bundle: true,
    static: './'
  }
};

var mqttserver = new mosca.Server(moscaSettings);
var express = require('express');
var app = express();
var http=require('http');
var httpServer = http.Server(app);
var session = require("express-session");
var mongoose = require('mongoose');

app.use("/js", express.static(__dirname + '/js'));
app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/images", express.static(__dirname + '/images'));
app.use("/views", express.static(__dirname + '/views'));

var bodyParser = require('body-parser');
var jsonParser= bodyParser.json();
app.use(bodyParser.json({limit:'1mb'}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true }));
// connect to Database
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://127.0.0.1:27017/iotDB");
var MongoStore = require('connect-mongo')(session); 
app.use(session({  
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
   store:new MongoStore({url:"mongodb://127.0.0.1:27017/iotDB"})
}));
// 数据库Schema 定义
var userSchema = new mongoose.Schema({	
	name:String,
	password:String,
	admin:mongoose.Schema.Types.ObjectId,
	status:Number,
});
var deviceSchema = new mongoose.Schema({
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
var ipsoSchema = new mongoose.Schema({
	objectID:Number,
	name:String,
	resource:String//[{resID:Number,name:String,type:String}]
});
var User = mongoose.model('User', userSchema);
var Device = mongoose.model('Device', deviceSchema);
var ipso=mongoose.model('ipobjects', ipsoSchema);
app.get('/index', function(req, res) {
	res.sendfile("./views/index.html");
}); 
// Connect To LoRa Access Server
if (LoRaAnabled)
{
var  userId = "3457031";
var   sec = "331bbb9b6d74fd984acf0331fa5bcb95";
var appEUI ="000000000000009a";
var devEUI="0000000000005855";
var  str=new Array();
var currentTimeStr=Math.round(new Date().getTime()/1000).toString() ;// (new Date().getTime()/1000).toString();
var str =createMd5(currentTimeStr+appEUI+sec);
console.log("str="+str);
 var tokenStr ="";
        for ( i = 0; i < str.length; i++)
        {
            tokenStr += str[i].toString("x2");
        }
 console.log("tokenStr="+tokenStr);		
var url="ws://www.guodongiot.com:92/webs?"+"appEUI="+appEUI+"&token="+ tokenStr + "&time_s=" + currentTimeStr;
 //console.log(url);
 const ws = new WebSocket(url);
  ws.on('open', function open() {
  console.log("connected to LoRa Server websocket");

 //ws.send(array);
  });
// 从·Lora websock 接收数据
ws.on('message', function incoming(data) {
   var msgIn=JSON.parse(data,"utf8"); 
if (msgIn.data!=null) 
{ 	
   var len=msgIn.data.length;
   var devEUI=msgIn.devEUI;
  
   var array=new Uint8Array(len/4)
    var bdata=Buffer.from(array) ;
  
   var p=0;
   var s=2;
   for (var i=2;i<(len/4+2);i++)
   { 
     var t1=(hextoBin(msgIn.data.charCodeAt(s))<<4)|hextoBin(msgIn.data.charCodeAt(s+1));
	  s=s+2;
	   var t2=(hextoBin(msgIn.data.charCodeAt(s))<<4)|hextoBin(msgIn.data.charCodeAt(s+1));
	   s=s+2;
   bdata[p++]= (hextoBin(t1)<<4)|hextoBin(t2);
   }
 //  console.log(bdata);
 coapDecode(bdata);
} else
	if (msgIn.result!=null)
{
	if (msgIn.error==0)
		console.log("send successful");
}
  });
}
var device_profile=null;
var analog1=0;
app.get('/ipsoInfo',function(req,res){
	ipso.find({},function(error,ipsos){
	res.send(ipsos);	
	})
})

app.get('/dashboardInfo',function(req,res){
 	var sublist=new Array();
	var device_num=0;
	var user_num=0;
	var sub_num=0;
	var profile;
Device.find({admin:req.query.id},'name subscribe profile status',function(error, device) {
	   
	   device_num=device.length;
			  if (device.length>0)   
			   device.forEach(function(dev){
				   if (dev.subscribe!=null)
				   { 
  			         profile=JSON.parse(dev.profile);
   			        for (var i=0;i<dev.subscribe.length;i++)
					   { 
						    var object_name;
                            var reource_name;	
	                           urlList=dev.subscribe[i].split('/');
							for (var o=0;o<profile.objects.length;o++)
								if (profile.objects[o].id==urlList[2])
								{
									object_name=profile.objects[o].name;
								  for (var k=0;k<profile.objects[o].resource.length;k++)
									 if( urlList[3]==profile.objects[o].resource[k].id)
										 resource_name=profile.objects[o].resource[k].name;
								}
							sublist.push({
								URL:dev.subscribe[i],
								device:dev.name,
								object:object_name,
								instant:0,
								resource:resource_name
							    })
						 	
					   }
						
				   }
			   });
		console.log("subscribe List:"+sublist);	   
	User.find({admin:req.query.id},'name',function(error, u) {
				    user_num=u.length;				 		
					res.set('Content-Type', 'application/json');
					if (sublist!=null)
					sub_num=sublist.length;
					res.send({user_num:user_num,device_num:device_num,sub_num:sub_num,subscribe:sublist});
				});
	});
})
// API get List Of User
app.get('/getListOfUser',function(req,res){
 	console.log(req.query.id);
User.find({admin:req.query.id},'name  status',function(error, m) {
	   console.log(m);
	   res.set('Content-Type', 'application/json');
		res.send(m);
})
})
// API- getListOf Device
app.get('/getListOfDevice',function(req,res){
	console.log(req.query.id);
Device.find({admin:req.query.id},'name address status linkType devEUI',function(error, m) {
	 
	  res.set('Content-Type', 'application/json');
	   res.send(m);
})
})
// API Delete an Device
// API device Observe
app.put('/subscribe',function(req,res){
	var url=req.query.url;
	var url_list=url.split("/");
 var device_id=url_list[1];
var obs=req.query.obs ;
   Device.findOne({_id:device_id},'address linkType devEUI subscribe',function(error,device){
	     var sendpayload=Buffer("/"+url_list[2]+"/"+url_list[3]+";obs="+obs);	   
		  var  message     = generate({code:01,messageId: 1, payload: sendpayload });
		if (device.linkType==1)
		{ 
         	console.log("Send to LoRa Websocket");
			//send to LoRa WebSocket
			ws_send(message,device.devEUI);
			
		}
	   else if (device.linkType==2)
		{
			console.log("Send to oneNet");
			 oneNetObserve(device.devEUI,device_id,url_list[2],0,url_list[3],obs);
		}
	    else
		{
		 if (device.address!=null)
			{ 
			
			   client.send(message, 0, message.length, 5684, device.address, function(err, bytes) {
				   console.log("Send To"+device.address+" "+sendpayload);
				  }) ;
			}
		}
// update devide subscribe list	
var sublist=device.subscribe;	
	if (obs==1)
	{
		if (sublist==null) {
		   
				Device.update({_id:device_id},{subscribe:url},function(error){
					console.log("update the sublist:"+url);
				})
			}
			else {
				var flg=true;
				for (var i=0;i<sublist.length;i++){
					if (sublist[i]==url)
					{
						flg=false;
					} 
				} ;
				if (flg){					 					
					sublist.push(url);
					console.log("sublist="+sublist);
					Device.update({_id:device_id},{subscribe:sublist},function(error){
						console.log("update the sublist"+url);
					})
				}
			}
	}		
   else
   {
	    var temp=new Array();
		var flg=true;
		for (var i=0;i<sublist.length;i++){
			if (sublist[i]!=url)
			      temp.push(sublist[i]);
		  } ;
			Device.update({_id:device_id},{subscribe:temp},function(error){
				console.log("remove subscribe item:"+url);
			})	
   }
 })
})
/*app.put('/observeData',function(req,res){
	var user_id=req.query.id;
	var subInfo=req.body;
	console.log(req.body);
	User.findOne({_id:user_id},'sublist',function(error,user){
       var sublist=user.sublist;
	if (sublist==null) {
		sublist=subInfo;
			User.update({_id:user_id},{sublist:sublist},function(error){
				console.log("update the sublist");
			})}
	else {
		var flg=true;
		sublist.forEach(function(s){
			if (s.URL==subInfo.URL)
			{
				flg=false;
		    } 
		});
		if (flg){
			sublist.push(subInfo);
			console.log("sublist="+sublist);
			User.update({_id:user_id},{sublist:sublist},function(error){
				console.log("update the sublist");
			})
		}
	}
	
	})
});
app.put('/userUnObserve',function(req,res){
	var user_id=req.query.id;
	var subInfo=req.body;
	User.findOne({_id:user_id},'sublist',function(error,user){
       var sublist=user.sublist;
       var temp=new Array();
		var flg=true;
		sublist.forEach(function(s){
			if (s.URL!=subInfo.URL)
			      temp.push(s);
		});
			User.update({_id:user_id},{sublist:temp},function(error){
				console.log("un subscribe");
			})	
	})
});
app.get('/deviceObserve',function(req,res){
 var url_list=req.query.url.split("/");
 var device_id=url_list[1];
var obs=req.query.obs ;
   Device.findOne({_id:device_id},'address linkType devEUI',function(error,device){
	     var sendpayload=Buffer("/"+url_list[2]+"/"+url_list[3]+";obs="+obs);	   
		  var  message     = generate({code:01,messageId: 1, payload: sendpayload });
		if (device.linkType==1)
		{  console.log("Send to LoRa Websocket");
			//send to LoRa WebSocket
			ws_send(message,device.devEUI);
			
		}
	    else
		{
		 if (device.address!=null)
			{ 
			
			   client.send(message, 0, message.length, 5684, device.address, function(err, bytes) {
				   console.log("Send To"+device.address+" "+sendpayload);
				  }) ;
			}
		}
 })
})*/
// API write Data to Device
app.put('/writeData',function(req,res){
 
 var url_list=req.query.url.split("/");
 var device_id=url_list[1];
 console.log("write=>"+device_id);
   Device.findOne({_id:device_id},'address linkType devEUI',function(error,device){
	   	  var sendpayload=Buffer("/"+url_list[2]+"/"+url_list[3]+"/"+url_list[4]);   	  
		  var  message     = generate({code:03,messageId: 1, payload: sendpayload });
		  console.log("devEUI="+device.devEUI);
		  console.log("message"+message);
		if (device.linkType==1)
		{  console.log("Send to LoRa Websocket");
			//send to LoRa WebSocket
			ws_send(message,device.devEUI);
			
		} else if (device.linkType==2)
		{
			oneNetWriteData(device.devEUI,device_id,url_list[2],0,url_list[3],url_list[4]);
		}
	    else
		{
			if (device.address!=null)
				{ 
			
				   client.send(message, 0, message.length, 5684, device.address, function(err, bytes) {
					   console.log("Send To"+device.address+" "+sendpayload);
					  }) ;
				 	  
				}
		}
		res.end("OK")
 })
})
// API - read Data From Device
app.get('/ReadData',function(req,res){
 
 var url_list=req.query.url.split("/");
 var device_id=url_list[1];
 
   Device.findOne({_id:device_id},'admin address linkType devEUI',function(error,device){
	    var sendpayload=Buffer("/"+url_list[2]+"/"+url_list[3]);
	    var  message     = generate({code:01,messageId: 1, payload: sendpayload });
		if (device.linkType==1)
		{
			ws_send(message,device.devEUI);
		}
		else if (device.linkType==2)
		{
			console.log("oneNetReadData");
			 oneNetReadData(device.admin,device.devEUI,url_list[1],url_list[2],0,url_list[3]);
			 res.end("OK");
		}
	else
	{ 
		if (device.address!=null)
		{ 		   	  		 
		   client.send(message, 0, message.length, 5684, device.address, function(err, bytes) {
			   console.log("Send To"+device.address+" "+sendpayload);
		      }) ;
		}
	}
 })
})
// API read History Data
app.get('/readHistory',function(req,res){
	var url_list=req.query.url.split("/");
   
	var device_id=url_list[1];
	var query_url="/"+url_list[2]+"/"+url_list[3]+"/";
	var vlist=new Array();
	 Device.findOne({_id:device_id},'data',function(error,device){
		  console.log(device.data);
	   if (device.data!=null)
	   { 
		device.data.forEach(function(d){
		   
			if (d.url==query_url) 
			{    
				vlist.push({timestamp:d.timestamp,value:d.value});
			}
		}) ;
	   // console.log(vlist);
		res.send(vlist);
	   }	 
	 });
	
   })
 // API add an device
app.post('/addDevice',function(req,res){
	var admin_id=mongoose.Types.ObjectId(req.body.admin);
	var link_Type=req.body.linkType;
	var dev_EUI=req.body.devEUI;
Device.findOne({name:req.body.name},'name',function(error,dev){
	if (!dev)
	{
	var device=new Device (
		{
			name:req.body.name,
			linkType:link_Type,
			devEUI:dev_EUI,
			address:null,
			admin: admin_id,
			profile:null,
			subscribe:null,
			status:0,
			data:null
		});
		device.save(function(err,d){
			 res.set('Content-Type', 'text/plain');
			 res.send("添加成功 ID="+d.id);
		});
	} else
		{
			res.set('Content-Type', 'text/plain');
			 res.send("该设备名已存在");
		}
})
	});
//API active an Device	  
app.get('/activeDevice',function(req,res){
	 console.log("Active Device"+req.query.id);
	var device_id=req.query.id;
	Device.findOne({_id:device_id},'address linkType devEUI',function(error,device){
		if (error)console.log("err active device");
	 
	 var payload=new Buffer("/1000/1002");
	 var  message     = generate({code:1,messageId: 2, payload: payload});
	 if (device.linkType==1)
		{  
	console.log("Actvie device devEUI="+devEUI);
			ws_send(message,device.devEUI);
		}else if (device.linkType==2)
		{
			//get oneNet object/resource list;
			  oneNetDiscovery(device_id,device.devEUI);
		 	 
			
		    
		}
		else{ 
			if (device.address!=null)
		{ 
	    console.log("active device address="+device.address)
		client.send(message, 0, message.length, 5684, device.address);
	   res.end("active...");
	    }
      
		  else
		{
			res.end("No IP Address");
			}
		}
	})
	Device.update({_id:device_id},{profile:null},function(err){
			if (err)
			debug("uploadchat err");
		});
})
// API get DEvice Objects
app.get('/getDeviceObject',function(req,res){
	 console.log("request device profile"+req.query.id);
	var device_id=req.query.id;
Device.findOne({_id:device_id},'name profile',function(error,device){
console.log("device profile"+device.profile);	
		if (device.profile==null)
		{ 
	     console.log("null device profile");
			
     	} else {			
		 res.set('Content-Type', 'text/json');
		res.send({deviceName:device.name,profile: device.profile });
		}
   })		
})
//API Delete An device
// API Add an new User
app.post('/addUser',function(req,res){
	 console.log(req.body.name);
	var admin_id=mongoose.Types.ObjectId(req.body.admin);
	User.findOne({name:req.body.name},'name',function(error,user){
		if (!user)
		{
		var user=new User (
			{
				name:req.body.name,
				password:req.body.password,
				admin: admin_id,
				status:0 
			});
		console.log(user);
		user.save(function(err,user){
			 res.set('Content-Type', 'text/plain');
			 res.send("添加成功 ID="+user.id);
		});
		} else
		{
			res.set('Content-Type', 'text/plain');
			 res.send("用户已存在！");
		}
	})

	 
	});
//API Delete a User

app.post('/login',function(req,res){
	// sess = req.session;
	 console.log(req.Session);
	User.findOne({name:req.body.username,password:req.body.password},'admin',function(error,user){
		if ((error)||(user==null)){
			res.status(400);
            res.send('用户未登入，或口令不符');   
		}
		else
		{
			console.log(user._id);console.log(user.admin);
			//  sess.username=req.body.userame;
		 	req.session.userInfo={name:req.body.username,id:user._id,admin:user.admin};
		//	req.session.userid=user._id;
			 res.set('Content-Type', 'application/json');
             res.send({userid:user._id,admin:user.admin});
		}
	})
})
app.get('/logout',function(req,res){
	console.log("user logout");
req.session.destroy(function(err) {
  if(err) {
    console.log(err);
  } else {
    res.redirect('/');
  }
});

});
// cmcc 是modular2Cloud 的URL(自行定义的) 用于token”的验证
app.get('/cmcc', function(req, res) {

    console.log("one Net Check");
	res.write(req.query.msg);
});
app.post('/cmcc', function(req, res) {
	var date = new Date( req.body.msg.at);
	var time = date.getFullYear() + "-" + (date.getMonth() < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1)) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + " " + date.toTimeString().substr(0, 8);
	console.log(req.body.msg);
 	if (req.body.msg.ds_id) {
		var dsid=(req.body.msg.ds_id).split("_");	
		var temp = req.body.msg.value;
		temp = temp.toFixed(2);
		Device.findOne({devEUI:req.body.msg.imei},'admin data',function(error,device){
			var topic="serverToClient_"+device.admin;
			var payload='/'+device._id+'/'+dsid[0]+'/'+dsid[2]+'/'+temp;
		publish(topic,payload);
		var data=device.data;
		if (data==null)
		{
			data={
				timestamp:time,
				value:payload,
			   };
		} else
			data.push({
				timestamp:time,
				value:payload,
			   });
			Device.update({_id:device._id},{data:data},function(err){
				if (err)
			   console.log("insert history data  err");
			})   
		});
	  	
	} 
	res.status(200).send('OK');
	
}); 
app.post('/test',function(req,res)
{  
 var topic="serverToClient_"+req.body.admin;
    var payload=req.body.url+10*Math.random();
	publish(topic,payload);
})

httpServer.listen(15686, function(){
 console.log('http Server on 15686');
});
server.on('message', function(data,rinfo) {
var src_addr=rinfo.address;
 var payload=parse(data).payload.toString();
 var url_list=payload.split("/");
  console.log(url_list);
  if ((url_list[2]=="1000")&&(url_list[3]=="1001"))
  {
	  console.log("HeartBeat");
	  Device.update({'_id':device_id},{address:src_addr},function(err){
			if (err)
			debug("uploadchat err");
		})
  } 
 if ((url_list[2]=="1000")&&(url_list[3]=="1002"))
 { 
var profile=url_list[4].toString();
device_profile=profile.replace(/'/g,"\"");
console.log(device_profile);
var device_id=url_list[1];
Device.update({'_id':device_id},{profile:device_profile,address:src_addr},function(err){
			if (err)
			debug("uploadchat err");
		})
}
else 
{ 
  var message = {
  topic: "/"+url_list[1]+"/"+url_list[2]+"/"+url_list[3],
  payload:url_list[4], // or a Buffer
  qos: 0, // 0, 1, or 2
  retain: false // or true
};
console.log(message.topic);
mqttserver.publish(message, function() {
 
});
   var sendpayload=new Buffer('OK');
  var  message     = generate({code:69,messageId: 1, payload: sendpayload });
 client.send(message, 0, message.length, 5684, "192.168.11.102", function(err, bytes) {
  }) ;
  //  如果是订阅的数据，要写入数据库
  var device_id="5a7c16a49a370a1e3477c1b6";//url_list[1];
  var dataurl="/"+url_list[3]+"/"+url_list[4]+"/";
  Device.findOne({_id:device_id},'data',function(error,c){
	//  console.log(c.data);
		var dlist=c.data;
		if(dlist==null)
		{  
			dlist={
			timestamp:Date.now(),
			url:dataurl,
			value:url_list[5],
		}
		} else			
		{   if (dlist.length>64)
			dlist.shift();
			dlist.push({
			timestamp:Date.now(),
			url:dataurl,
			value:url_list[5],
		});}
		
	//	console.log(dlist);
		Device.update({'_id':device_id},{data:dlist,address:src_addr},function(err){
			if (err)
			debug("uploadchat err");
		})
  });
}
    })
server.bind(port, function() {
  console.log("CoAP server on 5684");
})

mqttserver.on('ready', setup);
mqttserver.on('clientConnected', function(client) {
	console.log('client connected', client.id);		
});

// fired when a message is received
mqttserver.on('published', function(packet, client) {
  //console.log('Published:'+packet.payload.toString());
});
/*
  程序库
*/
function publish(topic,payload)
{
	var message = {
  topic: topic,
  payload:payload,
  qos: 0, // 0, 1, or 2
  retain: false // or true
};

mqttserver.publish(message, function() {
 console.log("publish:"+message.topic);
});
}
// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server On 15684')
}
// web socket send message to LoRa server 
function BinToHex(v)
{
	if (v<10) return v+0x30;
	return v-10+0x41;
}
function ws_send(Msgstr,devEUI)
{   console.log(Msgstr);
	var sendMsg="\\x";
	var p=0;
	for (i=0;i<Msgstr.length;i++)
	{ 
        
		sendMsg+=String.fromCharCode(BinToHex((Msgstr[i]&0xf0)>>4),BinToHex(Msgstr[i]&0x0f));
		 
	};
	 
	params = {"params":{
					"devEUI":devEUI,                   					
					"data":sendMsg,
					"userSec":sec,
					"type":0,
					"request_id":"12344aassa"
              }
            };
			console.log(JSON.stringify(params));
	ws.send(JSON.stringify(params));
}
function strtohex(str)
{   var ss=str.toString();
	var hex = '';
	for(var i=0;i<ss.length;i++) {
		hex += ''+ss.charCodeAt(i).toString(16);
	}
	return hex;
}

 function hex2str(hexx) {
  var hex = hexx.toString();//force conversion
   var str = '';
   for (var i = 2; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
   return str;

}
function  DateFormat(now)
 {
  
 year = "" + now.getFullYear();
  month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
  day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
  hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
  minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
  second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
  return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
   
  return(s);  
  
 } 
 function hextoBin(v)
 { 
	if ((v>=0x30)&&(v<0x3A)) return (v-0x30); 
   if ((v>=0x41)&&(v<0x47)) return v-0x41+10;	
   if ((v>=0x61)&&(v<0x69)) return v-0x61+10;	
   return 0x00;
 }
 function coapDecode(data)
 {
	 var payload=parse(data).payload.toString();
 var url_list=payload.split("/");
 console.log("payload="+payload);
  if ((url_list[2]=="1000")&&(url_list[3]=="1001"))
  {
	  console.log("HeartBeat");
	/*  Device.update({'_id':device_id},{status:2},function(err){
			if (err)
			debug("uploadchat err");
		}) */
  } else
  //register Object
 if ((url_list[2]=="1000")&&(url_list[3]=="1002"))
 { 
var profile=url_list[4].toString();

var device_profile=profile.replace(/'/g,"\"");
var oJson=JSON.parse(device_profile);
console.log(oJson);
var object={id:oJson.id,name:oJson.name,resource:null};
var device_id=url_list[1];

 Device.findOne({'_id':device_id},'profile',function(err,device){
			if (err)
			debug("uploadchat err");
		  if (device.profile==null){
			 var content={"objects":[object]};
			 console.log("object="+JSON.stringify(content));
			 Device.update({'_id':device_id},{profile:JSON.stringify(content)},function(err){
			if (err)
			debug("uploadchat err");
		   })
		  } else
		  { var flg=true;
			curr_profile= JSON.parse(device.profile); 
			curr_profile.objects.forEach(function(obj) {
				if (obj.id==object.id)
				{
					flg=false;
					obj.name=object.name;
				}
		  });
		  if (flg)
		  { 
        	  curr_profile.objects.push(object);
			 
		  }
		  console.log("current="+JSON.stringify(curr_profile));
		    Device.update({'_id':device_id},{profile:JSON.stringify(curr_profile)},function(err){
			if (err)
			debug("uploadchat err");
		   })
		  }
		}) ;
}else
//register resource
 if ((url_list[2]=="1000")&&(url_list[3]=="1003"))
 {  var objID=url_list[4];
	 var profile=url_list[5].toString();
	// var res=profile.replace(/'/g,"\"");
   //  var resource=JSON.parse(res);
   var reslist=profile.split(":");
   var resource=new Array();
    var objects=new Array();
   console.log(reslist);
     var device_id=url_list[1];	
      ipso.findOne({objectID:objID},'name resource',function(error, i) {
		//console.log(i);
		var objName=i.name;
	 //console.log("objName="+objName);
	        var ipso_res=JSON.parse(i.resource);
			//console.log(ipso_res);
			  reslist.forEach(function(r){
				  // fine resource Name
				  var resName=null;
				  ipso_res.forEach(function(ipso_r){
					  if (ipso_r.resID==r) resName=ipso_r.name;
				  });
				  if (resName==null) resName="noname";
				  //-----------------
				  //console.log("resName=",resName);
				  if (resource==null)resource=[{id:r,name:resName}];
				  else
				  resource.push({id:r,name:resName});
			  });
			  if (objects==null)objects=[{id:objID,name:"noname",resource:resource}];
			  else
			 objects.push({id:objID,name:objName,resource:resource});
		  Device.findOne({'_id':device_id},'profile',function(error,i){
			  var obj=new Array();
			if (i.profile!=null)
			{
			console.log("profile="+i.profile);
			var profile=JSON.parse(i.profile);
			obj=profile.objects;
			obj.push(objects[0]);
			
			}
			else obj=objects;
			console.log("objects="+JSON.stringify(obj));
			    Device.update({'_id':device_id},{profile:JSON.stringify({objects:obj})},function(err){
			if (err)
			debug("uploadchat err");
		});
		})
    
			});
	 }
else 
{ 
  var message = {
  topic: "/"+url_list[1]+"/"+url_list[2]+"/"+url_list[3],
  payload:url_list[4], // or a Buffer
  qos: 0, // 0, 1, or 2
  retain: false // or true
    };
console.log("publish"+JSON.stringify(message));
 mqttserver.publish(message, function() {
 
 });
 //  var sendpayload=new Buffer('OK');
//  var  message     = generate({code:69,messageId: 1, payload: sendpayload });
 //client.send(message, 0, message.length, 5684, "192.168.11.102", function(err, bytes) {
//  }) ;
  //  如果是订阅的数据，要写入数据库
  var device_id=url_list[1];
  var dataurl="/"+url_list[2]+"/"+url_list[3]+"/";
   Device.findOne({'_id':device_id},'data',function(error,c){
	//  console.log(c.data);
		var dlist=c.data;
		if(dlist==null)
		{  
			dlist={
			timestamp:Date.now(),
			url:dataurl,
			value:url_list[4],
		}
		} else			
		{   if (dlist.length>64)
			dlist.shift();
			dlist.push({
			timestamp:Date.now(),
			url:dataurl,
			value:url_list[4],
		});}
		
	  	//console.log(dlist);
	 	Device.update({'_id':device_id},{data:dlist},function(err){
	 		if (err)
	 		debug("uploadchat err");
	 	})
  }); 
}
 }
 function createMd5(message) {
    var crypto = require("crypto");
    var md5 = crypto.createHash("md5");        
    return md5.update(message).digest('hex');
}
function oneNetDiscovery(device_id,devEUI)
{   var objects=new Array();
	const options0 = {
  hostname: 'api.heclouds.com',
  port: 80,
  path: '/nbiot/resources?imei='+devEUI,
  method: 'GET',
  headers: {
    
	'api-key':'0yqRK6CxkvVAubxbRnEv0VdAMIE='
}};
var req0 = http.request(options0, (res) => {
  console.log('statusCode:', res.statusCode);
  //console.log('headers:', res.headers);

  res.on('data', (d) => {

	if (JSON.parse(d).errno==0){
		var m=JSON.parse(d);
		console.log(m.data.item);
		var objlist=m.data.item;
		objlist.forEach(function(obj){
			var reslist=obj.instances[0].resources;
			var resource=new Array();
			console.log("to Find"+obj.obj_id);
	ipso.findOne({objectID:obj.obj_id},'name resource',function(error, i) {
		//console.log(i);
		var objName="NoName";
	     if (!error) objName=i.name;
		 console.log("objName="+objName);
	        var ipso_res=JSON.parse(i.resource);
			//console.log(ipso_res);
			  reslist.forEach(function(r){
				  // fine resource Name
				  var resName=null;
				  ipso_res.forEach(function(ipso_r){
					  if (ipso_r.resID==r) resName=ipso_r.name;
				  });
				  if (resName==null) resName="noname";
				  //-----------------
				  console.log("resName=",resName);
				  if (resource==null)resource=[{id:r,name:resName}];
				  else
				  resource.push({id:r,name:resName});
			  });
			  if (objects==null)objects=[{id:obj.obj_id,name:"noname",resource:resource}];
			  else
			 objects.push({id:obj.obj_id,name:objName,resource:resource});
		
        Device.findOne({'_id':device_id},'profile',function(error,i){
			  var obj=new Array();
			if (i.profile!=null)
			{
			console.log("profile="+i.profile);
			var profile=JSON.parse(i.profile);
			obj=profile.objects;
			obj.push(objects[0]);
			
			}
			else obj=objects;
			console.log("objects="+JSON.stringify(obj));
			    Device.update({'_id':device_id},{profile:JSON.stringify({objects:obj})},function(err){
			if (err)
			debug("uploadchat err");
		});
		})
		
	  });
    });	  
	};
  });
});
 req0.end();

}
function oneNetReadData(admin,devEUI,dev_id,obj_id,ins_id,res_id)
{
	var temp='/nbiot?imei='+devEUI+'&obj_inst_id='+ins_id+'&obj_id='+obj_id+'&res_id='+res_id;
   
    
const options5 = {
  hostname: 'api.heclouds.com',
  port: 80,
  path: temp,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
	'api-key':'0yqRK6CxkvVAubxbRnEv0VdAMIE='
}};

var req5 = http.request(options5, (res) => {
  console.log('statusCode:', res.statusCode);
  //console.log('headers:', res.headers);

  res.on('data', (d) => {
	//process.stdout.write(d);
	var t =JSON.parse(d);
	if (t.errno==0) {
		console.log(JSON.stringify(t.data));
		var temp=t.data[0].res[0].res_inst[0].val;
		
  var message = {
  topic: "serverToClient_"+admin,
  payload:"/"+dev_id+"/"+obj_id+"/"+res_id+'/'+temp.toString(),  
  qos: 0, // 0, 1, or 2
  retain: false // or true
};
console.log(message);
 mqttserver.publish(message, function() {
 
 }); 
		}
	else console.log(t);
 
});
});
req5.end();
}
function oneNetWriteData(devEUI,dev_id,obj_id,ins_id,res_id,value)
{
	var temp='/nbiot?imei='+devEUI+'&obj_inst_id='+ins_id+'&obj_id='+obj_id+'&mode=2';
	
	var Body={
    "data":[{
    "val": Number(value),
    "res_id":res_id
  }]

};
	const options6 = {
	  hostname: 'api.heclouds.com',
	  port: 80,
	  path: temp,
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'api-key':'0yqRK6CxkvVAubxbRnEv0VdAMIE='
	}};

	var req6 = http.request(options6, (res) => {
	  console.log('statusCode:', res.statusCode);
		 res.on('data', (d) => {
			var t =JSON.parse(d);
			console.log(t);
		 
		});
	});
	req6.on('error', (e) => {
	  console.error(e);
	  
	});
	console.log(temp);
	console.log(JSON.stringify(Body));
	req6.write(JSON.stringify(Body)); 
	req6.end();
};
function oneNetObserve(devEUI,dev_id,obj_id,ins_id,res_id,value)
{
	
	var temp='/nbiot?imei='+devEUI+'&obj_inst_id='+ins_id+'&obj_id='+obj_id+'&mode=2';
	
	var Body={
    "data":[{
    "obs": Number(value),
    "res_id":res_id
  }]

};
	const options6 = {
	  hostname: 'api.heclouds.com',
	  port: 80,
	  path: temp,
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'api-key':'0yqRK6CxkvVAubxbRnEv0VdAMIE='
	}};

	var req6 = http.request(options6, (res) => {
	  console.log('statusCode:', res.statusCode);
		 res.on('data', (d) => {
			var t =JSON.parse(d);
			console.log(t);
		 
		});
	});
	req6.on('error', (e) => {
	  console.error(e);
	  
	});
	console.log(temp);
	console.log(JSON.stringify(Body));
	req6.write(JSON.stringify(Body)); 
	req6.end();
}