jQuery.noConflict();
(function($) {
  "use strict";
  var events = [
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show',
    'mobile.app.record.create.submit',
    'mobile.app.record.edit.submit',
    'mobile.app.record.create.change.担当者',
    'mobile.app.record.edit.change.担当者'
  ];
  kintone.events.on(events, function(event) {
    kintone.mobile.app.record.setFieldShown('検索用担当者', false);
    var record = event.record;
    var names = '';
    for (var i in record['担当者'].value) {
      if (names !== '') {
        name += ', '; //複数行文字列で改行するなら '\r\n'
      }
      names += record['担当者'].value[i].name;
    }
    record['検索用担当者']['value'] = names;
    return event;
  });
})(jQuery);
