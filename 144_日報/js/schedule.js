jQuery.noConflict();
(function($) {
    "use strict";

    var showEvents = [
        "app.record.create.show",
        "app.record.edit.show"
    ];
   
    var confirm = ''
    +   '<div class="emxas-confirm">'
    +       '<div>本日の業務テーブルに設定しますか？</div>'
    +       '<div>（元のデータはクリアされます）</div>'
    +       '<div class="emxas-confirm-button-area">'
    +           '<button class="emxas-button-dialog-cancel">キャンセル</button>'
    +           '<button class="emxas-button-dialog-ok">OK</button>'
    +       '</div>'
    +   '</div>';

    var message = ''
    +   '<div class="emxas-alert">'
    +       '<p></p>'
    +   '</div>';
    
    //対象日の予定
    var schedule;

    //画面のレコード
    var objRecord;
    
    // ロケールを設定
    moment.locale('ja');

    
    /**
     *「本日の業務」サブテーブルを取得
     */
    var getSubtable = function(){
        var body = {
            "app": kintone.app.getId()
        };
        
        return kintone.api(kintone.api.url('/k/v1/form', true), 'GET', body).then(function(resp) {
            // success
            var properties = resp.properties;
            for(var i = 0; i < properties.length; i++){
                if(properties[i]["code"] === "Table"){
                    return properties[i];
                }
            }
            
            return null;
        });
    }
    
    /**
     * サブテーブル中のフィールドに値を設定する。
     * 対象のフィールド、値はパラメータで受け取る。
     */
    var getRowObject = function(subTable, setFileds){
        var rowObject = {};
        for(var i = 0; i < subTable['fields'].length; i++){
            rowObject[subTable['fields'][i]['code']] = {};
            rowObject[subTable['fields'][i]['code']]['type'] = subTable['fields'][i]['type'];
            
            //値設定対象の項目の場合、'value'に値を設定
            if(subTable['fields'][i]['code'] in setFileds){
                rowObject[subTable['fields'][i]['code']]['value'] = setFileds[subTable['fields'][i]['code']];
            }else{
                rowObject[subTable['fields'][i]['code']]['value'] = null;
            }
        }
        
        return rowObject;
    }
    
    kintone.events.on(showEvents, function(e) {
       
        var spc = kintone.app.record.getSpaceElement('spcSchedule');
        var srcGetSchedule = ''
            +   '<div id="emxas-get-schedule">'
                    //スケジュール取得ボタン
            +       '<button id="emxas-button-schedule" class="emxas-custom-button">スケジュールから<br>業務を取得</button>'
            +       confirm
            +       message
            +   '</div>';
        $(spc).html(srcGetSchedule);

        return e;
    });

    //「スケジュール取得ボタン」クリックイベント
    $(document).on('click', '#emxas-button-schedule', function(ev){
       var date;
       var staffCd;

        //ポップアップ表示箇所取得
        var pos = {
            'top': $(this).position().top + $(this).outerHeight,
            'left': $(this).position().left
        };

        //エラーメッセージ初期化
        $('.emxas-alert').hide();

       objRecord = kintone.app.record.get();
       var record = objRecord['record'];
       if(record['日付'].value && record['担当者コード'].value){
            date = record['日付'].value;
            staffCd = record['担当者コード'].value;

            var param = {
                app: emxasConf.getConfig("APP_SCHEDULE"),
                query: "担当者コード = \"" + staffCd + "\" and " +
                    //予定の開始／終了が指定日に該当している
                    " ( " +
                        "開始日時 <=\"" + date + "T23:59:59+09:00\" and " +
                        "終了日時 >=\"" + date + "T00:00:00+09:00\"" +
                    " ) " +
                    "order by 開始日時 asc",
                isGuest: true
            };

            return kintoneUtility.rest.getAllRecordsByQuery(param).then(function(resp){
                console.log(resp);
                var records = resp.records;

                if(records.length === 0){
                    //対象予定存在しないメッセージ
                    var msg = '指定の日付、担当者の予定が存在しません。';
                    $('.emxas-alert > p').text(msg);
                    $('.emxas-alert').show();
                }else{
                    schedule = records;
                    //ポップアップ表示
                    $('.emxas-confirm').css('left', pos.left);
                    $('.emxas-confirm').css('top', pos.top);
                    if($('.emxas-confirm').is(':visible')){
                        $('.emxas-confirm').hide();
                    }else{
                        $('.emxas-confirm').show();
                    }
                }

            });
       }else{
            var msg = '日付、担当者を入力して下さい。';
            $('.emxas-alert > p').text(msg);
            $('.emxas-alert').show();
       }
    });

   
    //スケジュール取得ダイアログ「OK」のクリックイベント
    $(document).on('click', '.emxas-button-dialog-ok', function(ev){

        var tbl = [];
        //画面の業務サブテーブルに既存行がある場合、退避
        for(var iTbl=0; iTbl<objRecord['record']['Table']['value'].length; iTbl++){
            
            //空行はつめる
            if( !(objRecord['record']['Table']['value'][iTbl]['value']['開始時間']['value'] ||
                    objRecord['record']['Table']['value'][iTbl]['value']['終了時間']['value'] ||
                    objRecord['record']['Table']['value'][iTbl]['value']['顧客コード']['value'] ||
                    objRecord['record']['Table']['value'][iTbl]['value']['業務コード']['value']) ){
                continue;
            }
            
            tbl.push({
                'id': objRecord['record']['Table']['value'][iTbl]['id'],
                'value': objRecord['record']['Table']['value'][iTbl]['value']
            });
        }

        // 「本日の業務」サブテーブルを取得
        getSubtable().then(function(resp){
            console.log(resp);

            //指定日付
            var date = objRecord['record']['日付'].value;

            //取得予定の数分
            for(var i=0; i<schedule.length; i++){
                var record = schedule[i];
                var startYmd = record['開始日時']['value'];
                var startHm = '00:00';  //0時を初期設定
                var endYmd = record['終了日時']['value'];
                var endHm = '00:00';    //0時を初期設定
    
                //取得した予定の開始日付と、画面の日付が同日の場合
                if(moment(startYmd).format('YYYY-MM-DD') === date){
                    //時刻部分を設定
                    startHm = moment(startYmd).format('HH:mm');
                }
                //取得した予定の終了日付と、画面の日付が同日の場合
                if(moment(endYmd).format('YYYY-MM-DD') === date){
                    //時刻部分を設定
                    endHm = moment(endYmd).format('HH:mm');
                }
    
                var setFields = {
                    '顧客コード': record['顧客コード']['value'],
                    '業務コード': record['業務コード']['value'],
                    '開始時間': startHm,
                    '終了時間': endHm,
                    '予定タイトル': record['タイトル']['value']
                }
                tbl.push({
                    'value': getRowObject(resp, setFields)
                });
                console.log(tbl);
                // tbl.push({
                //     'value': {
                //         '顧客コード': {
                //             'value': record['顧客コード']['value'],
                //             'type': 'SINGLE_LINE_TEXT'
                //         },
                //         '顧客名': {
                //             'value': '',
                //             'type': 'SINGLE_LINE_TEXT'
                //         },
                //         '業務コード': {
                //             'value': record['業務コード']['value'],
                //             'type': 'SINGLE_LINE_TEXT'
                //         },
                //         '業務名称': {
                //             'value': '',
                //             'type': 'SINGLE_LINE_TEXT'
                //         },
                //         '区分コード': {
                //             'value': '',
                //             'type': 'SINGLE_LINE_TEXT'
                //         },
                //         '業務区分': {
                //             'value': '',
                //             'type': 'SINGLE_LINE_TEXT'
                //         },
                //         '開始時間': {
                //             'value': startHm,
                //             'type': 'TIME'
                //         },
                //         '終了時間': {
                //             'value': endHm,
                //             'type': 'TIME'
                //         },
                //         '計算_作業時間': {
                //             'value': '',
                //             'type': 'CALC'
                //         },
                //         '備考': {
                //             'value': '',
                //             'type': 'SINGLE_LINE_TEXT'
                //         },
                //     }
                // });
            }
    
            //画面[本日の業務]サブテーブル]に反映
            objRecord['record']['Table']['value'] = tbl;
            kintone.app.record.set(objRecord);
            
            //ルックアップ項目の設定
            for(var iTbl = 0; iTbl < objRecord['record']['Table']['value'].length; iTbl++){
                objRecord['record']['Table']['value'][iTbl]['value']['顧客コード']['lookup'] = true;
                objRecord['record']['Table']['value'][iTbl]['value']['業務コード']['lookup'] = true;
            }
            kintone.app.record.set(objRecord);
    
            //ポップアップエリア隠す
            $('.emxas-confirm').hide();
        })
        .catch(function(error){
            alert("フィールド情報の取得でエラーが発生しました。")
        });
    });

    //スケジュール取得ダイアログ「キャンセル」のクリックイベント
    $(document).on('click', '.emxas-button-dialog-cancel', function(ev){
        $('.emxas-confirm').hide();
    });

    //emxas-confirm以外のクリックイベント
    $(document).on('click touched', function(ev){
        //スケジュール取得ボタンの場合 ⇒ 何もしない
        if($(ev.target).closest('#emxas-button-schedule').length > 0){
            return;
        }

        //それ以外 ⇒ ポップアップエリア隠す
        if(! $(ev.target).closest('.emxas-confirm').length){
            $('.emxas-confirm').hide();
        }
    });

    
})(jQuery);
