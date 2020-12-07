/*
 * 作業者リスト作成プログラム
 * 20200930 MDSJ takahara
 */
(function() {
  'use strict';

  var events = [
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show',
    'mobile.app.record.create.submit',
    'mobile.app.record.edit.submit',
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
