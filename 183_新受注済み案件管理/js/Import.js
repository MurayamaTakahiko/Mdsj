jQuery.noConflict();
(function($) {
   "use strict";
   kintone.events.on("app.record.index.show", function(e) {
       var appId = 27;

        //ダイアログでファイルが選択された時の処理
        $('#selfile').bind('change', function(evt) {
            //読み込んだファイルをテキストエリアに表示
            var reader = new FileReader();
            reader.readAsText(evt.target.files[0]);
            reader.onload = function(ev) {
                $('textarea[name=\"txt\"]').val(reader.result);
            };
        });
        //「post」ボタンが押された時の処理
        $('#post_btn').bind('click', function() {
            var text_val = $('textarea[name=\"txt\"]').val();
            text_val = text_val.replace(/"/g, "");
            var jsonArray = csv2json(text_val.split('\n'));
            var obj = [];
            var newRow = {};
            var j = 0;
            for (var i = 0; i < jsonArray.length; i++) {
                if (jsonArray[i]['レコードの開始行']) {
                    j++;
                    obj[j - 1] = {'３コード': {value: jsonArray[i]['３コード']},
                        'OMS顧客コード': {value: jsonArray[i]['OMS顧客コード']},
                        '顧客名／被相続人名': {value: jsonArray[i]['顧客名／被相続人名']}, 
                        'Table': {'value': []}};
                    newRow = {
                        value: {
                            売上月: {
                                type: 'DATE',
                                value: jsonArray[i]['売上月']
                            },
                            実績請求額: {
                                type: 'NUMBER',
                                value: jsonArray[i]['実績請求額']
                            },
                            案件ステータス: {
                                type: 'DROP_DOWN',
                                value: jsonArray[i]['案件ステータス']
                            }
                        }
                    };
                    obj[j - 1]['Table']['value'].push(newRow);
                }else {
                    newRow = {
                        value: {
                            売上月: {
                                type: 'DATE',
                                value: jsonArray[i]['売上月']
                            },
                            実績請求額: {
                                type: 'NUMBER',
                                value: jsonArray[i]['実績請求額']
                            },
                            案件ステータス: {
                                type: 'DROP_DOWN',
                                value: jsonArray[i]['案件ステータス']
                            }
                        }
                    };
                    obj[j - 1]['Table']['value'].push(newRow);
                }
            }
            if (window.confirm('データを登録します。よろしいでしょうか？')) {
                // ログアプリへの登録処理
                kintone.api(kintone.api.url('/k/v1/records', true), 'POST', {app: appId, records: obj}, function(resp) {
                    location.reload();
                });
            }else {
                window.alert('キャンセルされました'); // 警告ダイアログを表示
            }
        });
        //パース処理
        function csv2json(csvArray) {
            var jsonArray = [];
            var items = csvArray[0].split(',');
            for (var i = 1; i < csvArray.length; i++) {
                var a_line = {};
                var csvArrayD = csvArray[i].split(',');
                // 各データをループ処理する
                for (var j = 0; j < items.length; j++) {
                    //要素名：items[j]
                    //データ：csvArrayD[j]
                    a_line[items[j]] = csvArrayD[j];
                }
                jsonArray.push(a_line);
            }
            return jsonArray;
        }
   });
})(jQuery);
