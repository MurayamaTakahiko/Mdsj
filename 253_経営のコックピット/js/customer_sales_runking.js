jQuery.noConflict();
(function($) {
  "use strict";
  moment.locale('ja');
  let func = window.func;
  let val = window.myVal;
  let spinner = window.spinner;

  kintone.events.on("app.record.index.show", function(e) {
    // プラグインのチェック
    try {
      if (!emxasConf) {}
    } catch (err) {
      let msg = '必要なプラグインがインストールされていません。';
      $('#contents').append($('<div>').text(msg));
      console.log(msg);
      return e;
    }
    if (e.viewType !== "custom") {
      return;
    }
    if (e.viewId != emxasConf.getConfig('VIEW_CST_SALES_RUNK')) {
      return;
    }
    console.log("------cstrunk");

    spinner.showSpinner();
    // 画面構成に必要なdivを用意
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'header'));
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'my-top-grid'));
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'my-grid'));

    // 画面描画物の構築
    func.getPersonOfChargeList().then(function() {
      // ヘッダ（期間絞込みの設定）
      var today = moment();
      var applySele = func.makeSelectYearMonth(today.year(), today.month(), 'select-year-apply', 'select-month-apply');
      var changeButton = $('<span>').append($('<button>').attr('id', 'change-button').text('変更').click());

      $('#header').append($('<div>').html('&emsp;&emsp;分析対象月：' + applySele.html() + '&emsp;' + changeButton.html()));

      $('#change-button').click(function() {
        // 期間の前後チェック
        showAnalysisBody();
      });
      // BODY
      ////// 初期表示 //////
      // 3ヶ月統括表のレイアウト
      func.setGridVal(gridVal);
      showAnalysisBody();
    }).catch(function(error) {
      alert('システムエラーが発生しました。');
      console.log(error);
      spinner.hideSpinner();
    });
    return e;
  });

  let gridVal = {};
  // グリッド幅
  gridVal.GRID_WIDTH = 'auto';
  // 通常のセル幅（CKP）
  gridVal.COL_WIDTH_CKP = [60, 90, 90, 75, 75, 90, 90, 90, 90, 75, 75, 75, 75, 75, 75, 75, 100, 75, 75];
  // 選択したタブのセル幅保持（初期値：顧客別）
  gridVal.COL_WIDTH = gridVal.COL_WIDTH_CKP;
  // ヘッダ1段目
  gridVal.GRID_TOP_COL_HEADERS = [
    '<rowspan type="top"> </rowspan>',
    '<rowspan type="top"> </rowspan>',
    '<rowspan type="top"> </rowspan>',
    '<colspan type="pre" cnt="2">販売量</colspan>',
    '<colspan type="pre" cnt="4">損益(千円)</colspan>',
    '<colspan type="pre" cnt="2">構成比</colspan>',
    '<colspan type="pre" cnt="5">参考指標</colspan>',
    '<colspan type="pre" cnt="3">検討事項</colspan>',
  ];
  // ヘッダ2段目
  gridVal.GRID_COL_HEADERS = [
    '<rowspan type="top">ランク</rowspan>',
    '<rowspan type="top">得意先名称</rowspan>',
    '<rowspan type="top">品種</rowspan>',
    '<colspan type="top">売上数量<br>（本）</colspan>',
    '<colspan type="top">総重量<br>（kg）</colspan>',
    '<colspan type="top">売上金額</colspan>',
    '<colspan type="top">スプレッド</colspan>',
    '<colspan type="top">粗利金額</colspan>',
    '<colspan type="top">（運賃）</colspan>',
    '<colspan type="top">構成比</colspan>',
    '<colspan type="top">累積<br>構成比</colspan>',
    '<colspan type="top">販価<br>円/kg</colspan>',
    '<colspan type="top">運賃<br>/kg</colspan>',
    '<colspan type="top">置場販価<br>/kg</colspan>',
    '<colspan type="top">粗利率</colspan>',
    '<colspan type="top">粗利益<br>/kg</colspan>',
    '<colspan type="top">対策と方針</colspan>',
    '<colspan type="top">目標<br>増数量</colspan>',
    '<colspan type="top">達成時期</colspan>',
  ];
  // 通常の際のカラム設定
  gridVal.getGridColumns = function(sumFlg) {
    return [{
        data: 'runk',
        type: 'text',
        readOnly: true,
        renderer: colorRenderer
      },
      {
        data: 'cstname',
        type: 'text',
        readOnly: true,
        renderer: colorRenderer
      },
      {
        data: 'codelist',
        type: 'text',
        readOnly: true,
        renderer: colorRenderer
      },
      {
        data: 'sallength',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer,
      },
      {
        data: 'salweight',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'salPrice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'salprofit',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'salprofit',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'brgprice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'salUnit',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: percentageRenderer
      },
      {
        data: 'plusUnit',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: percentageRenderer
      },
      {
        data: 'perSalprice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: manHourRenderer
      },
      {
        data: 'perBrgprice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: manHourRenderer
      },
      {
        data: 'perStcprice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: manHourRenderer
      },
      {
        data: 'perProfit',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: percentageRenderer
      },
      {
        data: 'perPrfprice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: manHourRenderer,
      },
      {
        data: 'solveComment',
        type: 'text',
        format: '0,0',
        readOnly: true,
        renderer: colorRenderer
      },
      {
        data: 'goalNum',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'goalPeriod',
        type: 'text',
        format: '0,0',
        readOnly: true,
        renderer: colorRenderer
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
  /**
   * 分析結果の表示を行います。
   */
  var showAnalysisBody = function() {
    spinner.showSpinner();
    // ユーザの設定値(期間)の読み込み
    let period = func.getPeriodFromTo();
    let err = [];
    // 期間をsessionStorageに保存
    sessionStorage.setItem(val.SELECT_PERIOD_YEARMONTH, func.makeStorageYearMonth(period));
    // データの取得
    let prflg = true;
    func.getProductPerformList(period, prflg) .then(function() {
      return func.getSalesPerformList(period, prflg);
    }).then(function() {
      console.log(' -- get data process for disp --');
      // 表示を初期化
      $('#my-top-grid').empty();
      $('#my-grid').empty();
      $('#total-grid').empty();
      // グリッドを表示
      func.showCstSalesRunkGrid(period);
      spinner.hideSpinner();
    }).catch(function(error) {
      alert('システムエラーが発生しました');
      console.log(error);
      spinner.hideSpinner();
    });
  }

})(jQuery);
