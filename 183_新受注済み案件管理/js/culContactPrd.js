jQuery.noConflict();
(function($) {
   "use strict";
   // 契約開始・終了を編集不可
    var shevents = [
        'app.record.create.show',
        'app.record.edit.show'
    ];
    kintone.events.on(shevents, function(event) {
        var record = event.record;
        record.契約期間開始.disabled = true;
        record.契約期間終了.disabled = true;
        return event;
    });

    // 売上月の最小を契約期間開始、最大を契約期間終了に自動反映
    var events = [
        'app.record.create.change.売上月',
        'app.record.edit.change.売上月'
    ];
    kintone.events.on(events, function(event) {
        var record = event.record;
        var minPrdDate = "";
        var maxPrdDate = "";
        record.売上管理表.value.forEach(function(row){
          if (!minPrdDate || (row.value['売上月']['value'] < minPrdDate)) {
            minPrdDate = moment(row.value['売上月']['value']).format("YYYY-MM-DD");
          }
          if (!maxPrdDate || (row.value['売上月']['value'] > maxPrdDate)) {
            maxPrdDate = moment(row.value['売上月']['value']).format("YYYY-MM-DD");
          }
        });
        record['契約期間開始']['value'] = minPrdDate;
        record['契約期間終了']['value'] = maxPrdDate;
        return event;
    });
})(jQuery);
