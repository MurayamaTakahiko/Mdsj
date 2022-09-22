(function ($) {
    "use strict";

    kintone.events.on(['app.record.index.show'], function (event) {
      //中津店
      //var APP_ID = 80;   //会員顧客名簿
      //梅田店
      //var APP_ID = 156;   //会員顧客名簿
      //四条烏丸店
      //var APP_ID = 140;   //会員顧客名簿

      var APP_ID = 447;   //会員顧客名簿

      if (event.viewName === "CSV取込") {
        var appId = event.appId;

        //ダイアログでファイルが選択された時の処理
        $('#file').bind('change', function (evt) {
            //読み込んだファイルをテキストエリアに表示
            var reader = new FileReader();
            reader.readAsText(evt.target.files[0], "Shift_JIS");
            reader.onerror = function () {
                alert('ファイル読み取りに失敗しました')
            }
            reader.onload = function (ev) {
                $('textarea[name=\"text\"]').val(reader.result);
            };
        });
        //「post」ボタン押下時の処理
        $(document).on('click', '#proc', async (ev) => {
          try{
            var text_val = $('textarea[name=\"text\"]').val();
            let tel1 = document.getElementById('tel1').value;
            let tel2 = document.getElementById('tel2').value;
            let keiyaku = document.getElementById('keiyaku').value;
            let biko = document.getElementById('biko').value;
            let year = document.getElementById('year').value;
            //text_val = text_val.replace(/"/g, "");
            if(text_val == ''){
              alert('ファイルが選択されていません。');
              return;
            }
            if(year == ''){
              alert('取込年を入力してください。');
              return;
            }

            if (window.confirm('データを登録します。よろしいでしょうか？')) {
                showSpinner(); // スピナー表示
            var jsonArray = csv2json(text_val.split('\n'),year,tel1,tel2,keiyaku,biko);
              for (var i = 0; i < jsonArray.length; i++) {

                var body = {
                  'app': APP_ID,
                  'query': '契約番号 in ("' + jsonArray[i]['契約番号'] +  '") '
                };
                //会員顧客名簿
                const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
                var rec=resp.records;
                var today=moment().format('YYYY-MM-DD');
                var j,k;
                for ( j = 0 ; j < rec.length ; j++){
                  jsonArray[i]['契約者']=rec[j]['顧客名'].value;
                  var subrec=rec[j]['プランリスト'].value;
                  for( k= 0 ; k < subrec.length; k++){
                    if(subrec[k]['value']['プラン種別'].value=='バーチャル'){
                      var stdt= subrec[k]['value']['プラン利用開始日'].value;
                      var eddt= subrec[k]['value']['プラン利用終了日'].value;
                      if(stdt != ""){
                        stdt=moment(stdt).format('YYYY-MM-DD');
                      }else{
                        continue;
                      }
                      if(eddt != ""){
                        eddt=moment(eddt).format('YYYY-MM-DD');
                      }
                      if(stdt <= today){
                        if(eddt =="" ){
                          jsonArray[i]['備考']='バーチャル';
                          break;
                        }else{
                          if(today <= eddt){
                            jsonArray[i]['備考']='バーチャル';
                            break;
                          }
                        }
                      }
                    }
                  }

                }

                var insbody={"app":appId,
                        "record":{
                            "請求対象月":{
                              "value":jsonArray[i]['請求対象月']
                            },
                            "契約電話番号":{
                              "value":jsonArray[i]['契約番号']
                            },
                            "通話料":{
                              "value":jsonArray[i]['通話料']
                            },
                            "契約者":{
                              "value":jsonArray[i]['契約者']
                            },
                            "備考":{
                              "value":jsonArray[i]['備考']
                            }
                        }
                      };
                //登録
                const resp2 = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', insbody);
              }
              hideSpinner(); // スピナー非表示
              alert('登録しました。');
              $('textarea[name=\"text\"]').val("");
            } else {

            }

        } catch(e) {
          // パラメータが間違っているなどAPI実行時にエラーが発生した場合
          hideSpinner(); // スピナー非表示
          alert(e.message);
          return ev;
        }
        });
      }




    });

    function csvSplit(line) {
     var c = "";
     var s = new String();
     var data = new Array();
     var singleQuoteFlg = false;

     for (var i = 0; i < line.length; i++) {
       c = line.charAt(i);
       if (c == "," && !singleQuoteFlg) {
         data.push(s.toString());
         s = "";
       } else if (c == "," && singleQuoteFlg) {
         //s = s + c;
       } else if (c == '"') {
         singleQuoteFlg = !singleQuoteFlg;
       } else {
         s = s + c;
       }
     }
     if(s != ""){
       data.push(s.toString());
     }
     return data;
   }
    //パース処理
    function csv2json(csvArray,year,tel1,tel2,keiyaku,biko) {
        var jsonArray = [];

        //読み込み
        for (var i = 2; i < csvArray.length; i++) {
            var a_line = {};
            var csvArrayD = csvSplit(csvArray[i]);
            //読み飛ばし
            //ブランク
              if(csvArray[i] == ""){
                continue;
              }
              //２項目目がブランク
              if(csvArrayD[1]=="" ){
              continue;
              }
            // 各データをループ処理する
            for (var j = 0; j < csvArrayD.length; j++) {
              switch(j){
                case 0:
                  a_line['請求対象月'] = csvArrayD[j];     //対象年月
                  break;
                case 2:
                  a_line['契約番号'] = csvArrayD[j];    //契約番号
                  break;
                case 6:
                  a_line['通話料'] = csvArrayD[j];    //通話料
                  break;
              }
            }
            //
            //請求対象月
            a_line['請求対象月'] = year + a_line['請求対象月'];
            a_line['請求対象月'] = String(a_line['請求対象月']).substr(0,4) + "-" + String(a_line['請求対象月']).substr(4,2) +"-" + String(a_line['請求対象月']).substr(6,2);
            //契約番号
            switch (a_line['契約番号']) {
              case tel1:
              case tel2:
                a_line['契約者']=keiyaku;
                a_line['備考']=biko;
                  break;
              default:
              a_line['契約者']="";
              a_line['備考']="";
            }
            a_line['通話料'] = a_line['通話料'].replaceAll(',','');    //通話料（円）
            jsonArray.push(a_line);
        }
        return jsonArray;
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
