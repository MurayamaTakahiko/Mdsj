//会員顧客名簿の自動計上対象を請求登録
//売上管理、入金管理も登録
(function($) {
    "use strict";

    //請求番号編集２箇所
    //中津店
    //var APP_ID = 80;   //会員顧客名簿
    //var APP_INVOICE_ID = 74;//請求登録
    //var APP_CONSTLIST = 79;
    //var APP_SALES_ID = 82;
    //var APP_CALL = 81;
    //var APP_MADO = 178;
    //var TEL_ITEM_NO=121;
    //var APP_ITEM = 17;
    //var KIGO='NS';

    //////請求番号採番時ロジック編集(US)
    //梅田店
    //var APP_ID = 156;   //会員顧客名簿
    //var APP_INVOICE_ID = 169;//請求登録
    //var APP_CONSTLIST = 170;
    //var APP_SALES_ID = 168;
    //var APP_CALL = 183;
    //var APP_MADO = 179;
    //var TEL_ITEM_NO=229;
    //var APP_ITEM = 157;
    //var KIGO='US';

    //////請求番号採番時ロジック編集(SS)
    var APP_ID = 140;   //会員顧客名簿
    var APP_INVOICE_ID = 153;//請求登録
    var APP_CONSTLIST = 154;
    var APP_SALES_ID = 152;
    var APP_CALL = 185;
    var APP_MADO = 180;
    var TEL_ITEM_NO=141;
    var APP_ITEM = 141;
    var KIGO='SS';

    //var APP_ID = 447;   //会員顧客名簿
    //var APP_INVOICE_ID = 449;   //請求登録
    //var APP_CONSTLIST = 448;   //入金管理
    //var APP_SALES_ID = 446;
    //var APP_CALL = 461;
    //var APP_MADO = 505;
    //var TEL_ITEM_NO=238;
    //var APP_ITEM = 458;
    //var KIGO='NS';

    var TAX=10;
    // moment.locale('ja');
    kintone.events.on('app.record.index.show', function(event) {
      if (event.viewName === "請求登録自動計上") {
        var dt =document.getElementById('date') ;
        var today = new Date();
        dt.value=moment(today).format("YYYY-MM-DD");
      }
    });

  //一括登録ボタン処理
  $(document).on('click', '#bulk_button1', async (ev) => {
    try {
      await Proc(1);
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
    //一括登録ボタン処理
    $(document).on('click', '#bulk_button2', async (ev) => {
      try {
        await Proc(2);
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
    async function Proc(n){
      //////請求番号採番時ロジック編集(NS)
      var taxkbn;
      var proc='';
      var count=0;
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
      var total=0;
      var invoicedt =document.getElementById('date').value ;
      //当月末
      var enddt =moment(invoicedt).endOf('month').format("YYYY-MM-DD");
      //翌月末
      var nextenddt =moment(invoicedt).add(1, 'months').endOf('month').format("YYYY-MM-DD");
      //翌月初
      var nextstartdt =moment(invoicedt).add(1, 'months').startOf('month').format("YYYY-MM-DD");
      //前月末
      var prevenddt =moment(invoicedt).add(-1, 'months').endOf('month').format("YYYY-MM-DD");

      var stateldt;
      //通話料６か月前
      var stateldt6=moment(invoicedt).add(-6, 'months').startOf('month').format("YYYY-MM-DD");
      //通話料2か月前
      var stateldt2=moment(invoicedt).add(-2, 'months').startOf('month').format("YYYY-MM-DD");

      var nextinvoicedt;
      //６か月後
      var enddt6=moment(invoicedt).add(6, 'months').endOf('month').format("YYYY-MM-DD");


      var max=0;
      //利用・請求代表 に "請求代表"含む
      //初回プラン利用開始日<=請求月の月末以前
      //入会日<=請求日の前月以前
      //自動計上対象に"対象"含む
      //前回請求日が空白または請求月の前月以前
      var body;
      if(n==2){
        body = {
          'app': kintone.app.getId(),
           'query': 'チェックボックス in  ("請求代表") and 入会日_0 <="' + enddt  + '" and  入会日 <= "' + prevenddt + '" and ' +
                    '(前回請求日 != "" and 前回請求日 <= "' + prevenddt + '" ) and (退会日 = "" or 退会日 >= "' + nextstartdt + '")  and 請求自動登録 in ("自動登録2（通話料有り等）") order by レコード番号 limit 500'
        };
      }else{
        body = {
          'app': kintone.app.getId(),
           'query': 'チェックボックス in  ("請求代表") and 入会日_0 <="' + enddt  + '" and  入会日 <= "' + prevenddt + '" and ' +
                    '(前回請求日 != "" and 前回請求日 <= "' + prevenddt + '" ) and (退会日 = "" or 退会日 >= "' + nextstartdt + '")  and 請求自動登録 in ("","自動登録1") order by レコード番号 limit 500'
        };
      }

      //指定年月のデータを取得
      const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
      //オプション終了日
      var optenddt=null;
      //プラン終了日
      var planenddt=null;

        var rec=resp.records;
        var i,j;
        for ( i = 0 ; i < rec.length ; i++){
          total=0;
          var subtotal=0;          //課税対象額
          var subnototal=0;        //非課税対象額
          var tax=0;
          var taxtotal=0;
          //100件で終了
          if(count>=100){
            break;
          }
          var firstplandt=rec[i]['入会日_0'].value;
          var previnvoicedt=rec[i]['前回請求日'].value;
          //新規採番
          var mindt=moment().startOf('month').format();
          var maxdt=moment().endOf('month').format();
          var yymm=moment().format('YYYYMM');
          var yymm2;
          var body = {
            'app': APP_INVOICE_ID,
            'query': '請求番号 != "" and 作成日時 >= "' + mindt +'" and 作成日時 <= "' + maxdt + '" order by 請求番号 desc '
          };
          //データ取得
          const resp2 = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
            var rec2=resp2.records;
            var newno;
            if(rec2.length==0){
              //newno="NS-" + yymm + "-0001";
              //newno="US-" + yymm + "-0001";
              //newno="SS-" + yymm + "-0001";
              newno=KIGO + "-" + yymm + "-0001";
            }else{
              var ren=rec2[0]['請求番号'].value;
              var iren=parseInt(ren.substr(-4));
              iren=iren+1;
              var sren=String(iren);
              sren=('0000' + sren).slice(-4);
              //newno="NS-" + yymm + "-" + sren;
              //newno="US-" + yymm + "-" + sren;
              //newno="SS-" + yymm + "-" + sren;
              newno=KIGO + "-" + yymm + "-" + sren;
            }
            //前回請求日、請求総額
            body = {
              'app': APP_INVOICE_ID,
              'query': '顧客番号 = "' + rec[i]['顧客番号'].value + '" order by 請求日 desc '
            };
            //データ取得
            const resp2_2 = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
            var rec2_2=resp2_2.records;
            var zen_seikyudt="";
            var zen_seikyukin=0;
            if(rec2_2.length!=0){
              zen_seikyudt=rec2_2[0]['請求日'].value;
              zen_seikyukin=rec2_2[0]['請求総額'].value;
            }
            //請求登録用
            var insbody={"app":APP_INVOICE_ID,
                    "record":{
                        "請求日":{
                          "value":invoicedt
                        },
                        "自動計上種別":{
                          "value":"system（月額請求）"
                        },
                        "自動登録日":{
                          "value":moment().format("YYYY-MM-DD")
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
                        "取得ID":{
                          "value":rec[i]['レコード番号'].value
                        },
                        "請求明細":{
                          "value":[]
                       },
                       "テーブル":{
                         "value":[]
                      },
                      "課税対象額":{
                        "value":0
                      },
                      "非課税対象額":{
                        "value":0
                      },
                      "調整前消費税":{
                        "value":0
                      },
                      "税調整額":{
                        "value":0
                      },
                      "消費税":{
                        "value":0
                      },
                      "請求総額":{
                        "value":0
                      },
                      "前回請求日":{
                        "value":zen_seikyudt
                      },
                      "前回請求額":{
                        "value":zen_seikyukin
                      }
                    }
                  };
                  //売上登録用
                  var insbody2={"app":APP_SALES_ID,
                          "record":{
                              "種別":{
                                "value":"system（月額請求）"
                              },
                              "請求番号":{
                                "value":newno
                              },
                              "請求日":{
                                "value":invoicedt
                              },
                              "対象顧客":{
                                "value":rec[i]['顧客名'].value
                              },
                              "売上明細":{
                                "value":[]
                              },
                              "消費税差額":{
                                "value":0
                              },
                              "税調整額":{
                                "value":0
                              }
                            }
                          };

            //プランリスト
            var subrec=rec[i]['プランリスト'].value;
            var virtualflg=false;
            for(let j = 0 ; j<subrec.length ; j++){
              //0円以外
              if(subrec[j]['value']['プラン料金'].value != "0" ){
                    //バーチャルかどうか
                    if(subrec[j]['value']['プラン種別'].value==="バーチャル"){
                      if(moment(subrec[j]['value']['プラン利用開始日'].value).format("YYYYMM")<=moment(nextstartdt).format('YYYYMM') &&
                         moment(subrec[j]['value']['プラン利用終了日'].value).format("YYYYMM")>=moment(nextstartdt).format('YYYYMM')){
                        virtualflg=true;
                         }
                      //virtualflg=true;
                      //3月もくは９月の場合で、初回プラン利用開始日の月＜今回請求日の月
                      if((moment(invoicedt).month()==2 || moment(invoicedt).month()==8) && (moment(firstplandt).format('YYYYMM')<moment(invoicedt).format('YYYYMM')) && previnvoicedt != null){
                        //プラン終了日が6か月以前の場合
                        if(subrec[j]['value']['プラン利用終了日'].value != null && enddt6>=subrec[j]['value']['プラン利用終了日'].value){
                          planenddt=moment(subrec[j]['value']['プラン利用終了日'].value).startOf('month').format("YYYY-MM-DD");
                          max=moment(planenddt).diff(nextstartdt,'months')+1;
                        }else{
                          planenddt=moment(enddt6).startOf('month').format("YYYY-MM-DD");
                          max=6
                        }
                        for(let k=0;k<max;k++){
                          // 売上管理の窓口入金済みにあるかどうか
                          body = {
                            'app': APP_SALES_ID,
                            'query': '登録NO_メンバー = "' + rec[i]['レコード番号'].value + 　'" and ' +
                                     '請求対象月 >= "' + moment(invoicedt).add(k+1, 'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                     '請求対象月 <= "' + moment(invoicedt).add(k+1, 'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                     '商品番号 in ("' + subrec[j]['value']['商品番号_プラン'].value + '") and 窓口入金 in ("済") '
                          };
                          //データ取得
                          const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                          //入金済に存在しなかったら
                          if(respsumi.records.length == 0){
                            //税区分
                            taxkbn = await getTaxkbn(subrec[j]['value']['商品番号_プラン'].value);
                            yymm2= Number(moment(invoicedt).add(k+1, 'month').year()).toString().slice(-2) + '.' + Number(moment(invoicedt).add(k+1, 'month').month()+1);
                            //請求明細用
                            insbody.record.請求明細.value.push({
                                            "value":{
                                              "種別":{
                                                "value":subrec[j]['value']['プラン種別'].value
                                              },
                                              "プラン・オプション":{
                                                "value":subrec[j]['value']['プラン'].value +'（' + yymm2 + '月分）',
                                              },
                                              "単価":{
                                                "value":subrec[j]['value']['プラン料金'].value
                                              },
                                              "税区分":{
                                                "value":taxkbn
                                              },
                                              "数量":{
                                                "value": 1
                                              },
                                                "利用対象期間_from":{
                                                  "value":moment(invoicedt).add(k+1, 'month').startOf('month').format("YYYY-MM-DD")
                                              },
                                                "利用対象期間_to":{
                                                  "value":moment(invoicedt).add(k+1, 'month').endOf('month').format("YYYY-MM-DD")
                                              }
                                            }
                                          });
                              if(taxkbn=="課税"){
                                if(Number(subrec[j]['value']['プラン料金'].value)>=0){
                                  tax=Math.floor(Number(subrec[j]['value']['プラン料金'].value) * Number(TAX/100));
                                }else{
                                  tax=Math.ceil(Number(subrec[j]['value']['プラン料金'].value) * Number(TAX/100));
                                }
                              }else{
                                tax=0;
                              }
                              taxtotal+=Number(tax);
                              //売上明細用
                              insbody2.record.売上明細.value.push({
                                              "value":{
                                                "請求対象月":{
                                                  "value":moment(invoicedt).add(k+1, 'month').endOf('month').format("YYYY-MM-DD")
                                                },
                                                "項目":{
                                                  "value":subrec[j]['value']['プラン'].value +'（' + yymm2 + '月分）'
                                                },
                                                "金額":{
                                                  "value":Number(subrec[j]['value']['プラン料金'].value)
                                                },
                                                "消費税":{
                                                  "value":tax
                                                },
                                                "商品種別":{
                                                  "value":subrec[j]['value']['プラン種別'].value
                                                },
                                                "商品番号":{
                                                  "value":subrec[j]['value']['商品番号_プラン'].value
                                                }
                                              }
                                            });
                              if(taxkbn=="課税"){
                                subtotal=Number(subtotal) + Number(subrec[j]['value']['プラン料金'].value);
                              }else{
                                subnototal=Number(subnototal) + Number(subrec[j]['value']['プラン料金'].value);
                              }
                          }
                        }
                    }
                  }else{
                    if(moment(nextenddt).format('YYYYMM') >= moment(subrec[j]['value']['プラン利用開始日'].value).format('YYYYMM') &&
                        (moment(nextenddt).format('YYYYMM') <= moment(subrec[j]['value']['プラン利用終了日'].value).format('YYYYMM')|| subrec[j]['value']['プラン利用終了日'].value == null)){
                          // 売上管理の窓口入金済みにあるかどうか
                          body = {
                            'app': APP_SALES_ID,
                            'query': '登録NO_メンバー = "' + rec[i]['レコード番号'].value + 　'" and ' +
                                     '請求対象月 >= "' + moment(invoicedt).add(1, 'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                     '請求対象月 <= "' + moment(invoicedt).add(1, 'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                     '商品番号 in ("' + subrec[j]['value']['商品番号_プラン'].value + '") and 窓口入金 in ("済") '
                          };
                          //データ取得
                          const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                          //入金済に存在しなかったら
                          if(respsumi.records.length == 0){
                            //税区分
                            taxkbn = await getTaxkbn(subrec[j]['value']['商品番号_プラン'].value);
                            yymm2= Number(moment(invoicedt).add(1, 'month').year()).toString().slice(-2) + '.' + Number(moment(invoicedt).add(1, 'month').month()+1);
                            //請求明細用
                            insbody.record.請求明細.value.push({
                                            "value":{
                                              "種別":{
                                                "value":subrec[j]['value']['プラン種別'].value
                                              },
                                              "プラン・オプション":{
                                                "value":subrec[j]['value']['プラン'].value +'（' + yymm2 + '月分）',
                                              },
                                              "単価":{
                                                "value":subrec[j]['value']['プラン料金'].value
                                              },
                                              "税区分":{
                                                "value":taxkbn
                                              },
                                              "数量":{
                                                "value":"1"
                                              },
                                                "利用対象期間_from":{
                                                  "value":moment(invoicedt).add(1, 'month').startOf('month').format("YYYY-MM-DD")
                                              },
                                                "利用対象期間_to":{
                                                  "value":moment(invoicedt).add(1, 'month').endOf('month').format("YYYY-MM-DD")
                                              }
                                            }
                                          });
                              if(taxkbn=="課税"){
                                if(Number(subrec[j]['value']['プラン料金'].value)>=0){
                                  tax=Math.floor(Number(subrec[j]['value']['プラン料金'].value) * Number(TAX/100));
                                }else{
                                  tax=Math.ceil(Number(subrec[j]['value']['プラン料金'].value) * Number(TAX/100));
                                }
                              }else{
                                tax=0;
                              }
                              taxtotal+=Number(tax);
                                 //売上明細用
                             insbody2.record.売上明細.value.push({
                                             "value":{
                                               "請求対象月":{
                                                 "value":moment(invoicedt).add(1, 'month').endOf('month').format("YYYY-MM-DD")
                                               },
                                               "項目":{
                                                 "value":subrec[j]['value']['プラン'].value +'（' + yymm2 + '月分）'
                                               },
                                               "金額":{
                                                 "value":Number(subrec[j]['value']['プラン料金'].value)
                                               },
                                               "消費税":{
                                                 "value":tax
                                               },
                                               "商品種別":{
                                                 "value":subrec[j]['value']['プラン種別'].value
                                               },
                                               "商品番号":{
                                                 "value":subrec[j]['value']['商品番号_プラン'].value
                                               }
                                             }
                                           });
                             if(taxkbn=="課税"){
                               subtotal=Number(subtotal) + Number(subrec[j]['value']['プラン料金'].value);
                             }else{
                               subnototal=Number(subnototal) + Number(subrec[j]['value']['プラン料金'].value);
                             }
                          }
                        }
                    }
                }
            }
            //オプション利用
            var subrec=rec[i]['オプション利用'].value;
            for(let j = 0 ; j<subrec.length ; j++){
              //0円以外
              if(subrec[j]['value']['オプション合計料金'].value != "0" ){
                    if(virtualflg){
                      //3月もくは９月の場合で、初回プラン利用開始日の月＜今回請求日の月
                       if((moment(invoicedt).month()==2 || moment(invoicedt).month()==8) && (moment(firstplandt).format('YYYYMM')<moment(invoicedt).format('YYYYMM')) && previnvoicedt != null){
                         //プラン終了日が6か月以前の場合
                         if((subrec[j]['value']['オプション利用終了日'].value != null &&
                             enddt6>=subrec[j]['value']['オプション利用終了日'].value) || (planenddt != null && enddt6>=planenddt)){
                             optenddt=moment(subrec[j]['value']['オプション利用終了日'].value).startOf('month').format();
                           //バーチャルプラン終了日と比較
                           if(planenddt == null){
                             max=moment(optenddt).diff(nextstartdt,'months')+1;
                           }else if(optenddt<planenddt){
                             max=moment(optenddt).diff(nextstartdt,'months')+1;
                           }else{
                             max=moment(planenddt).diff(nextstartdt,'months')+1;
                           }

                         }else{
                           max=6
                         }
                         for(let k=0;k<max;k++){
                           // 売上管理の窓口入金済みにあるかどうか
                           body = {
                             'app': APP_SALES_ID,
                             'query': '登録NO_メンバー = "' + rec[i]['レコード番号'].value + 　'" and ' +
                                      '請求対象月 >= "' + moment(invoicedt).add(k+1, 'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                      '請求対象月 <= "' + moment(invoicedt).add(k+1, 'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                      '商品番号 in ("' + subrec[j]['value']['商品番号_オプション'].value + '") and 窓口入金 in ("済") '
                           };
                           //データ取得
                           const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                           //入金済に存在しなかったら
                           if(respsumi.records.length == 0){
                             //税区分
                             taxkbn = await getTaxkbn(subrec[j]['value']['商品番号_オプション'].value);
                             yymm2= Number(moment(invoicedt).add(1, 'month').year()).toString().slice(-2) + '.' + Number(moment(invoicedt).add(1, 'month').month()+1);
                             insbody.record.請求明細.value.push({
                                          "value":{
                                            "種別":{
                                              "value":"オプション"
                                            },
                                            "プラン・オプション":{
                                              "value":subrec[j]['value']['オプション'].value +'（' + yymm2 + '月分）',
                                            },
                                            "単価":{
                                              "value":subrec[j]['value']['オプション単価'].value
                                            },
                                            "税区分":{
                                              "value":taxkbn
                                            },
                                            "数量":{
                                              "value":subrec[j]['value']['オプション契約数'].value
                                            },
                                              "利用対象期間_from":{
                                                "value":moment(invoicedt).add(k+1, 'month').startOf('month').format("YYYY-MM-DD")
                                            },
                                              "利用対象期間_to":{
                                                "value":moment(invoicedt).add(k+1, 'month').endOf('month').format("YYYY-MM-DD")
                                            }
                                          }
                                        });
                            if(taxkbn=="課税"){
                              if((Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value))>=0){
                                tax=Math.floor((Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value)) * Number(TAX/100));
                              }else{
                                tax=Math.ceil((Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value)) * Number(TAX/100));
                              }
                            }else{
                              tax=0;
                            }
                            taxtotal+=Number(tax);
                            //売上明細用
                            insbody2.record.売上明細.value.push({
                                          "value":{
                                            "請求対象月":{
                                              "value":moment(invoicedt).add(k+1, 'month').endOf('month').format("YYYY-MM-DD")
                                            },
                                            "項目":{
                                              "value":subrec[j]['value']['オプション'].value +'（' + yymm2 + '月分）'
                                            },
                                            "金額":{
                                              "value":Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value)
                                            },
                                            "消費税":{
                                              "value":tax
                                            },
                                            "商品種別":{
                                              "value":"オプション"
                                            },
                                            "商品番号":{
                                              "value":subrec[j]['value']['商品番号_オプション'].value
                                            }
                                          }
                                        });
                            if(taxkbn=="課税"){
                              subtotal=Number(subtotal) + (Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value));
                            }else{
                              subnototal=Number(subnototal) + (Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value));
                            }
                           }
                        }
                    }
                  }else{
                    if(moment(nextenddt).format('YYYYMM') >= moment(subrec[j]['value']['オプション利用開始日'].value).format('YYYYMM') &&
                        (moment(nextenddt).format('YYYYMM') <= moment(subrec[j]['value']['オプション利用終了日'].value).format('YYYYMM')|| subrec[j]['value']['オプション利用終了日'].value == null)){
                          // 売上管理の窓口入金済みにあるかどうか
                          body = {
                            'app': APP_SALES_ID,
                            'query': '登録NO_メンバー = "' + rec[i]['レコード番号'].value + 　'" and ' +
                                     '請求対象月 >= "' + moment(invoicedt).add(1, 'month').startOf('month').format("YYYY-MM-DD") +'" and ' +
                                     '請求対象月 <= "' + moment(invoicedt).add(1, 'month').endOf('month').format("YYYY-MM-DD") +'" and ' +
                                     '商品番号 in ("' + subrec[j]['value']['商品番号_オプション'].value + '") and 窓口入金 in ("済") '
                          };
                          //データ取得
                          const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                          //入金済に存在しなかったら
                          if(respsumi.records.length == 0){
                            //税区分
                            taxkbn = await getTaxkbn(subrec[j]['value']['商品番号_オプション'].value);
                            yymm2= Number(moment(invoicedt).add(1, 'month').year()).toString().slice(-2) + '.' + Number(moment(invoicedt).add(1, 'month').month()+1);
                            //請求明細
                            insbody.record.請求明細.value.push({
                                            "value":{
                                              "種別":{
                                                "value":"オプション"
                                              },
                                              "プラン・オプション":{
                                                "value":subrec[j]['value']['オプション'].value +'（' + yymm2 + '月分）',
                                              },
                                              "単価":{
                                                "value":subrec[j]['value']['オプション単価'].value
                                              },
                                              "税区分":{
                                                "value":taxkbn
                                              },
                                              "数量":{
                                                "value":subrec[j]['value']['オプション契約数'].value
                                              },
                                                "利用対象期間_from":{
                                                  "value":moment(invoicedt).add(1, 'month').startOf('month').format("YYYY-MM-DD")
                                              },
                                                "利用対象期間_to":{
                                                  "value":moment(invoicedt).add(1, 'month').endOf('month').format("YYYY-MM-DD")
                                              }
                                            }
                                          });
                            if(taxkbn=="課税"){
                              if((Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value))>=0){
                                tax=Math.floor((Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value)) * Number(TAX/100));
                              }else{
                                tax=Math.ceil((Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value)) * Number(TAX/100));
                              }
                            }else{
                              tax=0;
                            }
                            taxtotal+=Number(tax);
                            //売上明細用
                            insbody2.record.売上明細.value.push({
                                            "value":{
                                              "請求対象月":{
                                                "value":moment(invoicedt).add(1, 'month').endOf('month').format("YYYY-MM-DD")
                                              },
                                              "項目":{
                                                "value":subrec[j]['value']['オプション'].value +'（' + yymm2 + '月分）'
                                              },
                                              "金額":{
                                                "value":Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value)
                                              },
                                              "消費税":{
                                                "value":tax
                                              },
                                              "商品種別":{
                                                "value":"オプション"
                                              },
                                              "商品番号":{
                                                "value":subrec[j]['value']['商品番号_オプション'].value
                                              }
                                            }
                                          });
                              if(taxkbn=="課税"){
                                subtotal=Number(subtotal) + (Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value));
                              }else{
                                subnototal=Number(subnototal) + (Number(subrec[j]['value']['オプション単価'].value)*Number(subrec[j]['value']['オプション契約数'].value));
                              }
                          }
                      }
                  }
              }
            //通話料請求
            if(subrec[j]['value']['契約番号'].value != "" ){
                  insbody.record.テーブル.value.push({
                                  "value":{
                                    "契約電話番号":{
                                      "value":subrec[j]['value']['契約番号'].value
                                    }
                                  }
                                });
                  var subrec2=rec[i]['プランリスト'].value;
                  //請求時点（請求月の前月）でのプランを取得（８月までバーチャル、９月から通常の場合、９月請求の通話料はバーチャルの６ヶ月分）
                  for(let k = 0 ; k<subrec2.length ; k++){
                    //0円以外
                    if(subrec2[k]['value']['プラン料金'].value != "0" ){
                          //バーチャルかどうか
                          if(moment(subrec2[k]['value']['プラン利用開始日'].value).format("YYYYMM")<=moment(prevenddt).format('YYYYMM') &&
                             moment(subrec2[k]['value']['プラン利用終了日'].value).format("YYYYMM")>=moment(prevenddt).format('YYYYMM')){
                               if(subrec2[k]['value']['プラン種別'].value==="バーチャル"){
                                 virtualflg=true;
                               }else{
                                 virtualflg=false;
                               }
                          }
                    }
                  }
                  var targetflg=false;
                  //作成対象
                  if(virtualflg){
                    if((moment(invoicedt).month() == 2 || moment(invoicedt).month() == 8) && (moment(firstplandt).format('YYYYMM')<=moment(invoicedt).format('YYYYMM')) && previnvoicedt != null){
                        targetflg=true;
                    }
                  }else{
                    if(moment(invoicedt).month() % 2 != 0){
                        targetflg=true;
                    }
                  }
                  //対象のみ
                  if(targetflg){
                     max=0;
                    //契約番号
                    var tellNo=subrec[j]['value']['契約番号'].value;




                    //バーチャルは6か月、以外は2か月
                    if (virtualflg) {
                        stateldt=stateldt6;
                        //オプション利用開始日>６か月前の場合
                        if(moment(subrec[j]['value']['オプション利用開始日'].value).format('YYYYMM')>moment(stateldt).format('YYYYMM')){
                          stateldt=moment(subrec[j]['value']['オプション利用開始日'].value).startOf('month').format("YYYY-MM-DD");
                          }
                    }else{
                      stateldt=stateldt2;
                      if(moment(subrec[j]['value']['オプション利用開始日'].value).format('YYYYMM')>moment(stateldt).format('YYYYMM')){
                        stateldt=moment(subrec[j]['value']['オプション利用開始日'].value).startOf('month').format("YYYY-MM-DD");
                        }
                    }

                    //抽出終了月
                    if(moment(subrec[j]['value']['オプション利用終了日'].value).format("YYYYMM") <= moment(prevenddt).format("YYYYMM")){
                      prevenddt=moment(subrec[j]['value']['オプション利用終了日'].value).endOf('month').format("YYYY-MM-DD");
                    }

                    max=moment(moment(prevenddt).startOf('month').format("YYYY-MM-DD")).diff(moment(stateldt).startOf('month').format("YYYY-MM-DD"),'months')+1;

                    var body = {
                      'app': APP_CALL,
                      'query': '(契約者 = "" or 契約者 = "' + rec[i]['顧客名'].value +  '" ) and  契約電話番号 = "' + tellNo + '" and 請求対象月 >= "' + stateldt + '" and 請求対象月 <= "' + prevenddt + '" order by 請求対象月 ' + ' limit 500'
                    };
                    //データ取得
                    const resp3= await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                    var rec3=resp3.records;
                    var k;
                    var ymd;
                    var ymd2;
                    var mm;
                    var mm2;
                    var bill=0;
                    for ( k = 0 ; k < rec3.length ; k++){
                        var subrec3 = rec3[k];
                        ymd=subrec3['請求対象月'].value;
                        mm=moment(ymd).month()+1;
                        if(mm != mm2 ){
                          if(bill !=0){
                            if(bill>=0){
                              bill=Math.floor(bill);
                            }else {
                              bill=Math.ceil(bill);
                            }
                            // 売上管理の窓口入金済みにあるかどうか
                            body = {
                              'app': APP_SALES_ID,
                              'query': '登録NO_メンバー = "' + rec[i]['レコード番号'].value + 　'" and ' +
                                       '請求対象月 >= "' + moment(ymd2).startOf('month').format("YYYY-MM-DD") +'" and ' +
                                       '請求対象月 <= "' + moment(ymd2).endOf('month').format("YYYY-MM-DD") +'" and ' +
                                       '商品番号 in ( "' + TEL_ITEM_NO + '") and 窓口入金 in ("済") '
                            };
                            //データ取得
                            const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                            //入金済に存在しなかったら
                            if(respsumi.records.length == 0){
                              //税区分
                              taxkbn = await getTaxkbn(TEL_ITEM_NO);
                              yymm2=Number(moment(ymd2).year()).toString().slice(-2) + '.' + Number(mm2);
                                //請求明細
                                insbody.record.請求明細.value.push({
                                                  "value":{
                                                    "種別":{
                                                      "value":"オプション"
                                                    },
                                                    "プラン・オプション":{
                                                      "value":'通話料（' + yymm2 + '月分）'
                                                    },
                                                    "単価":{
                                                      "value":bill
                                                    },
                                                    "税区分":{
                                                      "value":taxkbn
                                                    },
                                                    "数量":{
                                                      "value":1
                                                    },
                                                      "利用対象期間_from":{
                                                        "value":moment(ymd2).startOf('month').format("YYYY-MM-DD")
                                                      },
                                                      "利用対象期間_to":{
                                                        "value":moment(ymd2).endOf('month').format("YYYY-MM-DD")
                                                    }
                                                  }
                                                });
                                  if(taxkbn=="課税"){
                                    if(Number(bill)>=0){
                                      tax=Math.floor((Number(bill) * Number(TAX/100)));
                                    }else{
                                      tax=Math.ceil((Number(bill) * Number(TAX/100)));
                                    }
                                  }else{
                                    tax=0;
                                  }
                                  taxtotal+=Number(tax);

                                  //売上明細用
                                  insbody2.record.売上明細.value.push({
                                                  "value":{
                                                    "請求対象月":{
                                                      "value": moment(invoicedt).add(1, 'month').endOf('month').format("YYYY-MM-DD")
                                                    },
                                                    "項目":{
                                                      "value":'通話料（' + yymm2 + '月分）'
                                                    },
                                                    "金額":{
                                                      "value":bill
                                                    },
                                                    "消費税":{
                                                      "value":tax
                                                    },
                                                    "商品種別":{
                                                      "value":"オプション"
                                                    },
                                                    "商品番号":{
                                                      "value":TEL_ITEM_NO
                                                    }
                                                  }
                                                });
                                  if(taxkbn=="課税"){
                                    subtotal=Number(subtotal) + Number(bill);
                                  }else{
                                    subnototal=Number(subnototal) + Number(bill);
                                  }
                                 bill=0;
                               }
                           }
                           ymd2=subrec3['請求対象月'].value;
                           mm2=moment(ymd2).month()+1;
                        }
                        bill += Number(subrec3['通話料'].value);
                    }
                    //0円以上
                    if(bill !=0){
                      if(bill>=0){
                        bill=Math.floor(bill);
                      }else {
                        bill=Math.ceil(bill);
                      }
                        // 売上管理の窓口入金済みにあるかどうか
                        body = {
                          'app': APP_SALES_ID,
                          'query': '登録NO_メンバー = "' + rec[i]['レコード番号'].value + 　'" and ' +
                                   '請求対象月 >= "' + moment(ymd2).startOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '請求対象月 <= "' + moment(ymd2).endOf('month').format("YYYY-MM-DD") +'" and ' +
                                   '商品番号 in ( "' + TEL_ITEM_NO + '") and 窓口入金 in ("済")  limit 500'
                        };
                        //データ取得
                        const respsumi = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                        //入金済に存在しなかったら
                        if(respsumi.records.length == 0){
                          //税区分
                          taxkbn = await getTaxkbn(TEL_ITEM_NO);
                          yymm2=Number(moment(ymd2).year()).toString().slice(-2) + '.' + Number(mm2);
                          //請求明細
                          insbody.record.請求明細.value.push({
                                            "value":{
                                              "種別":{
                                                "value":"オプション"
                                              },
                                              "プラン・オプション":{
                                                "value":'通話料（' + yymm2 + '月分）'
                                              },
                                              "単価":{
                                                "value":bill
                                              },
                                              "税区分":{
                                                "value":taxkbn
                                              },
                                              "数量":{
                                                "value":1
                                              },
                                                "利用対象期間_from":{
                                                  "value":moment(ymd2).startOf('month').format("YYYY-MM-DD")
                                              },
                                                "利用対象期間_to":{
                                                  "value":moment(ymd2).endOf('month').format("YYYY-MM-DD")
                                              }
                                            }
                                          });
                            if(taxkbn=="課税"){
                              if(Number(bill)>=0){
                                tax=Math.floor((Number(bill) * Number(TAX/100)));
                              }else{
                                tax=Math.ceil((Number(bill) * Number(TAX/100)));
                              }
                            }else{
                              tax=0;
                            }
                            taxtotal+=Number(tax);
                            //売上明細用
                            insbody2.record.売上明細.value.push({
                                            "value":{
                                              "請求対象月":{
                                                "value": moment(invoicedt).add(1, 'month').endOf('month').format("YYYY-MM-DD")
                                              },
                                              "項目":{
                                                "value":'通話料（' + yymm2 + '月分）'
                                              },
                                              "金額":{
                                                "value":bill
                                              },
                                              "消費税":{
                                                "value":tax
                                              },
                                              "商品種別":{
                                                "value":"オプション"
                                              },
                                              "商品番号":{
                                                "value":TEL_ITEM_NO
                                              }
                                            }
                                          });
                              if(taxkbn=="課税"){
                                subtotal=Number(subtotal) + Number(bill);
                              }else{
                                subnototal=Number(subnototal) + Number(bill);
                              }
                         }

                      }
                    }
                  }
              }

            //窓口処理後払い分
            targetflg=true;
            //前月末
            prevenddt =moment(invoicedt).add(-1, 'months').endOf('month').format("YYYY-MM-DD");
            body = {
              'app': APP_MADO,
              'query': '登録NO_メンバー = "' + rec[i]['レコード番号'].value + 　'" and ' +
                       '支払区分 in ("後払い") and ' +
                       '対象日 <= "' + prevenddt + '" and ' +
                       '自動計上済 in ("")  '
            };
            if(targetflg){
              //データ取得
              const respato = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
              var recato=respato.records;
              for (let k = 0 ; k < recato.length ; k++){
                var subrecato=recato[k]['料金テーブル'].value;
                for(let j = 0 ; j<subrecato.length ; j++){
                  if(subrecato[j]['value']['支払区分'].value == "後払い" && subrecato[j]['value']['対象日'].value <= prevenddt && subrecato[j]['value']['自動計上済'].value == ""  ){

                    yymm2=Number(moment(subrecato[j]['value']['対象日'].value).year()).toString().slice(-2) + '.' + Number(moment(subrecato[j]['value']['対象日'].value).month()+1);

                    //請求明細
                    insbody.record.請求明細.value.push({
                                    "value":{
                                      "種別":{
                                        "value":subrecato[j]['value']['商品種別'].value
                                      },
                                      "プラン・オプション":{
                                        "value":subrecato[j]['value']['商品名'].value +'（' + yymm2 + '月分）'
                                      },
                                      "単価":{
                                        "value":Number(subrecato[j]['value']['単価'].value)
                                      },
                                      "数量":{
                                        "value":Number(subrecato[j]['value']['数量'].value)
                                      },
                                      "税区分":{
                                        "value":subrecato[j]['value']['税区分'].value
                                      },
                                        "利用対象期間_from":{
                                          "value":subrecato[j]['value']['対象日'].value
                                      },
                                        "利用対象期間_to":{
                                          "value":subrecato[j]['value']['対象日'].value
                                      },
                                      "摘要":{
                                        "value":"窓口処理"
                                      }
                                    }
                                  });
                    if(subrecato[j]['value']['税区分'].value=="課税"){
                      if((Number(subrecato[j]['value']['単価'].value)*Number(subrecato[j]['value']['数量'].value))>=0){
                        tax=Math.floor((Number(subrecato[j]['value']['単価'].value)*Number(subrecato[j]['value']['数量'].value)) * Number(TAX/100));
                      }else{
                        tax=Math.ceil((Number(subrecato[j]['value']['単価'].value)*Number(subrecato[j]['value']['数量'].value)) * Number(TAX/100));
                      }
                    }else{
                      tax=0;
                    }
                    taxtotal+=Number(tax);
                    //売上明細用
                    insbody2.record.売上明細.value.push({
                                    "value":{
                                      "請求対象月":{
                                        "value":subrecato[j]['value']['対象日'].value
                                      },
                                      "項目":{
                                        "value":subrecato[j]['value']['商品名'].value+'（' + yymm2 + '月分）'
                                      },
                                      "金額":{
                                        "value":(Number(subrecato[j]['value']['単価'].value)*Number(subrecato[j]['value']['数量'].value))
                                      },
                                      "消費税":{
                                        "value":tax
                                      },
                                      "商品種別":{
                                        "value":subrecato[j]['value']['商品種別'].value
                                      },
                                      "支払種別":{
                                        "value":subrecato[j]['value']['支払種別'].value
                                      },
                                      "商品番号":{
                                        "value":subrecato[j]['value']['商品番号'].value
                                      }
                                    }
                                  });
                    if(subrecato[j]['value']['税区分'].value=="課税"){
                      subtotal=Number(subtotal) + ((Number(subrecato[j]['value']['単価'].value)*Number(subrecato[j]['value']['数量'].value)));
                    }else{
                      subnototal=Number(subnototal) +((Number(subrecato[j]['value']['単価'].value)*Number(subrecato[j]['value']['数量'].value)));
                    }
                    var ids=[];
                     for(let v=0;v<subrecato.length;v++){
                       if(v==j){
                         ids.push({
                         "id":subrecato[v]['id']
                         ,"value":{
                           "自動計上済":{
                             value: ["済"]
                             }
                           }
                         });
                       }else{
                            ids.push({"id":subrecato[v]['id']});
                       }
                     }
                    //窓口処理更新
                    var insbodyato = {
                      "app": APP_MADO,
                      "id":recato[k]['登録NO'].value,
                      "record": {
                        "料金テーブル":{
                          "value":ids
                          }
                      }
                    };
                    await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', insbodyato);

                  }
                }

              }
            }
            if (insbody.record.請求明細.value.length>0){
              //カウントアップ
              count+=1;
              //請求登録
              insbody.record.課税対象額.value=subtotal;
              insbody.record.非課税対象額.value=subnototal;
              if(subtotal>=0){
                 insbody.record.調整前消費税.value = Math.floor(subtotal * TAX / 100);
              }else{
                insbody.record.調整前消費税.value = Math.ceil(subtotal * TAX / 100);
              }
              insbody.record.税調整額.value=0;
              insbody.record.消費税.value = Number(insbody.record.調整前消費税.value) + Number(insbody.record.税調整額.value) ;
              insbody.record.請求総額.value=Number(subtotal) + Number(subnototal)  + Number(insbody.record.消費税.value)  ;
              await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody);
                //売上登録
                //消費税按分
                var adjusttax=0;

                adjusttax=Number(insbody.record.消費税.value)-taxtotal;
                insbody2.record.消費税差額.value  =adjusttax;
                insbody2.record.税調整額.value  =0;
                if(adjusttax !=0){
                  for(let j=0;j<insbody2.record.売上明細.value.length;j++){
                    if(insbody2.record.売上明細.value[j]['value']['消費税'].value!=0){
                      insbody2.record.売上明細.value[j]['value']['消費税'].value+=adjusttax;
                      break;
                    }
                  }
                }
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
                      },
                      "請求先所属・会社名": {
                        "value": rec[i]['所属・会社名１'].value
                      },
                      "請求先名": {
                        "value": rec[i]['顧客名'].value
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
    }
    //商品リストから税区分を取得
    var getTaxkbn = function(id) {
      var body = {
        "app": APP_ITEM,
        "query":"レコード番号=" + id
      };
      if(id==""){
        return "課税";
      }
      return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body).then(function(resp) {
        // success
        var rec = resp.records;
        if(rec.length==0){
          return "課税";
        }
        for (var i = 0; i < rec.length; i++) {
            return rec[i]["税区分"].value;
          }
        return "課税";
      });
    }

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
