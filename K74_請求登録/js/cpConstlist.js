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
    "app.record.edit.show"
  ];
  var confirm = '' +
    '<div class="emxas-confirm">' +
    '<div>請求明細に反映しますか？</div>' +
    '<div>（元のデータの下に足されます）</div>' +
    '<div class="emxas-confirm-button-area">' +
    '<button class="emxas-button-dialog-cancel">キャンセル</button>' +
    '<button class="emxas-button-dialog-ok">OK</button>' +
    '</div>' +
    '</div>';
  var message = '' +
    '<div class="emxas-alert">' +
    '<p></p>' +
    '</div>';
  //契約プラン・オプションリスト
  var constlist;
  //画面のレコード
  var objRecord;
  // プラン利用開始日・終了日
  var staDay ;
  var finDay ;
  var stateldt6;
  var stateldt2;
  // 通話明細開始日・終了日
  var staTelDay;
  var finTelDay ;
  var enddt6;
  var planenddt;
  var max;
  var invoicedt;
  var optenddt;
  var virtualdt;
  var firstdt;

  //var APP_CONSTLIST = 80;
  //var APP_TELLBILL = 81;
  //var APP_ITEM = 17;
  var APP_CONSTLIST = 447;
  var APP_TELLBILL = 461;
  var APP_ITEM = 458;
  var APP_SALES=446;
  var APP_MADO=505;
  var TEL_ITEM_NO=238;
  // ロケールを設定
  moment.locale('ja');

  /**
   *「請求明細一覧」サブテーブルを取得
   */
  var getSubtable = function() {
    var body = {
      "app": kintone.app.getId()
    };
    return kintone.api(kintone.api.url('/k/v1/form', true), 'GET', body).then(function(resp) {
      // success
      var properties = resp.properties;
      for (var i = 0; i < properties.length; i++) {
        if (properties[i]["code"] === "請求明細") {
          return properties[i];
        }
      }
      return null;
    });
  }

  /**
   * サブテーブル中のフィールドに値を設定する。
   * 対象のフィールド、値はパラメータで受け取る。
   */
  var getRowObject = function(subTable, setFileds) {
    var rowObject = {};
    for (var i = 0; i < subTable['fields'].length; i++) {
      rowObject[subTable['fields'][i]['code']] = {};
      rowObject[subTable['fields'][i]['code']]['type'] = subTable['fields'][i]['type'];
      //値設定対象の項目の場合、'value'に値を設定
      if (subTable['fields'][i]['code'] in setFileds) {
        rowObject[subTable['fields'][i]['code']]['value'] = setFileds[subTable['fields'][i]['code']];
      } else {
        rowObject[subTable['fields'][i]['code']]['value'] = null;
      }
    }
    return rowObject;
  }

  kintone.events.on(showEvents, function(e) {
    var spc = kintone.app.record.getSpaceElement('spcConstlist');
    var srcGetConstlist = '' +
      '<div id="emxas-get-schedule">'
      //スケジュール取得ボタン
      +
      '<button id="emxas-button-schedule">明細取得</button>' +
      confirm +
      message +
      '</div>';
    $(spc).html(srcGetConstlist);
    $('.emxas-confirm').hide();
    return e;
  });

  //取得ID変更時
  var showEvents3=[
    'app.record.edit.change.取得ID',
    'app.record.create.change.取得ID'
  ];
  kintone.events.on(showEvents3,  function(event) {
    staDay = moment().format("YYYY-MM-DD");
    var billDay = "";
  //処理
  var record=event.record;
  var custCd = record.取得ID.value;
  var param = {
    app: APP_CONSTLIST,
    query: "レコード番号 = \"" + custCd + "\" and " +
  //    "オプション利用開始日 <= \"" + staDay + "\" and " +
          "(退会日 = \"" + billDay + "\"  or 退会日 >= \"" + staDay + "\")"  +
      "order by レコード番号 desc"
  };
    //return kintoneUtility.rest.getAllRecordsByQuery(param).then(function(resp) {
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param, function(resp) {
      var setFields = {};
      var tbl = [];
      var j=0;
        var records = resp.records;
        if (records.length != 0) {
          for(var i=0;i<records.length;i++){
            for (var pTbl = 0; pTbl < records[i]['オプション利用']['value'].length; pTbl++) {
              var planList = records[i]['オプション利用'].value[pTbl].value;
                if(planList['契約番号'].value != ''){
                  tbl.push({
                        value:{
                          "契約電話番号": {
                            type:"SINGLE_LINE_TEXT",
                            value: planList['契約番号'].value
                          }
                        }
                      });

                }
            }
          }
        }else{
          tbl.push({
                value:{
                  "契約電話番号": {
                    type:"SINGLE_LINE_TEXT",
                    value: undefined
                  }
                }
              });

        }
        record.テーブル.value=tbl;
        //resetRowNo(record);
        kintone.app.record.set({record: record});
      });
  });
  //「明細取得ボタン」クリックイベント
  $(document).on('click', '#emxas-button-schedule', function(ev) {
    // 契約顧客アプリID
    objRecord = kintone.app.record.get();
    var record = objRecord['record'];
    invoicedt=record['請求日'].value;

    if(invoicedt===undefined){
      alert("請求日を入力してください。");
      return;
    }

     staDay = moment(invoicedt).add(1, 'month').endOf('month').format("YYYY-MM-DD");
     finDay = moment(invoicedt).add(1, 'month').startOf('month').format("YYYY-MM-DD");
    // 通話明細開始日・終了日
     staTelDay = moment(invoicedt).add(-2, 'month').startOf('month').format("YYYY-MM-DD");
     finTelDay = moment(invoicedt).add(-1, 'month').endOf('month').format("YYYY-MM-DD");
     enddt6=moment(invoicedt).add(6, 'months').endOf('month').format();
     var enddt=moment(invoicedt).endOf('month').format("YYYY-MM-DD");
　   var nextinvoicedt;
     var max;
     //通話料６か月前
     stateldt6=moment(invoicedt).add(-6, 'months').startOf('month').format();
     //通話料2か月前
     stateldt2=moment(invoicedt).add(-2, 'months').startOf('month').format();

    var custCd;
    var billDay = "";
    //ポップアップ表示箇所取得
    var pos = {
      'top': $(this).position().top + $(this).outerHeight,
      'left': $(this).position().left
    };
    //エラーメッセージ初期化
    $('.emxas-alert').hide();


    //取得ID
    if (record['取得ID'].value) {
      custCd = record['取得ID'].value;
      var param = {
        app: APP_CONSTLIST,
        query: "レコード番号 = \"" + custCd + "\" and " +
  //        "オプション利用開始日 <= \"" + staDay + "\" and " +
          " 入会日 <= \"" + enddt + "\" and " +
          "(退会日 = \"" + billDay + "\"  or 退会日 >= \"" + staDay + "\")" +
          "order by レコード番号 desc"
      };
      return kintoneUtility.rest.getAllRecordsByQuery(param).then(function(resp) {
        console.log(resp);
        var records = resp.records;
        if (records.length === 0) {
          //対象予定存在しないメッセージ
          var msg = '契約プラン・オプション一覧が存在しません。';
          $('.emxas-alert > p').text(msg);
          $('.emxas-alert').show();
        } else {
          constlist = records;
          //ポップアップ表示
          $('.emxas-confirm').css('left', pos.left);
          $('.emxas-confirm').css('top', pos.top);
          if ($('.emxas-confirm').is(':visible')) {
            $('.emxas-confirm').hide();
          } else {
            $('.emxas-confirm').show();
          }
        }
      });
    // 所属・会社名１がない場合は、顧客名をキーにする
  }else if (record['所属・会社名１'].value) {
      custCd = record['所属・会社名１'].value;
      var param = {
        app: APP_CONSTLIST,
        query: "所属・会社名１ = \"" + custCd + "\" and " +
    //      "オプション利用開始日 <= \"" + staDay + "\" and " +
          " 入会日 <= \"" + enddt + "\" and " +
          "(退会日 = \"" + billDay + "\"  or 退会日 >= \"" + staDay + "\")" +
          "order by レコード番号 desc"
      };
      return kintoneUtility.rest.getAllRecordsByQuery(param).then(function(resp) {
        console.log(resp);
        var records = resp.records;
        if (records.length === 0) {
          //対象予定存在しないメッセージ
          var msg = '契約プラン・オプション一覧が存在しません。';
          $('.emxas-alert > p').text(msg);
          $('.emxas-alert').show();
        } else {
          constlist = records;
          //ポップアップ表示
          $('.emxas-confirm').css('left', pos.left);
          $('.emxas-confirm').css('top', pos.top);
          if ($('.emxas-confirm').is(':visible')) {
            $('.emxas-confirm').hide();
          } else {
            $('.emxas-confirm').show();
          }
        }
      });
    } else if (record['顧客名'].value) {
      custCd = record['顧客名'].value;
      var param = {
        app: APP_CONSTLIST,
        query: "顧客名 = \"" + custCd + "\" and " +
  //        "オプション利用開始日 <= \"" + staDay + "\" and " +
          " 入会日 <= \"" + enddt + "\" and " +
          "(退会日 = \"" + billDay + "\"  or 退会日 >= \"" + staDay + "\")" +
          "order by レコード番号 desc"
      };
      return kintoneUtility.rest.getAllRecordsByQuery(param).then(function(resp) {
        console.log(resp);
        var records = resp.records;
        if (records.length === 0) {
          //対象予定存在しないメッセージ
          var msg = '契約プラン・オプション一覧が存在しません。';
          $('.emxas-alert > p').text(msg);
          $('.emxas-alert').show();
        } else {
          constlist = records;
          //ポップアップ表示
          $('.emxas-confirm').css('left', pos.left);
          $('.emxas-confirm').css('top', pos.top);
          if ($('.emxas-confirm').is(':visible')) {
            $('.emxas-confirm').hide();
          } else {
            $('.emxas-confirm').show();
          }
        }
      });
    } else {
      var msg = '所属・会社名１または顧客名を入力して下さい。';
      $('.emxas-alert > p').text(msg);
      $('.emxas-alert').show();
    }
  });

  //明細取得ダイアログ「OK」のクリックイベント
  $(document).on('click', '.emxas-button-dialog-ok', async (ev) => {
  try {
    var tbl = [];
    var nextinvoicedt;

    //画面の請求明細サブテーブルに既存行がある場合、退避
    for (var iTbl = 0; iTbl < objRecord['record']['請求明細']['value'].length; iTbl++) {
      //空行はつめる
      if (!(objRecord['record']['請求明細']['value'][iTbl]['value']['種別']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['プラン・オプション']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['単価']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['数量']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['摘要']['value'])) {
        continue;
      }
      tbl.push({
        'id': objRecord['record']['請求明細']['value'][iTbl]['id'],
        'value': objRecord['record']['請求明細']['value'][iTbl]['value']
      });
    }
    // 「請求明細」サブテーブルを取得
    var resp=await getSubtable();
        //取得予定の数分
        for (var i = 0; i < constlist.length; i++) {
          var record = constlist[i];
          var setFields = {};
          var virtualFlg = false;
          var firstFlg=false;
          //初回プラン利用開始日
          var firstplandt=record['入会日_0'].value;
          var flgA=false;
          var flgB=false;
          var body;
          // プラン分をまずセット
          for (var pTbl = 0; pTbl < record['プランリスト']['value'].length; pTbl++) {
            var planList = record['プランリスト'].value[pTbl].value;
            // 利用期間内のプランのみ
            if(planList['プラン料金'].value != "0"){
                // バーチャルプランのみ半年請求
                if (planList['プラン種別']['value'] === "バーチャル") {
                  //virtualFlg = true;
                  virtualdt=planList['プラン利用開始日']['value'];
                  //初回請求（入会日の月＝請求日かつ前回請求日なし）
                  if(moment(record['入会日'].value).format('YYYYMM') == moment(invoicedt).format('YYYYMM') && record['前回請求日'].value == null){
                    //firstFlg=true;
                    //請求日の年、月
                    var year=moment(virtualdt).get('year');
                    var month=moment(virtualdt).get('month');
                    //請求日の月が3～8月の場合、その年の９月まで、
                    //請求日の月が9～翌2月の場合、翌年の3月まで、
                    switch(month)
                    {
                      case 3:
                      case 4:
                      case 5:
                      case 6:
                      case 7:
                        nextinvoicedt=moment({year:year,month:8}).startOf('month').format("YYYY-MM-DD");
                        break;
                      case 8:
                      case 9:
                      case 10:
                      case 11:
                        nextinvoicedt=moment({year:year+1,month:2}).startOf('month').format("YYYY-MM-DD");
                        break;
                      case 0:
                      case 1:
                        nextinvoicedt=moment({year:year,month:2}).startOf('month').format("YYYY-MM-DD");
                        break;
                      case 2:
                        nextinvoicedt=moment({year:year,month:8}).startOf('month').format("YYYY-MM-DD");
                        break;
                    }
                    if(nextinvoicedt>=moment(planList['プラン利用終了日'].value).startOf('month').format("YYYY-MM-DD")){
                      nextinvoicedt=moment(planList['プラン利用終了日'].value).startOf('month').format("YYYY-MM-DD");
                    }
                    //プラン利用開始から次回請求までの分を請求
                    max=moment(nextinvoicedt).diff(moment(planList['プラン利用開始日'].value).startOf('month').format("YYYY-MM-DD"),'months');

                    if(max>=0){
                      virtualFlg=true;
                      for(let j=0;j<=max;j++){
                        // 売上管理の窓口入金済みにあるかどうか
                        body = {
                          'app': APP_SALES,
                          'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                   '請求対象月 >= "' + moment(planList['プラン利用開始日']['value']).add(j, 'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '請求対象月 <= "' + moment(planList['プラン利用開始日']['value']).add(j, 'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '商品番号 in ("' + planList['商品番号_プラン'].value + '") and 窓口入金 in ("済") '
                        };
                        //データ取得
                        const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                        //入金済に存在しなかったら
                        if(respsumi.records.length == 0){
                          setFields = {
                            '種別': planList['プラン種別']['value'],
                            'プラン・オプション': planList['プラン']['value']+'（' + (moment(planList['プラン利用開始日']['value']).add(j, 'month').month()+1) + '月分）',
                            '単価': planList['プラン料金']['value']  ,
                            '数量': 1,
                            '利用対象期間_from':moment(planList['プラン利用開始日']['value']).add(j, 'month').startOf('month').format("YYYY-MM-DD"),
                            '利用対象期間_to':moment(planList['プラン利用開始日']['value']).add(j, 'month').endOf('month').format("YYYY-MM-DD")
                          };
                          tbl.push({
                            'value' : getRowObject(resp, setFields)
                          });
                        }
                      }
                    }
                  }else if (moment(staDay).month() == 3 || moment(staDay).month() == 9){
                      //プラン終了日が6か月以前の場合
                      if(planList['プラン利用終了日'].value != null && enddt6>=planList['プラン利用終了日'].value){
                        planenddt=moment(planList['プラン利用終了日'].value).endOf('month').format();
                        max=moment(planenddt).diff(finDay,'months')+1;
                      }else{
                        max=6
                      }
                      for(let j=0;j<max;j++){
                        virtualFlg=true;
                        // 売上管理の窓口入金済みにあるかどうか
                        body = {
                          'app': APP_SALES,
                          'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                   '請求対象月 >= "' + moment(staDay).add(j, 'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '請求対象月 <= "' + moment(staDay).add(j, 'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '商品番号 in ("' + planList['商品番号_プラン'].value + '") and 窓口入金 in ("済") '
                        };
                        //データ取得
                        const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                        //入金済に存在しなかったら
                        if(respsumi.records.length == 0){
                            setFields = {
                              '種別': planList['プラン種別']['value'],
                              'プラン・オプション': planList['プラン']['value']+'（' + (moment(staDay).add(j, 'month').month()+1) + '月分）',
                              '単価': planList['プラン料金']['value']  ,
                              '数量': 1,
                              '利用対象期間_from':moment(staDay).add(j, 'month').startOf('month').format("YYYY-MM-DD"),
                              '利用対象期間_to':moment(staDay).add(j, 'month').endOf('month').format("YYYY-MM-DD")
                            };
                          // }
                          tbl.push({
                            'value' : getRowObject(resp, setFields)
                          });
                        }
                      }
                  }


                } else {
                  //バーチャル以外
                  //初回請求（入会日の月＝請求日かつ前回請求日なし）
                  if(moment(record['入会日'].value).format('YYYYMM') == moment(invoicedt).format('YYYYMM') && record['前回請求日'].value == null){
                     firstFlg=true;
                      nextinvoicedt=finDay;

                      //入会日の月=初回プラン利用開始の月（入会日の月分＋翌月分を請求）
                      if(moment(record['入会日'].value).format('YYYYMM')==moment(firstplandt).format('YYYYMM')){
                        flgA=false;
                        flgB=false;
                        //入会日の月がプランの利用期間に対象だった場合
                        if(moment(firstplandt).format('YYYYMM') >= moment(planList['プラン利用開始日'].value).format('YYYYMM') &&
                            (moment(firstplandt).format('YYYYMM') <= moment(planList['プラン利用終了日'].value).format('YYYYMM') || planList['プラン利用終了日'].value == null)){

                              // 売上管理の窓口入金済みにあるかどうか
                              body = {
                                'app': APP_SALES,
                                'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                         '請求対象月 >= "' + moment(firstplandt).add('month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                         '請求対象月 <= "' + moment(firstplandt).add('month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                         '商品番号 in ("' + planList['商品番号_プラン'].value + '") and 窓口入金 in ("済") '
                              };
                              //データ取得
                              const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                              //入金済に存在しなかったら
                              if(respsumi.records.length == 0){
                                setFields = {
                                  '種別': planList['プラン種別']['value'],
                                  'プラン・オプション': planList['プラン']['value']+'（' + (moment(firstplandt).month()+1) + '月分）',
                                  '単価': planList['プラン料金']['value'],
                                  '数量':1,
                                  '利用対象期間_from':moment(firstplandt).startOf('month').format("YYYY-MM-DD"),
                                  '利用対象期間_to':moment(firstplandt).endOf('month').format("YYYY-MM-DD")
                                };
                                tbl.push({
                                  'value' : getRowObject(resp, setFields)
                                });
                              }
                            }
                        //入会日の翌月分がプランの利用期間に対象だった場合
                        if(moment(firstplandt).add(1, 'month').format('YYYYMM') >= moment(planList['プラン利用開始日'].value).format('YYYYMM') &&
                            (moment(firstplandt).add(1, 'month').format('YYYYMM') <= moment(planList['プラン利用終了日'].value).format('YYYYMM') || planList['プラン利用終了日'].value == null)){

                              // 売上管理の窓口入金済みにあるかどうか
                              body = {
                                'app': APP_SALES,
                                'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                         '請求対象月 >= "' + moment(firstplandt).add(1,'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                         '請求対象月 <= "' + moment(firstplandt).add(1,'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                         '商品番号 in ("' + planList['商品番号_プラン'].value + '") and 窓口入金 in ("済") '
                              };
                              //データ取得
                              const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                              //入金済に存在しなかったら
                              if(respsumi.records.length == 0){
                                setFields = {
                                  '種別': planList['プラン種別']['value'],
                                  'プラン・オプション': planList['プラン']['value']+'（' + (moment(firstplandt).add(1, 'month').month()+1) + '月分）',
                                  '単価': planList['プラン料金']['value'],
                                  '数量':1,
                                  '利用対象期間_from':moment(firstplandt).add(1, 'month').startOf('month').format("YYYY-MM-DD"),
                                  '利用対象期間_to':moment(firstplandt).add(1, 'month').endOf('month').format("YYYY-MM-DD")
                                };
                                tbl.push({
                                  'value' : getRowObject(resp, setFields)
                                });
                              }
                            }

                  }else{
                        //入会日の月<>初回プラン利用開始の月（初回プラン利用開始の月を請求）
                        //入会日の月がプランの利用期間に対象だった場合
                        if(moment(firstplandt).format('YYYYMM') >= moment(planList['プラン利用開始日'].value).format('YYYYMM') &&
                            (moment(firstplandt).format('YYYYMM') <= moment(planList['プラン利用終了日'].value).format('YYYYMM')|| planList['プラン利用終了日'].value == null)){

                              // 売上管理の窓口入金済みにあるかどうか
                              body = {
                                'app': APP_SALES,
                                'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                         '請求対象月 >= "' + moment(firstplandt).add('month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                         '請求対象月 <= "' + moment(firstplandt).add('month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                         '商品番号 in ("' + planList['商品番号_プラン'].value + '") and 窓口入金 in ("済") '
                              };
                              //データ取得
                              const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                              //入金済に存在しなかったら
                              if(respsumi.records.length == 0){
                                setFields = {
                                  '種別': planList['プラン種別']['value'],
                                  'プラン・オプション': planList['プラン']['value']+'（' + (moment(firstplandt).month()+1) + '月分）',
                                  '単価': planList['プラン料金']['value'],
                                  '数量': 1,
                                  '利用対象期間_from':moment(firstplandt).startOf('month').format("YYYY-MM-DD"),
                                  '利用対象期間_to':moment(firstplandt).endOf('month').format("YYYY-MM-DD")
                                };
                                tbl.push({
                                  'value' : getRowObject(resp, setFields)
                                });
                              }
                            }
                      }
                    }else{
                      if(moment(staDay).format('YYYYMM') >= moment(planList['プラン利用開始日'].value).format('YYYYMM') &&
                          (moment(staDay).format('YYYYMM') <= moment(planList['プラン利用終了日'].value).format('YYYYMM')|| planList['プラン利用終了日'].value == null)){

                            // 売上管理の窓口入金済みにあるかどうか
                            body = {
                              'app': APP_SALES,
                              'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                       '請求対象月 >= "' + moment(staDay).add('month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                       '請求対象月 <= "' + moment(staDay).add('month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                       '商品番号 in ("' + planList['商品番号_プラン'].value + '") and 窓口入金 in ("済") '
                            };
                            //データ取得
                            const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                            //入金済に存在しなかったら
                            if(respsumi.records.length == 0){

                              setFields = {
                                '種別': planList['プラン種別']['value'],
                                'プラン・オプション': planList['プラン']['value']+'（' + (moment(staDay).month()+1) + '月分）',
                                '単価': planList['プラン料金']['value'],
                                '数量': 1,
                                '利用対象期間_from':moment(staDay).startOf('month').format("YYYY-MM-DD"),
                                '利用対象期間_to':moment(staDay).endOf('month').format("YYYY-MM-DD")
                              };
                              tbl.push({
                                'value' : getRowObject(resp, setFields)
                              });
                            }
                    }
                }
            }
          }
        }
          // オプション明細をセット
          for (var j = 0; j < record['オプション利用'].value.length; j++) {
            var tableList = record['オプション利用'].value[j].value;
            // 利用期間内のオプションのみ
            if(tableList['オプション合計料金'].value != "0"){
                // バーチャルプランのみ半年請求
                if (virtualFlg) {
                  //初回請求（入会日の月＝請求日かつ前回請求日なし）
                  if(moment(record['入会日'].value).format('YYYYMM') == moment(invoicedt).format('YYYYMM') && record['前回請求日'].value == null){
                    firstFlg=true;
                    //請求日の年、月
                    var year=moment(virtualdt).get('year');
                    var month=moment(virtualdt).get('month');
                    //請求日の月が4～9月の場合、その年の９月まで、
                    //請求日の月が10～翌3月の場合、翌年の3月まで、
                    switch(month)
                    {
                      case 3:
                      case 4:
                      case 5:
                      case 6:
                      case 7:
                        nextinvoicedt=moment({year:year,month:8}).startOf('month').format("YYYY-MM-DD");
                        break;
                      case 8:
                      case 9:
                      case 10:
                      case 11:
                        nextinvoicedt=moment({year:year+1,month:2}).startOf('month').format("YYYY-MM-DD");
                        break;
                      case 0:
                      case 1:
                        nextinvoicedt=moment({year:year,month:2}).startOf('month').format("YYYY-MM-DD");
                        break;
                      case 2:
                        nextinvoicedt=moment({year:year,month:8}).startOf('month').format("YYYY-MM-DD");
                        break;
                    }

                    if(moment(nextinvoicedt).startOf('month').format("YYYY-MM-DD")>=moment(tableList['オプション利用終了日'].value).startOf('month').format("YYYY-MM-DD")){
                      nextinvoicedt=moment(tableList['オプション利用終了日'].value).startOf('month').format("YYYY-MM-DD");
                    }
                    firstdt=moment(tableList['オプション利用開始日']['value']).startOf('month').format("YYYY-MM-DD");
                    if(virtualdt>=moment(tableList['オプション利用開始日']['value']).startOf('month').format("YYYY-MM-DD")){
                      firstdt= virtualdt;
                    }
                    //オプション利用開始から次回請求までの分を請求
                    max=moment(nextinvoicedt).diff(moment(firstdt).startOf('month').format("YYYY-MM-DD"),'months');
                    if(max>=0){
                      for(let j=0;j<=max;j++){
                        // 売上管理の窓口入金済みにあるかどうか
                        body = {
                          'app': APP_SALES,
                          'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                   '請求対象月 >= "' + moment(firstdt).add(j,'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '請求対象月 <= "' + moment(firstdt).add(j,'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '商品番号 in ("' + tableList['商品番号_オプション'].value + '") and 窓口入金 in ("済") '
                        };
                        //データ取得
                        const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                        //入金済に存在しなかったら
                        if(respsumi.records.length == 0){
                          setFields = {
                            '種別': 'オプション',
                            'プラン・オプション': tableList['オプション']['value']+'（'+ (moment(firstdt).add(j, 'month').month()+1) + '月分）',
                            '単価': tableList['オプション単価']['value']  ,
                            '数量': tableList['オプション契約数']['value'] ,
                            '利用対象期間_from':moment(firstdt).add(j, 'month').startOf('month').format("YYYY-MM-DD"),
                            '利用対象期間_to':moment(firstdt).add(j, 'month').endOf('month').format("YYYY-MM-DD")
                          };
                          tbl.push({
                            'value' : getRowObject(resp, setFields)
                          });
                        }
                      }
                    }

                  }else if (moment(staDay).month() == 3 || moment(staDay).month() == 9) {
                    //プラン終了日が6か月以前の場合
                    if(
                       (tableList['オプション利用終了日'].value != null &&
                          enddt6>=tableList['オプション利用終了日'].value) || (planenddt != null && enddt6>=planenddt)
                        ){
                      optenddt=moment(tableList['オプション利用終了日'].value).endOf('month').format();
                      //バーチャルプラン終了日と比較
                      if(planenddt == null){
                        max=moment(optenddt).diff(finDay,'months')+1;
                      }else if(optenddt<planenddt){
                        max=moment(optenddt).diff(finDay,'months')+1;
                      }else{
                        max=moment(planenddt).diff(finDay,'months')+1;
                      }

                    }else{
                      max=6
                    }
                    for(let j=0;j<max;j++){
                      // 売上管理の窓口入金済みにあるかどうか
                      body = {
                        'app': APP_SALES,
                        'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                 '請求対象月 >= "' + moment(staDay).add(j,'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                 '請求対象月 <= "' + moment(staDay).add(j,'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                 '商品番号 in ("' + tableList['商品番号_オプション'].value + '") and 窓口入金 in ("済") '
                      };
                      //データ取得
                      const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                      //入金済に存在しなかったら
                      if(respsumi.records.length == 0){
                        setFields = {
                          '種別': 'オプション',
                          'プラン・オプション': tableList['オプション']['value']+'（' + (moment(staDay).add(j, 'month').month()+1) + '月分）',
                          '単価': tableList['オプション単価']['value'] ,
                          '数量': tableList['オプション契約数']['value'] ,
                          '利用対象期間_from':moment(staDay).add(j, 'month').startOf('month').format("YYYY-MM-DD"),
                          '利用対象期間_to':moment(staDay).add(j, 'month').endOf('month').format("YYYY-MM-DD")
                        };
                      }
                      // }
                      tbl.push({
                        'value' : getRowObject(resp, setFields)
                      });
                    }
                  }
                } else {
                  //初回請求（入会日の月＝請求日かつ前回請求日なし）
                  if(moment(record['入会日'].value).format('YYYYMM') == moment(invoicedt).format('YYYYMM') && record['前回請求日'].value == null){
                    firstFlg=true;
                     nextinvoicedt=finDay;
                     flgA=false;
                     flgB=false;

                     //入会日の月=初回プラン利用開始の月（入会日の月分＋翌月分を請求）
                     if(moment(record['入会日'].value).format('YYYYMM')==moment(firstplandt).format('YYYYMM')){
                       //入会日の月がオプションの利用期間に対象だった場合
                       if(moment(firstplandt).format('YYYYMM') >= moment(tableList['オプション利用開始日'].value).format('YYYYMM') &&
                           (moment(firstplandt).format('YYYYMM') <= moment(tableList['オプション利用終了日'].value).format('YYYYMM') || tableList['オプション利用終了日'].value == null)){
                             // 売上管理の窓口入金済みにあるかどうか
                             body = {
                               'app': APP_SALES,
                               'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                        '請求対象月 >= "' + moment(firstplandt).add('month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                        '請求対象月 <= "' + moment(firstplandt).add('month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                        '商品番号 in ("' + tableList['商品番号_オプション'].value + '") and 窓口入金 in ("済") '
                             };
                             //データ取得
                             const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                             //入金済に存在しなかったら
                             if(respsumi.records.length == 0){
                               setFields = {
                                 '種別':  'オプション',
                                 'プラン・オプション': tableList['オプション']['value']+'（' + (moment(firstplandt).month()+1) + '月分）',
                                 '単価': tableList['オプション単価']['value'] ,
                                 '数量':tableList['オプション契約数']['value'] ,
                                 '利用対象期間_from':moment(firstplandt).startOf('month').format("YYYY-MM-DD"),
                                 '利用対象期間_to':moment(firstplandt).endOf('month').format("YYYY-MM-DD")
                               };
                               tbl.push({
                                 'value' : getRowObject(resp, setFields)
                               });
                             }
                           }
                       //入会日の翌月分がオプションの利用期間に対象だった場合
                       if(moment(firstplandt).add(1, 'month').format('YYYYMM') >= moment(tableList['オプション利用開始日'].value).format('YYYYMM') &&
                           (moment(firstplandt).add(1, 'month').format('YYYYMM') <= moment(tableList['オプション利用終了日'].value).format('YYYYMM') || tableList['オプション利用終了日'].value == null)){

                             // 売上管理の窓口入金済みにあるかどうか
                             body = {
                               'app': APP_SALES,
                               'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                        '請求対象月 >= "' + moment(firstplandt).add(1,'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                        '請求対象月 <= "' + moment(firstplandt).add(1,'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                        '商品番号 in ("' + tableList['商品番号_オプション'].value + '") and 窓口入金 in ("済") '
                             };
                             //データ取得
                             const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                             //入金済に存在しなかったら
                             if(respsumi.records.length == 0){

                               setFields = {
                                 '種別':  'オプション',
                                 'プラン・オプション': tableList['オプション']['value']+'（' + (moment(firstplandt).add(1, 'month').month()+1) + '月分）',
                                 '単価': tableList['オプション単価']['value'] ,
                                 '数量':tableList['オプション契約数']['value'],
                                 '利用対象期間_from':moment(firstplandt).add(1, 'month').startOf('month').format("YYYY-MM-DD"),
                                 '利用対象期間_to':moment(firstplandt).add(1, 'month').endOf('month').format("YYYY-MM-DD")
                               };
                               tbl.push({
                                 'value' : getRowObject(resp, setFields)
                               });
                             }
                           }

                         }else{
                           //入会日の月<>初回プラン利用開始の月（初回プラン利用開始の月を請求）
                           //入会日の月がプランの利用期間に対象だった場合
                           if(moment(firstplandt).format('YYYYMM') >= moment(tableList['オプション利用開始日'].value).format('YYYYMM') &&
                               (moment(firstplandt).format('YYYYMM') >= moment(tableList['オプション利用終了日'].value).format('YYYYMM') || tableList['オプション利用終了日'].value == null)){
                                 // 売上管理の窓口入金済みにあるかどうか
                                 body = {
                                   'app': APP_SALES,
                                   'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                            '請求対象月 >= "' + moment(firstplandt).add('month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                            '請求対象月 <= "' + moment(firstplandt).add('month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                            '商品番号 in ("' + tableList['商品番号_オプション'].value + '") and 窓口入金 in ("済") '
                                 };
                                 //データ取得
                                 const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                                 //入金済に存在しなかったら
                                 if(respsumi.records.length == 0){
                                   setFields = {
                                     '種別': 'オプション',
                                     'プラン・オプション': tableList['オプション']['value']+'（' + (moment(firstplandt).month()+1) + '月分）',
                                     '単価': tableList['オプション単価']['value'] ,
                                     '数量': tableList['オプション契約数']['value'],
                                     '利用対象期間_from':moment(firstplandt).startOf('month').format("YYYY-MM-DD"),
                                     '利用対象期間_to':moment(firstplandt).endOf('month').format("YYYY-MM-DD")
                                   };
                                   tbl.push({
                                     'value' : getRowObject(resp, setFields)
                                   });
                                 }
                               }
                             }
                     }else{
                       if(moment(staDay).format('YYYYMM') >= moment(tableList['オプション利用開始日'].value).format('YYYYMM') &&
                           (moment(staDay).format('YYYYMM') <= moment(tableList['オプション利用終了日'].value).format('YYYYMM')|| tableList['オプション利用終了日'].value == null)){
                             // 売上管理の窓口入金済みにあるかどうか
                             body = {
                               'app': APP_SALES,
                               'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                        '請求対象月 >= "' + moment(staDay).add('month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                        '請求対象月 <= "' + moment(staDay).add('month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                        '商品番号 in ("' + tableList['商品番号_オプション'].value + '") and 窓口入金 in ("済") '
                             };
                             //データ取得
                             const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                             //入金済に存在しなかったら
                             if(respsumi.records.length == 0){

                               setFields = {
                                 '種別': 'オプション',
                                 'プラン・オプション':tableList['オプション']['value']+'（' + (moment(staDay).month()+1) + '月分）',
                                 '単価': tableList['オプション単価']['value'],
                                 '数量': tableList['オプション契約数']['value'],
                                 '利用対象期間_from':moment(staDay).startOf('month').format("YYYY-MM-DD"),
                                 '利用対象期間_to':moment(staDay).endOf('month').format("YYYY-MM-DD")
                               };
                               tbl.push({
                                 'value' : getRowObject(resp, setFields)
                               });
                             }
                     }
                 }
              }
              // 通話料請求
                if(tableList['契約番号']['value'] != "" && firstFlg==false) {
                // バーチャルプランのみ半年請求
                if (virtualFlg) {
                  if (moment(staDay).month() == 3 || moment(staDay).month() == 9) {
                    var tellNo = tableList['契約番号'].value;
                    //抽出開始月
                    staTelDay = moment(invoicedt).add(-6, 'month').startOf('month').format("YYYY-MM-DD");
                    if(moment(tableList['オプション利用開始日'].value).format("YYYYMM") >= moment(staTelDay).format("YYYYMM")){
                      staTelDay=moment(tableList['オプション利用開始日'].value).startOf('month').format("YYYY-MM-DD");
                    }
                    //抽出終了月
                    if(moment(tableList['オプション利用終了日'].value).format("YYYYMM") <= moment(finTelDay).format("YYYYMM")){
                      finTelDay=moment(tableList['オプション利用終了日'].value).endOf('month').format("YYYY-MM-DD");
                    }
                    var query = '契約電話番号 = "' + tellNo + '" and 請求対象月 >= "' + staTelDay + '" and 請求対象月 <= "' + finTelDay + '" order by 請求対象月';
                    var paramTell = {
                        'app': APP_TELLBILL,
                        'query': query
                    };
                    var respT =await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', paramTell);
                      var recordsT = respT.records;
                      var tellBill = 0;
                      var ymd;
                      var ymd2;
                      var mm;
                      var mm2="";
                      for (var k = 0, l = recordsT.length; k < l; k++) {
                        var recordT = recordsT[k];
                        ymd=recordT['請求対象月'].value;
                        mm=moment(ymd).month()+1;
                        if(mm2==""){
                          ymd2=recordT['請求対象月'].value;
                          mm2=mm;
                        }
                        if(mm != mm2 ){
                          if(tellBill !=0){
                            // 売上管理の窓口入金済みにあるかどうか
                            body = {
                              'app': APP_SALES,
                              'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                       '請求対象月 >= "' + moment(ymd2).startOf('month').format("YYYY-MM-DD") +'" and ' +
                                       '請求対象月 <= "' + moment(ymd2).endOf('month').format("YYYY-MM-DD") +'" and ' +
                                       '商品番号 in ("' + TEL_ITEM_NO + '") and 窓口入金 in ("済") '
                            };
                            //データ取得
                            const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                            //入金済に存在しなかったら
                            if(respsumi.records.length == 0){
                              //請求明細
                              setFields = {
                                            "種別":"オプション",
                                            "プラン・オプション":'通話料（' + mm2 + '月分）',
                                            "単価":tellBill,
                                            "数量":1,
                                            "利用対象期間_from":moment(ymd2).startOf('month').format("YYYY-MM-DD"),
                                            "利用対象期間_to":moment(ymd2).endOf('month').format("YYYY-MM-DD")
                                          };
                                          tbl.push({
                                            'value': getRowObject(resp, setFields)
                                          });

                               }
                             }
                             tellBill=0;
                             ymd2=recordT['請求対象月'].value;
                             mm2=moment(ymd2).month()+1;
                          }
                          tellBill += Number(recordT['通話料'].value);

                      }
                      if (tellBill !== 0) {
                        // 売上管理の窓口入金済みにあるかどうか
                        body = {
                          'app': APP_SALES,
                          'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                   '請求対象月 >= "' + moment(ymd2).startOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '請求対象月 <= "' + moment(ymd2).endOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '商品番号 in ("' + TEL_ITEM_NO + '") and 窓口入金 in ("済") '
                        };
                        //データ取得
                        const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                        //入金済に存在しなかったら
                        if(respsumi.records.length == 0){
                          setFields = {
                            '種別': 'オプション',
                            'プラン・オプション': '通話料（' + mm2 + '月分）',
                            '単価': tellBill,
                            '数量': 1,
                            '利用対象期間_from':moment(ymd2).startOf('month').format("YYYY-MM-DD"),
                            '利用対象期間_to':moment(ymd2).endOf('month').format("YYYY-MM-DD")
                          };
                          tbl.push({
                            'value': getRowObject(resp, setFields)
                          });
                        }
                      }
                  }
                } else {
                  if (moment(invoicedt).month() % 2 != 0) {
                    var tellNo = tableList['契約番号'].value;
                    var query = '契約電話番号 = "' + tellNo + '" and 請求対象月 >= "' + staTelDay + '" and 請求対象月 <= "' + finTelDay + '" order by 請求対象月';
                    var paramTell = {
                        'app': APP_TELLBILL,
                        'query': query
                    };
                    var respT =await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', paramTell)
                      var recordsT = respT.records;
                      var tellBill = 0;
                      var ymd;
                      var ymd2;
                      var mm;
                      var mm2;
                      for (var k = 0, l = recordsT.length; k < l; k++) {
                        var recordT = recordsT[k];
                        ymd=recordT['請求対象月'].value;
                        mm=moment(ymd).month()+1;
                        if(mm != mm2 ){
                          if(tellBill !=0){
                            // 売上管理の窓口入金済みにあるかどうか
                            body = {
                              'app': APP_SALES,
                              'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                       '請求対象月 >= "' + moment(ymd2).startOf('month').format("YYYY-MM-DD") +'" and ' +
                                       '請求対象月 <= "' + moment(ymd2).endOf('month').format("YYYY-MM-DD") +'" and ' +
                                       '商品番号 in ("' + TEL_ITEM_NO + '") and 窓口入金 in ("済") '
                            };
                            //データ取得
                            const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                            //入金済に存在しなかったら
                            if(respsumi.records.length == 0){
                              //請求明細
                              setFields = {
                                            "種別":"オプション",
                                            "プラン・オプション":'通話料（' + mm2 + '月分）',
                                            "単価":tellBill,
                                            "数量":1,
                                            "利用対象期間_from":moment(ymd2).startOf('month').format("YYYY-MM-DD"),
                                            "利用対象期間_to":moment(ymd2).endOf('month').format("YYYY-MM-DD")
                                          };
                                          tbl.push({
                                            'value': getRowObject(resp, setFields)
                                          });
                             }
                           }
                            tellBill=0;
                             ymd2=recordT['請求対象月'].value;
                             mm2=moment(ymd2).month()+1;
                        }
                        tellBill += Number(recordT['通話料'].value);
                      }
                      if (tellBill !== 0) {
                        // 売上管理の窓口入金済みにあるかどうか
                        body = {
                          'app': APP_SALES,
                          'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                                   '請求対象月 >= "' + moment(ymd2).startOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '請求対象月 <= "' + moment(ymd2).endOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '商品番号 in ("' + TEL_ITEM_NO + '") and 窓口入金 in ("済") '
                        };
                        //データ取得
                        const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                        //入金済に存在しなかったら
                        if(respsumi.records.length == 0){
                          setFields = {
                            '種別': 'オプション',
                            'プラン・オプション': '通話料（' + mm2 + '月分）',
                            '単価': tellBill,
                            '数量': 1,
                            '利用対象期間_from':moment(ymd2).startOf('month').format("YYYY-MM-DD"),
                            '利用対象期間_to':moment(ymd2).endOf('month').format("YYYY-MM-DD")
                          };
                          tbl.push({
                            'value': getRowObject(resp, setFields)
                          });
                        }
                    }

                  }
                }
            }
        }
      }

      //窓口処理後払い分
      body = {
        'app': APP_MADO,
        'query': '登録NO_メンバー = "' + record['レコード番号'].value + 　'" and ' +
                 '支払区分 in ("後払い") and ' +
                 '自動計上済 in ("")  '
      };
      //データ取得
      const respato = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
      var recato=respato.records;
      for (let k = 0 ; k < recato.length ; k++){
        var subrecato=recato[k]['料金テーブル'].value;
        for(let j = 0 ; j<subrecato.length ; j++){
          if(subrecato[j]['value']['支払区分'].value == "後払い" && subrecato[j]['value']['自動計上済'].value == ""){
            //請求明細
            setFields = {
                          "種別":subrecato[j]['value']['商品種別'].value,
                          "プラン・オプション":subrecato[j]['value']['商品名'].value,
                          "単価":Number(subrecato[j]['value']['単価'].value) ,
                          "数量":Number(subrecato[j]['value']['数量'].value),
                          "利用対象期間_from":subrecato[j]['value']['対象日'].value,
                          "利用対象期間_to":subrecato[j]['value']['対象日'].value,
                          "摘要":"窓口処理",
                          "更新用ID1":recato[k]['登録NO'].value,
                          "更新用ID2":subrecato[j]['id']
                        };
                tbl.push({
                  'value': getRowObject(resp, setFields)
                });
                if(subrecato[j]['value']['郵送手数料'].value != "" && subrecato[j]['value']['郵送手数料'].value != "0"){
                  //請求明細
                  setFields = {
                                "種別":"郵送手数料",
                                "プラン・オプション":"郵送手数料",
                                "単価":Number(subrecato[j]['value']['郵送手数料'].value) ,
                                "数量":1,
                                "税区分":"非課税",
                                "利用対象期間_from":subrecato[j]['value']['対象日'].value,
                                "利用対象期間_to":subrecato[j]['value']['対象日'].value,
                                "摘要":"窓口処理",
                                "更新用ID1":"",
                                "更新用ID2":""
                              };
                      tbl.push({
                        'value': getRowObject(resp, setFields)
                      });
                }

          }
        }

      }
    }
        //画面[請求明細]サブテーブル]に反映
        objRecord['record']['請求明細']['value'] = tbl;
        kintone.app.record.set(objRecord);
        //ポップアップエリア隠す
        $('.emxas-confirm').hide();
      }catch(e) {
        alert("フィールド情報の取得でエラーが発生しました。")
      }
  });
  //スケジュール取得ダイアログ「キャンセル」のクリックイベント
  $(document).on('click', '.emxas-button-dialog-cancel', function(ev) {
    $('.emxas-confirm').hide();
  });
  //emxas-confirm以外のクリックイベント
  $(document).on('click touched', function(ev) {
    //スケジュール取得ボタンの場合 ⇒ 何もしない
    if ($(ev.target).closest('#emxas-button-schedule').length > 0) {
      return;
    }
    //それ以外 ⇒ ポップアップエリア隠す
    if (!$(ev.target).closest('.emxas-confirm').length) {
      $('.emxas-confirm').hide();
    }
  });


  var showEvents2 = [
    "app.record.create.show",
    "app.record.edit.show",
    "app.record.detail.show"
  ];
  //入力不可
  kintone.events.on(showEvents2, function(e) {
  e.record.自動登録日.disabled = true;
    return e;
  });
  //商品リスト表示
  kintone.events.on(showEvents2, function(e) {


    var spc = kintone.app.record.getSpaceElement('itemlist');
    var body = {
      'app': APP_ITEM,
      'query': ' order by レコード番号 '
    };
    //指定年月の日報データを取得
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body).then(function(resp) {
        var rec=resp.records;

        var list = '' +
        '<details> <summary>▼商品リスト表示（クリックで展開）</summary>' +
          '<div style="margin-left:15px">' +
          '<table class="subtable-gaia reference-subtable-gaia">' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">種別</span></th>' +
          '<th class="subtable-label-gaia subtable-label-single_select-gaia" style="width:300px">' +
          '   <span class="subtable-label-inner-gaia" style="min-width: 165px;">商品名</span></th>' +
          '<tr>';
         // var list = '' +
         // '<details> <summary>▼商品リスト表示（クリックで展開）</summary>' +
         // '<ul>' ;
          for(let i = 0 ; i<rec.length ; i++){
             list = list + '<td>' + rec[i]['商品種別'].value + '</td><td>' + rec[i]['文字列__1行__1'].value + '</td>' + '<tr>';
            //list = list + '<li>' + rec[i]['文字列__1行__1'].value + '</li>';
            }
          list=list+ '</table></div></details>';
          //list =list + '</ul></details>' ;
          $(spc).html(list);
    }).catch(function(resp) {
      // error
      console.log(resp);
      throw resp;
    });

    return e;
  });
})(jQuery);
