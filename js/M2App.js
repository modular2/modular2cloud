var modular2App=angular.module('modular2App',['ui.router','angularModalService','modular2.controllers'])
.config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
 //$urlRouterProvider.when("", "/app");
$urlRouterProvider.otherwise('/home');	 
	  $stateProvider.state('app', {
        url: '/home',
		templateUrl: '/views/start.html',
        controller:'appCtrl'
    })
		.state('login', {
        url: '/login',
		templateUrl: '/views/login.html',
          controller:'loginCtrl'
    })
	.state('dashboard', {
        url: '/dashboard',
			templateUrl: '/views/dashboard.html',
          controller:'dashboardCtrl'
    })
	.state('logout', {
        url: '/logout',
		templateUrl: '/views/start.html',
          controller:'logoutCtrl'
    })
		.state('sign-in', {
        url: '/sign-in',
		templateUrl: '/views/signin.html',
          controller:'signCtrl'
    })
    .state('about', {
        url: '/about',
		templateUrl: '/views/about.html',
    })	
		.state('board', {
        url: '/board',
		 templateUrl: '/views/boards.html',
           
    })
		.state('platform', {
        url: '/platform',
		 templateUrl: '/views/platform.html',
           
    })
	.state('doc_datamanagment', {
        url: '/doc_datamanagment',
		 templateUrl: '/views/doc_datamanagment.html',
           
    })
	.state('docs', {
        url: '/docs',
		 templateUrl: '/views/document.html',
          controller:'docsCtrl'
    })	
	.state('docs_ipso', {
        url: '/docs_ipso',
		 templateUrl: '/views/docs_ipso.html',
          controller:'docs_ipsoCtrl'
    })
	.state('docs_lwm2m', {
        url: '/docs_lwm2m',
		 templateUrl: '/views/docs_lwm2m.html',
        
    })		
   .state('historyData', {
        url: '/historyData',
        templateUrl: '/views/historyData.html',
          controller:'historyDataCtrl'
    })	
	.state('devicecontrol', {
		url:'/devicecontrol',
        templateUrl: '/views/devicemanage.html',
          controller:'devicecontrolCtrl'
    })
	.state('devicelist', {
		url:'/devicelist',
        templateUrl: '/views/devicelist.html',
          controller:'devicelistCtrl'
    })
	.state('userlist', {
		url:'/userlist',
        templateUrl: '/views/userlist.html',
          controller:'userlistCtrl'
    })
	.state('newdevice', {
		url:'/newdevice',
        templateUrl: '/views/newdevice.html',
          controller:'newdeviceCtrl'
    })
		.state('newuser', {
		url:'/newuser',
        templateUrl: '/views/newuser.html',
          controller:'newuserCtrl'
    })
			.state('Chat', {
		url:'/userChat',
        templateUrl: '/views/userChat.html',
          controller:'userChatCtrl'
    })
	}]);

modular2App.factory('client', function ($rootScope) {
    var  client  = mqtt.connect({ port: 15681, host: '127.0.0.1', keepalive: 10000});
    return {
        onConnect: function ( callback) {
			client.on('connect',function(){
				var args = arguments;
				$rootScope.$apply(function () {				
                    callback.apply(client, args);
                });
			});
        },
		onMessage:function (callback) {		
			client.on('message',function(){
				var args = arguments;
				$rootScope.$apply(function () {				
                    callback.apply(client, args);
                });
			});
		},
        publish: function (eventName, data, callback) {
            client.publish(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(client, args);
                    }
                });
            })
        },
		subscribe: function (eventName,callback) {
            client.subscribe(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(client, args);
                    }
                });
            })
        },
		unsubscribe: function (eventName,callback) {
            client.unsubscribe(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(client, args);
                    }
                });
            })
        }
    };
});	
modular2App.service('userInfo', function () {
        this.get=function() {
             return 	window.JSON.parse(window.localStorage.getItem('userInfo'));
		 //  return window.JSON.parse(window.sessionStorage['userInfo']);
        };
        this.put=function(info) {
		  //  window.sessionStorage['userInfo']=window.JSON.stringify(info)
            window.localStorage.setItem('userInfo', window.JSON.stringify(info));
        }
 
})
angular.module('modular2.controllers', [])
.controller('appCtrl', function($state,$rootScope,$scope) {

})
.controller('loginCtrl', function($state,$scope,userInfo,$http) {
	console.log("login hello");
$scope.title="欢迎登入";
$scope.login=function(){
		  var formdata={
		  username:$scope.username,
		  password:$scope.password,
	     } ;
			 $http({ 
            method: 'post',
            url: '/login',
            data:  formdata,
            headers: {'Content-Type': 'application/json'},         
        }).
        success(function(response) {
       		console.log(response);
        userInfo.put({
		name:$scope.username,
		id:response.userid,
		admin:response.admin
	    });
		
         $state.go("dashboard");    
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
         $scope.title="出错！"+response;
        });
}
})
.controller('logoutCtrl', function($state,$scope,$http,userInfo,client) {
	 userInfo.put({username:'',id:null,admin:''});
	  $http({ 
            method: 'get',
            url: '/logout',
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        })
})
.controller('dashboardCtrl', function($state,$scope,$http,userInfo,client) {
var Info=userInfo.get();
var sublist=new Array();
   $http({ 
            method: 'get',
            url: '/dashboardInfo/?id='+Info.admin,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) {
            console.log(response);      		
            $scope.device_num = response.device_num;
            $scope.user_num=response.user_num;
			$scope.sub_num=response.sub_num;
			 
			if (response.subscribe!=null)
			{
			//	sublist.forEach(function(s){
				
			//	client.subscribe("/"+s.device_id+s.URL,function(){
		    //       console.log("subscribe =>"+"/"+s.device_id+s.URL);
	        // });			 			 
			$scope.sublist=response.subscribe;
			}
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback       
        });
 //  client.subscribe('/5a7c16a49a370a1e3477c1b6/3304/5700',function(){
//		   console.log("subscribe it");
//	  });		
client.onMessage(function (topic, message) {
  var resources;
  
  var url_list=topic.split("/");
   var value=message.toString();
  sublist.forEach(function(s){
	//  console.log("/"+url_list[1]+"/"+url_list[2]+"/"+url_list[3]);
	  if ((s.device_id==url_list[1])&&(s.URL=="/"+url_list[2]+"/"+url_list[3])) s.value=value;
  })
 $scope.sublist=sublist;
 
}) 
client.onConnect(function () {
 console.log("mqtt connected");
});  
})
.controller('docsCtrl', function($state,$scope,$http,userInfo) {
	console.log("docs");
})
.controller('docs_ipsoCtrl', function($state,$scope,$http,userInfo) {
	 $http({ 
            method: 'get',
            url: '/ipsoInfo',
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) {
			console.log(response);
			var ipsolist=response;	
			ipsolist.forEach(function(i){
				i.resource=JSON.parse(i.resource)				
	         });
             $scope.ipsolist=ipsolist;			 
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback       
        });
})
.controller('historyDataCtrl', function($state,$scope,$http,userInfo) {
var	chart = new Highcharts.chart('container', {
                    title: {
						text: 'temperature'
						}, 
				    xAxis: {
				        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
				    },

				    series: [{
						name: 'temperature',
				        data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
				    }]
				});
			
	var Info=userInfo.get();
var history_data=[{timestamp:Date.now(),value:3.12},{timestamp:Date.now(),value:6.54},{timestamp:Date.now(),value:13.12}];
var devlist=[];
	var devicelist;
	var objlist=[];
	var reslist=[];
	var curr_device,curr_object,curr_resource;
	var device;
	var device_profile;
	$http({ 
            method: 'get',
            url: '/getListOfDevice/?id='+Info.id,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) {      		
            devicelist = response;
             devicelist.forEach(function(e){
				devlist.push({id:e._id,name:e.name});
			})
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
       
        });
	$scope.devlist=devlist;
	$scope.device_id="未选择";
	$scope.obj_name="未选择";
	$scope.res_name="未选择";
$scope.selDevice=function(name){
	for (var dev in devlist)
	{
		if (devlist[dev].name==name)
		{
			curr_device=devlist[dev].id;
			
	     }
	}
          $http({ 
            method: 'get',
            url: '/getDeviceObject/?id='+curr_device,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) { 

        device=response;
        device_profile=JSON.parse(device.profile); 		
        $scope.device_id=curr_device;		
		var objects=device_profile.objects;
	     objlist=[];
		for (var obj in objects)
		 objlist.push({id:objects[obj].id,name:objects[obj].name});
		$scope.objlist=objlist;
		console.log(objlist);
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
       
        });	
}
$scope.selObject=function(id){
	var resources;
	curr_object=id;
for (var obj in objlist)
  if (objlist[obj].id==id)
   $scope.obj_name=objlist[obj].name;
 var objects=device_profile.objects;
    for (var obj in objects)
	{ 
        if (objects[obj].id==id)
		{    
			 resources=objects[obj].resource;
		}
	}
	reslist=[];
	for (var res in resources)
	{
		reslist.push({id:resources[res].id,name:resources[res].name,type:resources[res].type,value:0,subscrible:true});
	}
	console.log(reslist);
$scope.reslist=reslist;
}
$scope.selResource=function(id){
	 curr_resource=id;
	for(var res in reslist)
		if (reslist[res].id==id)
	{
		
	$scope.res_name=reslist[res].name;
	$scope.res_type=reslist[res].type;
	 
	$scope.res_value=reslist[res].value;
	$scope.res_subscrible=reslist[res].subscrible;	
	chart.setTitle({text: reslist[res].name});
	chart.xAxis[0].setTitle({ text: "Bananas" });
		
	}
		
}
$scope.gethistory=function(){
	var dataurl="/"+curr_device+"/"+curr_object+"/"+curr_resource;
	console.log(dataurl);
	  $http({ 
            method: 'get',
            url: '/readHistory/?url='+dataurl,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) { 
	$scope.datalist=response;
	 var vlist=new Array();
	response.forEach(function(r){
		vlist.push(parseFloat(r.value));
	});
	   console.log(vlist);
	  chart.series[0].setData(vlist);
	 
	  
		}).
		error(function(response) {
		console.log("error"); // Getting Error Response in Callback
       
        });	
}

})

.controller('newuserCtrl', function($state,$scope,$http,userInfo) {
	var Info=userInfo.get();
	$scope.title="添加成员";
	 $scope.submit=function(){
		  var formdata={
		  name:$scope.username,
		  password:$scope.password,
		  admin:Info.id,
	     } ;
		 
			 $http({ 
            method: 'post',
            url: '/addUser',
            data:  formdata,
            headers: {'Content-Type': 'application/json'},         
        }).
        success(function(response) {
       		console.log(response);
            $scope.title =response;
             
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
       
        }); 
	 }
   $scope.back=function(){
	   $state.go("userlist");
   }	 
})
.controller('newdeviceCtrl', function($state,$scope,$http,userInfo) {
	 
	var Info=userInfo.get();

	$scope.title="添加设备";
	$scope.linkTypes=[
		"CoAP" ,
		"LoRa" ,
		"oneNet" ,
		"MQTT" ,
		"Pelion" 
	];

	 
	 $scope.submit=function(){
		 var deviceName= $scope.devicename;
		 var devEUI=$scope.devEUI;
		 if (deviceName==null)
		 {
			 alert("invaliddevice name");
	     } else  
		 { 
	 if (devEUI==null)
		 devEUI=0;
	 	var typeIndex=0;	
	    for (var i=0;i<5;i++)
		    if ($scope.linkType[i]==$scope.linkType)
			     typeIndex=i;
		  var formdata={
		  name:$scope.devicename,
		  admin:Info.id,
		  linkType:typeIndex,
		  devEUI:devEUI
	     } ;
			 $http({ 
            method: 'post',
            url: '/addDevice',
            data:  formdata,
            headers: {'Content-Type': 'application/json'},         
        }).
        success(function(response) {
       		console.log(response);
            $scope.title = response;
             
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
       
        }); 
	 }
	 }
	 $scope.back=function(){
	   $state.go("devicelist");
   } 
})
.controller('userlistCtrl', function($state,$scope,$http,userInfo) {
	var isAdmin=false;
	var Info=userInfo.get();
	 if (Info.id==Info.admin)
	isAdmin=true;
    $scope.isValid=isAdmin;
	 $http({ 
            method: 'get',
            url: '/getListOfUser/?id='+Info.admin,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) {
       		console.log(response);
            $scope.userlist = response;
             
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
      
        });

$scope.deluser=function(id){
	 
	$http({ 
            method: 'get',
            url: '/deldevice/?id='+id,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) {     	             
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback      
        });
    }

})
.controller('devicelistCtrl', function($state,$scope,$http,userInfo) {
	var isAdmin=false;
	var Info=userInfo.get();
	 if (Info.id==Info.admin)
	isAdmin=true;
    $scope.isValid=isAdmin;
	var linkType=['CoAP','LoRa','oneNet','MQTT','Pelion'];
	var deviceStatus=['未激活','激活'];
	 
	 $http({ 
            method: 'get',
            url: '/getListOfDevice/?id='+Info.admin,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) {
         response.forEach(function(r)
		 {
			 r.linkType=linkType[ r.linkType];
			 r.status=deviceStatus[r.status];
		 });		 
            $scope.devicelist =response;            
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
       
        });

$scope.deldevice=function(id){
	$http({ 
            method: 'get',
            url: '/deldevice/?id='+id,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) {     	             
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback      
        });
}
$scope.ActiveDevice=function(id)
{
 console.log("request device profile id="+id);
	$http({ 
            method: 'get',
            url: '/ActiveDevice/?id='+id,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) { 
            $scope.device_status=response;			       	 
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
       
        });				
}
})

.controller('userChatCtrl', function($state,$scope,$http,ModalService,client,userInfo) {
	
})
.controller('devicecontrolCtrl', function($state,$scope,$http,ModalService,client,userInfo) {
	var isAdmin=false;
	var selected=false;
var Info=userInfo.get();
if (Info.id==Info.admin)
	isAdmin=true;
	
	var devlist=[];
	var devicelist;
	var objlist=[];
	var reslist=[];
	var datalist=[];//new  Array(24);
	var curr_device,curr_object,curr_resource;
	var DeviceName,ObjectName,ResourceName;
	var device;
	var device_profile;
	
	$http({ 
            method: 'get',
            url: '/getListOfDevice/?id='+Info.admin,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) {      		
            devicelist = response;
			console.log(devicelist);
             devicelist.forEach(function(e){
				devlist.push({id:e._id,name:e.name});
			})
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
       
        });
	$scope.isValid=isAdmin;	
	$scope.devlist=devlist;
    $scope.device_id="未选择";
	$scope.obj_name="未选择";
	$scope.res_name="未选择";
	for (i=0;i<24;i++)
		datalist[i]=0;
	var	chart2 = new Highcharts.chart('container', {
					credits:{
    			 enabled: false // 禁用版权信息
		},
                    title: {
						text: 'temperature'
						}, 
				  

				    series: [{
						name: "",
    showInLegend: false,
				        data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
				    }]
				});
$scope.selDevice=function(name){
	for (var dev in devlist)
	{
		if (devlist[dev].name==name)
		{
			curr_device=devlist[dev].id;
			
	     }
	}
		   
          $http({ 
            method: 'get',
            url: '/getDeviceObject/?id='+ curr_device,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }).
        success(function(response) { 

            device =response;
			device_profile=JSON.parse(device.profile);;
				console.log(device_profile);	
        $scope.device_id=curr_device; 
        DeviceName=device.deviceName; 	
        $scope.device_status="OK";        
		var objects=device_profile.objects;
		console.log(objects);
	     objlist=[];
		for (var obj in objects)
		 objlist.push({id:objects[obj].id,name:objects[obj].name});
		$scope.objlist=objlist;
	    console.log(objlist);
        }).
        error(function(response) {
		console.log("error"); // Getting Error Response in Callback
       
        });				  
	}
$scope.selObject=function(id){
	var resources;
	curr_object=id;
for (var obj in objlist)
  if (objlist[obj].id==id)
   $scope.obj_name=objlist[obj].name;
   ObjectName=objlist[obj].name;
 var objects=device_profile.objects;
    for (var obj in objects)
	{ 
        if (objects[obj].id==id)
		{    
			 resources=objects[obj].resource;
		}
	}
	reslist=[];
	for (var res in resources)
	{
		reslist.push({id:resources[res].id,name:resources[res].name,type:"None",value:0,subscrible:true});
	}
	console.log(reslist);
$scope.reslist=reslist;
}	
$scope.selResource=function(id){
	 curr_resource=id;
	for(var res in reslist)
		if (reslist[res].id==id)
	{
		
	$scope.res_name=reslist[res].name;
	ResourceName=reslist[res].name;
	$scope.res_type=reslist[res].type;	 
	$scope.res_value=reslist[res].value;
	$scope.res_subscrible=reslist[res].subscrible;
	selected=true;
	}
}		 

 
$scope.unSubscribe=function()
{
	
 if (selected)
	{  
       console.log("unSubscript");
			var uri="/"+curr_device+"/"+curr_object+"/"+curr_resource;
				 $http({ 
					 method: 'put',
                  url: '/subscribe/?url='+uri+"&obs="+0,
                  data:  null,
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'},            
				}) 
				$scope.device_status="取消订阅";	
			   client.unsubscribe("/"+curr_device+uri,function(){
						   console.log("subscribe =>"+"/"+curr_device+uri);
				});
	}
}
$scope.Subscribe=function()
{
	
 if (selected)
 {
	 console.log("subscript");
 var uri="/"+curr_device+"/"+curr_object+"/"+curr_resource;
	 $http({ 
            method: 'put',
            url: '/subscribe/?url='+uri+"&obs="+1,
            data:  null,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
        }) 
	$scope.device_status="已订阅";	
 }
}
$scope.readData=function()
{ 
 	if (selected)
	{
		 var uri="/"+curr_device+"/"+curr_object+"/"+curr_resource;
				  $http({ 
					method: 'get',
					url: '/readData/?url='+uri,
					data:  null,
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
				})
			// 订阅该数据
			  var uri="/"+curr_device+"/"+curr_object+"/"+curr_resource;
			 client.subscribe(uri,function(){
				console.log("subscribe ="+uri);
			 });
	}
}
$scope.writeData=function()
{
	   if (selected&&isAdmin)
	   { 
          angular.element('#writeData').css('display', 'block');
		
       }
}
$scope.submitData=function()
{
	var result=$scope.result;
	console.log("write Data"+result);
	 var uri="/"+curr_device+"/"+curr_object+"/"+curr_resource+"/";
		  $http({ 
				method: 'put',
				url: '/writeData/?url='+uri+result,
				data:  null,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},         
			}).
			success(function(response) { 
				$scope.res_value=result;
				$scope.device_status=response;	
               angular.element('#writeData').css('display', 'none');				
			})
}
$scope.quit=function()
{
	angular.element('#writeData').css('display', 'none');
}
$scope.test=function()
{
	 var url="/"+curr_device+"/"+curr_object+"/"+curr_resource+"/";
	 console.log({url:url,admin:Info.admin});
	 $http({ 
				method: 'post',
				url: '/test',
				data:  {url:url,admin:Info.admin},
				headers: {'Content-Type': 'application/json'},         
			});
}
 var topic="serverToClient_"+Info.admin;
  client.subscribe( topic,function(){
						   console.log("subscribe =>"+topic);
				});
client.onMessage(function (topic, message) {
	console.log("message:"+message);
	var url=message.toString();
 	var url_list=url.split('/');
	console.log(url_list);
	if ((curr_device==url_list[1])&&(curr_object==url_list[2])&&(curr_resource==url_list[3]))
	{   var value=url_list[4];
         console.log("value"+value);
		$scope.res_value=value.toString();
		//if (typeof value =="number")
	 	{datalist.shift();
	 	datalist.push(parseFloat(value));
		
		chart2.setTitle({text:ResourceName});
	    chart2.series[0].setData(datalist,true, false, false);
		}	   
       // console.log(datalist);   
	  }	
  
});

//client.onConnect(function () {
// console.log("mqtt connected");
//});
}) 