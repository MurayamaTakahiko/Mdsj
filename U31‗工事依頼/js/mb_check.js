(function() {
 'use struct';
 moment.locale('ja');
 kintone.events.on(['mobile.app.record.create.submit','mobile.app.record.edit.submit'], function(event) {
 var record = event.record;
 var user = kintone.getLoginUser();
 if (user.code === 'uematsu-shain') {
   event.error = '保存する権限がありません。';
 }

 return event;
 })
})();
