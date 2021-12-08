/*
 * 社員金額非表示プログラム
 * 20201029 MDSJ takahara
 */
(function() {
  'use strict';

  var events = [
    'mobile.app.record.detail.show',
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show'
  ];
  kintone.events.on(events, function(event) {
    var user = kintone.getLoginUser();
    if (user.code === 'uematsu-shain') {
      kintone.mobile.app.record.setFieldShown('工事内容詳細', false);
    }
    return event;
  });
})();
