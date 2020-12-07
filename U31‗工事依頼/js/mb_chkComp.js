/*
 * 完工無案件チェックプログラム
 * 20200925 MDSJ takahara
 */
(function() {
  'use strict';

  var events = [
    'mobile.app.record.detail.show',
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    var clientRecordId = event.record.工事番号.value;
    var relatedAppId = kintone.mobile.app.getRelatedRecordsTargetAppId('業務日報一覧');
    var query = '工事番号 = "' + clientRecordId + '"';
    var outputFields = ['完工区分'];
    var appUrl = kintone.api.url('/k/m/v1/records');

    var params = {
      'app': relatedAppId,
      'query': query,
      'fields': outputFields
    };

    kintone.api(appUrl, 'GET', params, function(resp) {
      var chkComp = "未";
      for (var i = 0; i < resp.records.length; i++) {
        if (resp.records[i].完工区分.value === "完") {
          chkComp = "";
          record['完工チェック'].value = [];
          break;
        }
      }
      if (chkComp === "未") {
        record['完工チェック'].value[0] = chkComp;
      }
      record['完工チェック']['disabled'] = true;
      record['請求日']['disabled'] = true;
      kintone.mobile.app.record.set(event);
    });

    return event;
  });
})();
