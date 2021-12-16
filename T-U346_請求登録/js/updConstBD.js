/*
 * 工事依頼請求日更新プログラム
 * 20200825 MDSJ takahara
 * 20210510 MDSJ takahara Update
 */
jQuery.noConflict();
(function($) {
  "use strict";

  /**
   * kintone REST APIで一括更新するrecordsデータを作成する関数
   * @param records kintone REST APIで一括取得したrecordsデータ
   * @param billDay 一括更新する請求日データ
   * @param billDay 一括更新する請求番号データ
   * @returns {Array} kintone REST APIで一括更新するrecordsデータ
   */
  function createPutRecords(records, billDay, billNum) {
    var putRecords = [];
    for (var i = 0, l = records.length; i < l; i++) {
      var record = records[i];
      putRecords[i] = {
        id: record.$id.value,
        record: {
          請求日: {
            value: billDay
          },
          請求番号: {
            value: billNum
          }
        }
      };
    }
    return putRecords;
  }

  // 新規保存成功後イベント
  kintone.events.on(['app.record.create.submit.success'], function(event) {
    var record = event.record;
    var clientRecordId = event.recordId;
    var relatedAppId = kintone.app.getRelatedRecordsTargetAppId('工事依頼一覧');
    var billDay = record['請求日'].value;
    var custCd = record['得意先CD'].value;
    var query = '得意先CD = "' + custCd + '" and 金額入力日 != "" and 請求日 = ""';
    var paramGet = {
        'app': relatedAppId,
        'query': query
    };
    // 入金管理アプリID
    var APP_CONSTLIST = 351;
    var billNum = record['請求番号'].value;
    var billCD = record['得意先CD'].value;
    var billCstName = record['得意先名'].value;
    var billDay = record['請求日'].value;
    var billPrice = record['請求総額'].value;
    var params = {
        'app': APP_CONSTLIST,
        "record": {
          "請求番号": {
            "value": billNum
          },
          "請求先CD": {
            "value": billCD
          },
          "請求先名": {
            "value": billCstName
          },
          "請求日": {
            "value": billDay
          },
          "請求額": {
            "value": billPrice
          },
          "請求先区分": {
            "value": "法人"
          }
        }
      };
    // 工事依頼請求日・請求番号更新
    return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', paramGet).then(function(resp) {
      var records = resp.records;
      var paramPut = {
        'app': relatedAppId,
        'records': createPutRecords(records, billDay, billNum)
      };
      return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', paramPut).then(function(resp) {
        // 入金管理アプリ登録処理
        return kintone.api(kintone.api.url('/k/v1/record', true), 'POST', params).then(function(resp) {
          console.log(resp);
        });
      });
    });
  });
})(jQuery);
