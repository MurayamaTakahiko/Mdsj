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

  //登録実行前に郵送前連絡、その他にチェックがある場合、アラート表示
  var events = [
    'app.record.create.submit'
  ];
  //kintone.events.on(events, function(event) {
    kintone.events.on(events, async (event) => {
      try{
        var record = event.record;
        // var billRecordId = event.record.請求番号.value;
        var relatedAppId = kintone.app.getRelatedRecordsTargetAppId('工事依頼一覧');
        var custCd = record['得意先CD'].value;
        var query = '得意先CD = "' + custCd + '" and 金額入力日 != "" and 請求日 = ""';
        // var query = '請求番号 = "' + billRecordId + '"';
        //var query='';
        var appUrl = kintone.api.url('/k/v1/records');
        var params = {
            'app': relatedAppId,
            'query': query
        };
        var result=false;
        const resp=  await kintone.api(appUrl, 'GET', params);
        for (var i = 0; i < resp.records.length; i++) {
          if (resp.records[i].請求時注意事項.value.length != 0) {
            result=true;
            break;
          }
        }
        if (result == true) {
          // alert('請求書送付時の注意事項あり');
          var res = confirm("請求書送付時の注意事項あり");
          if (res === false) {
            event.error = 'キャンセルしました';
            //window.location.href = window.location.origin + window.location.pathname + "#record=" + event.recordId; // 画面遷移
            return event;
          }
        }
        //請求番号採番***************
        var nowmindt=moment().startOf('year').format();
        var nowmaxdt=moment().endOf('year').format();
        var yy=moment().format('YYYY').slice(-2);
        var body = {
          'app': kintone.app.getId(),
          'query': '請求番号 != "" and 作成日時 >= "' + nowmindt +'" and 作成日時 <= "' + nowmaxdt + '" order by 請求番号 desc '
        };
        const resp2= await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body);
        var recno=resp2.records;
        var newno;
        if(recno.length==0){
          newno="3" + yy + "0001";
        }else{
          var ren=recno[0]['請求番号'].value;
          var iren=parseInt(ren.substr(-4));
          iren=iren+1;
          var sren=String(iren);
          sren=('0000' + sren).slice(-4);
            newno="3" + yy + sren;
        }
        record['請求番号'].value=newno;
        return event;
     }catch(e) {
       // パラメータが間違っているなどAPI実行時にエラーが発生した場合
         alert(e.message);
       return event;
     }

  });

  //更新実行前に郵送前連絡、その他にチェックがある場合、アラート表示
  var events = [
    'app.record.edit.submit'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    var billRecordId = event.record.請求番号.value;
    var relatedAppId = kintone.app.getRelatedRecordsTargetAppId('工事依頼一覧');
    var query = '請求番号 = "' + billRecordId + '"';
    //var query='';
    var appUrl = kintone.api.url('/k/v1/records');
    var params = {
        'app': relatedAppId,
        'query': query
    };
    var result=false;
    kintone.api(appUrl, 'GET', params, function(resp) {
      for (var i = 0; i < resp.records.length; i++) {
        if (resp.records[i].請求時注意事項.value.length != 0) {
          result=true;
          break;
        }
      }
      if (result == true) {
        // alert('請求書送付時の注意事項あり');
        var res = confirm("請求書送付時の注意事項あり");
        if (res === false) {
          event.error = 'キャンセルしました';
          window.location.href = window.location.origin + window.location.pathname + "#record=" + event.record.$id.value; // 画面遷移
        }
      }
    });
  });

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
    //var APP_CONSTLIST = 37;
    var APP_CONSTLIST = 476;
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
