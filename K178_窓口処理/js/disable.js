
(function() {
  'use strict';
  var ev = [
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.create.change.料金テーブル',
    'app.record.edit.change.料金テーブル'
  ];

  kintone.events.on(ev, function(event){
    var tableVal = event.record['料金テーブル'].value;
    tableVal.forEach(function(column) {
      column.value['単価'].disabled = false;
    });
    return event;
  });
})();
