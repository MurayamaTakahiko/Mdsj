/*
 * 年齢・勤続年数計算プログラム
 * 20201014 MDSJ takahara
 */
jQuery.noConflict();
(function($) {
  "use strict";

  // ロケールを初期化
  moment.locale('ja');
  // 今日までの年月計算
  function getYearMonth(dtDate) {

    var dtToday = moment();
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
  // 今日までの換算人員
  function getCalNum(dtDate) {

    var dtToday = moment();
    var dtFrom = moment(dtDate);
    var years = 0;
    var calnum = 0;
    //入力日が過去日付の場合計算
    if (!dtToday.isBefore(moment(dtFrom), 'day')) {
      years = dtToday.diff(moment(dtFrom), 'years');
      switch (years) {
        case 0:
          calnum = 0.25;
          break;
        case 1:
          calnum = 0.25;
          break;
        case 2:
          calnum = 0.5;
          break;
        default:
          calnum = 1;
      }
    }
    return calnum;
  }

  var events = [
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.create.submit',
    'app.record.edit.submit',
    'app.record.create.change.生年月日',
    'app.record.edit.change.生年月日',
    'app.record.create.change.入社日',
    'app.record.edit.change.入社日'
  ];

  kintone.events.on(events, function(event) {

    var record = event.record; // 保存前の画面上のレコード
    // 生年月日
    var emBirthDay = record['生年月日'].value;
    // 雇用年月日
    var emJoiningDate = record['入社日'].value;
    var year = "";
    var emplYear = "";
    var month = "";
    var day = "";
    var calEmpNum = "";
    // 生年月日から年齢を表示する
    if (emBirthDay) {
      // 年齢
      year = moment().diff(moment(record['生年月日']['value']), 'years');
      record['年齢']['value'] = year;
      // 誕生月
      // month = moment(record['生年月日']['value']).month() + 1;
      // record['誕生月']['value'] = month;
      // 誕生日
      // day = moment(record['生年月日']['value']).date();
      // record['誕生日']['value'] = day;
    }
    // 雇用年月日から勤続年数を表示する
    if (emJoiningDate) {
      emplYear = getYearMonth(record['入社日']['value']);
      record['勤続年数']['value'] = emplYear;
      if (record['ランク'].value === "P1" || record['ランク'].value === "アシスタント") {
        calEmpNum = getCalNum(record['入社日']['value']);
      } else {
        calEmpNum = 1;
      }
      record['換算人員']['value'] = calEmpNum;
    }
    return event;
  });
})(jQuery);
