jQuery.noConflict();
(function($) {
    "use strict";
    moment.locale('ja');
    let func = window.func ;
    let val = window.myVal;
    let spinner = window.spinner;

    kintone.events.on("app.record.index.show", function(e) {
        // プラグインのチェック
        try{
            if (!emxasConf) { }
        }catch(err) {
            let msg = '必要なプラグインがインストールされていません。';
            $('#contents').append($('<div>').text(msg));
            console.log(msg);
            return e;
        }

        if( e.viewType !== "custom") { return; }
        //if( e.viewName !== '工数分析') {return;}
        if( e.viewId != emxasConf.getConfig('VIEW_MAN_HOUR_ANALYSIS')) {return;}
        console.log("------");

        spinner.showSpinner();
        // 画面構成に必要なdivを用意
        $('#contents').append($('<div>').addClass('solo-row-block').attr('id','header'));
        $('#contents').append($('<div>').addClass('solo-row-block').attr('id','tab'));
        $('#contents').append($('<div>').addClass('solo-row-block').attr('id','menmu-button'));
        $('#contents').append($('<div>').addClass('solo-row-block').attr('id','mybody'));

        func.getPersonOfChargeList().then( function() {
            return func.getCustomerList();
        }).then( function() {
            // 画面描画物の構築

            // ヘッダ（期間絞込みの設定）
            var today = moment();
            let toDate = moment(today);
            toDate.add(-1, 'months');
            let fromDate = moment(toDate);
            fromDate.add(-11, 'months');

            var fromSele = func.makeSelectYearMonth(fromDate.year(), fromDate.month() + 1, 'select-year-from', 'select-month-from');
            var toSele = func.makeSelectYearMonth(toDate.year() , toDate.month() + 1, 'select-year-to', 'select-month-to' );

            var changeButton = $('<span>').append($('<button>').attr('id','change-button').text('変更').click());
            $('#header').append( $('<div>').html('期間：' + fromSele.html() + '　～　' + toSele.html() + changeButton.html() /*'<button>変更</button>'*/));

            $('#change-button').click(function(){
                // 期間の前後チェック
                showAnalysisBody(w2ui['radio_choice_tab'].active);
            });

            // タブ
            $('#tab').w2tabs({
                name: 'radio_choice_tab',
                active: 'tab1',
                tabs: [
                    {id: 'tab1', caption:'事業所全体'},
                    {id: 'tab2', caption:'個人'},
                ],
                onClick: function (event) {
                    let period = func.getPeriodFromTo();
                    if (!period) {
                        // 期間の前後が不正なので、期間は初期表示に変更
                        $('#select-year-from').val(fromDate.year());
                        $('#select-month-from').val(fromDate.month() + 1);
                        $('#select-year-to').val(toDate.year());
                        $('#select-month-to').val(toDate.month() + 1);
                    }
                    if (event.object.text === '事業所全体') {
                        // 損益分析のボタンは表示
                        $('#profit-and-loss-analysis').show();
                        $('#select_charge').hide();
                    } else {
                        // 損益分析のボタンは非表示
                        $('#profit-and-loss-analysis').hide();
                        $('#select_charge').show();
                    }
                    // 表示を変更
                    showAnalysisBody(event.object.text);
                }
            });
            // 事務所全体と個人
            
            // 生産性分析と損益分析へのボタン
            var buttonLineDiv = $('<div>').addClass('man-hour-analysis-hearder');
            var productionAnalysisButton = $('<button>').attr('id','production-analysis')
                                .addClass('link-button')
                                .text('生産性分析')
                                .click(function(){
                                    //
                                    let url = '/k/' + kintone.app.getId() + '/?view=' + emxasConf.getConfig('VIEW_PRODUCTIVITY_ANALYSIS');
                                    window.location.href = url
                                });
            var profit_lossAnalysisButton = $('<button>').attr('id','profit-and-loss-analysis')
                                .addClass('link-button')
                                .text('損益分析')
                                .click(function(){
                                    let url = '/k/' + kintone.app.getId() + '/?view=' + emxasConf.getConfig('VIEW_PROFIT_LOSS_ANALYSYS');
                                    window.location.href = url;
                                });
            // 個人の担当者選択欄
            let chargeList = val.ALL_SRC_LIST_PERSON_OF_CHARGE;
            var selectChargeList = '<select id="select_charge" class="select-charge">' +
                                    '<option value="no-select">選択してください</option>';
            for (let ix = 0; ix < chargeList.length; ix++) {
                selectChargeList += '<option value="' + chargeList[ix]['担当者コード'].value + '">' + 
                                    chargeList[ix]['担当者名'].value + '</option>';
            }
            selectChargeList += '</select>';

            var buttonDiv = $('<div>').addClass('link-button-box')
                .append(selectChargeList)
                .append(productionAnalysisButton)
                .append(profit_lossAnalysisButton);


            // チェックボックス
            var checkItem = $('<span class="input-checkbox-item-cybozu"><input type="checkbox" class="input-checkbox-cybozu" id="c1"></input><label for="c1">顧客未選択の工数を除く</label></span>');
            checkItem.css('line-heigth','normal').css('vertical-align','bottom').css('height', '100%');
            var checkDiv = $('<div>').addClass('right-option-chk-box').append(
                $('<div>').addClass('input-check-cybozu').append(checkItem));
            checkDiv.css('text-align','right');
            buttonLineDiv.append(buttonDiv).append(checkDiv);
            $('#menmu-button').append(buttonLineDiv);

            // 担当者の選択欄を変更した場合
            $('#select_charge').change(function() {
                showAnalysisBody(w2ui['radio_choice_tab'].active);
            });
            // チェックボックスを変更した場合
            $('#c1').change(function(event) {
                //
                showAnalysisBody(w2ui['radio_choice_tab'].active);
            });

            // BODY
            ////// 初期表示 //////
            $('#select_charge').hide();
            showAnalysisBody(w2ui['radio_choice_tab'].active);//'事業所全体';

        }).catch(function(error){
            alert('システムエラーが発生しました。');
            console.log(error);
            spinner.hideSpinner();
        });

        return e;
    });

    /**
     * 分析結果の表示を行います。
     */
    var showAnalysisBody = function(type) {

        spinner.showSpinner();
        // ユーザの設定値(期間)の読み込み
        let period = func.getPeriodFromTo();
        let err = [];
        if (!func.checkPeriod(period, err)) {
            alert(err);
            spinner.hideSpinner();
            return;
        }
        // 期間をsessionStorageに保存
        sessionStorage.setItem(val.SELECT_PERIOD_YEARMONTH, func.makeStorageYearMonth(period));

        let query = '';
        // 日報アプリからのデータ取得の際に、自前で絞り込む条件を持つ
        let whereOption = {};

        let codeName = '顧客コード';

        // 個人タブ表示時は、担当者の選択を使用する。
        let selectCharge = $('#select_charge').val();
        if (type === 'tab2' || type === '個人') {
            codeName = '担当者コード';

            // 個人タブ表示時に、担当者未選択なら、空表示
            if (selectCharge === 'no-select') {
                // すべて表示なので、sessionStorageの選択担当者IDを空に
                sessionStorage.removeItem(val.SELECT_CHARGE_ID);
                $('#mybody').empty();
                // 単月
                var productionLine = getPersonalAnalysisLine('', '', '');
                var oneList = $('<fieldset>').addClass('one-analysis-box')
                    .append($('<legend>').text('単月（' + period.to.year + '/' + func.headZero(period.to.month, 2) + '）'))
                    .append(productionLine)
                $('#mybody').addClass('solo-row-block').append(oneList);
                // 期間
                var productionLine2 = getPersonalAnalysisLine('', '', '');
                var oneList2 = $('<fieldset>').addClass('one-analysis-box')
                    .append($('<legend>').text('期間（' + period.from.year + '/' + func.headZero(period.from.month, 2) +
                                                     '～' + period.to.year + '/' + func.headZero(period.to.month, 2) + '）'))
                    .append(productionLine2)
                $('#mybody').append(oneList2);
                spinner.hideSpinner();
                return;
            } else {
                // sessionStorageにデータを設定
                sessionStorage.setItem(val.SELECT_CHARGE_ID, selectCharge);
                // 担当者の絞り込み条件
                query += 'and 担当者コード = "' + selectCharge + '" ';
            }
        } else {
            // 事業所全体タブの場合
            // sessionStorageの選択担当者IDを空に
            sessionStorage.removeItem(val.SELECT_CHARGE_ID);
        }

        // 「顧客未選択の工数を除く」にチェックON
        var exceptNotExistCustomer = $('#c1').prop('checked');
        if (exceptNotExistCustomer) {
            whereOption.expectNoCustomer = true;
        }
        // order by はコードで寄せる。
        whereOption.orderBy = codeName; // 並び替え

        // データの取得
        func.getCustomerList(period).then(function() {
            return func.getPersonOfChargeList (period);
        }).then(function() {
                return getDailyReportData(query, whereOption, period, codeName);
        }).then(function(ret){
            console.log(' -- get data process for disp --');
            let oneMonthList = ret.one;
            let periodList = ret.period;
            // 表示を初期化
            $('#mybody').empty();

            // 単月
            let reword1 = '';
            let manHour1 = '';
            let laborCosts1 = '';
            let hourlyWage1 = '';

            // 期間
            let reword2 = '';
            let manHour2 = '';
            let laborCosts2 = '';
            let hourlyWage2 = '';

            // タブのどちらの表示かで、表示内容が変わる
            switch(type){
                case '個人':
                case 'tab2':
                    let oneCharge = findChargeLine(selectCharge, oneMonthList);
                    let periodCharge = findChargeLine(selectCharge, periodList);

                    // 単月
                    if (oneCharge) {
                        reword1 = oneCharge['報酬'];
                        manHour1 = oneCharge['工数'];
                        hourlyWage1 = oneCharge['時間あたり'];
                        if (isNaN(hourlyWage1)) {
                            hourlyWage1 = '';
                        }
                    }

                    // 期間
                    if (periodCharge) {
                        reword2 = periodCharge['報酬'];
                        manHour2 = periodCharge['工数'];
                        hourlyWage2 = periodCharge['時間あたり'];
                        if (isNaN(hourlyWage2)) {
                            hourlyWage2 = '';
                        }
                    }

                    // 単月
                    var productionLine = getPersonalAnalysisLine(reword1, manHour1, hourlyWage1);
                    var oneList = $('<fieldset>').addClass('one-analysis-box')
                        .append($('<legend>').text('単月（' + period.to.year + '/' + func.headZero(period.to.month, 2) + '）'))
                        .append(productionLine)
                    $('#mybody').addClass('solo-row-block').append(oneList);
                    // 期間
                    var productionLine2 = getPersonalAnalysisLine(reword2, manHour2, hourlyWage2);
                    var oneList2 = $('<fieldset>').addClass('one-analysis-box')
                        .append($('<legend>').text('期間（' + period.from.year + '/' + func.headZero(period.from.month, 2) +
                                                         '～' + period.to.year + '/' + func.headZero(period.to.month, 2) + '）'))
                        .append(productionLine2)
                    $('#mybody').append(oneList2);
                    break;
                case '事業所全体':
                case 'tab1':
                default:
                    // それぞれ合計行を追加
                    let oneTotal = {'報酬': '', '人件費': '', '工数': '', '時間あたり': '',
                                    '損益': '', '利益率': ''};
                    let periodTotal = {'報酬': '', '人件費': '', '工数': '', '時間あたり': '',
                                    '損益': '', '利益率': ''};
                    func.integrateTotal(oneMonthList, oneTotal);
                    func.integrateTotal(periodList, periodTotal);

                    // 単月
                    reword1 = oneTotal['報酬'];
                    manHour1 = oneTotal['工数'];
                    laborCosts1 = oneTotal['人件費'];
                    hourlyWage1 = oneTotal['時間あたり'];
                    if (isNaN(hourlyWage1)) {
                        hourlyWage1 = '';
                    }

                    // 期間
                    reword2 = periodTotal['報酬'];
                    manHour2 = periodTotal['工数'];
                    laborCosts2 = periodTotal['人件費'];
                    hourlyWage2 = periodTotal['時間あたり'];
                    if (isNaN(hourlyWage2)) {
                        hourlyWage2 = '';
                    }

                    // 単月
                    var productionLine = getProductionAnalysisLine(reword1, manHour1, laborCosts1, hourlyWage1);
                    var oneList = $('<fieldset>').addClass('one-analysis-box')
                        .append($('<legend>').text('単月（' + period.to.year + '/' + func.headZero(period.to.month, 2) + '）'))
                        .append(productionLine)
                    $('#mybody').addClass('solo-row-block').append(oneList);
                    // 期間
                    var productionLine2 = getProductionAnalysisLine(reword2, manHour2, laborCosts2, hourlyWage2);
                    var oneList2 = $('<fieldset>').addClass('one-analysis-box')
                        .append($('<legend>').text('期間（' + period.from.year + '/' + func.headZero(period.from.month, 2) +
                                                         '～' + period.to.year + '/' + func.headZero(period.to.month, 2) + '）'))
                        .append(productionLine2)
                    $('#mybody').append(oneList2);
                    break;
            }
            spinner.hideSpinner();
        }).catch(function (error) {
            alert('システムエラーが発生しました');
            console.log(error);
            spinner.hideSpinner();
        });
    }

    /**
     * 事務所全体用の計算表示を作成します。
     * 単月、または期間のどちらかのみです。
     */
    var getProductionAnalysisLine = function (reword, manHour, laborCosts, hourlyWage1) {
        var hourlayWage = getHourlyWageLine(reword, manHour, hourlyWage1);
        var profitAnadLoss = getProfitAndLossLine(reword, laborCosts);
        return $('<div>').append(hourlayWage).append(profitAnadLoss);
    }
    /**
     * 個人用の計算表示を作成します。
     * 単月、または期間のどちらかのみです。
     */
    var getPersonalAnalysisLine = function (reword, manHour, hourlyWage) {
        return $('<div>').append(getHourlyWageLine(reword, manHour, hourlyWage));
    }
    /**
     * 工数分析の損益の計算表示を作成します
     * 「報酬 － 人件費 ＝ 損益」を表示します。
     */
    var getProfitAndLossLine = function (reword, laborCosts) {
        let rewordSt = (reword === '')? '':Number(reword).toLocaleString();
        // 人件費
        let costSt = (laborCosts === '' )? '': numbro(Number(laborCosts)).format('0,0');
        // 損益
        let profitLoss = func.toNumber(reword) - func.toNumber(laborCosts);
        let profitLossSt = '';
        if (reword === '' && laborCosts === '') {
            profitLossSt = '';
        } else if (profitLoss >= 0){
            profitLossSt = numbro(Number(profitLoss)).format('0,0');
        } else {
            let span = $('<span>').css('color', func.COLOR_LOSS).text('△ ' + numbro(Math.abs(Number(profitLoss))).format('0,0'));
            profitLossSt = span[0].outerHTML;
        }
        var oneMonthHoshu = $('<div>').addClass('one-val-box').append(makeValueBox('報酬', '円', rewordSt, 'val-box-single'))
                                .append(makeCalculateBox('－'))
                                .append(makeValueBox('人件費', '円', costSt, 'val-box-single'))
                                .append(makeCalculateBox('＝'))
                                .append(makeValueBox('損益', '円', profitLossSt, 'val-box-double2'))
        return oneMonthHoshu;
    };
    /**
     * 工数分析の、時間当たり報酬を出す計算式表示を作成します
     * 「報酬 ÷ 工数 ＝ 時間あたり報酬」を表示します。
     */
    var getHourlyWageLine = function (reword, manHour, hourlyWage) {
        let rewordSt = (reword === '')? '':Number(reword).toLocaleString();
        let manHourSt = (manHour === '')? '': func.toManHourSt(manHour);
        let hourlyWageSt = (hourlyWage === '') ? '' : Number(hourlyWage).toLocaleString();

        var oneMonthHoshu = $('<div>').addClass('one-val-box').append(makeValueBox('報酬', '円', rewordSt, 'val-box-single'))
                                .append(makeCalculateBox('÷'))
                                .append(makeValueBox('工数', '時間', manHourSt,'val-box-single'))
                                .append(makeCalculateBox('＝'))
                                .append(makeValueBox('時間あたり報酬', '円', hourlyWageSt, 'val-box-double'))
        return oneMonthHoshu;
    }
    /**
     * 四角の中に値が入ったタグを作成します
     * 左上に値名、値の後ろに単位、値は渡されたそのままを扱います。
     */
    var makeValueBox = function(name, unitName, value, className) {
        return $('<div>').addClass(className)
                .append($('<span>').addClass('val-box-title').html(name))
                .append($('<span>').addClass('val-box-num').html(value))
                .append($('<span>').addClass('val-box-unit').html(unitName));
    };
    var makeCalculateBox = function(calcSt) {
        return $('<div>').addClass('calc-box')
            .append($('<span>').addClass('calc-box-text').text(calcSt));
    };
   
    /**
     * 1ヶ月毎の集計データが配列に入ってくるので、集計する。
     * それらを、足し合わせる。
     */
    var getDailyReportData = function (query, whereOption, period, codeName) {
        return func.getOneMonthDailyReport([], query, whereOption, period, codeName, 0).then(function(resp){
            let periodList = [];
            let oneList = [];
            // 全期間分のデータを集約
            func.integratePeriodData(resp, periodList);
            // 最後の1ヶ月分を集約(工数(分)→工数(時間)に変換のために必要)
            func.integratePeriodData([resp[resp.length -1]], oneList);

            // 最後の1ヶ月分と、全部集約したものを返す
            let retVal = {};
            retVal.one = oneList;
            retVal.period = periodList;
            return Promise.resolve(retVal);
        });
    };

    /**
     * 担当者コードが一致する行を見つけたら、その行のデータだけ返します。
     * 存在しない場合は何も返しません。
     */
    var findChargeLine = function(chargeCode, list) {
        for (let ix = 0; ix < list.length; ix++) {
            let one = list[ix];
            if (one['担当者コード'] === chargeCode) {
                return one;
            }
        }
        return;
    };

})(jQuery);
