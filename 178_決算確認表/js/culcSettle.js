jQuery.noConflict();
(function($) {
  "use strict";
  var events = [
    'app.record.edit.show',
    'app.record.create.submit',
    'app.record.edit.submit',
    'app.record.create.change.決算日',
    'app.record.edit.change.決算日'
  ];
  kintone.events.on(events, function(event) {
    kintone.app.record.setFieldShown('計算用決算日', false);
    var record = event.record;
    var settleDay = '';
    var settleY = moment().format('YYYY');
    var settleM = moment(settleY + "/" + record['決算月'].value + "/1").format('MM');
    var settleD = record['決算日'].value.slice(0, -1);

    if (settleD === "末") {
      settleDay = moment(settleY + "-" + settleM + "-01");
      settleD = moment(settleDay).endOf('months').format('DD');
    } else {
      settleD = moment(settleY + "/" + settleM + "/" + settleD).format('DD');
    }
    settleDay = moment(settleY + "-" + settleM + "-" + settleD).format('YYYY-MM-DD');

    record['計算用決算日'].value = settleDay;
    return event;
  });
})(jQuery);
