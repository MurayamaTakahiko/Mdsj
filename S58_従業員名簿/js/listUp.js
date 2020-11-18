/*
 * 年齢・勤続年数一括更新プログラム
 * 20201014 MDSJ takahara
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
    button.innerHTML = '一括更新';
    button.id = 'updateButton';
    kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    button.addEventListener('click', function() {
      getRecords(kintone.app.getId()).then(function(records){
        putRecords(kintone.app.getId(),records.map(function(record){
          return {
            id: record.レコード番号.value,
            record: {
              年齢: {
                value: moment().diff(moment(record.BirthDay.value), 'years')
              },
              誕生月: {
                value: moment(record['BirthDay']['value']).month() + 1
              },
              勤続年数: {
                value: getYearMonth(record.JoiningDate.value)
              },
              誕生日: {
                value: moment(record['BirthDay']['value']).date()
              }
            }
          };
        })).then(function(){
          location.reload();
        });
      });
    });
    return event;
  });
})(jQuery);
