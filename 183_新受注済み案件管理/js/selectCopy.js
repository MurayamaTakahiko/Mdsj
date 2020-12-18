jQuery.noConflict();
(function($) {
  "use strict";
  var events = [
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.create.change.主担当',
    'app.record.edit.change.主担当'
  ];
  kintone.events.on(events, function(event) {
    kintone.app.record.setFieldShown('検索用担当者', false);
    var record = event.record;
    var names = '';
    for (var i in record['主担当'].value) {
      if (names !== '') {
        name += ', '; //複数行文字列で改行するなら '\r\n'
      }
      names += record['主担当'].value[i].name;
    }
    record['検索用担当者']['value'] = names;
    return event;
  });
})(jQuery);
