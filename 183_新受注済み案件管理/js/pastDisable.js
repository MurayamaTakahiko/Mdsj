jQuery.noConflict();
(function($) {
   "use strict";
   // 過去計上日データを編集不可
    var events = [
        'app.record.create.show',
        'app.record.edit.show'
    ];
    kintone.events.on(events, function(event) {
        var record = event.record;
        record.売上管理表.value.forEach(function(row){
          var sellDate = row.value['売上月']['value'];
          if (sellDate == null){
          }else if (moment(sellDate).isBefore(moment().add(-5, 'days'), 'day')) {
            row.value.売上月.disabled = true;
            row.value.組織選択.disabled = true;
            row.value.担当者.disabled = true;
            row.value.計画額.disabled = true;
            row.value.予測額.disabled = true;
            row.value.実績請求額.disabled = true;
            row.value.交通費.disabled = true;
          }else if (moment(sellDate).isAfter(moment(), 'month')) {
            //来月以降は編集可能に
            row.value.売上月.disabled = true;
            row.value.計画額.disabled = true;
          }else{
            //今月分は一部編集可能に
            row.value.売上月.disabled = true;
            row.value.組織選択.disabled = true;
            row.value.担当者.disabled = true;
            row.value.計画額.disabled = true;
            row.value.予測額.disabled = true;
          }
        });
        return event;
    });

   // 過去計上日の新規明細は過去５日まで
    var crevents = [
      'app.record.create.change.売上月',
      'app.record.edit.change.売上月'
    ];
    kintone.events.on(crevents, function(event) {
      var row = event.changes.row;
      var sellDate = row.value['売上月']['value'];
      if (moment(sellDate).isBefore(moment().add(-5, 'days'), 'day')) {
        row.value['売上月']['value'] = "";
        event.error = "過去日での売上計上はできません。";
      }
      return event;
    });
})(jQuery);
