(function() {
 'use struct';
 moment.locale('ja');
 kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function(event) {
 var record = event.record;
 if (record['残金額']['value'] < 0) {
 //ここでレコード保存されずに編集画面にもどす。
 record['残金額']['error'] = '残金額がマイナスです。';
 event.error = '残金額がマイナスのため保存できません。';
 }
 return event;
 })
})();
