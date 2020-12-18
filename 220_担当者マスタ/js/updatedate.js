/*
 * 年齢・勤続年数一括更新プログラム
 * 20201210 MDSJ takahara
 */
jQuery.noConflict();
(function($) {
  "use strict";

  // ロケールを初期化
  moment.locale('ja');
  // 今日までの年月計算
  function getYearMonth(dtDate) {
    if (!dtDate) {
      return;
    }
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
  function getCalNum(dtDate, runk) {
    var dtToday = moment();
    var dtFrom = moment(dtDate);
    var years = 0;
    var calnum = 0;
    //入力日が過去日付の場合計算
    if (!dtToday.isBefore(moment(dtFrom), 'day')) {
      if (runk === "P1" || runk === "アシスタント") {
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
      } else {
        calnum = 1;
      }
    }
    return calnum;
  }
  var getRecords = function(app, tmpRecords) {
    var limit = 500;
    var tmpRecords = tmpRecords || [];
    return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: app,
      query: 'limit ' + limit + ' offset ' + tmpRecords.length
    }).then(function(response) {
      tmpRecords = tmpRecords.concat(response.records);
      return response.records.length === limit ? getRecords(app, tmpRecords) : tmpRecords;
    });
  }
  var putRecords = function(app, records) {
    var limit = 100;
    return Promise.all(
      records.reduce(function(recordsBlocks, record) {
        if (recordsBlocks[recordsBlocks.length - 1].length === limit) {
          recordsBlocks.push([record]);
        } else {
          recordsBlocks[recordsBlocks.length - 1].push(record);
        }
        return recordsBlocks;
      }, [
        []
      ]).map(function(recordsBlock) {
        return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', {
          app: app,
          records: recordsBlock
        });
      })
    );
  }

  var events = [
    'app.record.index.show'
  ];

  kintone.events.on(events, function(event) {
    // 一括更新ボタン
    if (document.getElementById('updateButton') !== null) return;
    var button = document.createElement('button');
    button.innerHTML = '年齢更新';
    button.id = 'updateButton';
    kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    button.addEventListener('click', function() {
      getRecords(kintone.app.getId()).then(function(records) {
        putRecords(kintone.app.getId(), records.map(function(record) {
          return {
            id: record.レコード番号.value,
            record: {
              年齢: {
                value: moment().diff(moment(record.生年月日.value), 'years')
              },
              勤続年数: {
                value: getYearMonth(record.入社日.value)
              },
              換算人員: {
                value: getCalNum(record.入社日.value, record.ランク.value)
              }
            }
          };
        })).then(function() {
          location.reload();
        });
      });
    });
    return event;
  });
})(jQuery);
