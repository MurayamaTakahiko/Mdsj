//一括登録ボタン表示
(function($) {
    "use strict";
    // moment.locale('ja');
    kintone.events.on('app.record.index.show', function(event) {
        if (event.viewName === "月末一括登録(カレンダー表示)") {
          if (document.getElementById('bulk_button') !== null) {
              return;
          }

          var myIndexButton = document.createElement('button');
          myIndexButton.id = 'bulk_button';
          myIndexButton.innerText = '一括登録';

          kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
      }
    });

    //一括登録ボタン処理
    $(document).on('click', '#bulk_button', function(ev) {
      var result = window.confirm('一括登録しますか？');
      if(result==false){
          return;
      }
      //アプリID
      var APP_ID = 409;   //日報
      var APP_SALES_ID = 410;
      //アプリID本番用
      //var APP_ID = 80;
      //var APP_SALES_ID = 82;

      //カレンダーの年月を取得
      var dts=$('input[id^="selectDate"]');
      var dt=dts[0].value;
      //var dt=document.getElementById('selectDate-:9m-text').value;
      var minDt=moment(dt).startOf('month').format();
      var maxDt=moment(dt).endOf('month').format();
      var body = {
        'app': kintone.app.getId(),
        'query': '日時 >= "' + minDt +  '" and 日時 <="' + maxDt  + '" and 日報種別 in ("ビジター利用日報","メンバー対応日報") and 売上登録済み = ""  order by 日時 '
      };
      //指定年月の日報を取得
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body, function(resp) {
        // success
        console.log(resp);
        var rec=resp.records;
        var i,j;
        for ( i = 0 ; i < rec.length ; i++){
          var subrec=rec[i]['料金テーブル'].value;
          var header;
          var table=[];
          var tableone;
          var id=rec[i]['レコード番号'].value;
          var insbody={"app":APP_SALES_ID,
                  "record":{
                      "種別":{
                        "value":"system（月額請求）"
                      },
                      "対象顧客":{
                        "value":rec[i]['メンバーの場合選択'].value
                      },
                      "備考":{
                        "value":rec[i]['ビジターの場合選択'].value
                      },
                      "売上明細":{
                        "value":[]
                      }
                    }
                  };

          for(let j = 0 ; j<subrec.length ; j++){
            //自動計上項目が入力されているかつ、集金額1円以上
            if(subrec[j]['value']['支払区分'].value =='支払済' && subrec[j]['value']['自動計上項目'].value != null && subrec[j]['value']['自動計上項目'].value !='' &&
              subrec[j]['value']['集金額税込・自動計算'].value >= 1 ){
              insbody.record.売上明細.value.push({
                              "value":{
                                "請求対象月":{
                                  "value":moment(rec[i]['日時'].value).format('YYYY-MM-DD')
                                },
                                "項目":{
                                  "value":subrec[j]['value']['商品名'].value
                                },
                                "金額":{
                                  "value":subrec[j]['value']['集金額税込・自動計算'].value
                                },
                                "支払種別":{
                                  "value":subrec[j]['value']['支払種別'].value
                                }
                              }
                            });
                }
            }
            if (insbody.record.売上明細.value.length>0){
              //登録
              kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody, function(resp) {
                var updbody={
                  "app":APP_ID,
                  "id":id,
                  "record":{
                    "売上登録済み":{
                      "value":"済"
                    }
                  }
                };
                kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updbody, function(resp) {
                  // success
                  console.log(resp);
                }, function(error) {
                  // error
                  alert("エラーが発生しました。")
                  return ;
                });
                  console.log(resp);
                }, function(error) {
                  alert("エラーが発生しました。")
                  return ;
                });
              }

            }
        // success
        alert( '登録しました。');
      }, function(error) {
        // error
        console.log(error);

      });

    });
})(jQuery);
