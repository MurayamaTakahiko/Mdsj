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
  //114行目のキーダウンは要変更
  //var APP_CUSTMERLIST = 80; //会員顧客名簿
  //var APP_TAIO = 84; //会員対応管理
  //var APP_YAGO = 10; //屋号
  //var SUB_DMAIN = "kyoei-realestate";
  //var SHOP_NM="中津";

  //梅田店 ポスト判別用項目は除く 114行目のキーダウンは要変更
  //114行目のキーダウンは要変更
  //var APP_CUSTMERLIST = 156; //会員顧客名簿
  //var APP_TAIO = 155; //会員対応管理
  //var APP_YAGO = 161; //屋号
  //var SUB_DMAIN = "kyoei-realestate";
  //var SHOP_NM="梅田";

  //四条烏丸店
  //114行目のキーダウンは要変更
  var APP_CUSTMERLIST = 140; //会員顧客名簿
  var APP_TAIO = 139; //会員対応管理
  var APP_YAGO = 145; //屋号
  var SUB_DMAIN = "kyoei-realestate";
  var SHOP_NM="四条烏丸";

  //114行目のキーダウンは要変更
  //var APP_CUSTMERLIST = 447; //会員顧客名簿
  //var APP_TAIO = 444; //会員対応管理
  //var APP_YAGO = 459; //屋号
  //var SUB_DMAIN = "mdsj";
  //var SHOP_NM="中津";

  var kokyakutitle= '' +
          '<div style="margin-left:15px">' +
          '<table class="subtable-gaia reference-subtable-gaia">' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:50px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 50px;">選択</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:50px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 50px;">詳細</span></th>' +
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
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">代表者氏名</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:200px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">代表者氏名フリガナ</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">請求代表</span></th>' +
          '<tr>';
  var kokyakutitle2='' +
          '<div style="margin-left:15px">' +
          '<table class="subtable-gaia reference-subtable-gaia">' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:50px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 50px;">選択</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:50px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 50px;">詳細</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">顧客番号</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">顧客名</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">契約名義</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">契約名義フリガナ</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">所属・会社名</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">所属・会社名フリガナ</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">代表者氏名</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:200px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">代表者氏名フリガナ</span></th>' +
          '<th class="subtable-label-gaia2 subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">請求代表</span></th>' +
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

    //梅田は5、梅田以外は4
    document.getElementsByClassName("input-text-cybozu")[4].addEventListener("keydown", async function(event) {
    if (event.keyCode === 13) {
      try{
        var spc = kintone.app.record.getSpaceElement('yagolist');
        var objRecord = kintone.app.record.get();
        var record=objRecord.record;
        var day = objRecord.record.日付.value;
        var stratena=objRecord.record.宛名検索.value;
        //屋号検索
        if(stratena){
            showSpinner(); // スピナー表示
            if(await DialogKokyaku() == 0){
              var msg = "顧客が見つかりませんでした。<br>";
              if(await DialogOther(msg)==0){
                hideSpinner();
                alert("該当の顧客が存在しません。");
              };
            hideSpinner();
            }else{
              hideSpinner();
            }

        }
      }catch(e) {
        // error
        console.log(e);
        hideSpinner();
      }
    }
    });


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
      //屋号検索
      if(stratena){
          showSpinner(); // スピナー表示
          if(await DialogKokyaku() == 0){
            var msg = "顧客が見つかりませんでした。<br>";
            if(await DialogOther(msg)==0){
              hideSpinner();
              alert("該当の顧客が存在しません。");
            };
          }else{
            hideSpinner();
          }

      }
    }catch(e) {
      // error
      console.log(e);
      hideSpinner();
    }
    return e;
  });
  //クリックイベント
  $(document).on('click', '#emxas-button-clear',  async function(e) {
    try{
      var objRecord = kintone.app.record.get();
      objRecord.record.宛名検索.value="";
      await kintone.app.record.set(objRecord);
      await ClearData();
    }catch(e){
      // error
      console.log(e);
    }
    return e;
  });

async function DialogKokyaku(){
  // クライアントの作成
  const client = new KintoneRestAPIClient();
  var spc = kintone.app.record.getSpaceElement('yagolist');
  var objRecord = kintone.app.record.get();
  var record=objRecord.record;
  var day = record.日付.value;
  var stratena=record.宛名検索.value;  // リクエストパラメータの設定
  var list;
  var recordno;
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
  var seikyudaihyo;
  //条件分割
  var data=[];
  var data2=[];
  // リクエストパラメータの設定
  const params = {
    app: APP_CUSTMERLIST,     // アプリID
    condition: '(退会日 >= \"' + day + '\" or 退会日 = \"\" )  and 住所使用屋号 not in (\"\")',  // 条件
    orderBy: 'レコード番号 asc',           // 順番
    withCursor: true              // カーソル有無
  };
  const params2 = {
    app: APP_YAGO,     // アプリID
    condition:'団体名法人名屋号 !=  \"\" ',  // 条件
    orderBy: 'レコード番号 asc',           // 順番
    withCursor: true              // カーソル有無
  };
  //顧客データを取得
  const resp = await client.record.getAllRecords(params);
  //会社・所属データを取得
  const resp2 = await client.record.getAllRecords(params2);

  if(resp.length!=0){
    var stratenas=stratena.split("、");
    for(let i=0;i<resp.length;i++){
      //項目
      recordno="";
      kokyakuno="";
      kokyakunm="";
      furigana="";
      optfr="";
      optto="";
      adyago="";
      adyagofuri="";
      daihyosya="";
      daihyosyafuri="";
      seikyudaihyo="";
      if(resp[i]['レコード番号'].value){
        recordno=resp[i]['レコード番号'].value;
      }
      if(resp[i]['顧客番号'].value){
        kokyakuno=resp[i]['顧客番号'].value;
      }
      if(resp[i]['顧客名'].value){
        kokyakunm=resp[i]['顧客名'].value;
      }
      if(resp[i]['フリガナ'].value){
        furigana=resp[i]['フリガナ'].value;
      }
      if(resp[i]['チェックボックス'].value){
        seikyudaihyo=resp[i]['チェックボックス'].value;
      }
      let opt=resp[i]['オプション利用'].value;
      if(opt){
        let blnHit=false;
        for(let j=0;j<opt.length;j++){
          //屋号あり
          if(opt[j]['value']['住所使用屋号'].value || opt[j]['value']['住所使用屋号フリガナ'].value){
            blnHit=true;

            //
            daihyosya="";
            daihyosyafuri="";

            // const params2 = {
            //   app: APP_YAGO,     // アプリID
            //   condition: '団体名法人名屋号 = \"' + opt[j]['value']['住所使用屋号'].value + '\" ',  // 条件
            //   withCursor: true              // カーソル有無
            // };
            //所属・会社名を取得
            //const resp2 = await client.record.getAllRecords(params2);
            const rowdata = resp2.filter(row => row.団体名法人名屋号.value === opt[j]['value']['住所使用屋号'].value);
            if(rowdata){
                if(rowdata.length !=0){
                  if(rowdata[0]['氏'].value){
                    daihyosya=rowdata[0]['氏'].value;
                  }
                  if(rowdata[0]['フリガナ'].value){
                    daihyosyafuri=rowdata[0]['フリガナ'].value;
                  }
              }
            }
            // if(resp2.length!=0){
            //     daihyosya=resp2[0]['氏'].value;
            //     daihyosyafuri=resp2[0]['フリガナ'].value;
            // }

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
                'レコード番号':recordno,
                '顧客番号':kokyakuno,
                '顧客名':kokyakunm,
                'フリガナ':furigana,
                'オプション利用開始日':optfr,
                'オプション利用終了日':optto,
                '住所使用屋号':adyago,
                '住所使用屋号フリガナ':adyagofuri,
                '代表者氏名':daihyosya,
                '代表者フリガナ':daihyosyafuri,
                '請求代表':seikyudaihyo
            })
          }
        }
        if(!blnHit){
          data2.push({
            'レコード番号':recordno,
              '顧客番号':kokyakuno,
              '顧客名':kokyakunm,
              'フリガナ':furigana,
              'オプション利用開始日':optfr,
              'オプション利用終了日':optto,
              '住所使用屋号':adyago,
              '住所使用屋号フリガナ':adyagofuri,
              '代表者氏名':daihyosya,
              '代表者フリガナ':daihyosyafuri,
              '請求代表':seikyudaihyo
          })
        }
      }else{
        data2.push({
          'レコード番号':recordno,
          '顧客番号':kokyakuno,
          '顧客名':kokyakunm,
          'フリガナ':furigana,
          'オプション利用開始日':optfr,
          'オプション利用終了日':optto,
          '住所使用屋号':adyago,
          '住所使用屋号フリガナ':adyagofuri,
          '代表者氏名':daihyosya,
          '代表者フリガナ':daihyosyafuri,
          '請求代表':seikyudaihyo
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
        if((data[i]['顧客名'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1 || data[i]['フリガナ'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1 ) && data[i]['オプション利用開始日'] <= day && ( data[i]['オプション利用終了日'] >= day || data[i]['オプション利用終了日']=="")){
          data2.push(data[i]);
        }else{
          if(data[i]['住所使用屋号'] != "" && data[i]['オプション利用開始日'] <= day && ( data[i]['オプション利用終了日'] >= day || data[i]['オプション利用終了日']=="")){
            if(data[i]['住所使用屋号'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1  ){
              data2.push(data[i]);
            }
          }
      }
      }
    }
    //一覧作成
    if(data2.length!=0){
      var blnOne=true;
      var keykokyaku;
      //１顧客のみかどうか
      for(let i=0;i<data2.length;i++){
        if(i==0){
          keykokyaku=data2[i]['顧客番号'];
        }else{
          if(keykokyaku !=data2[i]['顧客番号'])
          {
            blnOne=false;
            break;
          }
        }
      }
      //顧客が１つの場合
      if(blnOne){
        objRecord.record.顧客番号.value=keykokyaku;
        objRecord.record["顧客番号"]["lookup"] = true;
        //屋号情報セット
        await SetYagoOption(objRecord);
        return 1;
      }


        //結果出力
        list = kokyakutitle;
        var recordno2;
        var kokyakuno2;
        var kokyakunm2;
        var furigana2;
        var adyago2;
        var adyagofuri2;
        var daihyosya2;
        var daihyosyafuri2;
        for(let i = 0 ; i<data2.length ; i++){
          if(recordno2 != data2[i]['レコード番号'] || kokyakuno2 !=data2[i]['顧客番号'] || kokyakunm2 != data2[i]['顧客名'] || furigana2 != data2[i]['フリガナ'] ||
            adyago2 !=  data2[i]['住所使用屋号'] ||  adyagofuri2 !=data2[i]['住所使用屋号フリガナ'] || daihyosya2 != data2[i]['代表者氏名'] ||daihyosyafuri2 !=data2[i]['代表者フリガナ'] ){
            list = list + '<td><button class="sentaku">選択</button></td>' ;
            list = list + '<td><button class="syosai">詳細</button><input type="hidden" value=' + data2[i]['レコード番号'] + '> </td>' ;
            list = list + '<td>' + data2[i]['顧客番号'] + '</td><td>' + data2[i]['顧客名'] + '</td><td>' + data2[i]['フリガナ'] + '</td>' ;
            list = list + '<td>' + data2[i]['住所使用屋号'] + '</td><td>' + data2[i]['住所使用屋号フリガナ'] + '</td>' ;
            list = list + '<td>' + data2[i]['代表者氏名'] + '</td><td>' + data2[i]['代表者フリガナ'] + '</td><td>' + data2[i]['請求代表'] + '</td>' ;
            list = list +'<tr>';

            recordno2=data2[i]['レコード番号'];
            kokyakuno2=data2[i]['顧客番号'];
            kokyakunm2=data2[i]['顧客名'];
            furigana2=data2[i]['フリガナ'];
            adyago2=data2[i]['住所使用屋号'];
            adyagofuri2=data2[i]['住所使用屋号フリガナ'];
            daihyosya2=data2[i]['代表者氏名'];
            daihyosyafuri2=data2[i]['代表者フリガナ'];
            }
        }
        list=list+ '</table></div>';

        // ダイアログを作成
        var dialog = document.createElement('div');
        dialog.innerHTML = ' <dialog class="dialog"><h3>顧客検索結果</h3>' + list + '<div class="close"><button class="button">閉じる</button>><button class="otherbutton">もしかして候補</button></div></dialog>';
        // ダイアログを表示
         document.body.appendChild(dialog);
         const dialogDemo = document.querySelector('.dialog');
         // 閉じるボタン
         const closeBtn = document.querySelector('.button');
         // 閉じるボタンがクリックされたときダイアログを閉じる
         closeBtn.addEventListener('click', () => {
           dialogDemo.close();
           dialogDemo.remove();
           hideSpinner();
         });
         // もしかして候補
         const otherBtn = document.querySelector('.otherbutton');
         // 閉じるボタンがクリックされたときダイアログを閉じる
         otherBtn.addEventListener('click',  async function(e) {
         dialogDemo.close();
         dialogDemo.remove();
           if(await DialogOther("")==0){
             hideSpinner();
             alert("該当の顧客が存在しません。");
          }
        });
         // 選択ボタン
         //const sentakuBtn = document.querySelector('.sentaku');
         $(document).on('click', '.sentaku',  async function(e) {
           await ClearData();
           var objRecord = kintone.app.record.get();
         //sentakuBtn.addEventListener('click', () => {
           const kokyakuno=$(this).parent().next().next().text()
           objRecord.record.顧客番号.value=kokyakuno;
           objRecord.record["顧客番号"]["lookup"] = true;
           //屋号情報セット
           await SetYagoOption(objRecord);
           //kintone.app.record.set(objRecord);
           dialogDemo.close();
           dialogDemo.remove();
           hideSpinner();
         });
         // 詳細ボタン
         //const sentakuBtn = document.querySelector('.sentaku');
         $(document).on('click', '.syosai',  async function(e) {
           await ClearData();
           var objRecord = kintone.app.record.get();
         //sentakuBtn.addEventListener('click', () => {
          recordno=$(this).next().val();
           var redirectUrl = 'https://' + SUB_DMAIN + '.cybozu.com/k/' + APP_CUSTMERLIST + '/show#record=' + recordno;
           window.open(redirectUrl);
         });

         dialogDemo.showModal();
     }
    return data2.length;
  }
  return 0;
}

async function DialogOther(msg){
  const client = new KintoneRestAPIClient();
  var spc = kintone.app.record.getSpaceElement('yagolist');
  var objRecord = kintone.app.record.get();
  var record=objRecord.record;
  var day = record.日付.value;
  var stratena=record.宛名検索.value;  // リクエストパラメータの設定
  var list;
  var recordno;
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
  var seikyudaihyo;
  //条件分割
  var data=[];
  var data2=[];
  // リクエストパラメータの設定
  const params = {
    app: APP_CUSTMERLIST,     // アプリID
    condition: '(退会日 >= \"' + day + '\" or 退会日 = \"\" )  ',  // 条件
    orderBy: 'レコード番号 asc',           // 順番
    withCursor: true              // カーソル有無
  };
  const params2 = {
    app: APP_YAGO,     // アプリID
    condition:'団体名法人名屋号 !=  \"\" ',  // 条件
    orderBy: 'レコード番号 asc',           // 順番
    withCursor: true              // カーソル有無
  };
  //顧客データを取得
  const resp = await client.record.getAllRecords(params);
  //会社・所属データを取得
  const resp2 = await client.record.getAllRecords(params2);
  var rowdata;
  //項目
  kokyakuno="";
  kokyakunm="";
  furigana="";
  keiyakumeigi="";
  keiyakumeigifuri="";
  syozoku="";
  syozokufuri="";
  daihyosya="";
  daihyosyafuri="";
  seikyudaihyo="";
  if(resp.length!=0){
    var stratenas=stratena.split("、");
    for(let i=0;i<resp.length;i++){
      //
      if(resp[i]['レコード番号'].value){
        recordno=resp[i]['レコード番号'].value;
      }
      if(resp[i]['顧客番号'].value){
        kokyakuno=resp[i]['顧客番号'].value;
      }
      if(resp[i]['顧客名'].value){
        kokyakunm=resp[i]['顧客名'].value;
      }
      if(resp[i]['フリガナ'].value){
        furigana=resp[i]['フリガナ'].value;
      }
      if(resp[i]['契約名義'].value){
        keiyakumeigi=resp[i]['契約名義'].value;
      }
      if(resp[i]['契約名義フリガナ'].value){
        keiyakumeigifuri=resp[i]['契約名義フリガナ'].value;
      }
      if(resp[i]['チェックボックス'].value){
        seikyudaihyo=resp[i]['チェックボックス'].value;
      }
      if(resp2.length !=0){
        //所属会社名1
        if(resp[i]['所属・会社名１'].value){
          SetData2(resp[i]['所属・会社名１'].value,resp2,data2,recordno,kokyakuno,kokyakunm,furigana,keiyakumeigi,keiyakumeigifuri,seikyudaihyo);
        }
        //所属会社名2
        if(resp[i]['所属会社名2'].value){
          SetData2(resp[i]['所属会社名2'].value,resp2,data2,recordno,kokyakuno,kokyakunm,furigana,keiyakumeigi,keiyakumeigifuri,seikyudaihyo);
        }
        //所属会社名3
        if(resp[i]['所属会社名3'].value){
          SetData2(resp[i]['所属会社名3'].value,resp2,data2,recordno,kokyakuno,kokyakunm,furigana,keiyakumeigi,keiyakumeigifuri,seikyudaihyo);
        }
        //所属会社名4
        if(resp[i]['所属会社名4'].value){
          SetData2(resp[i]['所属会社名4'].value,resp2,data2,recordno,kokyakuno,kokyakunm,furigana,keiyakumeigi,keiyakumeigifuri,seikyudaihyo);
        }
        //所属会社名5
        if(resp[i]['所属会社名5'].value){
          SetData2(resp[i]['所属会社名5'].value,resp2,data2,recordno,kokyakuno,kokyakunm,furigana,keiyakumeigi,keiyakumeigifuri,seikyudaihyo);
        }
      }else{
        data2.push({
            'レコード番号':recordno,
            '顧客番号':kokyakuno,
            '顧客名':kokyakunm,
            'フリガナ':furigana,
            '契約名義':keiyakumeigi,
            '契約名義フリガナ':keiyakumeigifuri,
            '所属会社名':syozoku,
            '所属会社名フリガナ':syozokufuri,
            '代表者氏名':daihyosya,
            '代表者氏名フリガナ':daihyosyafuri,
            '請求代表':seikyudaihyo,
        })
      }
    }
    //検索条件分割分繰り返す
    kokyakunm="";
    furigana="";
    keiyakumeigi="";
    keiyakumeigifuri="";
    syozoku="";
    syozokufuri="";
    daihyosya="";
    daihyosyafuri="";
    for(let x=0;x<stratenas.length;x++){
      data=data2;
      data2=[];
      var strsearch=stratenas[x];
      for(let i=0;i<data.length;i++){


        //顧客名、顧客名フリガナ、契約名義、契約名義フリガナ、所属会社名、所属会社名フリガナ、代表者名、代表者名フリガナ、
        if((data[i]['顧客名'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1 || data[i]['フリガナ'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1 ||
            data[i]['契約名義'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1 || data[i]['契約名義フリガナ'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1 ||
            data[i]['所属会社名'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1 || data[i]['所属会社名フリガナ'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1 ||
            data[i]['代表者氏名'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1 || data[i]['代表者氏名フリガナ'].toUpperCase().indexOf(strsearch.toUpperCase()) != -1) ){

          if(kokyakunm != data[i]['顧客名'] || furigana !=data[i]['フリガナ'] || keiyakumeigi != data[i]['契約名義'] || keiyakumeigifuri !=data[i]['契約名義フリガナ'] ||
             syozoku != data[i]['所属会社名'] || syozokufuri !=data[i]['所属会社名フリガナ'] ||daihyosya != data[i]['代表者氏名'] || daihyosyafuri !=data[i]['代表者氏名フリガナ'] )
          {
               data2.push(data[i]);
               kokyakunm=data[i]['顧客名'];
               furigana=data[i]['フリガナ'];
               keiyakumeigi=data[i]['契約名義'];
               keiyakumeigifuri=data[i]['契約名義フリガナ'];
               syozoku=data[i]['所属会社名'];
               syozokufuri=data[i]['所属会社名フリガナ'];
               daihyosya=data[i]['代表者氏名'];
               daihyosyafuri=data[i]['代表者氏名フリガナ'];
          }
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
        list = list + '<td><button class="syosai">詳細</button><input type="hidden" value=' + data2[i]['レコード番号'] + '> </td>' ;
        list = list + '<td>' + data2[i]['顧客番号'] + '</td><td>' + data2[i]['顧客名'] + '</td>' ;
        list = list + '<td>' + data2[i]['契約名義'] + '</td><td>' + data2[i]['契約名義フリガナ'] + '</td>' ;
        list = list + '<td>' + data2[i]['所属会社名'] + '</td><td>' + data2[i]['所属会社名フリガナ'] + '</td>' ;
        list = list + '<td>' + data2[i]['代表者氏名'] + '</td><td>' + data2[i]['代表者氏名フリガナ'] + '</td>' ;
        list = list + '<td>' + data2[i]['請求代表'] + '</td>' ;
        list = list +'<tr>';
    }
     list=list+ '</table></div>';

     // ダイアログを作成
     var dialog = document.createElement('div');
     dialog.innerHTML = ' <dialog class="dialog"><h3>' + msg + 'もしかして、こちらの方でしょうか？</h3>' + list + '<div class="close"><button class="button">閉じる</button></div></dialog>';
      // ダイアログを表示
      document.body.appendChild(dialog);
      const dialogDemo = document.querySelector('.dialog');
      // 閉じるボタン
      const closeBtn = document.querySelector('.button');
      // 閉じるボタンがクリックされたときダイアログを閉じる
      closeBtn.addEventListener('click', () => {
      dialogDemo.close();
      dialogDemo.remove();
      hideSpinner();
      });
      // 選択ボタン
      //const sentakuBtn = document.querySelector('.sentaku');
      $(document).on('click', '.sentaku',  async function(e) {
        await ClearData();
        var objRecord = kintone.app.record.get();
      //sentakuBtn.addEventListener('click', () => {
        const kokyakuno=$(this).parent().next().next().text();
        objRecord.record.顧客番号.value=kokyakuno;
        objRecord.record["顧客番号"]["lookup"] = true;
        //屋号情報セット
        await SetYagoOption(objRecord);
        //kintone.app.record.set(objRecord);
        dialogDemo.close();
        dialogDemo.remove();
        hideSpinner();
      });
      // 詳細ボタン
      //const sentakuBtn = document.querySelector('.sentaku');
      $(document).on('click', '.syosai',  async function(e) {
        await ClearData();
        var objRecord = kintone.app.record.get();
      //sentakuBtn.addEventListener('click', () => {
      recordno=$(this).next().val();
       var redirectUrl = 'https://' + SUB_DMAIN + '.cybozu.com/k/' + APP_CUSTMERLIST + '/show#record=' + recordno;
        window.open(redirectUrl);
      });
      dialogDemo.showModal();
      return data2.length;
  }
  return 0;
}

 async function ClearData(){
   var objRecord = kintone.app.record.get();
   var record=objRecord.record;
   var custno = objRecord.record.顧客番号.value;
   objRecord.record.顧客番号.lookup = 'CLEAR';
   objRecord.record.プランリスト.value=[];
   objRecord.record.オプションリスト.value=[];
   objRecord.record.屋号使用オプションリスト.value=[];
   objRecord.record.郵送先変更依頼.value=[];
   objRecord.record.転送カラム設定用.value="";
   if(SHOP_NM !="梅田"){
     objRecord.record.ポスト判別用.value="";
   }
   await kintone.app.record.set(objRecord);
 }
  async function SetYagoOption(objRecord){
    var custno = objRecord.record.顧客番号.value;
    var day =objRecord.record.日付.value;
    var blnYHit=false;
    var blnPHit=false;
    var body = {
        app: APP_CUSTMERLIST,
        query: "顧客番号 = \"" + custno + "\" and " +
            "(退会日 >= \"" + day + "\" or 退会日 = \"\" )  " +
           "order by レコード番号 "
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
            if(opt[j]['value']['住所使用屋号'].value != "" && opt[j]['value']['オプション利用開始日'].value <= day &&
                ( opt[j]['value']['オプション利用終了日'].value >= day || opt[j]['value']['オプション利用終了日'].value==null)){
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
            //郵便転送
            if(opt[j]['value']['オプション'].value.indexOf("郵便物転送") != -1 && opt[j]['value']['オプション利用開始日'].value <= day &&
                ( opt[j]['value']['オプション利用終了日'].value >= day || opt[j]['value']['オプション利用終了日'].value==null)){
                  objRecord.record['転送カラム設定用'].value="郵便転送";
                  blnPHit=true;
            }
            if(!blnPHit){
                objRecord.record['転送カラム設定用'].value="";
            }
            //専用ポスト
            if(opt[j]['value']['オプション'].value.indexOf("専用ポスト") != -1 && opt[j]['value']['オプション利用開始日'].value <= day &&
                ( opt[j]['value']['オプション利用終了日'].value >= day || opt[j]['value']['オプション利用終了日'].value==null)){
                  if(SHOP_NM !="梅田"){
                    objRecord.record['ポスト判別用'].value="ポスト";
                  }
                  blnYHit=true;
            }
            if(!blnYHit){
              if(SHOP_NM !="梅田"){
                objRecord.record['ポスト判別用'].value="";
              }

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



  function SetData2(search,resp2,data2,recordno,kokyakuno,kokyakunm,furigana,keiyakumeigi,keiyakumeigifuri,seikyudaihyo){
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
        'レコード番号':recordno,
        '顧客番号':kokyakuno,
        '顧客名':kokyakunm,
        'フリガナ':furigana,
        '契約名義':keiyakumeigi,
        '契約名義フリガナ':keiyakumeigifuri,
        '所属会社名':syozoku,
        '所属会社名フリガナ':syozokufuri,
        '代表者氏名':daihyosya,
        '代表者氏名フリガナ':daihyosyafuri,
        '請求代表':seikyudaihyo,
    })
  }


  var showEvents2 = [
    "app.record.create.change.オプション名",
    "app.record.edit.change.オプション名",
    "app.record.create.change.OP利用開始日",
    "app.record.edit.change.OP利用開始日",
    "app.record.create.change.OP利用終了日",
    "app.record.edit.change.OP利用終了日",
    "app.record.create.change.オプションリスト",
    "app.record.edit.change.オプションリスト",
  ];
  //オプション変更時
  kintone.events.on(showEvents2, function(e) {
    var blnYHit=false;
    var blnPHit=false;
    var day = e.record.日付.value;
    var subTable = e.record['オプションリスト'].value;
    for(let i=0;i<subTable.length;i++){
      //郵便転送
      if(subTable[i]['value']['オプション名'].value && subTable[i]['value']['オプション名'].value.indexOf("郵便物転送") != -1 && subTable[i]['value']['OP利用開始日'].value <= day &&
          ( subTable[i]['value']['OP利用終了日'].value >= day || !subTable[i]['value']['OP利用終了日'].value)){
            e.record['転送カラム設定用'].value="郵便転送";
            blnYHit=true;
      }
      //専用ポスト
      if(subTable[i]['value']['オプション名'].value && subTable[i]['value']['オプション名'].value.indexOf("専用ポスト") != -1 && subTable[i]['value']['OP利用開始日'].value <= day &&
          ( subTable[i]['value']['OP利用終了日'].value >= day || !subTable[i]['value']['OP利用終了日'].value)){
            if(SHOP_NM !="梅田"){
              e.record['ポスト判別用'].value="ポスト";
            }
            blnPHit=true;
      }
    }
    if(!blnYHit){
      e.record['転送カラム設定用'].value="";
    }
    if(!blnPHit){
      if(SHOP_NM !="梅田"){
        e.record['ポスト判別用'].value="";
      }
    }
    return e;
  });


  var showEvents3 = [
    "app.record.create.change.転送担当",
    "app.record.edit.change.転送担当",
  ];
  //転送担当変更時
  kintone.events.on(showEvents3, function(e) {
    if(e.record['転送担当'].value){
        e.record['転送一覧の並替用'].value=SHOP_NM;
    }else{
      e.record['転送一覧の並替用'].value="";
    }
    return e;
  });

  // スピナーを動作させる関数
  function showSpinner() {
      // 要素作成等初期化処理
      if ($('.kintone-spinner').length == 0) {
          // スピナー設置用要素と背景要素の作成
          var spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
          var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');

          // スピナー用要素をbodyにappend
          $(document.body).append(spin_div, spin_bg_div);

          // スピナー動作に伴うスタイル設定
          $(spin_div).css({
              'position': 'fixed',
              'top': '50%',
              'left': '50%',
              'z-index': '510',
              'background-color': '#fff',
              'padding': '26px',
              '-moz-border-radius': '4px',
              '-webkit-border-radius': '4px',
              'border-radius': '4px'
          });

          $(spin_bg_div).css({
              'position': 'fixed',
              'top': '0px',
              'left': '0px',
              'z-index': '500',
              'width': '100%',
              'height': '200%',
              'background-color': '#000',
              'opacity': '0.5',
              'filter': 'alpha(opacity=50)',
              '-ms-filter': "alpha(opacity=50)"
          });

          // スピナーに対するオプション設定
          var opts = {
              'color': '#000'
          };

          // スピナーを作動
          new Spinner(opts).spin(document.getElementById('kintone-spin'));
      }

      // スピナー始動（表示）
      $('.kintone-spinner').show();
  }

  // スピナーを停止させる関数
  function hideSpinner() {
      // スピナー停止（非表示）
      $('.kintone-spinner').hide();
  }

})(jQuery);
