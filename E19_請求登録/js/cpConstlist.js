/*
 * 工事明細コピープログラム
 * 20200814 MDSJ takahara
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
  //工事依頼明細
  var constlist;
  //画面のレコード
  var objRecord;
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
    return e;
  });

  //「明細取得ボタン」クリックイベント
  $(document).on('click', '#emxas-button-schedule', function(ev) {
    // 案件一覧アプリID
    var APP_CONSTLIST = 17;
    var custCd;
    var finDay = "";
    var billDay = "";
    //ポップアップ表示箇所取得
    var pos = {
      'top': $(this).position().top + $(this).outerHeight,
      'left': $(this).position().left
    };
    //エラーメッセージ初期化
    $('.emxas-alert').hide();
    objRecord = kintone.app.record.get();
    var record = objRecord['record'];
    if (record['得意先コード'].value) {
      custCd = record['得意先コード'].value;
      var param = {
        app: APP_CONSTLIST,
        query: "得意先コード = \"" + custCd + "\" and " +
          // "金額入力日 != \"" + finDay + "\" and " +
          "請求日 = \"" + billDay + "\" " +
          "order by 案件番号 desc"
      };
      return kintoneUtility.rest.getAllRecordsByQuery(param).then(function(resp) {
        console.log(resp);
        var records = resp.records;
        if (records.length === 0) {
          //対象予定存在しないメッセージ
          var msg = '案件一覧が存在しません。';
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
      var msg = '得意先コードを入力して下さい。';
      $('.emxas-alert > p').text(msg);
      $('.emxas-alert').show();
    }
  });

  //明細取得ダイアログ「OK」のクリックイベント
  $(document).on('click', '.emxas-button-dialog-ok', function(ev) {
    var tbl = [];
    //画面の請求明細サブテーブルに既存行がある場合、退避
    for (var iTbl = 0; iTbl < objRecord['record']['請求明細']['value'].length; iTbl++) {
      //空行はつめる
      if (!(objRecord['record']['請求明細']['value'][iTbl]['value']['現場名']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['作業内容・使用資材']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['数量']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['単位']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['摘要']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['単価']['value'] ||
          objRecord['record']['請求明細']['value'][iTbl]['value']['金額']['value'])) {
        continue;
      }
      tbl.push({
        'id': objRecord['record']['請求明細']['value'][iTbl]['id'],
        'value': objRecord['record']['請求明細']['value'][iTbl]['value']
      });
    }
    // 「請求明細」サブテーブルを取得
    getSubtable().then(function(resp) {
        console.log(resp);
        //取得予定の数分
        for (var i = 0; i < constlist.length; i++) {
          var record = constlist[i];
          for (var j = 0; j < record['工事内容詳細'].value.length; j++) {
            var tableList = record['工事内容詳細'].value[j].value;
            var unit = tableList['見積単価']['value'] == 0 ? tableList['標準単価']['value'] : tableList['見積単価']['value'];
            var setFields = {
              '現場名': record['現場名']['value'],
              '作業内容・使用資材': tableList['作業内容・使用資材']['value'],
              '数量': tableList['数量']['value'],
              '単位': tableList['単位']['value'],
              '単価': unit,
              '金額': tableList['金額']['value']
            }
            console.log(setFields);
            tbl.push({
              'value': getRowObject(resp, setFields)
            });
          }
        }
        //画面[請求明細]サブテーブル]に反映
        objRecord['record']['請求明細']['value'] = tbl;
        kintone.app.record.set(objRecord);
        //ポップアップエリア隠す
        $('.emxas-confirm').hide();
      })
      .catch(function(error) {
        alert("フィールド情報の取得でエラーが発生しました。")
      });
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
})(jQuery);
