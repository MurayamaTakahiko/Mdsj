/*
 * 契約顧客請求日更新プログラム
 * 20210628 MDSJ takahara
 * 20210712 MDSJ takahara Update
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
          前回請求日: {
            value: billDay
          },
          前回請求番号: {
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
    var relatedAppId = kintone.app.getRelatedRecordsTargetAppId('顧客契約一覧');
    var billDay = record['請求日'].value;
    var custCd = record['所属・会社名１'].value;
    var query = '所属・会社名１ = "' + custCd + '"';
    var paramGet = {
        'app': relatedAppId,
        'query': query
    };
    // 入金管理アプリID
    var APP_CONSTLIST = 79;
    var billNum = record['請求番号'].value;
    var billCD = record['所属・会社名１'].value;
    var billCstName = record['顧客名'].value;
    var billCstCd = record['顧客番号'].value;
    var billDay = record['請求日'].value;
    var billPrice = record['請求総額'].value;
    var params = {
        'app': APP_CONSTLIST,
        "record": {
          "請求番号": {
            "value": billNum
          },
          "請求先所属・会社名": {
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
      // その他売上請求アプリID
      var APP_OTHERBILL = 82;
      var paramList = [];
      // 請求明細分をそれぞれ別レコードで
      for (var i = 0; i < record['請求明細']['value'].length; i++) {
        var billList = record['請求明細'].value[i].value;
        var paramOne = {
          "顧客番号": {
            "value": billCstCd
          },
          "所属・会社名１": {
            "value": billCD
          },
          "対象顧客": {
            "value": billCstName
          },
          "請求対象月": {
            "value": billDay
          },
          "種別": {
            "value": "月額請求"
          },
          "項目": {
            "value": billList['プラン・オプション']['value']
          },
          "金額": {
            "value": billList['小計']['value']
          }
        };
        paramList.push(paramOne);
        console.log(paramList);
      }
      var paramBulk = {
        'app': APP_OTHERBILL,
        'records': paramList
      };
    // 契約顧客請求日・請求番号更新
    return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', paramGet).then(function(resp) {
      var records = resp.records;
      var paramPut = {
        'app': relatedAppId,
        'records': createPutRecords(records, billDay, billNum)
      };
      return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', paramPut).then(function(resp) {
        // 売上アプリ登録処理
        kintone.api(kintone.api.url('/k/v1/records', true), 'POST', paramBulk, function(resp) {
          // success
          console.log(resp);
        }, function(error) {
          // error
          console.log(error);
        });
        // 入金管理アプリ登録処理
        return kintone.api(kintone.api.url('/k/v1/record', true), 'POST', params).then(function(resp) {
          console.log(resp);
        });
      });
    });
  });
})(jQuery);
