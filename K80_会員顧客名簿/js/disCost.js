/*
 * プラン入会金・保証金非表示制御
 * 20211025 MDSJ takahara
 */
(function() {
  'use strict';

  var events = [
    'app.record.detail.show',
    'app.record.create.show',
    'app.record.edit.show'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    kintone.app.record.setFieldShown('入会金', false);
    kintone.app.record.setFieldShown('保証金', false);
    kintone.app.record.setFieldShown('請求済', false);
    return event;
  });

})();
