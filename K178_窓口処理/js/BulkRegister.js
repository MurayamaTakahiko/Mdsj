//一括登録ボタン表示
(function($) {
    "use strict";
    // moment.locale('ja');
    kintone.events.on('app.record.index.show', function(event) {
        if (event.viewName === "月末一括計上") {
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
      var APP_SALES_ID = 82;  //売上管理
      var APP_INVOICE_ID = 74; //請求登録
      var APP_NYUKIN_ID= 79; //入金管理
      var APP_CUSTMER_ID = 80 //会員顧客名簿
      //アプリID
      //var APP_SALES_ID = 446;  //売上管理
      //var APP_INVOICE_ID = 449; //請求登録
      //var APP_NYUKIN_ID= 448; //入金管理
      //var APP_CUSTMER_ID = 447 //会員顧客名簿
      //カレンダーの年月を取得
      var dts=$('input[id^="selectDate"]');
      var dt=dts[0].value;
      var proc='';

      var minDt=moment(dt).startOf('month').format();
      var maxDt=moment(dt).endOf('month').format();
      var body = {
        'app': kintone.app.getId(),
        'query': '日時 >= "' + minDt +  '" and 日時 <="' + maxDt  + '" and 自動計上済 in ("") and 支払区分 in ("支払済")  order by 日時 limit 500'
      };
      var rec;
      var i,j;
      var subrec;
      var id;
      var insbody;  //売上管理用
      var updbody;
      var insbody2; //請求登録用
      var insbody3; //入金管理用
      //指定年月の支払済みを取得
      const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
        // success
        console.log(resp);
        rec=resp.records;
        for ( i = 0 ; i < rec.length ; i++){
          subrec=rec[i]['料金テーブル'].value;
          id=rec[i]['登録NO'].value;
          //請求番号採番***************
          var nowmindt=moment().startOf('month').format();
          var nowmaxdt=moment().endOf('month').format();
          var yymm=moment().format('YYYYMM');
          body = {
            'app': APP_INVOICE_ID,
            'query': '請求番号 != "" and 作成日時 >= "' + nowmindt +'" and 作成日時 <= "' + nowmaxdt + '" order by 請求番号 desc '
          };
          //データ取得
          const respno = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
            var recno=respno.records;
            var newno;
            if(recno.length==0){
              newno="NS-" + yymm + "-0001";
            }else{
              var ren=recno[0]['請求番号'].value;
              var iren=parseInt(ren.substr(-4));
              iren=iren+1;
              var sren=String(iren);
              sren=('0000' + sren).slice(-4);
              newno="NS-" + yymm + "-" + sren;
            }
          //*******************************



          subrec=rec[i]['料金テーブル'].value;
          id=rec[i]['登録NO'].value;
          insbody={"app":APP_SALES_ID,
                  "record":{
                      "種別":{
                        "value":"system（月額請求）"
                      },
                      "請求番号":{
                        "value":newno
                      },
                      "入金確認日":{
                        "value":moment(rec[i]['日時'].value).format('YYYY-MM-DD')
                      },
                      "請求日":{
                        "value":moment(rec[i]['日時'].value).format('YYYY-MM-DD')
                      },
                      "対象顧客":{
                        "value":rec[i]['メンバーの場合'].value
                      },
                      "対象ビジター":{
                        "value":rec[i]['ビジターの場合'].value
                      },
                      "窓口入金":{
                        "value":["済"]
                      },
                      "売上明細":{
                        "value":[]
                      }
                    }
                  };
                  //請求登録
                  insbody2={"app":APP_INVOICE_ID,
                          "record":{
                              "請求番号":{
                               "value":newno
                              },
                              "請求日":{
                                "value":moment(rec[i]['日時'].value).format('YYYY-MM-DD')
                              },
                              "自動登録日":{
                                "value":moment().format('YYYY-MM-DD')
                              },
                              "顧客名  ":{
                                "value":rec[i]['メンバーの場合'].value
                              },
                              "顧客名_ビジター":{
                                "value":rec[i]['ビジターの場合'].value
                              },
                              "請求明細":{
                                "value":[]
                              },
                              "テーブル":{
                                "value":[]
                              },
                              "請求書対象":{
                                "value":"対象外"
                              }
                            }
                          };


                  //契約番号取得********************
                  if(rec[i]['登録NO_メンバー'].value != ""){
                    body = {
                      'app': APP_CUSTMER_ID,
                      'query': '契約番号 in ("") and レコード番号 = "' + rec[i]['登録NO_メンバー'].value + '" '
                    };
                    //データ取得
                    const respkeiyaku = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                    var reckeiyaku=respkeiyaku.records;
                    for (let k = 0 ; k < reckeiyaku.length ; k++){
                      var subreckeiyaku=reckeiyaku[k]['オプション利用'].value;
                      for(let l=0 ; l < subreckeiyaku.length;l++){
                        if(subreckeiyaku[l]['value']['契約番号'].value !=""){
                        insbody2.record.テーブル.value.push({
                                        "value":{
                                          "契約電話番号":{
                                            "value":subreckeiyaku[l]['value']['契約番号'].value
                                          }
                                        }
                                      });
                        }
                      }

                    }
                  }
                  //入金管理
                  insbody3={"app":APP_NYUKIN_ID,
                          "record":{
                              "請求番号":{
                               "value":newno
                              }
                            }
                          };
          for(let j = 0 ; j<subrec.length ; j++){
            //支払済かつ自動計上するかつ、集金額1円以上
            if(subrec[j]['value']['支払区分'].value =='支払済' &&  subrec[j]['value']['集金額'].value >= 1 && subrec[j]['value']['自動計上済'].value ==''){
              insbody.record.売上明細.value.push({
                              "value":{
                                "請求対象月":{
                                  "value":moment(subrec[j]['value']['対象日'].value).format('YYYY-MM-DD')
                                },
                                "項目":{
                                  "value":subrec[j]['value']['商品名'].value
                                },
                                "金額":{
                                  "value":Math.round(subrec[j]['value']['料金'].value * 1.1)
                                },
                                "支払種別":{
                                  "value":subrec[j]['value']['支払種別'].value
                                },
                                "商品番号":{
                                  "value":subrec[j]['value']['商品番号'].value
                                }
                              }
                            });
                insbody2.record.請求明細.value.push({
                                "value":{
                                  "請求対象月":{
                                    "value":moment(subrec[j]['value']['対象日'].value).format('YYYY-MM-DD')
                                  },
                                  "種別":{
                                    "value":subrec[j]['value']['商品種別'].value
                                  },
                                  "プラン・オプション":{
                                    "value":subrec[j]['value']['商品名'].value
                                  },
                                  "単価":{
                                    "value":Number(subrec[j]['value']['単価'].value)
                                  },
                                  "数量":{
                                    "value":Number(subrec[j]['value']['数量'].value)
                                  },
                                  "利用対象期間_from":{
                                    "value":moment(subrec[j]['value']['対象日'].value).format('YYYY-MM-DD')
                                  },
                                  "利用対象期間_to":{
                                    "value":moment(subrec[j]['value']['対象日'].value).format('YYYY-MM-DD')
                                  }
                                }
                              });
              //更新
              var ids=[];
               for(let v=0;v<subrec.length;v++){
                 if(v==j){
                   ids.push({
                   "id":subrec[v]['id']
                   ,"value":{
                     "自動計上済":{
                       value: ["済"]
                       }
                     }
                   });
                 }else{
                   ids.push({"id":subrec[v]['id']});
                 }
               }
                updbody={
                  "app":kintone.app.getId(),
                  "id":id,
                  "record":{
                    "料金テーブル":{
                      "value":ids
                      }
                    }
                  };
                    await  kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updbody).then(function(resp3) {
                  });
                }
            }
            if(insbody.record.売上明細.value.length>0){
              //登録
              const resp2 = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody);
              //登録
              const resp3 = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody2);
              //登録
              const resp4 = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody3);
            }
      }
      //後払い分（ビジター）
      body = {
        'app': kintone.app.getId(),
        'query': '日時 >= "' + minDt +  '" and 日時 <="' + maxDt  + '" and 自動計上済 in ("") and 支払区分 in ("後払い") and 登録NO_ビジター != "" order by 日時 limit 500'
      };
      //指定年月の後払いを取得
      const resp4 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
      console.log(resp);
      rec=resp4.records;
      for ( i = 0 ; i < rec.length ; i++){
        //請求番号採番***************
        var nowmindt=moment().startOf('month').format();
        var nowmaxdt=moment().endOf('month').format();
        var yymm=moment().format('YYYYMM');
        body = {
          'app': APP_INVOICE_ID,
          'query': '請求番号 != "" and 作成日時 >= "' + nowmindt +'" and 作成日時 <= "' + nowmaxdt + '" order by 請求番号 desc '
        };
        //データ取得
        const respno = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
          var recno=respno.records;
          var newno;
          if(recno.length==0){
            newno="NS-" + yymm + "-0001";
          }else{
            var ren=recno[0]['請求番号'].value;
            var iren=parseInt(ren.substr(-4));
            iren=iren+1;
            var sren=String(iren);
            sren=('0000' + sren).slice(-4);
            newno="NS-" + yymm + "-" + sren;
          }
        //*******************************
        subrec=rec[i]['料金テーブル'].value;
        id=rec[i]['登録NO'].value;
        //売上管理
        insbody={"app":APP_SALES_ID,
                "record":{
                    "請求番号":{
                     "value":newno
                    },
                    "種別":{
                      "value":"system（月額請求）"
                    },
                    "請求日":{
                      "value":moment(rec[i]['日時'].value).format('YYYY-MM-DD')
                    },
                    "対象顧客":{
                      "value":rec[i]['メンバーの場合'].value
                    },
                    "対象ビジター":{
                      "value":rec[i]['ビジターの場合'].value
                    },
                    "売上明細":{
                      "value":[]
                    }
                  }
                };
                //請求登録
                insbody2={"app":APP_INVOICE_ID,
                        "record":{
                            "請求番号":{
                             "value":newno
                            },
                            "請求日":{
                              "value":moment(rec[i]['日時'].value).format('YYYY-MM-DD')
                            },
                            "自動登録日":{
                              "value":moment().format('YYYY-MM-DD')
                            },
                            "顧客名_ビジター":{
                              "value":rec[i]['ビジターの場合'].value
                            },
                            "請求明細":{
                              "value":[]
                            }
                          }
                        };
                //入金管理
                insbody3={"app":APP_NYUKIN_ID,
                        "record":{
                            "請求番号":{
                             "value":newno
                            }
                          }
                        };
        for(let j = 0 ; j<subrec.length ; j++){
          //支払済かつ自動計上するかつ、集金額1円以上
          if(subrec[j]['value']['支払区分'].value =='後払い' &&  subrec[j]['value']['集金額'].value >= 1 ){
            insbody.record.売上明細.value.push({
                            "value":{
                              "請求対象月":{
                                "value":moment(subrec[j]['value']['対象日'].value).format('YYYY-MM-DD')
                              },
                              "項目":{
                                "value":subrec[j]['value']['商品名'].value
                              },
                              "金額":{
                                "value":Math.round(subrec[j]['value']['料金'].value * 1.1)
                              },
                              "支払種別":{
                                "value":subrec[j]['value']['支払種別'].value
                              },
                              "商品番号":{
                                "value":subrec[j]['value']['商品番号'].value
                              }
                            }
                          });
            insbody2.record.請求明細.value.push({
                            "value":{
                              "請求対象月":{
                                "value":moment(subrec[j]['value']['対象日'].value).format('YYYY-MM-DD')
                              },
                              "種別":{
                                "value":subrec[j]['value']['商品種別'].value
                              },
                              "プラン・オプション":{
                                "value":subrec[j]['value']['商品名'].value
                              },
                              "単価":{
                                "value":Number(subrec[j]['value']['単価'].value)
                              },
                              "数量":{
                                "value":Number(subrec[j]['value']['数量'].value)
                              },
                              "利用対象期間_from":{
                                "value":moment(subrec[j]['value']['対象日'].value).format('YYYY-MM-DD')
                              },
                              "利用対象期間_to":{
                                "value":moment(subrec[j]['value']['対象日'].value).format('YYYY-MM-DD')
                              }
                            }
                          });
              }

              var ids=[];
               for(let v=0;v<subrec.length;v++){
                 if(v==j){
                   ids.push({
                   "id":subrec[v]['id']
                   ,"value":{
                     "自動計上済":{
                       value: ["済"]
                       }
                     }
                   });
                 }else{
                      ids.push({"id":subrec[v]['id']});
                 }
               }
                updbody={
                  "app":kintone.app.getId(),
                  "id":id,
                  "record":{
                    "料金テーブル":{
                      "value":ids
                      }
                    }
                  };
                    await  kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updbody).then(function(resp3) {
                  });
          }
          if (insbody.record.売上明細.value.length>0){
            //売上管理登録
            const resp5 = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody);
            //請求管理登録
            const resp6 = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody2);
            //入金管理登録
            const resp7 = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody3);

              // updbody={
              //   "app":kintone.app.getId(),
              //   "id":id,
              //   "record":{
              //     "後払い自動計上":{
              //       "value":["済"]
              //       }
              //     }
              //   };
              //     await  kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updbody).then(function(resp8) {
              //   });

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

    function GetNewInvoiceNo(appid){

          return newno;
    }

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
