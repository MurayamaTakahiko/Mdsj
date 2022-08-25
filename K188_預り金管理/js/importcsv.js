(function ($) {
    "use strict";

    kintone.events.on(['app.record.index.show'], function (event) {
      if (event.viewName === "預り金作成") {
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
            let elements = document.getElementsByName('type');
            let len = elements.length;
            let checkValue = '';
            for (let i = 0; i < len; i++){
                if (elements.item(i).checked){
                    checkValue = elements.item(i).value;
                }
            }
            if(checkValue==''){
              alert('種類を選択してください。');
              return;
            }
            if(checkValue=="3"){
              var dt =document.getElementById('date').value ;
              if(dt==""){
                alert('自動引落（りそな）の場合は、入金日を入力してください。');
                return;
              }
            }
            //text_val = text_val.replace(/"/g, "");
            if(text_val == ''){
              alert('ファイルが選択されていません。');
              return;
            }


            if (window.confirm('データを登録します。よろしいでしょうか？')) {
                showSpinner(); // スピナー表示
            var jsonArray = csv2json(text_val.split('\n'),checkValue);
              for (var i = 0; i < jsonArray.length; i++) {

                var insbody={"app":appId,
                        "record":{
                            "入金日":{
                              "value":jsonArray[i]['入金日']
                            },
                            "入金金額":{
                              "value":jsonArray[i]['入金金額']
                            },
                            "振込人名":{
                              "value":jsonArray[i]['振込人名']
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
    function csv2json(csvArray,type) {
        var jsonArray = [];
        var stridx=0; //開始行
        var dtcol=0;  //入金日列
        var amcol=0   //入金金額列
        var fncol=0;  //振込人名列
        var name="";
        switch (type) {
          case "1":
            //タイトル行を飛ばす
            stridx=1;
            dtcol=2;
            amcol=5;
            fncol=12;
            name="振込（りそな）";
            break;
          case "2":
            dtcol=2;
            amcol=6;
            fncol=14;
            name="振込（三井住友））";
            break;
          case "3":
            dtcol=-1
            amcol=8;
            fncol=7;
            name="自動引落（りそな）";
            break;
          case "4":
            dtcol=0;
            amcol=13;
            fncol=4;
            name="自動引落（三井住友）";
            break;
          default:
            break;
        }
        //読み込み
        for (var i = stridx; i < csvArray.length; i++) {
            var a_line = {};
            var csvArrayD = csvSplit(csvArray[i]);
            //読み飛ばし
            //パソコンバンク（りそな）
            if(type=="1"){

              //入金金額がブランク
              if(csvArray[i] == ""){
                continue;
              }
            }
            //パソコンバンク（三井住友）
            if(type=="2"){
              //データ区分が2以外
              if(csvArrayD[0]!="2" ){
              continue;
              }
              //取引区分が11以外
              if(csvArrayD[5]!="11" ){
              continue;
              }
            }
            //自動引落（りそな）
            if(type=="3"){
              if(csvArrayD[0]!="2" ){
              continue;
              }
              //振替結果が0以外
              if(csvArrayD[11]!="0" ){
              continue;
              }
            }
            //自動引落（三井住友）
            if(type=="4"){
              //振替結果が0以外
              if(csvArrayD[12]!="0" ){
              continue;
              }
            }
            // 各データをループ処理する
            for (var j = 0; j < csvArrayD.length; j++) {
              switch(j){
                case dtcol:
                  a_line['入金日'] = csvArrayD[j];     //勘定日
                  break;
                case amcol:
                  a_line['入金金額'] = csvArrayD[j];    //入金金額（円）
                  break;
                case fncol:
                  a_line['振込人名'] = csvArrayD[j];    //摘要
                  break;
              }
            }
            //
            a_line['種類']=name;
            //入金日
            if(type=="1"){
              a_line['入金日'] = a_line['入金日'].replace('年','-');   //勘定日
              a_line['入金日'] = a_line['入金日'].replace('月','-');   //勘定日
              a_line['入金日'] = a_line['入金日'].replace('日','');   //勘定日
            }
            if(type=="2"){
              a_line['入金日'] = String('000000' + a_line['入金日']).substr(-6);
              a_line['入金日'] = String(Number(a_line['入金日'].substr(0,2))+2018) + a_line['入金日'].substr(2,4);   //勘定日
              a_line['入金日'] = String(a_line['入金日']).substr(0,4) + "-" + String(a_line['入金日']).substr(4,2) +"-" + String(a_line['入金日']).substr(6,2);//勘定日
              }
            if(type=="3"){
              a_line['入金日'] = moment().format(document.getElementById('date').value);   //勘定日
            }
            if(type=="4"){
              a_line['入金日'] = a_line['入金日'].replaceAll('/','-');   //勘定日
            }
            a_line['入金金額'] = a_line['入金金額'].replaceAll(',','');    //入金金額（円）
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
