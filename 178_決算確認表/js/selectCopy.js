jQuery.noConflict();
(function($) {
   "use strict";
    var events = [
        'app.record.create.show',
        'app.record.edit.show',
        'app.record.create.change.主担当',
        'app.record.edit.change.主担当',
        'app.record.create.change.作成担当者',
        'app.record.edit.change.作成担当者'
    ];
    kintone.events.on(events, function(event) {
        kintone.app.record.setFieldShown('ソート用主担当', false);
        kintone.app.record.setFieldShown('ソート用作成者', false);
        var record = event.record;
        var namesM = '';
        for (var i in record['主担当'].value){
          if (namesM !== '') {
            name += ', ' ; //複数行文字列で改行するなら '\r\n'
          }
          namesM += record['主担当'].value[i].name;
        }
        record['ソート用主担当']['value'] = namesM;
        var namesW = '';
        for (var i in record['作成担当者'].value){
          if (namesW !== '') {
            name += ', ' ; //複数行文字列で改行するなら '\r\n'
          }
          namesW += record['作成担当者'].value[i].name;
        }
        record['ソート用作成者']['value'] = namesW;
        return event;
    });
})(jQuery);
