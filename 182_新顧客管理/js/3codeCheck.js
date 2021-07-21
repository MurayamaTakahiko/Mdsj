jQuery.noConflict();
(function($) {
  "use strict";
  var events = [
    'app.record.create.change.３コード',
    'app.record.edit.change.３コード',
    'app.record.create.submit',
    'app.record.edit.submit'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    // 全角→半角変換
    record['３コード'].value = record['３コード'].value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0)-65248);
		}).replace(/[‐－―ー]/g,'-');
    console.log(record['３コード'].value);
    // 小文字→大文字変換
    record['３コード'].value = record['３コード'].value.toUpperCase();
    console.log(record['３コード'].value);
    return event;
  });
})(jQuery);
