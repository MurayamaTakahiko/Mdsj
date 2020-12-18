/*
 * 過去登録禁止プログラム
 * 20201014 MDSJ takahara
 */
jQuery.noConflict();
(function($) {
  "use strict";
  // 過去計上日データを編集不可
  var events = [
    'app.record.create.show',
    'app.record.edit.show',
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    record['点検日']['disabled'] = true;
    return event;
  });
})(jQuery);
