(function ($) {
    "use strict";

    kintone.events.on(['app.record.index.show'], function (event) {

      if (event.viewName === "入金自動充当") {
        //中津店
        //var APP_SALES_ID = 82;  //売上管理
        //var APP_NYUKIN_ID= 79; //入金管理
        //var APP_KOZA_ID = 189  //口座管理
        //梅田店
        //var APP_SALES_ID = 168;  //売上管理
        //var APP_NYUKIN_ID= 170; //入金管理
        //var APP_KOZA_ID = 191  //口座管理
        //四条烏丸店
        //var APP_SALES_ID = 152;  //売上管理
        //var APP_NYUKIN_ID= 154; //入金管理
        //var APP_KOZA_ID = 194  //口座管理

        var APP_SALES_ID = 446;  //売上管理
        var APP_NYUKIN_ID= 448; //入金管理
        var APP_KOZA_ID = 511  //口座管理
        var appId = event.appId;
          if (document.getElementById('bulk_button') !== null) {
              return;
          }

          var myIndexButton = document.createElement('button');
          myIndexButton.id = 'bulk_button';
          myIndexButton.innerText = '自動充当';

          kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);

        //「post」ボタン押下時の処理
        $(document).on('click', '#bulk_button', async (ev) => {
          try{
            if (window.confirm('入金自動充当します。よろしいでしょうか？')) {
                showSpinner(); // スピナー表示
                var param = {
                  'app': kintone.app.getId(),
                  'query': '入金処理 in ("未") order by 登録NO limit 500'
                };
                //未処理の預かり金を取得
                const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param);
                var rec=resp.records;
                for (let i = 0 ; i < rec.length ; i++){
                  var furinm = rec[i]['振込人名'].value;
                  var kin = Number(rec[i]['入金金額'].value);
                  var nyukindt=rec[i]['入金日'].value;
                  var azukari_id=rec[i]['登録NO'].value;
                  var param2 = {
                    'app': APP_KOZA_ID,
                    'query': '振込人名 = "' + furinm + '" order by 登録日 desc limit 500'
                  };
                  //振込人名が一致する口座管理を取得
                  const resp2 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param2);
                  var rec2=resp2.records;
                  for (let j = 0 ; j < rec2.length ; j++){
                    if(rec2[j]['顧客番号'].value == "" && rec2[j]['登録NO_ビジター'].value==""){
                      continue;
                    }
                    if(rec2[j]['顧客番号'].value != ""){
                      var param3 = {
                        'app': APP_NYUKIN_ID,
                        'query': '顧客番号 = "' + rec2[j]['顧客番号'].value + '" and 残金額 != 0 order by 請求日 desc limit 500'
                      };
                    }
                    if(rec2[j]['登録NO_ビジター'].value != ""){
                      var param3 = {
                        'app': APP_NYUKIN_ID,
                        'query': '登録NO_ビジター = "' + rec2[j]['登録NO_ビジター'].value + '" and 残金額 != 0 order by 請求日 desc limit 500'
                      };
                    }
                    //入金金額
                    const resp3 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param3);
                    var rec3=resp3.records;

                    for (let k = 0 ; k < rec3.length ; k++){
                        //残金額と一致する場合
                        if(Number(rec3[k]['残金額'].value)==kin){
                          var seikyu_no=rec3[k]['請求番号'].value;
                          var kbn;
                          switch (rec[i]['種類'].value) {
                            case "振込（りそな）":
                              kbn="振込";
                              break;
                            case "振込（三井住友）":
                              kbn="振込";
                              break;
                            case "自動引落（りそな）":
                              kbn="自動引落";
                              break;
                            case "自動引落（三井住友）":
                              kbn="自動引落";
                              break;
                            default:
                              kbn="その他";
                              break;
                          }
                          //充当処理
                          var updparam = {
                            "app": APP_NYUKIN_ID,
                            "id":rec3[k]['レコード番号'].value,
                            "record": {
                              "登録NO_預り金": {
                                "value": azukari_id
                              },
                              "入金区分":{
                                "value":kbn
                              },
                              "入金日":{
                                "value":nyukindt
                              },
                              "入金額":{
                                "value":kin
                              }
                            }
                          };
                            //入金管理更新
                            await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updparam);

                            //請求番号で売上を検索
                            var param4 = {
                              'app': APP_SALES_ID,
                              'query': '請求番号 = "' + seikyu_no + '" and 登録NO_預り金 = "" '
                            };
                            const resp4 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param4);
                            var rec4=resp4.records;
                            for (let l = 0 ; l < rec4.length ; l++){
                              var subrec4=rec4[l]['売上明細'].value;
                              var ids=[];
                               for(let v=0;v<subrec4.length;v++){
                                   ids.push({
                                   "id":subrec4[v]['id']
                                   ,"value":{
                                     "支払種別":{
                                       value: kbn
                                       }
                                     }
                                   });
                                 }
                              //売上管理
                              var updparam2 = {
                                "app": APP_SALES_ID,
                                "id":rec4[l]['登録NO'].value,
                                "record": {
                                  "入金確認日": {
                                    "value": nyukindt
                                  },
                                  "登録NO_預り金": {
                                    "value": azukari_id
                                  },
                                  "売上明細":{
                                    "value":ids
                                  }
                                }
                                };
                                //売上管理更新
                                await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updparam2);
                            }
                           //預り金更新
                           var updparam3 = {
                             "app": kintone.app.getId(),
                             "id":azukari_id,
                             "record": {
                               "入金処理": {
                                 "value": "済"
                               }
                             }
                             };
                          await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updparam3);
                        }
                    }
                }
              }
              hideSpinner(); // スピナー非表示
              alert('登録しました。');
              return ev;
            } else {

            }

        } catch(e){
          // パラメータが間違っているなどAPI実行時にエラーが発生した場合
          hideSpinner(); // スピナー非表示
          alert(e.message);
          return ev;
        }
        });
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
