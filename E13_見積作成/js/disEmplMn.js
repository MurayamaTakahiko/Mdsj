/*
 * 社員金額非表示プログラム
 * 20201029 MDSJ takahara
 */
(function() {
  'use strict';

  var events = [
    'app.record.detail.show',
    'app.record.create.show',
    'app.record.edit.show'
  ];
  kintone.events.on(events, function(event) {
    var user = kintone.getLoginUser();
    if (user.code === 'uematsu-shain') {
      kintone.app.record.setFieldShown('工事内容詳細', false);
    }
    return event;
  });
})();
