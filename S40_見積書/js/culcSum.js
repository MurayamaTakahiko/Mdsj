/*
 * 見積明細集計プログラム
 * 20200729 MDSJ takahara
 */
(function() {
  'use strict';

  var events = [
    'app.record.detail.show',
    'app.record.edit.show'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    var clientRecordId = event.recordId;
    var relatedAppId = kintone.app.getRelatedRecordsTargetAppId('見積明細');
    var query = '見積書レコード番号 = "' + clientRecordId + '"';
    var outputFields = ['見積明細合計', '原価明細合計'];
    var appUrl = kintone.api.url('/k/v1/records');

    var params = {
      'app': relatedAppId,
      'query': query,
      'fields': outputFields
    };

    kintone.api(appUrl, 'GET', params, function(resp) {
      var culcamount = 0;
      var costamount = 0;
      for (var i = 0; i < resp.records.length; i++) {
        culcamount += parseFloat(resp.records[i].見積明細合計.value);
        costamount += parseFloat(resp.records[i].原価明細合計.value);
      }
      record['見積合計'].value = culcamount;
      record['原価合計'].value = costamount;
      kintone.app.record.set(event);
    });

    return event;
  });
})();
