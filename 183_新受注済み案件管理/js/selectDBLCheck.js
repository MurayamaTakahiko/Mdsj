jQuery.noConflict();
(function($) {
  "use strict";
  var events = [
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.create.submit',
    'app.record.edit.submit'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    record.売上管理表.value.forEach(function(row) {
      var selectedUsers = row.value['担当者']['value'];
      if (selectedUsers.length > 1) {
        event.error = "担当者は一人しか指定できません。";
      }
    });
    return event;
  });
})(jQuery);
