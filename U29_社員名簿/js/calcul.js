/*
 * 年齢・勤続年数計算プログラム
 * 20200717 MDSJ takahara
 */
jQuery.noConflict();
(function($) {
  "use strict";

  // ロケールを初期化
  moment.locale('ja');
  // 今日までの年月計算
  function getYearMonth(dtDate,dtDate2) {

    var dtToday = moment();
    if(dtDate2){
      dtToday = moment(dtDate2);
    }
    var dtFrom = moment(dtDate);
    var years = 0;
    var months = 0;
    //入力日が過去日付の場合計算
    if (!dtToday.isBefore(moment(dtFrom), 'day')) {
      years = dtToday.diff(moment(dtFrom), 'years');
      months = dtToday.diff(moment(dtFrom), 'months') % 12;
    }
    return years + "年 " + months + "ヶ月";
  }

  var events = [
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.create.submit',
    'app.record.edit.submit',
    'app.record.create.change.BirthDay',
    'app.record.edit.change.BirthDay',
    'app.record.create.change.JoiningDate',
    'app.record.edit.change.JoiningDate'
  ];

  kintone.events.on(events, function(event) {

    var record = event.record; // 保存前の画面上のレコード
    // 生年月日
    var emBirthDay = record['BirthDay'].value;
    // 雇用年月日
    var emJoiningDate = record['JoiningDate'].value;
    var year = "";
    var emplYear = "";
    // 生年月日から年齢を表示する
    if (emBirthDay) {
      year = moment().diff(moment(record['BirthDay']['value']), 'years');
      record['年齢']['value'] = year;
    }
    // 雇用年月日から勤続年数を表示する
    if (emJoiningDate) {
      emplYear = getYearMonth(record['JoiningDate']['value'],record['退職年月日']['value']);
      record['勤続年数']['value'] = emplYear;
    }
    return event;
  });
})(jQuery);
