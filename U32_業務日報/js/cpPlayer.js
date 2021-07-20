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
      if (plList !== '') {
        plList += ', ';
      }
      plList += table[i].value['作業者名'].value;
    }
    record['作業者リスト']['value'] = plList;
    record['作業者リスト']['disabled'] = true;
    // 完工済みの工事依頼かどうかチェック
    var clientRecordId = event.record.工事番号.value;
    var appId = kintone.app.getId();
    var query = '工事番号 = ' + clientRecordId + ' and 完工区分 in ("完")';
    var outputFields = ['日付'];
    var appUrl = kintone.api.url('/k/v1/records');
    var params = {
      'app': appId,
      'query': query,
      'fields': outputFields
    };
    return kintone.api(appUrl, 'GET', params).then(function(resp) {
      if (resp.records.length > 0) {
        event.error = '既に完工済みの工事依頼は使用できません。';
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
