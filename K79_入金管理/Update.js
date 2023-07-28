(function ($) {
    "use strict";
    var events=[
      'app.record.create.submit.success',
      'app.record.edit.submit.success'
    ];
    kintone.events.on(events, async (ev) => {

        //中津店
        //var APP_SALES_ID = 82;  //売上管理
        //var APP_INVOICE_ID = 74; //請求登録
        //var APP_NYUKIN_ID= 79; //入金管理
        //var APP_CUSTMER_ID = 80; //会員顧客名簿
        //var APP_KOZA_ID = 189;  //口座管理
        //var APP_AZUKARI_ID = 188;  //預り金管理
        //var APP_HOSYO_ID = 198;      //保証金管理
        //梅田店
        //var APP_SALES_ID = 168;  //売上管理
        //var APP_INVOICE_ID = 169; //請求登録
        //var APP_NYUKIN_ID= 170; //入金管理
        //var APP_CUSTMER_ID = 156; //会員顧客名簿
        //var APP_KOZA_ID = 191;  //口座管理
        //var APP_AZUKARI_ID = 190;  //預り金管理
        //var APP_HOSYO_ID = 204;      //保証金管理
        //四条烏丸点
        //var APP_SALES_ID = 152;  //売上管理
        //var APP_INVOICE_ID = 153; //請求登録
        //var APP_NYUKIN_ID= 154; //入金管理
        //var APP_CUSTMER_ID = 140; //会員顧客名簿
        //var APP_KOZA_ID = 194;  //口座管理
        //var APP_AZUKARI_ID = 192;  //預り金管理
        //var APP_HOSYO_ID = 205;      //保証金管理

        var APP_SALES_ID = 446;      //売上管理
        var APP_INVOICE_ID = 449;    //請求登録
        var APP_CUSTMER_ID = 447;    //会員顧客名簿
        var APP_KOZA_ID = 511;       //口座管理
        var APP_AZUKARI_ID = 510;    //預り金管理
        var APP_HOSYO_ID = 518;      //保証金管理

        var appId = ev.appId;

        try{
          var record = ev.record;
          var azukari_id=record['登録NO_預り金'].value;
          var seikyu_no=record['請求番号'].value;
          var nyukin_kbn=record['入金区分'].value;
          var nyukin_dt=record['入金日'].value;
          var customerno=record['顧客番号'].value;
          var torokuno=record['登録NO_ビジター'].value;
          var azukari_ids=[];

          showSpinner(); // スピナー表示
          //更新する預かり金NOを格納
          if(azukari_id != ""){
            azukari_ids.push(azukari_id);
          }
          var subrec=record['複数入金'].value;
          for(let i=0;i<subrec.length;i++){
            if(subrec[i]['value']['登録NO_複数'].value!= ""){
              azukari_ids.push(subrec[i]['value']['登録NO_複数'].value);
            }
          }
          if(azukari_ids.length > 0){
            for(let i=0;i<azukari_ids.length;i++){
              var param = {
                'app': APP_AZUKARI_ID,
                'query': '登録NO = "' + azukari_ids[i] + '" and 入金処理 in ("未") '
              };
              const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param);
              var rec=resp.records;
              for (let j = 0 ; j < rec.length ; j++){
                var furinm=rec[j]['振込人名'].value;
                var param2 = {
                  'app': APP_KOZA_ID,
                  'query': '振込人名 = "' + furinm + '" and 顧客番号 = "' + customerno + '" and 登録NO_ビジター = "' + torokuno + '" '
                };
                const resp2 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param2);
                var rec2=resp2.records;
                if(rec2.length == 0){
                  //口座管理登録
                  var updparam = {
                    "app": APP_KOZA_ID,
                    "record": {
                      "振込人名": {
                        "value": furinm
                      },
                      "顧客番号":{
                        "value":customerno
                      },
                      "登録NO_ビジター":{
                        "value":torokuno
                      }
                    }
                  };
                    await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', updparam);
                }

                  //預り金管理更新
                  var updparam3 = {
                    "app": APP_AZUKARI_ID,
                    "id":azukari_ids[i],
                    "record": {
                      "入金処理": {
                        "value":"済"
                      },"入金管理登録NO": {
                        "value":record["レコード番号"].value
                      }
                    }
                  };
                  await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updparam3);
              }
            }
          }
          //売上管理取得
          var param3 = {
            'app': APP_SALES_ID,
            'query': '請求番号 = "' + seikyu_no + '" '
          };
          const resp3 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param3);
          var rec3=resp3.records;
          for (let j = 0 ; j < rec3.length ; j++){
            var subrec3=rec3[j]['売上明細'].value;
            var ids=[];
             for(let v=0;v<subrec3.length;v++){
                 ids.push({
                 "id":subrec3[v]['id']
                 ,"value":{
                   "支払種別":{
                     value: nyukin_kbn
                     }
                   }
                 });
               }
              //売上管理更新
              var updparam2 = {
                "app": APP_SALES_ID,
                "id":rec3[j]['登録NO'].value,
                "record": {
                  "登録NO_預り金": {
                    "value": azukari_id
                  },
                  "入金確認日":{
                    "value":nyukin_dt
                  },
                  "売上明細":{
                    "value":ids
                  }
                }
              };
            await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updparam2);
          }
          //保証金アプリ
          var param4 = {
            'app': APP_HOSYO_ID,
            'query': '請求番号 = "' + seikyu_no + '" ' + 'and 入金区分 in ("") '
          };
          const resp4 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param4);
          var rec4=resp4.records;
          if(rec4.length != 0){
            //売上管理更新
            var updparam4 = {
              "app": APP_HOSYO_ID,
              "id":rec4[0]['レコード番号'].value,
              "record": {
                "入金区分": {
                  "value": nyukin_kbn
                },
                "入金日": {
                  "value": nyukin_dt
                }
              }
            };
            await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updparam4);
          }


          hideSpinner(); // スピナー非表示
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
