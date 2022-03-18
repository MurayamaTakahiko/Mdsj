//会員顧客名簿の自動計上対象を請求登録
//売上管理、入金管理も登録
(function($) {
    "use strict";
    // moment.locale('ja');
    kintone.events.on('app.record.index.show', function(event) {
      if (event.viewName === "請求登録自動計上") {
        var dt =document.getElementById('date') ;
        var today = new Date();
        dt.value=moment(today).format("YYYY-MM-DD");
      }
    });

  //一括登録ボタン処理
  $(document).on('click', '#bulk_button', async (ev) => {
    try {
    //本番
    var APP_ID = 80;   //会員顧客名簿
    var APP_INVOICE_ID = 74;//請求登録
    var APP_CONSTLIST = 79;
    var APP_SALES_ID = 82;
    //var APP_ID = 447;   //会員顧客名簿
    //var APP_INVOICE_ID = 449;   //請求登録
    //var APP_CONSTLIST = 448;   //入金管理
    //var APP_SALES_ID = 446;
    var TAX=10;
    var proc='';
    var dt =document.getElementById('date') ;
    if(isDate(dt.value,"-")==false){
      alert('請求日が正しくありません。');
      return ;
    }
    var result = window.confirm('一括登録しますか？');
    if(result==false){
        return;
    }
    showSpinner(); // スピナー表示
    var errMsg="";
    var invoicedt =document.getElementById('date').value ;
    //当月末
    var enddt =moment(dt).endOf('month').format();
    //翌月末
    var nextenddt =moment(dt).add(1, 'months').endOf('month').format();
    //翌月初
    var nextstartdt =moment(dt).add(1, 'months').startOf('month').format();
    //前月末
    var prevenddt =moment(dt).add(-1, 'months').endOf('month').format();
    //利用・請求代表 に "請求代表"含む
    //初回プラン利用開始日<=請求月の月末以前
    //自動計上対象に"対象"含む
    //前回請求日が空白または請求月の前月以前
    var body = {
      'app': kintone.app.getId(),
      'query': 'チェックボックス in  ("請求代表") and 入会日_0 <="' + enddt  + '" and  ' +
               '(前回請求日 = "" or 前回請求日 <= "' + prevenddt + '" ) order by レコード番号 '
    };
    //指定年月の日報データを取得
    const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
      var rec=resp.records;
      var i,j;
      for ( i = 0 ; i < rec.length ; i++){
        //新規採番
        var mindt=moment(invoicedt).startOf('month').format();
        var maxdt=moment(invoicedt).endOf('month').format();
        var yymm=moment(invoicedt).format('YYYYMM');
        var body = {
          'app': APP_INVOICE_ID,
          'query': '請求番号 != "" and 請求日 >= "' + mindt +'" and 請求日 <= "' + maxdt + '" order by 請求番号 desc '
        };
        //データ取得
        const resp2 = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
          var rec2=resp2.records;
          var newno;
          if(rec2.length==0){
            newno="NS-" + yymm + "-0001";
          }else{
            var ren=rec2[0]['請求番号'].value;
            var iren=parseInt(ren.substr(-4));
            iren=iren+1;
            var sren=String(iren);
            sren=('0000' + sren).slice(-4);
            newno="NS-" + yymm + "-" + sren;
          }
          //請求登録用
          var insbody={"app":APP_INVOICE_ID,
                  "record":{
                      "請求日":{
                        "value":invoicedt
                      },
                      "自動登録日":{
                        "value":invoicedt
                      },
                      "請求番号":{
                        "value":newno
                      },
                      "顧客名":{
                        "value":rec[i]['顧客名'].value
                      },
                      "所属・会社名１":{
                        "value":rec[i]['所属・会社名１'].value
                      },
                      "フリガナ":{
                        "value":rec[i]['フリガナ'].value
                      },
                      "登録種別":{
                        "value":rec[i]['法人・個人'].value
                      },
                      "顧客番号":{
                        "value":rec[i]['顧客番号'].value
                      },
                      "請求書その他宛名フォーム":{
                        "value":rec[i]['その他宛名'].value
                      },
                      "郵便番号":{
                        "value":rec[i]['郵便番号'].value
                      },
                      "住所":{
                        "value":rec[i]['住所'].value
                      },
                      "契約電話番号":{
                        "value":rec[i]['携帯電話番号'].value
                      },
                      "税率":{
                        "value":TAX
                      },
                      "請求明細":{
                        "value":[]
                    }
                  }
                };
                //売上登録用
                var insbody2={"app":APP_SALES_ID,
                        "record":{
                            "種別":{
                              "value":"system（月額請求）"
                            },
                            "対象顧客":{
                              "value":rec[i]['顧客名'].value
                            },
                            "売上明細":{
                              "value":[]
                            }
                          }
                        };

          //プランリスト
          var subrec=rec[i]['プランリスト'].value;
          for(let j = 0 ; j<subrec.length ; j++){
            //利用開始日が翌月末以前
            //利用終了日が空白もしくは請求月の翌月初以降
            //0円以外
            if(subrec[j]['value']['プラン利用開始日'].value <= nextenddt &&
               (subrec[j]['value']['プラン利用終了日'].value == null || subrec[j]['value']['プラン利用終了日'].value >= nextstartdt) &&
                subrec[j]['value']['プラン料金'].value != "0" ){
              //請求明細用
              insbody.record.請求明細.value.push({
                              "value":{
                                "種別":{
                                  "value":subrec[j]['value']['プラン種別'].value
                                },
                                "プラン・オプション":{
                                  "value":subrec[j]['value']['プラン'].value
                                },
                                "単価":{
                                  "value":subrec[j]['value']['プラン料金'].value
                                },
                                "数量":{
                                  "value":"1"
                                }
                              }
                            });
               //売上明細用
               insbody2.record.売上明細.value.push({
                               "value":{
                                 "請求対象月":{
                                   "value":moment(invoicedt).format('YYYY-MM-DD')
                                 },
                                 "項目":{
                                   "value":subrec[j]['value']['プラン'].value
                                 },
                                 "金額":{
                                   "value":parseInt(parseInt(subrec[j]['value']['プラン料金'].value) * (1+parseInt(TAX)/100))
                                 }
                               }
                             });
            }
          }
          //オプション利用
          var subrec=rec[i]['オプション利用'].value;
          for(let j = 0 ; j<subrec.length ; j++){
            //利用開始日が翌月末以前
            //利用終了日が空白もしくは請求月の翌月初以降
            //0円以外
            if(subrec[j]['value']['オプション利用開始日'].value <= nextenddt &&
               (subrec[j]['value']['オプション利用終了日'].value == null || subrec[j]['value']['オプション利用終了日'].value >= nextstartdt) &&
                subrec[j]['value']['オプション合計料金'].value != "0" ){
              insbody.record.請求明細.value.push({
                              "value":{
                                "種別":{
                                  "value":"オプション"
                                },
                                "プラン・オプション":{
                                  "value":subrec[j]['value']['オプション'].value
                                },
                                "単価":{
                                  "value":subrec[j]['value']['オプション単価'].value
                                },
                                "数量":{
                                  "value":subrec[j]['value']['オプション契約数'].value
                                }
                              }
                            });
                            //売上明細用
                            insbody2.record.売上明細.value.push({
                                            "value":{
                                              "請求対象月":{
                                                "value":moment(invoicedt).format('YYYY-MM-DD')
                                              },
                                              "項目":{
                                                "value":subrec[j]['value']['オプション'].value
                                              },
                                              "金額":{
                                                "value":subrec[j]['value']['オプション合計料金'].value
                                              }
                                            }
                                          });
            }
          }
          if (insbody.record.請求明細.value.length>0){
            //請求登録
            await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody);
              //売上登録
              await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody2);
              //入金登録
              var insbody3 = {
                  "app": APP_CONSTLIST,
                  "record": {
                    "請求番号": {
                      "value": newno
                    },
                    "請求日": {
                      "value": invoicedt
                    }
                  }
                };
                await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody3);
                  //顧客名簿更新
                  var insbody4 = {
                    "app": APP_ID,
                    "id":rec[i]['レコード番号'].value,
                    "record": {
                      "前回請求日": {
                        "value": invoicedt
                      },
                      "前回請求番号": {
                        "value": newno
                      }
                    }
                  };
                  await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', insbody4);
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



  // str: 日付文字列（yyyy-MM-dd, yyyy/MM/dd）
  // delim: 区切り文字（"-", "/"など）
  function isDate (str, delim) {
    var arr = str.split(delim);
    if (arr.length !== 3) return false;
    const date = new Date(arr[0], arr[1] - 1, arr[2]);
    if (arr[0] !== String(date.getFullYear()) || arr[1] !== ('0' + (date.getMonth() + 1)).slice(-2) || arr[2] !== ('0' + date.getDate()).slice(-2)) {
      return false;
    } else {
      return true;
    }
  };
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
