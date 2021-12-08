/*
 * 完工無案件チェックプログラム
 * 20200925 MDSJ takahara
 * 20210624 MDSJ takahara 工数合計計算
 */
(function() {
  'use strict';

  var events = [
    'mobile.app.record.detail.show',
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show'
  ];
  var timeMath = {
    // 加算
    sum : function() {
      var result, times, second, i,
        len = arguments.length;
      if (len === 0) return;
      for (i = 0; i < len; i++) {
        if (!arguments[i] || !arguments[i].match(/^[0-9]+:[0-9]{2}$/)) continue;
        times = arguments[i].split(':');
        second = this.toSecond(times[0], times[1]);
        if ((!second && second !== 0)) continue;
        if (i === 0) {
          result = second;
        } else {
          result += second;
        }
      }
      return this.toTimeFormat(result);
    },
    // 時間を秒に変換
    toSecond : function(hour, minute) {
      if (!hour || !minute || hour === null || minute === null ||
        typeof hour === 'boolean' ||
        typeof minute === 'boolean' ||
        typeof Number(hour) === 'NaN' ||
        typeof Number(minute) === 'NaN') return;

      return (Number(hour) * 60 * 60) + (Number(minute) * 60);
    },
    // 秒を時間（hh:mm）のフォーマットに変換
    toTimeFormat : function(fullSecond) {
      var hour, minute;
      if ((!fullSecond && fullSecond !== 0) || !String(fullSecond).match(/^[\-0-9][0-9]*?$/)) return;
      var paddingZero = function(n) {
        return (n < 10)  ? '0' + n : n;
      };

      hour   = Math.floor(Math.abs(fullSecond) / 3600);
      minute = Math.floor(Math.abs(fullSecond) % 3600 / 60);
      minute = paddingZero(minute);

      return ((fullSecond < 0) ? '-' : '') + hour + ':' + minute;
    }
  };

  kintone.events.on(events, function(event) {
    var record = event.record;
    var clientRecordId = event.record.案件番号.value;
    var relatedAppId = kintone.mobile.app.getRelatedRecordsTargetAppId('業務日報一覧');
    var query = '案件番号 = "' + clientRecordId + '"';
    var outputFields = ['完工区分', '工数合計'];
    var appUrl = kintone.api.url('/k/m/v1/records');

    var params = {
      'app': relatedAppId,
      'query': query,
      'fields': outputFields
    };

    kintone.api(appUrl, 'GET', params, function(resp) {
      var chkComp = "未";
      var sumWork = "00:00";
      for (var i = 0; i < resp.records.length; i++) {
        if (resp.records[i].完工区分.value === "完") {
          chkComp = "";
          record['完工チェック'].value = [];
          break;
        }
      }
      for (var i = 0; i < resp.records.length; i++) {
        sumWork = timeMath.sum(sumWork, resp.records[i].工数合計.value);
      }
      var sums = sumWork.split(':');
      sumWork = sums[0] + '時間' + sums[1] + '分';
      record.工事工数合計.value = sumWork;
      // record['工事工数合計']['disabled'] = true;
      if (chkComp === "未") {
        record['完工チェック'].value[0] = chkComp;
      }
      kintone.mobile.app.record.set(event);
    });
    record['完工チェック']['disabled'] = true;
    record['請求日']['disabled'] = true;
    record['請求番号']['disabled'] = true;

    return event;
  });
})();
