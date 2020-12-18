/*
*--------------------------------------------------------------------
* Kintone-Plugin "chatworkpush"
* Version: 1.0
* Copyright (c) 2016 TIS
*
* Released under the MIT License.
* http://tis2010.jp/license.txt
* -------------------------------------------------------------------
*/
jTis.noConflict();
(function($,PLUGIN_ID){
	"use strict";
	/*---------------------------------------------------------------
	 valiable
	---------------------------------------------------------------*/
	var vars={
		appname:'',
		redirect:'',
		refreshtoken:'',
		ismobile:false,
		form:null,
		config:{},
		fieldinfos:{},
		rooms:[]
	};
	var events={
		insert:[
			'app.record.create.submit.success',
			'mobile.app.record.create.submit.success'
		],
		update:[
			'app.record.index.edit.submit.success',
			'app.record.edit.submit.success',
			'mobile.app.record.edit.submit.success'
		],
		delete:[
			'app.record.index.delete.submit',
			'app.record.detail.delete.submit',
			'mobile.app.record.detail.delete.submit'
		],
		process:[
			'app.record.detail.process.proceed',
			'mobile.app.record.detail.process.proceed'
		],
		show:[
			'app.record.index.show',
			'app.record.create.show',
			'app.record.detail.show',
			'app.record.edit.show',
			'mobile.app.record.index.show',
			'mobile.app.record.create.show',
			'mobile.app.record.detail.show',
			'mobile.app.record.edit.show'
		]
	};
	var functions={
		/* authorize */
		authorize:function(callback){
			/* get access token */
			if (!sessionStorage.getItem('accesstoken'))
			{
				var regex=new RegExp("code=([^&#]*)");
				var results=regex.exec(window.location.href);
				if (results!=null) functions.token(results[1],null,callback);
				else
				{
					/* setup session storage */
					sessionStorage.setItem('redirect',window.location.href);
					/* redirect authorize url */
					var authurl='https://www.chatwork.com/packages/oauth2/login.php?response_type=code';
					authurl+='&client_id='+vars.config['client_id'];
					authurl+='&scope=rooms.all:read_write%20contacts.all:read%20users.profile.me:read';
					authurl+='&redirect_uri='+encodeURIComponent(vars.redirect);
					window.location.href=authurl;
				}
			}
			else callback();
		},
		/* convert base64 */
		base64:function(value,callback){
			var blob=new Blob([value]);
			var reader=new FileReader();
			reader.onload=function(event){callback(event.target.result.replace(/^.+,/,''))};
			reader.readAsDataURL(blob);
		},
		/* array join */
		join:function(param){
			return Object.keys(param).map((key) => {
				return key+'='+param[key];
			}).join('&');
    	},
		/* load members */
		members:function(room_id,callback){
			var accesstoken=sessionStorage.getItem('accesstoken');
			if (accesstoken)
			{
				kintone.proxy(
					'https://api.chatwork.com/v2/rooms/'+room_id+'/members',
					'GET',
					{
						'Authorization':'Bearer '+accesstoken
					},
					{},
					function(body,status,headers){
						var json=JSON.parse(body);
						var refresh=false;
						$.each(headers,function(key,values){
							if (key.match(/WWW-Authenticate/g))
								if (values.match(/The access token expired/g)) refresh=true;
						});
						if (refresh)
						{
							functions.token(null,sessionStorage.getItem('refreshtoken'),function(){
								functions.members(room_id,callback);
							});
						}
						else
						{
							if (status==200) callback(json);
							else swalTis('Error!',json.errors[0],'error');
						}
					},
					function(error){swalTis('Error!','ChatWorkへの接続に失敗しました。','error');}
				);
			}
		},
		/* create message */
		messagecreate:function(headers,footers,record,fields){
			var res='';
			if (headers.length>0) res+=headers.join('\n');
			if (fields.length>0)
			{
				for (var i=0;i<fields.length;i++)
				{
					if (fields[i] in vars.fieldinfos)
					{
						res+='[info]';
						res+='[title]'+vars.fieldinfos[fields[i]].label+'[/title]';
						res+=(function(fieldinfo,value){
							var res='';
							var unit=(fieldinfo.unit!=null)?fieldinfo.unit:'';
							var unitPosition=(fieldinfo.unitPosition!=null)?fieldinfo.unitPosition.toUpperCase():'BEFORE';
							if (value)
								switch (fieldinfo.type.toUpperCase())
								{
									case 'CALC':
										switch(fieldinfo.format.toUpperCase())
										{
											case 'DATETIME':
												res=new Date(value.dateformat()).format('Y-m-d H:i');
												break;
											case 'NUMBER_DIGIT':
												res=parseFloat(value).format();
												break;
											default:
												res=value;
												break;
										}
										if (unitPosition=='BEFORE') res=unit+res;
										else res=res+unit;
										break;
									case 'CATEGORY':
									case 'CHECK_BOX':
									case 'MULTI_SELECT':
										if (value.length!=0) res=value.join(',');
										break;
									case 'CREATOR':
									case 'MODIFIER':
										res=value.name;
										break;
									case 'CREATED_TIME':
									case 'DATETIME':
									case 'UPDATED_TIME':
										res=new Date(value.dateformat()).format('Y-m-d H:i');
										break;
									case 'NUMBER':
										if (fieldinfo.digit) res=parseFloat(value).format();
										else res=value;
										if (unitPosition=='BEFORE') res=unit+res;
										else res=res+unit;
										break;
									case 'GROUP_SELECT':
									case 'ORGANIZATION_SELECT':
									case 'STATUS_ASSIGNEE':
									case 'USER_SELECT':
										res=[];
										for (var i2=0;i2<value.length;i2++) res.push(value[i2].name);
										res=res.join(',');
										break;
									default:
										res=value;
										break;
								}
							return res;
						})(vars.fieldinfos[fields[i]],record[fields[i]].value);
						res+='[/info]';
					}
				}
			}
			else res+='\n';
			if (footers.length>0) res+=footers.join('\n');
			return res;
		},
		/* push message */
		messagepush:function(room_id,message,success,fail){
			var accesstoken=sessionStorage.getItem('accesstoken');
			if (accesstoken)
			{
				kintone.proxy(
					'https://api.chatwork.com/v2/rooms/'+room_id+'/messages',
					'POST',
					{
						'Authorization':'Bearer '+accesstoken,
						'Content-Type':'application/x-www-form-urlencoded'
					},
					functions.join({
						'body':encodeURIComponent(message)
					}),
					function(body,status,headers){
						var json=JSON.parse(body);
						var refresh=false;
						$.each(headers,function(key,values){
							if (key.match(/WWW-Authenticate/g))
								if (values.match(/The access token expired/g)) refresh=true;
						});
						if (refresh)
						{
							functions.token(null,sessionStorage.getItem('refreshtoken'),function(){
								functions.messagepush(room_id,message,success,fail);
							});
						}
						else
						{
							if (json.message_id) success(json.message_id);
							else
							{
								swalTis({
									title:'Error!',
									text:json.errors[0],
									icon:'error'
								}).then(function(isConfirm){fail();});
							}
						}
					},
					function(error){
						fail();
					}
				);
			}
			else fail();
		},
		/* pickup menbers */
		pickupmenbers:function(room_id,room_name,success,fail){
			var fields=[];
			fields.push({
				code:'rooms',
				label:'チャットルーム',
				type:'SINGLE_LINE_TEXT'
			});
			fields.push({
				code:'members',
				label:'担当メンバー',
				type:'CHECK_BOX',
				options:{'dummy':{label:'dummy',index:0}}
			});
			fields.push({
				code:'membersall',
				label:'',
				type:'CHECK_BOX',
				options:{'all':{label:'すべてのメンバーに通知',index:0}}
			});
			vars.form=$('body').fieldsform({fields:fields});
			functions.members(room_id,function(records){
				var rooms=$('#rooms .receiver',vars.form.contents).prop('disabled',true).val(room_name);
				var memberscontainer=$('#members .receiver',vars.form.contents).closest('.container');
				var membersreceiver=$('#members .receiver',vars.form.contents).closest('label').clone(true);
				var membersallcontainer=$('#membersall .receiver',vars.form.contents).closest('.container');
				var membersallreceiver=$('#membersall .receiver',vars.form.contents).closest('label');
				$('#members label:not(.title)',vars.form.contents).remove();
				for (var i=0;i<records.length;i++)
				{
					var receiver=membersreceiver.clone(true);
					$('.label',receiver).html(records[i].name);
					$('.receiver',receiver).attr('id',records[i].account_id).val(records[i].account_id).prop('checked',false).on('change',function(){
						if (!$(this).prop('checked')) $('.receiver',membersallreceiver).prop('checked',false);
					});
					memberscontainer.append(receiver);
				}
				$('.title',membersallcontainer).hide();
				$('.receiver',membersallreceiver).on('change',function(){
					if ($(this).prop('checked'))
						$.each(memberscontainer.find('.receiver'),function(){
							$(this).prop('checked',true);
						});
				});
				vars.form.dialog.container.css({'height':(vars.form.dialog.contents[0].scrollHeight+45).toString()+'px'});
				vars.form.show({
					buttons:{
						ok:function(){
							var members='';
							/* close form */
							vars.form.hide();
							$.each(memberscontainer.find('.receiver:checked'),function(){
								members+='[To:'+$(this).val()+'] '+$('.label',$(this).closest('label')).text()+'さん\n';
							});
							success(members);
						},
						cancel:function(){
							/* close form */
							vars.form.hide();
							fail();
						}
					}
				});
			});
		},
		/* get access token */
		token:function(code,refreshtoken,callback){
			var body='';
			if (refreshtoken)
			{
				body=functions.join({
					'grant_type':'refresh_token',
					'refresh_token':refreshtoken
				});
			}
			else
			{
				body=functions.join({
					'grant_type':'authorization_code',
					'code':code,
					'redirect_uri':encodeURIComponent(vars.redirect),
				});
			}
			functions.base64(vars.config['client_id']+':'+vars.config['client_secret'],function(resp){
				kintone.proxy(
					'https://oauth.chatwork.com/token',
					'POST',
					{
						'Authorization':'Basic '+resp,
						'Content-Type':'application/x-www-form-urlencoded'
					},
					body,
					function(body,status,headers){
						var json=JSON.parse(body);
						if (!json.error)
						{
							/* setup session storage */
							sessionStorage.setItem('accesstoken',json.access_token);
							sessionStorage.setItem('refreshtoken',json.refresh_token);
							if (sessionStorage.getItem('redirect').replace(/\/$/g,'')+'/'==vars.redirect) callback();
							else window.location.href=sessionStorage.getItem('redirect');
						}
						else swalTis('Error!',json.error_description,'error');
					},
					function(error){
						swalTis('Error!',error,'error');
					}
				);
			});
		},
		/* create url */
		url:function(recordid){
			var directory=(vars.ismobile)?'m/'+kintone.mobile.app.getId():kintone.app.getId();
			var recordno=recordid;
			return kintone.api.url('/k/',true).replace(/\.json/g,'')+directory+'/show'+((vars.ismobile)?'?':'#')+'record='+recordno;
		}
	};
	/*---------------------------------------------------------------
	 kintone events
	---------------------------------------------------------------*/
	kintone.events.on(events.show,function(event){
		vars.config=kintone.plugin.app.getConfig(PLUGIN_ID);
		if (!vars.config) return event;
		if (!('rooms' in vars.config)) return event;
		if (!sessionStorage)
		{
			swalTis('Error!','本プラグインはご利用中のブラウザには対応しておりません。','error');
			return event;
		}
		/* check device */
		vars.ismobile=event.type.match(/mobile/g);
		/* initialize valiable */
		vars.redirect=kintone.api.url('/k/', true).replace(/\.json/g,((vars.ismobile)?'m/'+kintone.mobile.app.getId():kintone.app.getId())+'/');
		vars.rooms=JSON.parse(vars.config['rooms']);
		/* authorize */
		functions.authorize(function(){
			/* get fieldinfo */
			kintone.api(kintone.api.url('/k/v1/app/form/fields',true),'GET',{app:(vars.ismobile)?kintone.mobile.app.getId():kintone.app.getId(),lang:'user'},function(resp){
				vars.fieldinfos=resp.properties;
				kintone.api(kintone.api.url('/k/v1/app/settings',true),'GET',{app:(vars.ismobile)?kintone.mobile.app.getId():kintone.app.getId()},function(resp){
					vars.appname=resp.name;
				},function(error){
					swalTis({
						title:'Error!',
						text:$.builderror(error),
						icon:'error'
					}).then(function(isConfirm){resolve(event);});
				});
			},function(error){});
		});
		return event;
	});
	kintone.events.on(events.insert,function(event){
		return new kintone.Promise(function(resolve,reject){
			var rooms=$.grep(vars.rooms,function(item,index){
				return item.insert=='1';
			});
			var counter=0;
			var bodies=[];
			var createbodies=function(rooms,index,callback){
				if ($.conditionsmatch(event.record,vars.fieldinfos,JSON.parse(rooms[index].conditions)))
				{
					if (rooms[index].mention=='1')
					{
						functions.pickupmenbers(rooms[index].room,rooms[index].name,function(members){
							var body={
								room_id:rooms[index].room,
								message:functions.messagecreate(
									[members,'【アプリ名】'+vars.appname+' 【アクション】レコード追加'],
									[functions.url(event.record['$id'].value)],
									event.record,
									rooms[index].fields
								)
							};
							bodies.push(body);
							counter++;
							index++;
							if (index<rooms.length) createbodies(rooms,index,callback);
							else callback();
						},function(){
							index++;
							if (index<rooms.length) createbodies(rooms,index,callback);
							else callback();
						})
					}
					else
					{
						var body={
							room_id:rooms[index].room,
							message:functions.messagecreate(
								['【アプリ名】'+vars.appname+' 【アクション】レコード追加'],
								[functions.url(event.record['$id'].value)],
								event.record,
								rooms[index].fields
							)
						};
						bodies.push(body);
						counter++;
						index++;
						if (index<rooms.length) createbodies(rooms,index,callback);
						else callback();
					}
				}
				else
				{
					index++;
					if (index<rooms.length) createbodies(rooms,index,callback);
					else callback();
				}
			};
			if (rooms.length==0) resolve(event);
			createbodies(rooms,0,function(){
				if (bodies.length==0) resolve(event);
				for (var i=0;i<bodies.length;i++)
				{
					functions.messagepush(
						bodies[i].room_id,
						bodies[i].message,
						function(id){
							counter--;
							if (counter==0) resolve(event);
						},
						function(){resolve(event);}
					);
				}
			});
		});
	});
	kintone.events.on(events.update,function(event){
		if (event.error !== "") {
			console.log("error " + event.error);
			return event;
		}
		return new kintone.Promise(function(resolve,reject){
			var rooms=$.grep(vars.rooms,function(item,index){
				return item.update=='1';
			});
			var counter=0;
			var bodies=[];
			var createbodies=function(rooms,index,callback){
				if ($.conditionsmatch(event.record,vars.fieldinfos,JSON.parse(rooms[index].conditions)))
				{
					if (rooms[index].mention=='1')
					{
						functions.pickupmenbers(rooms[index].room,rooms[index].name,function(members){
							var body={
								room_id:rooms[index].room,
								message:functions.messagecreate(
									[members,'【アプリ名】'+vars.appname+' 【アクション】レコード更新'],
									[functions.url(event.record['$id'].value)],
									event.record,
									rooms[index].fields
								)
							};
							bodies.push(body);
							counter++;
							index++;
							if (index<rooms.length) createbodies(rooms,index,callback);
							else callback();
						},function(){
							index++;
							if (index<rooms.length) createbodies(rooms,index,callback);
							else callback();
						})
					}
					else
					{
						var body={
							room_id:rooms[index].room,
							message:functions.messagecreate(
								['【アプリ名】'+vars.appname+' 【アクション】レコード更新'],
								[functions.url(event.record['$id'].value)],
								event.record,
								rooms[index].fields
							)
						};
						bodies.push(body);
						counter++;
						index++;
						if (index<rooms.length) createbodies(rooms,index,callback);
						else callback();
					}
				}
				else
				{
					index++;
					if (index<rooms.length) createbodies(rooms,index,callback);
					else callback();
				}
			};
			if (rooms.length==0) resolve(event);
			createbodies(rooms,0,function(){
				if (bodies.length==0) resolve(event);
				for (var i=0;i<bodies.length;i++)
				{
					functions.messagepush(
						bodies[i].room_id,
						bodies[i].message,
						function(id){
							counter--;
							if (counter==0) resolve(event);
						},
						function(){resolve(event);}
					);
				}
			});
		});
	});
	kintone.events.on(events.delete,function(event){
		return new kintone.Promise(function(resolve,reject){
			var rooms=$.grep(vars.rooms,function(item,index){
				return item.delete=='1';
			});
			var counter=0;
			var bodies=[];
			var createbodies=function(rooms,index,callback){
				if ($.conditionsmatch(event.record,vars.fieldinfos,JSON.parse(rooms[index].conditions)))
				{
					if (rooms[index].mention=='1')
					{
						functions.pickupmenbers(rooms[index].room,rooms[index].name,function(members){
							var body={
								room_id:rooms[index].room,
								message:functions.messagecreate(
									[members,'【アプリ名】'+vars.appname+' 【アクション】レコード削除'],
									[],
									event.record,
									rooms[index].fields
								)
							};
							bodies.push(body);
							counter++;
							index++;
							if (index<rooms.length) createbodies(rooms,index,callback);
							else callback();
						},function(){
							index++;
							if (index<rooms.length) createbodies(rooms,index,callback);
							else callback();
						})
					}
					else
					{
						var body={
							room_id:rooms[index].room,
							message:functions.messagecreate(
								['【アプリ名】'+vars.appname+' 【アクション】レコード削除'],
								[],
								event.record,
								rooms[index].fields
							)
						};
						bodies.push(body);
						counter++;
						index++;
						if (index<rooms.length) createbodies(rooms,index,callback);
						else callback();
					}
				}
				else
				{
					index++;
					if (index<rooms.length) createbodies(rooms,index,callback);
					else callback();
				}
			};
			if (rooms.length==0) resolve(event);
			createbodies(rooms,0,function(){
				if (bodies.length==0) resolve(event);
				for (var i=0;i<bodies.length;i++)
				{
					functions.messagepush(
						bodies[i].room_id,
						bodies[i].message,
						function(id){
							counter--;
							if (counter==0) resolve(event);
						},
						function(){resolve(event);}
					);
				}
			});
		});
	});
	kintone.events.on(events.process,function(event){
		return new kintone.Promise(function(resolve,reject){
			var rooms=$.grep(vars.rooms,function(item,index){
				return item.process=='1';
			});
			var counter=0;
			var bodies=[];
			var createbodies=function(rooms,index,callback){
				if ($.conditionsmatch(event.record,vars.fieldinfos,JSON.parse(rooms[index].conditions)))
				{
					if (rooms[index].mention=='1')
					{
						functions.pickupmenbers(rooms[index].room,rooms[index].name,function(members){
							var body={
								room_id:rooms[index].room,
								message:functions.messagecreate(
									[
										members,
										'【アプリ名】'+vars.appname+' 【アクション】ステータス変更',
										'【変更前ステータス】'+event.status.value+' 【変更後ステータス】'+event.nextStatus.value
									],
									[functions.url(event.record['$id'].value)],
									event.record,
									rooms[index].fields
								)
							};
							bodies.push(body);
							counter++;
							index++;
							if (index<rooms.length) createbodies(rooms,index,callback);
							else callback();
						},function(){
							index++;
							if (index<rooms.length) createbodies(rooms,index,callback);
							else callback();
						})
					}
					else
					{
						var body={
							room_id:rooms[index].room,
							message:functions.messagecreate(
								[
									'【アプリ名】'+vars.appname+' 【アクション】ステータス変更',
									'【変更前ステータス】'+event.status.value+' 【変更後ステータス】'+event.nextStatus.value
								],
								[functions.url(event.record['$id'].value)],
								event.record,
								rooms[index].fields
							)
						};
						bodies.push(body);
						counter++;
						index++;
						if (index<rooms.length) createbodies(rooms,index,callback);
						else callback();
					}
				}
				else
				{
					index++;
					if (index<rooms.length) createbodies(rooms,index,callback);
					else callback();
				}
			};
			if (rooms.length==0) resolve(event);
			createbodies(rooms,0,function(){
				if (bodies.length==0) resolve(event);
				for (var i=0;i<bodies.length;i++)
				{
					functions.messagepush(
						bodies[i].room_id,
						bodies[i].message,
						function(id){
							counter--;
							if (counter==0) resolve(event);
						},
						function(){resolve(event);}
					);
				}
			});
		});
	});
})(jTis,kintone.$PLUGIN_ID);
