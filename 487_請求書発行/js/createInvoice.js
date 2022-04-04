//受注済み案件アプリから請求データを作成
(function($) {
    "use strict";
    // moment.locale('ja');
    kintone.events.on('app.record.index.show', function(event) {
      if (event.viewName === "請求データ作成") {
        var simedt =document.getElementById('simedt') ;
        var fromdt =document.getElementById('fromdt') ;
        var todt =document.getElementById('todt') ;

        var today = new Date();
        simedt.value=moment(today).format("YYYY-MM-DD");
        fromdt.value=moment(today).format("YYYY-MM-DD");
        todt.value=moment(today).format("YYYY-MM-DD");
      }
    });

  //一括登録ボタン処理
  $(document).on('click', '#proc', async (ev) => {
    try {
    //本番
    var APP_ID = 363;   //受注済み案件
    var simedt =document.getElementById('simedt').value ;
    var fromdt =document.getElementById('fromdt').value ;
    var todt =document.getElementById('todt').value ;
    var tax =document.getElementById('tax').value ;
    var yyyy=moment(simedt).year();
    var mm = moment(simedt).month();
    if(isDate(simedt,"-")==false){
      alert('締日が正しくありません。');
      return ;
    }
    if(isDate(fromdt,"-")==false){
      alert('日付（From）が正しくありません。');
      return ;
    }
    if(isDate(todt,"-")==false){
      alert('日付（To）が正しくありません。');
      return ;
    }
    var taxkbn=document.getElementById('taxkbn').value ;
    var uri=document.getElementById('uri').value ;
    var simekbn=document.getElementById('simekbn').value ;

    var result = window.confirm('一括登録しますか？');
    if(result==false){
        return;
    }
    showSpinner(); // スピナー表示
    var errMsg="";
    //受注済み案件よりデータ取得
    var body = {
      'app': APP_ID,
      'query': '契約期間開始 <="' + todt  + '" or  契約期間終了 <="' + fromdt  + '"  order by ３コード '
    };
    //指定年月の日報データを取得
    const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
      var rec=resp.records;
      var i,j;
      var code3="";        //３コード
      var seikyuno="";     //請求書番号
      var seikyutitle="";  //件名
      var seikyuam=0;      //請求金額
      var seikyuuri="";    //売上計上先
      var subins=[];
      var ins=[];
      var no=0;
      //
      for ( i = 0 ; i < rec.length ; i++){

        if(code3 == ""){
          code3=rec[i]['３コード'].value;
          seikyuno="";
          seikyutitle=yyyy + "年" + mm + "月ご請求分";
          seikyuam=0;
          seikyuuri=uri;
          subins=[];
          ins=[];
        }
        //3コードが違う場合、
        if(code3 != rec[i]['３コード'].value ){
          //
          if(subins.length>0){
            //請求データ作成
            var ins={"app":kintone.app.getId(),
                    "record":{
                        "請求書番号":{
                          "value":""
                        },
                        "3コード":{
                          "value":code3
                        },
                        "件名":{
                          "value":seikyutitle
                        },
                        "当月請求額_税抜":{
                          "value":seikyuam
                        },
                        "税率":{
                          "value": tax
                        },
                        "当月消費税額":{
                          "value":seikyuam * tax / 100
                        },
                        "今回請求金額_税込":{
                          "value":seikyuam + (seikyuam * tax / 100)
                        },
                        "締日":{
                          "value":simedt
                        },
                        "請求明細":{
                          "value":subins
                      }
                    }
                  };
            //
            await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', ins);
          }
          code3=rec[i]['３コード'].value;
          seikyuno="";
          seikyutitle=yyyy + "年" + mm + "月ご請求分";
          seikyuam=0;
          seikyuuri=uri;
          subins=[];
          ins=[];
        }
        //売上管理表テーブル取得
        var subrec=rec[i]['売上管理表'].value;
        for (j=0 ; j < subrec.length;j++){
          //
          if(uri==subrec[j]['value']['売上計上先2'].value &&
          (
            (simekbn=='月末' && subrec[j]['value']['自動計上対象']['value'].indexOf('対象') > -1) ||
            (simekbn=='月中' && subrec[j]['value']['自動計上対象']['value'].indexOf('対象') == -1)
             )&&
             (subrec[j]['value']['売上月'].value >= fromdt && subrec[j]['value']['売上月'].value <= todt)
             &&
             (subrec[j]['value']['請求チェック']['value'].indexOf('済み') > -1)
           ){
               //請求明細作成
               no=no+1;
               seikyuam+=Number(subrec[j]['value']['実績請求額'].value);
               subins.push({
                      "value":{
                        "明細日付":{
                          "value":subrec[j]['value']['売上月'].value
                        },
                        "明細番号":{
                          "value":no
                        },
                        "明細内容":{
                          "value":subrec[j]['value']['請求備考'].value
                        },
                        "明細数量":{
                          "value":1
                        },
                        "明細単価":{
                          "value":Number(subrec[j]['value']['実績請求額'].value)
                        },
                        "明細金額":{
                          "value":Number(subrec[j]['value']['実績請求額'].value)
                        }
                      }
                    });
          }

        }


      }
      //最終
      if(subins.length>0){
        //請求データ作成
        var ins={"app":kintone.app.getId(),
                "record":{
                    "請求書番号":{
                      "value":""
                    },
                    "3コード":{
                      "value":code3
                    },
                    "件名":{
                      "value":seikyutitle
                    },
                    "当月請求額_税抜":{
                      "value":Number(seikyuam)
                    },
                    "当月消費税額":{
                      "value":Number(seikyuam) * Number(tax) / 100
                    },
                    "今回請求金額_税込":{
                      "value":Number(seikyuam) + (Number(seikyuam) * Number(tax) / 100)
                    },
                    "税率":{
                      "value": tax
                    },
                    "締日":{
                      "value":simedt
                    },
                    "請求明細":{
                      "value":subins
                  }
                }
              };
        //
        await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', ins);
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
