/*
 * 作業者リスト作成プログラム
 * 20200930 MDSJ takahara
 */
(function() {
  'use strict';

  var cfevents = [
    'app.record.create.submit',
    'app.record.edit.submit'
  ];
  kintone.events.on(cfevents, function(event) {
    var record = event.record;
    var table = record['作業者一覧'].value;
    var plList = '';
    for (var i = 0; i < table.length; i++) {
      //駐車料金有の場合
      if(table[i].value['駐車料金'].value=='有'){
        if(table[i].value['金額'].value==0 || !table[i].value['金額'].value){
            event.error = '駐車料金の金額が入力されていません。';
            return event;
        }
      }
      if(table[i].value['駐車料金'].value=='無'){
        if(table[i].value['金額'].value!=0 && table[i].value['金額'].value){
            event.error = '駐車料金「無」で金額が入力されています。';
            return event;
        }
      }
      if (plList !== '') {
        plList += ', ';
      }
      plList += table[i].value['作業者名'].value;
    }
    record['作業者リスト']['value'] = plList;
    record['作業者リスト']['disabled'] = true;
    // 請求済みの工事依頼かどうかチェック
    var clientRecordId = event.record.工事番号.value;
    var appId = kintone.app.getLookupTargetAppId('工事番号');
    var query = '工事番号 = ' + clientRecordId + ' and 請求番号 = ""';
    var outputFields = ['工事番号'];
    var appUrl = kintone.api.url('/k/v1/records');
    var params = {
      'app': appId,
      'query': query,
      'fields': outputFields
    };
    return kintone.api(appUrl, 'GET', params).then(function(resp) {
      var user=kintone.getLoginUser();
      if (resp.records.length < 1 && user.code != 'uematsu-100') {
        event.error = '既に請求済みの工事依頼は使用できません。';
      } else {
        var res = confirm("本当にこの内容を反映させますか");
        if (res === false) {
          event.error = 'キャンセルしました';
          window.location.href = window.location.origin + window.location.pathname + "#record=" + event.record.$id.value; // 画面遷移
        }
      }
      return event;
    });
  });

  var events = [
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.create.change.作業者一覧',
    'app.record.edit.change.作業者一覧',
    'app.record.create.change.作業者名',
    'app.record.edit.change.作業者名'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    var table = record['作業者一覧'].value;
    var plList = '';
    for (var i = 0; i < table.length; i++) {
      if (plList !== '') {
        plList += ', ';
      }
      plList += table[i].value['作業者名'].value;
    }
    record['作業者リスト']['value'] = plList;
    record['作業者リスト']['disabled'] = true;
    return event;
  });
})();
