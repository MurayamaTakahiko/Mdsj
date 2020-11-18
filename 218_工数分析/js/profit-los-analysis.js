jQuery.noConflict();
(function($) {
    "use strict";
    moment.locale('ja');
    let func = window.func ;

    // 表示時の処理
    kintone.events.on("app.record.index.show", function(e) {
        // プラグインの存在チェック
        try{
            if (!emxasConf){ }
        }catch (error) {
            return e;
        }

        if( e.viewType !== "custom") { return; }
        //if( e.viewName !== '損益分析') {return;}
        if( e.viewId != emxasConf.getConfig('VIEW_PROFIT_LOSS_ANALYSYS')) {return;}
        console.log("------");
        func.setGridVal(gridVal);

        // 画面表示
        func.doMainDisplay(e.viewId);
        return e;
    });

    let gridVal = {};
    // グリッド幅
    gridVal.GRID_WIDTH = 'auto';
    //gridVal.GRID_WIDTH = '1320px';
    // 2期比較の際のセル幅
    gridVal.COL_WIDTH_2TERM = [80, 280, 110, 100, 110, 100, 110, 100, 110, 100, 50];
    // 通常のセル幅
    gridVal.COL_WIDTH = [80, 280, 130, 130, 130, 130, 50];
    // 二期比較の際のヘッダ1段目
    gridVal.GRID_TOP_COL_HEADERS =  [ '<rowspan type="top"> </rowspan>', '<rowspan type="top"> </rowspan>',
                '<colspan type="pre" cnt="2">報酬</colspan>',
                '<colspan type="pre" cnt="2">人件費</colspan>',
                '<colspan type="pre" cnt="3">損益</colspan>',
                '',
                ];
    // 通常のヘッダ
    gridVal.getGridColHeaders = function(showType) {
        return [ 'コード', (showType === '顧客別')? '顧客名': '担当者名',
                    '報酬', '人件費', '損益', '利益率', '<nosort>損益グラフ</nosort>', ];
    };
    // 二期比較の際のヘッダ2段目
    gridVal.get2TermGridColHeaders = function(showType) {
        return  [ '<rowspan type="bottom">コード</rowspan>',
            '<rowspan type="bottom">' + ((showType === '顧客別')? '顧客名': '担当者名') + '</rowspan>',
            '今期', '増減', // 報酬
            '今期', '増減', // 人件費
            '今期', '<colspan type="pre" cnt="2">増減</colspan>', // 損益
            '', ];
    };
    // 通常の際のカラム設定
    gridVal.getGridColumns = function(showType) {
        let code = (showType === '顧客別')? '３コード': '担当者コード';
        let name = (showType === '顧客別')? '顧客名': '担当者名';
        return  [ {data: code, type: 'text',  readOnly: true },
                    {data: name, type: 'text', readOnly: true },
                    {data: '報酬', type: 'numeric', format: '0,0', readOnly: true, renderer: monetaryRenderer},
                    {data: '人件費', type: 'numeric', format: '0,0',  readOnly: true, renderer: monetaryRenderer},
                    {data: '損益', type: 'numeric', format: '0,0',  readOnly: true,  renderer: monetaryRenderer},
                    {data: '利益率', type: 'numeric',  readOnly: true, format: '0,0', renderer: percentageRenderer},
                    {data: '', type: 'numeric', readOnly: true,  renderer: func.plusMinusProfitLossRenderer },
                ];
    };
    // 二期比較の際のカラム設定
    gridVal.get2TermGridColumns = function(showType) {
        let code = (showType === '顧客別')? '３コード' : '担当者コード';
        let name = (showType === '顧客別')? '顧客名' : '担当者名';
        return  [
                    {data: code, type: 'text', readOnly: true },
                    {data: name, type: 'text', readOnly: true },
                    {data: '報酬', type: 'numeric', format: '0,0', readOnly: true, renderer: monetaryRenderer},
                    {data: '報酬Comp', type: 'numeric', format: '0,0', renderer: monetaryGainLossRenderer,  readOnly: true,},
                   {data: '人件費', type: 'numeric', format: '0,0', readOnly: true, renderer: monetaryRenderer},
                   {data: '人件費Comp', type: 'numeric', format: '0,0', renderer: monetaryGainLossRenderer,  readOnly: true,},
                   {data: '損益', type: 'numeric', format: '0,0', readOnly: true,  renderer: monetaryRenderer},
                   {data: '損益Comp', type: 'numeric', format: '0,0', renderer: monetaryGainLossRenderer, readOnly: true,},
                    {data: '', type: 'text', readOnly: true,  renderer: func.plusMinusRenderer },
                   ];
    };

    // Renderer
    var monetaryRenderer = func.monetaryRenderer;
    var percentageRenderer = func.percentageRenderer;
    var manHourRenderer = func.manHourRenderer;
    var manHourGainLossColorRenderer = func.manHourGainLossColorRenderer;
    var monetaryGainLossRenderer = func.monetaryGainLossRenderer;

})(jQuery);
