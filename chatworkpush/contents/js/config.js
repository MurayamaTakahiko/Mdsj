/*
*--------------------------------------------------------------------
* Kintone-Plugin "chatworkpush -config.js-"
* Version: 3.0
* Copyright (c) 2016 TIS
*
* Released under the MIT License.
* http://tis2010.jp/license.txt
* -------------------------------------------------------------------
*/
jTis.noConflict();
(function($,PLUGIN_ID){
	"use strict";
	var vars={
		conditionform:null,
		roomtable:null,
		conditiontable:[],
		fieldtable:[],
		conditioninfos:{},
		fieldinfos:{}
	};
	var functions={
		fieldsort:function(layout){
			var codes=[];
			$.each(layout,function(index,values){
				switch (values.type)
				{
					case 'ROW':
						$.each(values.fields,function(index,values){
							/* exclude spacer */
							if (!values.elementId) codes.push(values.code);
						});
						break;
					case 'GROUP':
						$.merge(codes,functions.fieldsort(values.layout));
						break;
				}
			});
			return codes;
		},
		loadconditions:function(index,conditions){
			var add=false;
			var row=null;
			vars.conditiontable[index].clearrows();
			for (var i=0;i<conditions.length;i++)
			{
				var condition=conditions[i];
				add=true;
				vars.conditiontable[index].addrow();
				row=vars.conditiontable[index].rows.last();
				$('.field',row).text(vars.conditioninfos[condition.field].label);
				$('.comp',row).text(condition.comp.name);
				$('.value',row).text(condition.label);
			}
			if (add) vars.conditiontable[index].container.css({'display':'table'});
			else vars.conditiontable[index].container.hide();
		},
		loadrooms:function(callback){
			vars.roomtable.clearrows();
			vars.conditiontable=[];
			vars.fieldtable=[];
			$('select#room',vars.roomtable.template).empty().append($('<option>').attr('value','').text(''));
			if ($('input#api_token').val())
			{
				kintone.proxy(
					'https://api.chatwork.com/v2/rooms',
					'GET',
					{
						'X-ChatWorkToken':$('input#api_token').val()
					},
					{},
					function(body,status,headers){
						if (status==200)
						{
							var rooms=JSON.parse(body);
							for (var i=0;i<rooms.length;i++) $('select#room',vars.roomtable.template).append($('<option>').attr('value',rooms[i].room_id).text(rooms[i].name));
							vars.roomtable.addrow();
							vars.roomtable.container.css({'display':'table'});
						}
						else
						{
							swalTis('Error!','チャット一覧の取得に失敗しました。','error');
							vars.roomtable.container.hide();
						}
						if (callback) callback();
					},
					function(error){
						swalTis('Error!','ChatWorkへの接続に失敗しました。','error');
						vars.roomtable.container.hide();
						if (callback) callback();
					}
				);
			}
			else
			{
				vars.roomtable.container.hide();
				if (callback) callback();
			}
		}
	};
	/*---------------------------------------------------------------
	 initialize fields
	---------------------------------------------------------------*/
	kintone.api(kintone.api.url('/k/v1/app/form/layout',true),'GET',{app:kintone.app.getId()},function(resp){
		var sorted=functions.fieldsort(resp.layout);
		/* get fieldinfo */
		kintone.api(kintone.api.url('/k/v1/app/form/fields',true),'GET',{app:kintone.app.getId(),lang:'user'},function(resp){
			var config=kintone.plugin.app.getConfig(PLUGIN_ID);
			var fieldinfo=null;
			vars.fieldinfos=resp.properties;
			fieldinfo=$.grep(Object.values(resp.properties),function(item,index){return item.type=='RECORD_NUMBER'})[0];
			vars.conditioninfos[fieldinfo.code]=fieldinfo;
			fieldinfo=$.grep(Object.values(resp.properties),function(item,index){return item.type=='MODIFIER'})[0];
			vars.conditioninfos[fieldinfo.code]=fieldinfo;
			fieldinfo=$.grep(Object.values(resp.properties),function(item,index){return item.type=='CREATOR'})[0];
			vars.conditioninfos[fieldinfo.code]=fieldinfo;
			fieldinfo=$.grep(Object.values(resp.properties),function(item,index){return item.type=='UPDATED_TIME'})[0];
			vars.conditioninfos[fieldinfo.code]=fieldinfo;
			fieldinfo=$.grep(Object.values(resp.properties),function(item,index){return item.type=='CREATED_TIME'})[0];
			vars.conditioninfos[fieldinfo.code]=fieldinfo;
			fieldinfo=$.grep(Object.values(resp.properties),function(item,index){return item.type=='STATUS'})[0];
			if (fieldinfo.enabled)
			{
				vars.conditioninfos[fieldinfo.code]=fieldinfo;
				fieldinfo=$.grep(Object.values(resp.properties),function(item,index){return item.type=='STATUS_ASSIGNEE'})[0];
				vars.conditioninfos[fieldinfo.code]=fieldinfo;
			}
			$.each(sorted,function(index){
				if (sorted[index] in vars.fieldinfos)
				{
					fieldinfo=vars.fieldinfos[sorted[index]];
					/* check field type */
					switch (fieldinfo.type)
					{
						case 'FILE':
						case 'RECORD_NUMBER':
						case 'REFERENCE_TABLE':
						case 'RICH_TEXT':
						case 'SUBTABLE':
							break;
						default:
							$('select#field').append($('<option>').attr('value',fieldinfo.code).text(fieldinfo.label));
							break;
					}
					vars.conditioninfos[fieldinfo.code]=fieldinfo;
				}
			});
			/* initialize valiable */
			vars.roomtable=$('.rooms').adjustabletable({
				add:'img.addroom',
				del:'img.delroom',
				addcallback:function(row,addindex){
					if (vars.roomtable)
					{
						vars.conditiontable.splice(addindex,0,$('.conditions',row).adjustabletable());
						vars.fieldtable.splice(addindex,0,$('.fields',row).adjustabletable({
							add:'img.addfield',
							del:'img.delfield'
						}));
						$('button#conditions',row).off('click').on('click',function(){
							var index=vars.roomtable.rows.index(row);
							var conditions=($('input#conditions',row).val())?JSON.parse($('input#conditions',row).val()):[];
							vars.conditionform.show({fieldinfos:vars.conditioninfos,conditions:conditions},function(resp){
								$('input#conditions',row).val(JSON.stringify(resp));
								functions.loadconditions(index,resp);
							});
						});
					}
				},
				delcallback:function(delindex){
					vars.conditiontable.splice(delindex,1);
					vars.fieldtable.splice(delindex,1);
				}
			});
			var row=null;
			var rooms={};
			if (Object.keys(config).length!==0)
			{
				$('input#api_token').val(config['api_token']);
				$('input#client_id').val(config['client_id']);
				$('input#client_secret').val(config['client_secret']);
			}
			functions.loadrooms(function(){
				if (Object.keys(config).length!==0)
				{
					rooms=JSON.parse(config['rooms']);
					for (var i=0;i<rooms.length;i++)
					{
						if (i>0) vars.roomtable.addrow();
						row=vars.roomtable.rows.last();
						$('select#room',row).val(rooms[i].room);
						if (rooms[i].insert=='1') $('input#insert',row).prop('checked',true);
						if (rooms[i].update=='1') $('input#update',row).prop('checked',true);
						if (rooms[i].delete=='1') $('input#delete',row).prop('checked',true);
						if (rooms[i].process=='1') $('input#process',row).prop('checked',true);
						if (rooms[i].mention=='1') $('input#mention',row).prop('checked',true);
						$('input#conditions',row).val(rooms[i].conditions);
						functions.loadconditions(i,JSON.parse(rooms[i].conditions));
						for (var i2=0;i2<rooms[i].fields.length;i2++)
						{
							if (i2>0) vars.fieldtable[i].addrow();
							$('select#field',vars.fieldtable[i].rows.last()).val(rooms[i].fields[i2]);
						}
					}
				}
			});
			$('input#api_token').on('change',function(){functions.loadrooms()});
			vars.conditionform=$('body').conditionsform({
				fields:vars.conditioninfos
			});
		},function(error){});
	},function(error){});
	/*---------------------------------------------------------------
	 button events
	---------------------------------------------------------------*/
	$('button#submit').on('click',function(e){
		var checked=0;
		var row=null;
		var config=[];
		var rooms=[];
		/* check values */
		if ($('input#api_token').val()=='')
		{
			swalTis('Error!','APIトークンを入力して下さい。','error');
			return;
		}
		if ($('input#client_id').val()=='')
		{
			swalTis('Error!','クライアントIDを入力して下さい。','error');
			return;
		}
		if ($('input#client_secret').val()=='')
		{
			swalTis('Error!','クライアントシークレットを入力して下さい。','error');
			return;
		}
		for (var i=0;i<vars.roomtable.rows.length;i++)
		{
			var room={
				room:'',
				name:'',
				insert:'0',
				update:'0',
				delete:'0',
				process:'0',
				mention:'0',
				conditions:'',
				fields:[]
			};
			checked=0;
			row=vars.roomtable.rows.eq(i);
			if (!$('select#room',row).val()) continue;
			else
			{
				room.room=$('select#room',row).val();
				room.name=$('select#room option:selected',row).text();
			}
			if ($('input#insert',row).prop('checked'))
			{
				room.insert='1';
				checked++;
			}
			if ($('input#update',row).prop('checked'))
			{
				room.update='1';
				checked++;
			}
			if ($('input#delete',row).prop('checked'))
			{
				room.delete='1';
				checked++;
			}
			if ($('input#process',row).prop('checked'))
			{
				room.process='1';
				checked++;
			}
			if (checked<1)
			{
				swalTis('Error!','アクションを選択して下さい。','error');
				return;
			}
			if ($('input#mention',row).prop('checked')) room.mention='1';
			room.conditions=($('input#conditions',row).val())?$('input#conditions',row).val():'[]';
			for (var i2=0;i2<vars.fieldtable[i].rows.length;i2++)
			{
				row=vars.fieldtable[i].rows.eq(i2);
				if (!$('select#field',row).val()) continue;
				room.fields.push($('select#field',row).val());
			}
			rooms.push(room);
		}
		/* setup config */
		config['api_token']=$('input#api_token').val();
		config['client_id']=$('input#client_id').val();
		config['client_secret']=$('input#client_secret').val();
		config['rooms']=JSON.stringify(rooms);
		/* save config */
		kintone.plugin.app.setConfig(config);
	});
	$('button#cancel').on('click',function(e){
		history.back();
	});
})(jTis,kintone.$PLUGIN_ID);