/*
 * 契約プラン・オプションコピープログラム
 * 20210628 MDSJ takahara
 * 20210802 MDSJ takahara Update
 */
jQuery.noConflict();
(function($) {
  "use strict";

  var showEvents = [
    "app.record.create.show",
    "app.record.detail.show",
    "app.record.edit.show"
  ];

  //中津店
  //var APP_CUSTMERLIST = 80; //会員顧客名簿
  //var APP_TAIO = 84; //会員対応管理
  //var APP_YAGO = 10; //屋号
  //梅田店
  //var APP_CUSTMERLIST = 156; //会員顧客名簿
  //var APP_TAIO = 155; //会員対応管理
  //var APP_YAGO = 161; //屋号
  //四条烏丸店
  //var APP_CUSTMERLIST = 140; //会員顧客名簿
  //var APP_TAIO = 139; //会員対応管理
  //var APP_YAGO = 145; //屋号

  var APP_CUSTMERLIST = 447; //会員顧客名簿
  var APP_TAIO = 444; //会員対応管理
  var APP_YAGO = 459; //屋号



  var kokyakutitle= '' +
          '<div style="margin-left:15px">' +
          '<table class="subtable-gaia reference-subtable-gaia">' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:50px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 50px;">選択</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:150px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">顧客番号</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:200px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">顧客名</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:200px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">フリガナ</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:200px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">住所使用「屋号」</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:200px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">住所使用「屋号」フリガナ</span></th>' +
          '<tr>';
  var kokyakutitle2='' +
          '<div style="margin-left:15px">' +
          '<table class="subtable-gaia reference-subtable-gaia">' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">選択</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">顧客番号</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">顧客名</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">契約名義</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">契約名義フリガナ</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">所属・会社名</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">所属・会社名フリガナ</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">代表者氏名</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">代表者氏名フリガナ</span></th>' +
          '<tr>';

  //顧客リスト表示
  kintone.events.on(showEvents, function(e) {
    var objRecord = e.record;
    var spc = kintone.app.record.getSpaceElement('btn1');
    var srcGetConstlist = '' +
      '<div id="emxas-get-list">' +
      '<div><span>&nbsp;</span></div>' +
      '<div><button id="emxas-button-list">屋号情報検索</button></div>' +
      '</div>';
    $(spc).html(srcGetConstlist);
    var spc2 = kintone.app.record.getSpaceElement('btn2');
    var srcGetConstlist2 = '' +
      '<div id="emxas-get-list">' +
      '<div><span>&nbsp;</span></div>' +
      '<div><button id="emxas-button-clear">顧客情報クリア</button></div>' +
      '</div>';
        $(spc2).html(srcGetConstlist2);
    objRecord.顧客番号.disabled = true;
    return e;
  });


  //クリックイベント
  $(document).on('click', '#emxas-button-list',  async function(e) {
    try{

      var spc = kintone.app.record.getSpaceElement('yagolist');
      var objRecord = kintone.app.record.get();
      var record=objRecord.record;
      var day = record.日付.value;
      var stratena=record.宛名検索.value;
      var list;
      var kokyakuno;
      var kokyakunm;
      var furigana;
      var optfr;
      var optto;
      var adyago;
      var adyagofuri;
      var keiyakumeigi;
      var keiyakumeigifuri;
      var syozoku;
      var syozokufuri;
      var daihyosya;
      var daihyosyafuri;
      //条件分割
      var data=[];
      var data2=[];
      // クライアントの作成
			const client = new KintoneRestAPIClient();

			// リクエストパラメータの設定
			const params = {
				app: APP_CUSTMERLIST,     // アプリID
				condition: '(退会日 >= \"' + day + '\" or 退会日 = \"\" )  ',  // 条件
				orderBy: 'レコード番号 asc',           // 順番
				withCursor: true              // カーソル有無
			};
      // リクエストパラメータの設定
			const params2 = {
				app: APP_YAGO,     // アプリID
        condition:'団体名法人名屋号 !=  \"\" ',  // 条件
				orderBy: 'レコード番号 asc',           // 順番
				withCursor: true              // カーソル有無
			};

      //屋号検索
      if(stratena){
        //顧客データを取得
        const resp = await client.record.getAllRecords(params);

        if(resp.length!=0){
          var stratenas=stratena.split("、");
          for(let i=0;i<resp.length;i++){
            //項目
            kokyakuno="";
            kokyakunm="";
            furigana="";
            optfr="";
            optto="";
            adyago="";
            adyagofuri="";
            if(resp[i]['顧客番号'].value){
              kokyakuno=resp[i]['顧客番号'].value;
            }
            if(resp[i]['顧客名'].value){
              kokyakunm=resp[i]['顧客名'].value;
            }
            if(resp[i]['フリガナ'].value){
              furigana=resp[i]['フリガナ'].value;
            }
            let opt=resp[i]['オプション利用'].value;
            if(opt){
              let blnHit=false;
              for(let j=0;j<opt.length;j++){
                //屋号あり
                if(opt[j]['value']['住所使用屋号'].value || opt[j]['value']['住所使用屋号フリガナ'].value){
                  blnHit=true;
                  //項目
                  optfr="";
                  optto="";
                  adyago="";
                  adyagofuri="";
                  if(opt[j]['value']['オプション利用開始日'].value){
                    optfr=opt[j]['value']['オプション利用開始日'].value;
                  }
                  if(opt[j]['value']['オプション利用終了日'].value){
                    optto=opt[j]['value']['オプション利用終了日'].value;
                  }
                  if(opt[j]['value']['住所使用屋号'].value){
                    adyago=opt[j]['value']['住所使用屋号'].value;
                  }
                  if(opt[j]['value']['住所使用屋号フリガナ'].value){
                    adyagofuri=opt[j]['value']['住所使用屋号フリガナ'].value;
                  }
                  data2.push({
                      '顧客番号':kokyakuno,
                      '顧客名':kokyakunm,
                      'フリガナ':furigana,
                      'オプション利用開始日':optfr,
                      'オプション利用終了日':optto,
                      '住所使用屋号':adyago,
                      '住所使用屋号フリガナ':adyagofuri
                  })
                }
              }
              if(!blnHit){
                data2.push({
                    '顧客番号':kokyakuno,
                    '顧客名':kokyakunm,
                    'フリガナ':furigana,
                    'オプション利用開始日':optfr,
                    'オプション利用終了日':optto,
                    '住所使用屋号':adyago,
                    '住所使用屋号フリガナ':adyagofuri
                })
              }
            }else{
              data2.push({
                '顧客番号':kokyakuno,
                '顧客名':kokyakunm,
                'フリガナ':furigana,
                'オプション利用開始日':optfr,
                'オプション利用終了日':optto,
                '住所使用屋号':adyago,
                '住所使用屋号フリガナ':adyagofuri
              })
            }

          }

          //検索条件分割分繰り返す
          for(let x=0;x<stratenas.length;x++){
            data=data2;
            data2=[];
            var strsearch=stratenas[x];
            for(let i=0;i<data.length;i++){
              //顧客名、フリガナ、オプションリストの住所使用屋号
              if(strsearch==data[i]['顧客名'] || strsearch==data[i]['フリガナ'] ){
                data2.push(data[i]);
              }
              if(data[i]['住所使用屋号'] != "" && data[i]['オプション利用開始日'] <= day && ( data[i]['オプション利用終了日'] >= day || data[i]['オプション利用終了日']=="")){
                if(strsearch==data[i]['住所使用屋号']  ){
                  data2.push(data[i]);
                }
              }
            }
          }
          //一覧作成
          if(data2.length!=0){
            //結果出力
            list = kokyakutitle;
            for(let i = 0 ; i<data2.length ; i++){
                list = list + '<td><button class="sentaku">選択</button></td>' ;
                list = list + '<td>' + data2[i]['顧客番号'] + '</td><td>' + data2[i]['顧客名'] + '</td><td>' + data2[i]['フリガナ'] + '</td>' ;
                list = list + '<td>' + data2[i]['住所使用屋号'] + '</td><td>' + data2[i]['住所使用屋号フリガナ'] + '</td>' ;
                list = list +'<tr>';
            }
             list=list+ '</table></div>';

             // ダイアログを作成
             var dialog = document.createElement('div');
             dialog.innerHTML = ' <dialog class="dialog"><h3>顧客検索結果</h3>' + list + '<div class="close"><button class="button">閉じる</button></div></dialog>';
          }
        }

        //顧客検索結果表示
        if(data2.length==0){
          //もしかして検索
          //顧客データを取得
          const resp2 = await client.record.getAllRecords(params2);
          var rowdata;
          //項目
          kokyakuno="";
          kokyakunm="";
          keiyakumeigi="";
          keiyakumeigifuri="";
          syozoku="";
          syozokufuri="";
          daihyosya="";
          daihyosyafuri="";
          if(resp.length!=0){
            for(let i=0;i<resp.length;i++){
              //
              if(resp[i]['顧客番号'].value){
                kokyakuno=resp[i]['顧客番号'].value;
              }
              if(resp[i]['顧客名'].value){
                kokyakunm=resp[i]['顧客名'].value;
              }
              if(resp[i]['契約名義'].value){
                keiyakumeigi=resp[i]['契約名義'].value;
              }
              if(resp[i]['契約名義フリガナ'].value){
                keiyakumeigifuri=resp[i]['契約名義フリガナ'].value;
              }
              if(resp2.length !=0){
                //所属会社名1
                if(resp[i]['所属・会社名１'].value){
                  SetData2(resp[i]['所属・会社名１'].value,resp2,data2,kokyakuno,kokyakunm,keiyakumeigi,keiyakumeigifuri);
                }
                //所属会社名2
                if(resp[i]['所属会社名2'].value){
                  SetData2(resp[i]['所属会社名2'].value,resp2,data2,kokyakuno,kokyakunm,keiyakumeigi,keiyakumeigifuri);
                }
                //所属会社名3
                if(resp[i]['所属会社名3'].value){
                  SetData2(resp[i]['所属会社名3'].value,resp2,data2,kokyakuno,kokyakunm,keiyakumeigi,keiyakumeigifuri);
                }
                //所属会社名4
                if(resp[i]['所属会社名4'].value){
                  SetData2(resp[i]['所属会社名4'].value,resp2,data2,kokyakuno,kokyakunm,keiyakumeigi,keiyakumeigifuri);
                }
                //所属会社名5
                if(resp[i]['所属会社名5'].value){
                  SetData2(resp[i]['所属会社名5'].value,resp2,data2,kokyakuno,kokyakunm,keiyakumeigi,keiyakumeigifuri);
                }
              }else{
                data2.push({
                    '顧客番号':kokyakuno,
                    '顧客名':kokyakunm,
                    '契約名義':keiyakumeigi,
                    '契約名義フリガナ':keiyakumeigifuri,
                    '所属会社名':syozoku,
                    '所属会社名フリガナ':syozokufuri,
                    '代表者氏名':daihyosya,
                    '代表者氏名フリガナ':daihyosyafuri
                })
              }
            }
            //検索条件分割分繰り返す
            kokyakunm="";
            for(let x=0;x<stratenas.length;x++){
              data=data2;
              data2=[];
              var strsearch=stratenas[x];
              for(let i=0;i<data.length;i++){
                //契約名義、契約名義フリガナ、所属会社名、所属会社名フリガナ、代表者名、代表者名フリガナ、
                if((strsearch==data[i]['契約名義'] || strsearch==data[i]['契約名義フリガナ'] ||
                    strsearch==data[i]['所属会社名'] || strsearch==data[i]['所属会社名フリガナ'] ||
                    strsearch==data[i]['代表者氏名'] || strsearch==data[i]['代表者氏名フリガナ']) ){
                  data2.push(data[i]);
                  //kokyakunm=data[i]['顧客名'];
                }
              }
            }
          }
          //一覧作成
          if(data2.length!=0){
            //結果出力
            list = kokyakutitle2;
            for(let i = 0 ; i<data2.length ; i++){
                list = list + '<td><button class="sentaku">選択</button></td>' ;
                list = list + '<td>' + data2[i]['顧客番号'] + '</td><td>' + data2[i]['顧客名'] + '</td>' ;
                list = list + '<td>' + data2[i]['契約名義'] + '</td><td>' + data2[i]['契約名義フリガナ'] + '</td>' ;
                list = list + '<td>' + data2[i]['所属会社名'] + '</td><td>' + data2[i]['所属会社名フリガナ'] + '</td>' ;
                list = list + '<td>' + data2[i]['代表者氏名'] + '</td><td>' + data2[i]['代表者氏名フリガナ'] + '</td>' ;
                list = list +'<tr>';
            }
             list=list+ '</table></div>';

             // ダイアログを作成
             var dialog = document.createElement('div');
             dialog.innerHTML = ' <dialog class="dialog"><h3>顧客が見つかりませんでした。<br>もしかして、こちらでしょうか？</h3>' + list + '<div class="close"><button class="button">閉じる</button></div></dialog>';
          }
        }
        if(data2.length !=0){

            // ダイアログを表示
            document.body.appendChild(dialog);
            const dialogDemo = document.querySelector('.dialog');
            // 閉じるボタン
            const closeBtn = document.querySelector('.button');
            // 閉じるボタンがクリックされたときダイアログを閉じる
            closeBtn.addEventListener('click', () => {
            dialogDemo.close();
            dialogDemo.remove();
            });
            // 選択ボタン
            //const sentakuBtn = document.querySelector('.sentaku');
            $(document).on('click', '.sentaku',  async function(e) {
              await ClearData();
              var objRecord = kintone.app.record.get();
            //sentakuBtn.addEventListener('click', () => {
              const kokyakuno=$(this).parent().next().text();
              objRecord.record.顧客番号.value=kokyakuno;
              objRecord.record["顧客番号"]["lookup"] = true;
              //屋号情報セット
              await SetYagoOption(objRecord);
              //kintone.app.record.set(objRecord);
              dialogDemo.close();
              dialogDemo.remove();

            });
            dialogDemo.showModal();
        }else{
          alert("該当の顧客が存在しません。");
        }
      }
    }catch(e) {
      // error
      console.log(e);
    }
    return e;
  });
  //クリックイベント
  $(document).on('click', '#emxas-button-clear',  async function(e) {
    try{
      await ClearData();
    }catch(e){
      // error
      console.log(e);
    }
    return e;
  });

 async function ClearData(){
   var objRecord = kintone.app.record.get();
   var record=objRecord.record;
   var custno = objRecord.record.顧客番号.value;
   objRecord.record.顧客番号.lookup = 'CLEAR';
   objRecord.record.プランリスト.value=[];
   objRecord.record.オプションリスト.value=[];
   objRecord.record.屋号使用オプションリスト.value=[];
   objRecord.record.郵送先変更依頼.value=[];
   await kintone.app.record.set(objRecord);
 }
  async function SetYagoOption(objRecord){
    var custno = objRecord.record.顧客番号.value;
    var day =objRecord.record.日付.value;
    var body = {
        app: APP_CUSTMERLIST,
        query: "顧客番号 = \"" + custno + "\" and " +
            "(退会日 >= \"" + day + "\" or 退会日 = \"\" )  " +
           "order by レコード番号 limit 500"
    };
    objRecord.record.屋号使用オプションリスト.value=[];
    objRecord.record.郵送先変更依頼.value=[];

    const res = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
    var rec=res.records;
    if(rec.length !=0){

        for(let i = 0 ; i<rec.length ; i++){
          objRecord.record.プランリスト.value=[];
          objRecord.record.オプションリスト.value=[];

          var opt = rec[i]['オプション利用'].value;
          var pln = rec[i]['プランリスト'].value;
          //オプションリスト
          for(let j=0;j<opt.length;j++){
            //オプションリスト
            objRecord.record.オプションリスト.value.push({
              value: {
                OP行番号: {
                  value: j+1,
                  type: 'SINGLE_LINE_TEXT',
                },
                オプション名: {
                  value: opt[j]['value']['オプション'].value,
                  type: 'SINGLE_LINE_TEXT',
                },
                契約数: {
                  value: opt[j]['value']['オプション契約数'].value,
                  type: 'NUMBER',
                },
                OP利用開始日: {
                  value: opt[j]['value']['オプション利用開始日'].value,
                  type: 'DATE',
                },
                OP利用終了日: {
                  value: opt[j]['value']['オプション利用終了日'].value,
                  type: 'DATE',
                },
              }
            });
            //住所使用屋号オプションリスト
            if(opt[j]['value']['住所使用屋号'].value != "" && opt[j]['value']['オプション利用開始日'].value <= day && ( opt[j]['value']['オプション利用終了日'].value >= day || opt[j]['value']['オプション利用終了日'].value==null)){
              objRecord.record.屋号使用オプションリスト.value.push({
                value: {
                  屋号オプション名: {
                    value: opt[j]['value']['オプション'].value,
                    type: 'SINGLE_LINE_TEXT',
                  },
                  開始日: {
                    value: opt[j]['value']['オプション利用開始日'].value,
                    type: 'DATE',
                  },
                  終了日: {
                    value: opt[j]['value']['オプション利用終了日'].value,
                    type: 'DATE',
                  },
                  住所使用屋号: {
                    value: opt[j]['value']['住所使用屋号'].value,
                    type: 'SINGLE_LINE_TEXT',
                  },
                  住所使用屋号フリガナ: {
                    value: "",
                    type: 'SINGLE_LINE_TEXT',
                  },
                  代表者氏名: {
                    value: "",
                    type: 'SINGLE_LINE_TEXT',
                  },
                  代表者氏名フリガナ: {
                    value: "",
                    type: 'SINGLE_LINE_TEXT',
                  },
                }
              });
              objRecord.record['屋号使用オプションリスト']['value'][(objRecord.record.屋号使用オプションリスト.value.length)-1].value['住所使用屋号']['lookup']=true;
            }
          }
          //プランリスト
          for(let j=0;j<pln.length;j++){
            objRecord.record.プランリスト.value.push({
              value: {
                P行番号: {
                  value: j+1,
                  type: 'NUMBER',
                },
                プラン名: {
                  value: pln[j]['value']['プラン'].value,
                  type: 'SINGLE_LINE_TEXT',
                },
                プラン種別: {
                  value: pln[j]['value']['プラン種別'].value,
                  type: 'SINGLE_LINE_TEXT',
                },
                プラン利用開始日: {
                  value: pln[j]['value']['プラン利用開始日'].value,
                  type: 'DATE',
                },
                プラン利用終了日: {
                  value: pln[j]['value']['プラン利用終了日'].value,
                  type: 'DATE',
                },
              }
            });
          }

        }

      }

      //郵送依頼レコード
      var body3 = {
          'app': APP_TAIO,
          'query': "顧客番号 = \"" + custno + "\" " +
                   "and 問い合わせ種別 in (\"１１、郵送先変更依頼\") " +
                   "order by レコード番号"
        };
      const res3 = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body3);
      var rec3=res3.records;
      for(let i = 0 ; i<rec3.length ; i++){
        objRecord.record.郵送先変更依頼.value.push({
          value: {
            郵送開始日: {
              value: rec3[i]['郵送開始日'].value,
              type: 'DATE',
            },
            郵送終了日: {
              value: rec3[i]['郵送終了日'].value,
              type: 'DATE',
            },
            郵送先: {
              value: rec3[i]['郵送先'].value,
              type: 'SINGLE_LINE_TEXT',
            },
            郵送先今回のみ: {
              value: rec3[i]['郵送先今回のみ'].value,
              type: 'SINGLE_LINE_TEXT',
            }
          }
        });
      }
    kintone.app.record.set(objRecord);
  }



  function SetData2(search,resp2,data2,kokyakuno,kokyakunm,keiyakumeigi,keiyakumeigifuri){
    var syozoku="";
    var syozokufuri="";
    var daihyosya="";
    var daihyosyafuri="";
    const rowdata = resp2.filter(row => row.団体名法人名屋号.value === search);
    if(rowdata){
        if(rowdata.length !=0){
        if(rowdata[0]['団体名法人名屋号'].value){
          syozoku=rowdata[0]['団体名法人名屋号'].value;
        }
        if(rowdata[0]['団体名法人名屋号フリガナ'].value){
          syozokufuri=rowdata[0]['団体名法人名屋号フリガナ'].value;
        }
        if(rowdata[0]['氏'].value){
          daihyosya=rowdata[0]['氏'].value;
        }
        if(rowdata[0]['フリガナ'].value){
          daihyosyafuri=rowdata[0]['フリガナ'].value;
        }
      }
    }
    data2.push({
        '顧客番号':kokyakuno,
        '顧客名':kokyakunm,
        '契約名義':keiyakumeigi,
        '契約名義フリガナ':keiyakumeigifuri,
        '所属会社名':syozoku,
        '所属会社名フリガナ':syozokufuri,
        '代表者氏名':daihyosya,
        '代表者氏名フリガナ':daihyosyafuri
    })
  }
})(jQuery);
