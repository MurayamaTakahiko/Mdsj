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
    $(document).on('click', '#bulk_button', async (ev) => {
      try {
      var result = window.confirm('一括登録しますか？');
      if(result==false){
          return;
      }
      showSpinner(); // スピナー表示
      //アプリID本番用
      //var APP_ID = 83;
      //var APP_SALES_ID = 82;
      //アプリID
      var APP_ID = 445;   //日報
      var APP_SALES_ID = 446;


      //カレンダーの年月を取得
      var dts=$('input[id^="selectDate"]');
      var dt=dts[0].value;
      var proc='';
      //var dt=document.getElementById('selectDate-:9m-text').value;
      var minDt=moment(dt).startOf('month').format();
      var maxDt=moment(dt).endOf('month').format();
      var body = {
        'app': kintone.app.getId(),
        'query': '日時 >= "' + minDt +  '" and 日時 <="' + maxDt  + '" and ドロップダウン in ("ビジター利用日報","メンバー対応日報") and 売上登録済み = ""  order by 日時 '
      };

      //指定年月の日報を取得
      const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
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
                      "対象ビジター":{
                        "value":rec[i]['ビジターの場合選択'].value
                      },
                      "売上明細":{
                        "value":[]
                      }
                    }
                  };

          for(let j = 0 ; j<subrec.length ; j++){
            //支払済かつ自動計上するかつ、集金額1円以上
            if(subrec[j]['value']['支払区分'].value =='支払済' && subrec[j]['value']['自動計上'].value == '自動計上する'  &&
              subrec[j]['value']['集金額税込・自動計算'].value >= 1 ){
              var item;
              item=subrec[j]['value']['商品名'].value;
              insbody.record.売上明細.value.push({
                              "value":{
                                "請求対象月":{
                                  "value":moment(rec[i]['日時'].value).format('YYYY-MM-DD')
                                },
                                "項目":{
                                  "value":item
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
              const resp2 = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody);
                var updbody={
                  "app":APP_ID,
                  "id":id,
                  "record":{
                    "売上登録済み":{
                      "value":"済"
                      }
                    }
                  };
                    await  kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updbody).then(function(resp3) {
                  });

          }

      }
      hideSpinner(); // スピナー非表示
      alert('登録しました。');
      return ev;
    } catch(e) {
      // パラメータが間違っているなどAPI実行時にエラーが発生した場合
      hideSpinner(); // スピナー非表示
      alert(e.message);
      return ev;
    }
    });


    // スピナーを動作させる関数
    function showSpinner() {
        // 要素作成等初期化処理
        if ($('.kintone-spinner').length == 0) {
            // スピナー設置用要素と背景要素の作成
            var spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
            var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');

            // スピナー用要素をbodyにappend
            $(document.body).append(spin_div, spin_bg_div);

            // スピナー動作に伴うスタイル設定
            $(spin_div).css({
                'position': 'fixed',
                'top': '50%',
                'left': '50%',
                'z-index': '510',
                'background-color': '#fff',
                'padding': '26px',
                '-moz-border-radius': '4px',
                '-webkit-border-radius': '4px',
                'border-radius': '4px'
            });

            $(spin_bg_div).css({
                'position': 'fixed',
                'top': '0px',
                'left': '0px',
                'z-index': '500',
                'width': '100%',
                'height': '200%',
                'background-color': '#000',
                'opacity': '0.5',
                'filter': 'alpha(opacity=50)',
                '-ms-filter': "alpha(opacity=50)"
            });

            // スピナーに対するオプション設定
            var opts = {
                'color': '#000'
            };

            // スピナーを作動
            new Spinner(opts).spin(document.getElementById('kintone-spin'));
        }

        // スピナー始動（表示）
        $('.kintone-spinner').show();
    }

    // スピナーを停止させる関数
    function hideSpinner() {
        // スピナー停止（非表示）
        $('.kintone-spinner').hide();
    }

})(jQuery);
