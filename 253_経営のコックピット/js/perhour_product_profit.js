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
    if (e.viewId != emxasConf.getConfig('VIEW_PRD_PERHOUR_PROFIT')) {
      return;
    }
    console.log("------perhour");

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
  gridVal.GRID_WIDTH = '1256';
  // 通常のセル幅（CKP）
  gridVal.COL_WIDTH_CKP = [90, 90, 90, 75, 75, 90, 75, 75, 90, 75, 90, 75, 75, 75, 75, 75, 75, 90, 90];
  // 選択したタブのセル幅保持（初期値：顧客別）
  gridVal.COL_WIDTH = gridVal.COL_WIDTH_CKP;
  // ヘッダ1段目
  gridVal.GRID_TOP_COL_HEADERS = [
    '<rowspan type="top"> </rowspan>',
    '<rowspan type="top"> </rowspan>',
    '<rowspan type="top"> </rowspan>',
    '<colspan type="pre" cnt="3">販売金額</colspan>',
    '<colspan type="pre" cnt="3">材料金額</colspan>',
    '<colspan type="pre" cnt="3">材料ロス</colspan>',
    '<colspan type="pre" cnt="2">製品原価</colspan>',
    '<colspan type="pre" cnt="2">製品歩留</colspan>',
    '<colspan type="pre" cnt="3">スプレッド</colspan>',
  ];
  // ヘッダ2段目
  gridVal.GRID_COL_HEADERS = [
    '<rowspan type="top">商品名</rowspan>',
    '<rowspan type="top">製品<br>サイズ</rowspan>',
    '<rowspan type="top">h当たり<br>生産量(kg)</rowspan>',
    '<colspan type="top">販売重量</colspan>',
    '<colspan type="top">販売単価</colspan>',
    '<colspan type="top">販売金額</colspan>',
    '<colspan type="top">母材重量</colspan>',
    '<colspan type="top">母材単価</colspan>',
    '<colspan type="top">母材金額</colspan>',
    '<colspan type="top">実ﾛｽ重量</colspan>',
    '<colspan type="top">実ﾛｽ金額</colspan>',
    '<colspan type="top">実ﾛｽ率</colspan>',
    '<colspan type="top">製品重量</colspan>',
    '<colspan type="top">製品単価</colspan>',
    '<colspan type="top">製品歩留<br>(理論)</colspan>',
    '<colspan type="top">実際歩留</colspan>',
    '<colspan type="top">金額</colspan>',
    '<colspan type="top">％</colspan>',
    '<colspan type="top">時間<br>当たり</colspan>',
  ];
  // 通常の際のカラム設定
  gridVal.getGridColumns = function(sumFlg) {
    return [{
        data: 'name',
        type: 'text',
        readOnly: true,
        renderer: colorRenderer
      },
      {
        data: 'size',
        type: 'text',
        readOnly: true,
        renderer: colorRenderer
      },
      {
        data: 'perHourPrd',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: manHourRenderer
      },
      {
        data: 'salweight',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer,
      },
      {
        data: 'salUnitPrc',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: manHourRenderer
      },
      {
        data: 'salprice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'mtrweight',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'mtrUnitPrc',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: manHourRenderer
      },
      {
        data: 'mtrprice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'losweight',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'losprice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'losUnit',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: percentageRenderer
      },
      {
        data: 'prdweight',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
      },
      {
        data: 'prdUnitPrc',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: manHourRenderer
      },
      {
        data: 'prdYieldThr',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: percentageRenderer
      },
      {
        data: 'prdYield',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: percentageRenderer,
      },
      {
        data: 'spreadPrice',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: manHourRenderer
      },
      {
        data: 'spreadPer',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: percentageRenderer
      },
      {
        data: 'perHourPrf',
        type: 'numeric',
        format: '0,0',
        readOnly: true,
        renderer: monetaryRenderer
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
    /** if (!func.checkPeriod(period, err)) {
      alert(err);
      spinner.hideSpinner();
      return;
    } */
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
      func.showPerhourListGrid(period);
      spinner.hideSpinner();
    }).catch(function(error) {
      alert('システムエラーが発生しました');
      console.log(error);
      spinner.hideSpinner();
    });
  }

})(jQuery);
