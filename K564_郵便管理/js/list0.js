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
  var APP_CUSTMERLIST = 447; //会員顧客名簿
  var APP_TAIO = 444; //会員対応管理
  var APP_YAGO = 459; //屋号
  var kokyakutitle= '' +
          '<div style="margin-left:15px">' +
          '<table class="subtable-gaia reference-subtable-gaia">' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:50px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 50px;">選択</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">顧客番号</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">顧客名</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">フリガナ</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">契約名義</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">契約名義フリガナ</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">所属会社名1</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">所属会社名1フリガナ</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">所属会社名2</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">所属会社名3</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">所属会社名4</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 150px;">所属会社名5</span></th>' +
          '<tr>';
  // var yagotitle= '' +
  //         '<div style="margin-left:15px">' +
  //         '<table class="subtable-gaia reference-subtable-gaia">' +
  //         '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
  //         '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">顧客番号</span></th>' +
  //         '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
  //         '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">顧客名</span></th>' +
  //         '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
  //         '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">オプション</span></th>' +
  //         '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
  //         '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">OP利用開始日</span></th>' +
  //         '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
  //         '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">OP利用終了日</span></th>' +
  //         '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
  //         '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">住所使用「屋号」</span></th>' +
  //         '<tr>';
  // var yagotitle2= '' +
  //         '<div style="margin-left:15px">' +
  //         '<table class="subtable-gaia reference-subtable-gaia">' +
  //         '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
  //         '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">団体名・法人名・屋号</span></th>' +
  //         '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
  //         '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">契約名義</span></th>' +
  //         '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
  //         '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">代表者氏名</span></th>' +
  //         '<tr>';
  var yusotitle='' +
          '<div style="margin-left:15px">' +
          '<table class="subtable-gaia reference-subtable-gaia">' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">受付日時</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">郵送開始日</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">郵送終了日</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:100px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">郵送先</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 100px;">今回のみ郵送先</span></th>' +
          '<tr>';

  //顧客リスト表示
  kintone.events.on(showEvents, function(e) {
    var spc = kintone.app.record.getSpaceElement('btn1');
    var spclist = kintone.app.record.getSpaceElement('yagolist');
    var spclist2 = kintone.app.record.getSpaceElement('yagolist2');
    var spclist3  = kintone.app.record.getSpaceElement('yusolist');
    var spcpopup  = kintone.app.record.getSpaceElement('popup');

    var srcGetConstlist = '' +
      '<div id="emxas-get-list">' +
      '<div><span>&nbsp;</span></div>' +
      '<div><button id="emxas-button-list">屋号情報検索</button></div>' +
      '</div>';
    $(spc).html(srcGetConstlist);
    // var list = yagotitle +
    //        '</table></div>';
    // $(spclist).html(list);
    //
    // var list2 = yagotitle2 +
    //        '</table></div>';
    // $(spclist2).html(list2);
    //
    // var list3 = yusotitle +
    //        '</table></div>';
    // $(spclist3).html(list3);


    return e;
  });


  //クリックイベント
  $(document).on('click', '#emxas-button-list',  async function(e) {
    try{

      var spc = kintone.app.record.getSpaceElement('yagolist');
      var spc2 = kintone.app.record.getSpaceElement('yagolist2');
      var objRecord = kintone.app.record.get();
      var record=objRecord.record;
      var day = record.日付.value;
      var search1=record.屋号検索.value;
      var list;

      var body = {
        app: APP_CUSTMERLIST,
        query: "(" +
              "顧客名 like \"" + search1 + "\" or " +
              "フリガナ like \"" + search1 + "\" or " +
              "所属・会社名１ like \"" + search1 + "\" or " +
              "所属・会社名1_フリガナ like \"" + search1 + "\" or " +
              "所属会社名2 like \"" + search1 + "\" or " +
              "所属会社名3 like \"" + search1 + "\" or " +
              "所属会社名4 like \"" + search1 + "\" or " +
              "所属会社名5 like \"" + search1 + "\"  " +
            　" ) and " +
              "(退会日 >= \"" + day + "\" or 退会日 = \"\" )  " +
          "order by レコード番号 limit 500"
      };


      // //テーブル初期化
      // var list = yagotitle;
      // list=list+ '</table></div>';
      // $(spc).html(list);
      // var list2 = yagotitle2;
      // list2=list2+ '</table></div>';
      // $(spc2).html(list2);
      // objRecord.record.チェック結果.value="";
      //屋号検索
      if(search1){
        //顧客データを取得
        const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET',  body);
        var rec=resp.records;
        if(rec.length!=0){
          if(rec.length==1){
            objRecord.record.顧客番号.value=rec[0]['顧客番号'].value;
            objRecord.record["顧客番号"]["lookup"] = true;
            //屋号情報セット
            SetYagoOption(objRecord);
            //kintone.app.record.set(objRecord);
          }else{
            list = kokyakutitle;
            for(let i = 0 ; i<rec.length ; i++){
                    list = list + '<td><button class="sentaku">選択</button></td>' ;
                    list = list + '<td>' + rec[i]['顧客番号'].value + '</td><td>' + rec[i]['顧客名'].value + '</td><td>' + rec[i]['フリガナ'].value + '</td>' ;
                    list = list + '<td>' + rec[i]['所属・会社名１'].value + '</td><td>' + rec[i]['所属・会社名1_フリガナ'].value + '</td>' ;
                    list = list + '<td>' + rec[i]['所属会社名2'].value + '</td>' ;
                    list = list + '<td>' + rec[i]['所属会社名3'].value + '</td>' ;
                    list = list + '<td>' + rec[i]['所属会社名4'].value + '</td>' ;
                    list = list + '<td>' + rec[i]['所属会社名5'].value + '</td>' ;
                    list = list +'<tr>';
                }
               list=list+ '</table></div>';
                // ダイアログを作成
                var dialog = document.createElement('div');
                dialog.innerHTML = ' <dialog class="dialog"><h3>顧客検索結果</h3>' + list + '<div class="close"><button class="button">閉じる</button></div></dialog>';

              //   // ダイアログを表示
                 document.body.appendChild(dialog);
                 const dialogDemo = document.querySelector('.dialog');
                 // 閉じるボタン
                const closeBtn = document.querySelector('.button');
                // 閉じるボタンがクリックされたときダイアログを閉じる
                closeBtn.addEventListener('click', () => {
                  dialogDemo.close();
                });
                // 選択ボタン
               //const sentakuBtn = document.querySelector('.sentaku');
               $(document).on('click', '.sentaku',  async function(e) {
               //sentakuBtn.addEventListener('click', () => {
                 const kokyakuno=$(this).parent().next().text();
                 objRecord.record.顧客番号.value=kokyakuno;
                 objRecord.record["顧客番号"]["lookup"] = true;
                 //屋号情報セット
                 SetYagoOption(objRecord);
                 //kintone.app.record.set(objRecord);
                 dialogDemo.close();
               });
                dialogDemo.showModal();
          }

          // //list =list + '</ul></details>' ;
          // $(spc).html(list);
        }else{
          alert("該当の顧客が存在しません。");
        }
    }
    //   //屋号検索
    //   if(search1){
    //   //住所使用「屋号」データを取得
    //   const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET',  body);
    //   var rec=resp.records;
    //     if(rec.length!=0){
    //
    //       list = yagotitle;
    //       for(let i = 0 ; i<rec.length ; i++){
    //         var opt=rec[i]['オプション利用'].value;
    //         //住所使用屋号に入力あり生きているオプション
    //         for(let j =0 ;j<opt.length;j++){
    //           if(opt[j]['value']['住所使用屋号'].value != "" && opt[j]['value']['オプション利用開始日'].value <= day && ( opt[j]['value']['オプション利用終了日'].value >= day || opt[j]['value']['オプション利用終了日'].value==null)){
    //               list = list + '<td>' + rec[i]['顧客番号'].value + '</td><td>' + rec[i]['顧客名'].value + '</td><td>' + opt[j]['value']['オプション'].value + '</td>' ;
    //               list = list + '<td>' + opt[j]['value']['オプション利用開始日'].value + '</td><td>' + opt[j]['value']['オプション利用終了日'].value + '</td><td>' + opt[j]['value']['住所使用屋号'].value + '</td>' ;
    //               list = list +'<tr>';
    //
    //             objRecord.record.チェック結果.value="屋号オプションあり";
    //             }
    //           }
    //       }
    //       list=list+ '</table></div>';
    //       //list =list + '</ul></details>' ;
    //       $(spc).html(list);
    //     }else{
    //
    //       //住所使用屋号がなければ、屋号
    //       body = {
    //         app: APP_YAGO,
    //         query: "(文字列__1行_ like \"" + search1 + "\" or " +
    //               "契約名義 like \"" + search1 + "\" ) " +
    //               "order by レコード番号 limit 500"
    //       };
    //       const resp2 = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET',  body);
    //       var rec2=resp2.records;
    //       if(rec2.length !=0){
    //         var daihyo =record.代表者名検索.value;
    //
    //         var blnHit=false;
    //         list2 = yagotitle2;
    //         for(let i = 0 ; i<rec2.length ; i++){
    //           blnHit=false;
    //           //代表者あり
    //           if(daihyo){
    //             //代表者と検索代表者が同じ
    //             if(daihyo == rec2[i]['氏'].value){
    //               objRecord.record.チェック結果.value="所属・会社名あり、代表者あり";
    //             }else{
    //               objRecord.record.チェック結果.value="所属・会社名あり、代表者該当なし";
    //             }
    //            }else{
    //             objRecord.record.チェック結果.value="所属・会社名あり";
    //           }
    //           list2 = list2 + '<td>' + rec2[i]['文字列__1行_'].value + '</td><td>' + rec2[i]['契約名義'].value + '</td><td>' + rec2[i]['氏'].value + '</td>' ;
    //           list2 = list2 +'<tr>';
    //         }
    //       }else{
    //         objRecord.record.チェック結果.value="屋号なし";
    //       }
    //       list2=list2+ '</table></div>';
    //       //list =list + '</ul></details>' ;
    //       $(spc2).html(list2);
    //
    //     }
    // }
    // kintone.app.record.set(objRecord);
    }catch(e) {
      // error
      console.log(e);
    }
    return e;
  });

  async function SetYagoOption(objRecord){
    var blnHit=false;
    var blnHit2=false;
    var custno = objRecord.record.顧客番号.value;
    var day =objRecord.record.日付.value;
    var body = {
        app: APP_CUSTMERLIST,
        query: "顧客番号 = \"" + custno + "\" and " +
            "(退会日 >= \"" + day + "\" or 退会日 = \"\" )  " +
           "order by レコード番号 limit 500"
    };
    const res = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
    var rec=res.records;
    if(rec.lengh !=0){
      //var list = yagotitle;
        for(let i = 0 ; i<rec.length ; i++){
          var opt = rec[i]['オプション利用'].value;
          for(let j=0;j<opt.length;j++){
            if(opt[j]['value']['住所使用屋号'].value != "" && opt[j]['value']['オプション利用開始日'].value <= day && ( opt[j]['value']['オプション利用終了日'].value >= day || opt[j]['value']['オプション利用終了日'].value==null)){
              objRecord.record.屋号使用オプションリスト.value.push({
                value: {
                  オプション名: {
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
                    type: 'DATE',
                  }
                }
              });
              blnHit=true;
            }
          }
        }
        if(!blnHit){
          //所属会社1～5と代表者名
          var kaisya=[];
          if(objRecord.record.所属会社名１.value != ""){
            kaisya.push(objRecord.record.所属会社名１.value);
          }
          if(objRecord.record.所属会社名2.value != ""){
            kaisya.push(objRecord.record.所属会社名2.value);
          }
          if(objRecord.record.所属会社名3.value != ""){
            kaisya.push(objRecord.record.所属会社名3.value);
          }
          if(objRecord.record.所属会社名4.value != ""){
            kaisya.push(objRecord.record.所属会社名4.value);
          }
          if(objRecord.record.所属会社名5.value != ""){
            kaisya.push(objRecord.record.所属会社名5.value);
          }
          for(let i=0;i<kaisya.length;i++){
            var body2 = {
                  app: APP_YAGO,
                  query: "団体名法人名屋号 = \"" + kaisya[i] + "\"  "
                };
                const res2= await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body2);
                var rec2=res2.records;
                for(let j = 0 ; j<rec2.length ; j++){
                      objRecord.record.所属会社リスト.value.push({
                        value: {
                          所属・会社名: {
                            value: rec2[j]['団体名法人名屋号'].value,
                            type: 'SINGLE_LINE_TEXT',
                          },
                          代表者氏名: {
                            value: rec2[j]['氏'].value,
                            type: 'SINGLE_LINE_TEXT',
                          }
                        }
                      });
                      //代表者名未入力
                      if(objRecord.record.代表者名検索.value ===  undefined){
                        blnHit2=true;

                      //代表者名入力あり合致
                      }else if(objRecord.record.代表者名検索.value == rec2[j]['氏'].value){
                        blnHit2=true;
                      }else{
                        blnHit2=false;
                      }
                  }
              }
          }
      }else{

      }
      kintone.app.record.set(objRecord);
  }
  var showEvents2 = [
    "app.record.create.change.顧客番号2",
    "app.record.edit.change.顧客番号2"
  ];
  kintone.events.on( showEvents2,  function(event) {
    var tbl1 = [];
    var tbl2 = [];
    var blnHit=false;
    var blnHit2=false;
    var record=event.record;
    var custno = record.顧客番号.value;
    var custname=record.代表者名検索.value;
    var day = record.日付.value;
    record.屋号使用オプションリスト.value=tbl1;
    record.所属会社リスト.value=tbl2;
    var body = {
        app: APP_CUSTMERLIST,
        query: "顧客番号 = \"" + custno + "\" and " +
            "(退会日 >= \"" + day + "\" or 退会日 = \"\" )  " +
           "order by レコード番号 limit 500"
    };

    if(custno != ""){
      //使用している屋号オプション
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body, async (res) => {
        var rec=res.records;
        if(rec.lengh !=0){
          //var list = yagotitle;
            for(let i = 0 ; i<rec.length ; i++){
              var opt = rec[i]['オプション利用'].value;
              for(let j=0;j<opt.length;j++){
                if(opt[j]['value']['住所使用屋号'].value != "" && opt[j]['value']['オプション利用開始日'].value <= day && ( opt[j]['value']['オプション利用終了日'].value >= day || opt[j]['value']['オプション利用終了日'].value==null)){
                  record.屋号使用オプションリスト.value.push({
                    value: {
                      オプション名: {
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
                        type: 'DATE',
                      }
                    }
                  });
                  blnHit=true;
                }
              }
              //セット
              kintone.app.record.set({record: record});
            }

            if(!blnHit){
              //所属会社1～5と代表者名
              var kaisya=[];
              if(record.所属会社名１.value != ""){
                kaisya.push(record.所属会社名１.value);
              }
              if(record.所属会社名2.value != ""){
                kaisya.push(record.所属会社名2.value);
              }
              if(record.所属会社名3.value != ""){
                kaisya.push(record.所属会社名3.value);
              }
              if(record.所属会社名4.value != ""){
                kaisya.push(record.所属会社名4.value);
              }
              if(record.所属会社名5.value != ""){
                kaisya.push(record.所属会社名5.value);
              }
              for(let i=0;i<kaisya.length;i++){
              var body2 = {
                    app: APP_YAGO,
                    query: "団体名法人名屋号 = \"" + kaisya[i] + "\"  "
                  };
                  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body2, function(res2) {
                    var rec2=res2.records;
                    for(let j = 0 ; j<rec2.length ; j++){
                          record.所属会社リスト.value.push({
                            value: {
                              所属・会社名: {
                                value: rec2[j]['団体名法人名屋号'].value,
                                type: 'SINGLE_LINE_TEXT',
                              },
                              代表者氏名: {
                                value: rec2[j]['氏'].value,
                                type: 'SINGLE_LINE_TEXT',
                              }
                            }
                          });
                          //代表者名未入力
                          if(custname ===  undefined){
                            blnHit2=true;

                          //代表者名入力あり合致
                          }else if(custname == rec2[j]['氏'].value){
                            blnHit2=true;
                          }else{
                            blnHit2=false;
                          }
                      }
                  });
              };
            }
        }else{
          //所属会社と代表者氏名を取得


        }


        //セット
        await　kintone.app.record.set({record: record});

          var paramGet = {
              'app': APP_TAIO,
              'query': "ルックアップ = \"" + custno + "\" " +
                       "and 問い合わせ種別 in (\"１１、郵送先変更依頼\") " +
                       "order by レコード番号"
          };
          //郵送依頼対応
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', paramGet, function(resyuso) {
          var rec=resyuso.records;
          var list = yusotitle;
            for(let i = 0 ; i<rec.length ; i++){
                    list = list + '<td>' + rec[i]['受付日時'].value + '</td><td>' + rec[i]['郵送開始日'].value + '</td>' ;
                    list = list + '<td>' + rec[i]['郵送終了日'].value + '</td><td>' + rec[i]['郵送先'].value + '</td><td>' + rec[i]['郵送先今回のみ'].value + '</td>' ;
                    list = list +'<tr>';
            }
            list=list+ '</table></div>';
            //$(spc2).html(list);
          });
      });
      //list =list + '</ul></details>' ;
    }
    return event;

  });


})(jQuery);
