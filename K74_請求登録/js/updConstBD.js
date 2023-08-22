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
  kintone.events.on(['app.record.create.submit.success'], async (event) => {
    try{
      var record = event.record;
      var clientRecordId = event.recordId;
      var relatedAppId = kintone.app.getRelatedRecordsTargetAppId('顧客契約一覧');
      var billDay = record['請求日'].value;
      var custCd = record['所属・会社名１'].value;;
      var custName = record['顧客名'].value;
      var query;
      var nextenddt =moment(billDay).add(1, 'months').endOf('month').format();

      if (record['所属・会社名１'].value) {
        query = '所属・会社名１ = "' + custCd + '"'+ ' and 退会日 = ""';
      } else {
        query = '顧客名 = "' + custName + '"' + ' and 退会日 = ""';
      }
      var paramGet = {
          'app': relatedAppId,
          'query': query
      };
      //中津店
      //var APP_CONSTLIST = 79; // 入金管理アプリID
      //var APP_OTHERBILL = 82; // 売上管理アプリID
      //var APP_MADO = 178;
      //梅田店
      //var APP_CONSTLIST = 170; // 入金管理アプリID
      //var APP_OTHERBILL = 168; // 売上管理アプリID
      //var APP_MADO = 179;
      //四条烏丸店
      var APP_CONSTLIST = 154; // 入金管理アプリID
      var APP_OTHERBILL = 152; // 売上管理アプリID
      var APP_MADO = 180;

      //var APP_CONSTLIST = 448;
      //var APP_OTHERBILL = 446;
      //var APP_MADO = 505;

      var billNum = record['請求番号'].value;
      var billCD = custCd;
      var billCstName = custName;
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
          "複数入金":{
            "value":[{
                "value":{
                  "登録NO_複数":{
                    "value":""
                  },
                  "入金日_複数":{
                    "value":null
                  },
                  "入金額_複数":{
                    "value":""
                  }
                }
              }]
          }
        }
      };

      var paramList = [];
      var taxtotal=0;

      var virtualFlg = false;
      //売上登録用
      var insbody={
                  "種別":{
                    "value":"system（月額請求）"
                  },
                  "請求番号":{
                    "value":billNum
                  },
                  "請求日":{
                    "value":billDay
                  },
                  "対象顧客":{
                    "value":billCstName
                  },
                  "売上明細":{
                    "value":[]
                  },
                  "消費税差額":{
                    "value":0
                  },
                  "税調整額":{
                    "value": record['税調整額'].value
                  }
              };

      // 請求明細分
      for (var i = 0; i < record['請求明細']['value'].length; i++) {


        var billList = record['請求明細'].value[i].value;

        var ids=[];
        if(billList['更新用ID1'].value != ""){
          var paramGet2 = {
              'app': APP_MADO,
              'query': "登録NO = " + billList['更新用ID1'].value + ""
          };
          const respato = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET',  paramGet2);
            var ato=respato.records;
            for(let v=0;v<ato.length;v++){
              var atolist=ato[v]['料金テーブル'].value;
              for(let w=0;w<atolist.length;w++){
                if(billList['更新用ID2'].value==atolist[w]['id']){
                  ids.push({
                  "id":atolist[w]['id']
                  ,"value":{
                    "自動計上済":{
                      value: ["済"]
                      }
                    }
                  });
                }else{
                     ids.push({"id":atolist[w]['id']});
                }
              }
              var updbody={
                "app":APP_MADO,
                "id":billList['更新用ID1'].value,
                  "record": {
                    "料金テーブル":{
                      "value":ids
                      }
                  }
                };
                //窓口処理後払い更新
                  await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updbody);

            }
          }
        var fromdt;
        var todt;
        if(billList['プラン・オプション'].value.indexOf('通話料') != -1){
          fromdt=nextenddt;
        }else{
          if(billList['利用対象期間_from']['value']==null){
            fromdt=moment(nextenddt).startOf('month').format();
          }else{
            fromdt=moment(billList['利用対象期間_from']['value']).startOf('month').format();
          }
        }

        if(billList['プラン・オプション'].value.indexOf('通話料') != -1){
          todt=nextenddt;
        }else{
          if(billList['利用対象期間_to']['value']==null){
            todt=moment(nextenddt).endOf('month').format();
          }else{
            todt=moment(billList['利用対象期間_to']['value']).endOf('month').format();
          }
        }
        var max=moment(todt).diff(fromdt,'months')+1;

        //金額
        var subbill=0;
        var subtotal=0;

        var tax=0;
          var ritu=record['税率'].value;
          for(var j=0;j<max;j++){
            subbill=Math.round(parseInt(billList['金額']['value'])/max);
            subtotal+=subbill;
            if(j==(max-1)){
              subbill+=parseInt(billList['金額']['value'])-subtotal;
            }
            if(billList['税区分'].value=="課税"){
              if(Number(subbill)>=0){
                tax=Math.floor(Number(subbill) * Number(ritu/100));
              }else{
                tax=Math.ceil(Number(subbill) * Number(ritu/100));
              }
            }else{
              tax=0;
            }
            taxtotal+=Number(tax);
            //売上明細用
            insbody.売上明細.value.push({
                            "value":{
                              "請求対象月":{
                                "value":moment(fromdt).add(j, 'month').endOf('month').format("YYYY-MM-DD")
                              },
                              "項目":{
                                "value":billList['プラン・オプション']['value']
                              },
                              "金額":{
                                "value":subbill
                              },
                              "消費税":{
                                "value":tax
                              },
                              "商品種別":{
                                "value":billList['種別']['value']
                              }
                            }
                          });
          }
      }
      //消費税按分
      var adjusttax=0;

      adjusttax=Number(record['調整前消費税'].value)-taxtotal;
      insbody.消費税差額.value=adjusttax;
      if(adjusttax !=0){
        for(let j=0;j<insbody.売上明細.value.length;j++){
          if(insbody.売上明細.value[j]['value']['消費税'].value!=0){
            insbody.売上明細.value[j]['value']['消費税'].value+=adjusttax;
            break;
          }
        }
      }
        paramList.push(insbody);
        console.log(paramList);
      var paramBulk = {
        'app': APP_OTHERBILL,
        'records': paramList
      };



    // 契約顧客請求日・請求番号更新
    const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', paramGet);
      var records = resp.records;
      var paramPut = {
        'app': relatedAppId,
        'records': createPutRecords(records, billDay, billNum)
      };
    await kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', paramPut);
    // 売上アプリ登録処理
    await kintone.api(kintone.api.url('/k/v1/records', true), 'POST', paramBulk);
    // 入金管理アプリ登録処理
    await kintone.api(kintone.api.url('/k/v1/record', true), 'POST', params);
  } catch(e) {
    // パラメータが間違っているなどAPI実行時にエラーが発生した場合

    alert(e.message);

    return event;
  }
  });
})(jQuery);
