/*
 * 作業者リスト作成プログラム
 * 20200930 MDSJ takahara
 */
(function() {
  'use strict';

  var cfevents = [
    'mobile.app.record.create.submit',
    'mobile.app.record.edit.submit'
  ];
  kintone.events.on(cfevents, function(event) {
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
    // 請求済みの工事依頼かどうかチェック
    var clientRecordId = event.record.工事番号.value;
    var appId = kintone.mobile.app.getLookupTargetAppId('工事番号');
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
      if (resp.records.length < 1  && user.code != 'uematsu-100') {
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
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show',
    'mobile.app.record.create.change.作業者一覧',
    'mobile.app.record.edit.change.作業者一覧',
    'mobile.app.record.create.change.作業者名',
    'mobile.app.record.edit.change.作業者名'
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
