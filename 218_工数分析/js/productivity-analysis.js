jQuery.noConflict();
(function($) {
  "use strict";
  moment.locale('ja');
  let func = window.func;

  // 表示時の処理
  kintone.events.on("app.record.index.show", function(e) {
    // プラグインの存在チェック
    try {
      if (!emxasConf) {}
    } catch (error) {
      return e;
    }

    if (e.viewType !== "custom") {
      return;
    }
    //if( e.viewName !== '生産性分析') {return;}
    if (e.viewId != emxasConf.getConfig('VIEW_PRODUCTIVITY_ANALYSIS')) {
      return;
    }
    console.log("------");
    func.setGridVal(gridVal);

    // 画面表示
    func.doMainDisplay(e.viewId);
    return e;
  });

  let gridVal = {};
  // グリッド幅
  gridVal.GRID_WIDTH = 'auto';
  //let GRID_WIDTH = '1320px';
  // 2期比較の際のセル幅
  gridVal.COL_WIDTH_2TERM = [80, 280, 110, 100, 110, 100, 110, 100, 110, 100, 50];
  // 通常のセル幅（顧客別）
  gridVal.COL_WIDTH_CUSTOMER = [70, 140, 90, 65, 130, 80, 105, 105, 50, 80, 100, 100, 130, 80];
  // 通常のセル幅（担当者別）
  gridVal.COL_WIDTH_CHARGE = [70, 140, 140, 140, 140, 320, 130, 80];
  // 選択したタブのセル幅保持（初期値：顧客別）
  gridVal.COL_WIDTH = gridVal.COL_WIDTH_CUSTOMER;

  // 二期比較の際のヘッダ1段目（cnt属性は2期比較時のcolspan数）
  gridVal.GRID_TOP_COL_HEADERS = [
    '<rowspan type="top"> </rowspan>', // ３コード（担当者コード）
    '<rowspan type="top"> </rowspan>', // 顧客名（担当者名）
    '<colspan type="pre" cnt="2">報酬</colspan>',
    '<colspan type="pre" cnt="2">工数</colspan>',
    '<colspan type="pre" cnt="3">時間あたり報酬</colspan>',
    '', // 時間あたり報酬グラフ
  ];
  // 通常のヘッダ（cnt属性は2期比較時のcolspan数）
  gridVal.getGridColHeaders = function(showType) {
    if (showType === '顧客別') {
      return [
        'コード',
        '顧客名',
        '報酬',
        '工数',
        '時間あたり報酬',
        '人件費',
        '損益',
        '利益率',
        '区分',
        '担当者',
        '業務',
        '担当者工数',
        '担当者人件費',
        '割合'
      ];
    } else {
      return [
        'コード',
        '担当者名',
        '報酬',
        '工数',
        '時間あたり報酬',
        '業務',
        '担当者工数',
        '割合'
      ];
    }
  };
  // 二期比較の際のヘッダ2段目（cnt属性は2期比較時のcolspan数）
  gridVal.get2TermGridColHeaders = function(showType) {
    return ['<rowspan type="bottom">コード</rowspan>',
      '<rowspan type="bottom">' + ((showType === '顧客別') ? '顧客名' : '担当者名') + '</rowspan>',
      '今期', '増減', // 報酬
      '今期', '増減', // 工数
      '今期', '<colspan type="pre" cnt="2">増減</colspan>', // 時間あたり報酬
      '',
    ];
  };
  // 通常の際のカラム設定
  gridVal.getGridColumns = function(showType, sumFlg) {
    if (showType === '顧客別') {
      return [{
          data: '３コード',
          type: 'text',
          readOnly: true,
          renderer: colorRenderer
        },
        {
          data: '顧客名',
          type: 'text',
          readOnly: true,
          renderer: colorRenderer
        },
        {
          data: '報酬',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: monetaryRenderer
        },
        {
          data: '工数',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: manHourRenderer,
        },
        {
          data: '時間あたり',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: monetaryRenderer
        },
        {
          data: '人件費',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: monetaryRenderer
        },
        {
          data: '損益',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: monetaryRenderer
        },
        {
          data: '利益率',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: percentageRenderer
        },
        {
          data: '担当者毎集計担当者区分',
          type: 'text',
          readOnly: true
        },
        {
          data: '担当者毎集計担当者名称',
          type: 'text',
          readOnly: true
        },
        {
          data: '業務毎集計業務名称',
          type: 'text',
          readOnly: true
        },
        {
          data: '業務毎集計担当者工数',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: manHourRenderer
        },
        {
          data: '業務毎集計担当者人件費',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: monetaryRenderer
        },
        {
          data: '業務毎集計割合',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: percentageRenderer
        },
      ];
    } else {
      return [{
          data: '担当者コード',
          type: 'text',
          readOnly: true,
          renderer: colorRenderer
        },
        {
          data: '担当者名',
          type: 'text',
          readOnly: true,
          renderer: colorRenderer
        },
        {
          data: '報酬',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: monetaryRenderer
        },
        {
          data: '工数',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: manHourRenderer,
        },
        {
          data: '時間あたり',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: monetaryRenderer
        },
        {
          data: '業務毎集計業務名称',
          type: 'text',
          readOnly: true
        },
        {
          data: '業務毎集計担当者工数',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: manHourRenderer
        },
        {
          data: '業務毎集計割合',
          type: 'numeric',
          format: '0,0',
          readOnly: true,
          renderer: percentageRenderer
        },
      ];
    }
    // let code = (showType === '顧客別')? '３コード': '担当者コード';
    // let name = (showType === '顧客別')? '顧客名': '担当者名';
    // return  [
    //     {data: code, type: 'text',  readOnly: true, renderer: colorRenderer},
    //     {data: name, type: 'text', readOnly: true , renderer: colorRenderer},
    //     {data: '報酬', type: 'numeric', format: '0,0', readOnly: true, renderer: monetaryRenderer},
    //     {data: '工数', type: 'numeric', format: '0,0', readOnly: true, renderer: manHourRenderer,},
    //     {data: '時間あたり', type: 'numeric', format: '0,0', readOnly: true, renderer: monetaryRenderer},
    //     {data: '人件費', type: 'numeric', format: '0,0', readOnly: true, renderer: monetaryRenderer},
    //     {data: '損益', type: 'numeric', format: '0,0', readOnly: true, renderer: monetaryRenderer},
    //     {data: '利益率', type: 'numeric', format: '0,0', readOnly: true, renderer: percentageRenderer},
    //     {data: '担当者毎集計担当者区分', type: 'text', readOnly: true},
    //     {data: '担当者毎集計担当者名称', type: 'text', readOnly: true},
    //     {data: '業務毎集計業務名称', type: 'text', readOnly: true},
    //     {data: '業務毎集計担当者工数', type: 'numeric', format: '0,0', readOnly: true, renderer: manHourRenderer},
    //     {data: '業務毎集計担当者人件費', type: 'numeric', format: '0,0', readOnly: true, renderer: monetaryRenderer},
    //     {data: '業務毎集計割合', type: 'numeric', format: '0,0', readOnly: true, renderer: percentageRenderer},
    // ];
  };
  // 二期比較の際のカラム設定
  gridVal.get2TermGridColumns = function(showType) {
    let code = (showType === '顧客別') ? '３コード' : '担当者コード';
    let name = (showType === '顧客別') ? '顧客名' : '担当者名';
    return [{
        data: code,
        type: 'text',
        readOnly: true
      },
      {
        data: name,
        type: 'text',
        readOnly: true
      },
      {
        data: '報酬',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: '報酬Comp',
        type: 'numeric',
        format: '0,0',
        renderer: monetaryGainLossRenderer,
        readOnly: true,
      },
      {
        data: '工数',
        type: 'numeric',
        format: '0,0',
        renderer: manHourRenderer,
        readOnly: true,
      },
      {
        data: '工数Comp',
        type: 'numeric',
        format: '0,0',
        renderer: manHourGainLossColorRenderer,
        readOnly: true,
      },
      {
        data: '時間あたり',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: '時間あたりComp',
        type: 'numeric',
        format: '0,0',
        renderer: monetaryGainLossRenderer,
        readOnly: true,
      },
      {
        data: '',
        type: 'text',
        readOnly: true,
        renderer: func.plusMinusRenderer
      },
    ];
  };

  // Renderer
  var monetaryRenderer = func.monetaryRenderer;
  var percentageRenderer = func.percentageRenderer;
  var manHourRenderer = func.manHourRenderer;
  var manHourGainLossColorRenderer = func.manHourGainLossColorRenderer;
  var monetaryGainLossRenderer = func.monetaryGainLossRenderer;
  var colorRenderer = func.colorRenderer;

})(jQuery);
