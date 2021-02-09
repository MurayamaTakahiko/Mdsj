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
    if (e.viewId != emxasConf.getConfig('VIEW_PRC_PDCT_ANALYSIS')) {
      return;
    }
    console.log("------");

    spinner.showSpinner();
    // 画面構成に必要なdivを用意
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'header'));
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'tab'));
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'my-top-grid'));
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'my-grid'));

    // 画面描画物の構築
    func.getPersonOfChargeList().then(function() {
      // ヘッダ（期間絞込みの設定）
      var today = moment();
      var applySele = func.makeSelectYearMonth(today.year(), today.month(), 'select-year-apply', 'select-month-apply');
      var changeButton = $('<span>').append($('<button>').attr('id', 'change-button').text('変更').click());
      $('#header').append($('<div>').html('&emsp;&emsp;コックピット対象月：' + applySele.html() + '&emsp;' + changeButton.html()));
      $('#change-button').click(function() {
        // 表示を変更
        showAnalysisBody(w2ui['radio_choice_tab'].active);
      });

      // タブ
      $('#tab').w2tabs({
        name: 'radio_choice_tab',
        active: 'tab1',
        tabs: [{
            id: 'tab1',
            caption: '予実比較'
          },
          {
            id: 'tab2',
            caption: '稼働状況'
          },
          {
            id: 'tab3',
            caption: '品質状況'
          },
          {
            id: 'tab4',
            caption: 'Ｐ／Ｌ'
          }
        ],
        onClick: function(event) {
          let period = func.getPeriodFromTo();
          if (!period) {
            // 期間の前後が不正なので、期間は初期表示に変更
            $('#select-year-apply').val(today.year());
            $('#select-month-apply').val(today.month() + 1);
          }
          // タブを変更
          showAnalysisBody(event.object.text);
        }
      });

      // BODY
      ////// 初期表示 //////
      // 3ヶ月統括表のレイアウト
      func.setGridVal(gridVal);
      showAnalysisBody(w2ui['radio_choice_tab'].active); //'仕入・生産';
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
  // グリッド幅(稼働状況)
  gridVal.GRID_WIDTH_WORK = 'auto';
  // 通常のセル幅（CKP）
  gridVal.COL_WIDTH_CKP = [30, 100, 60, 65, 45, 60, 65, 45, 60, 65, 45, 60, 65, 45, 60, 65, 45, 60, 65, 45, 60, 65, 45, 60, 65, 45, 60, 65, 45, 60, 65, 45, 60, 65, 45];
  // 通常のセル幅(稼働状況)
  gridVal.COL_WIDTH_WORK_CKP = [150, 80, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150];
  // 通常のセル幅(品質状況)
  gridVal.COL_WIDTH_QUALITY_CKP = [150, 150, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120];
  // 2期比較の際のセル幅
  gridVal.COL_WIDTH_2TERM = [15, 60, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30];
  // 通常のセル幅（顧客別）
  gridVal.COL_WIDTH_CUSTOMER = [70, 140, 90, 65, 130, 80, 105, 105, 50, 80, 100, 100, 130, 80];
  // 通常のセル幅（担当者別）
  gridVal.COL_WIDTH_CHARGE = [70, 140, 140, 140, 140, 320, 130, 80];
  // 選択したタブのセル幅保持（初期値：顧客別）
  gridVal.COL_WIDTH = gridVal.COL_WIDTH_CKP;

  // ヘッダ1段目
  gridVal.GRID_TOP_COL_HEADERS = [
    '<rowspan type="top"> </rowspan>', // タブ種
    '<rowspan type="top"> </rowspan>', // ＫＰＩ項目
    '<colspan type="pre" cnt="12">1月度</colspan>', // 前月度
    '<colspan type="pre" cnt="12">2月度</colspan>', // 当月度
    '<colspan type="pre" cnt="9">3月度</colspan>', // 次月度
  ];
  // ヘッダ1段目(稼働状況)
  gridVal.GRID_TOP_COL_WORK_HEADERS = [
    '<rowspan type="top"> </rowspan>', // タブ種
    '<rowspan type="top"> </rowspan>', // ＫＰＩ項目
    '<colspan type="pre" cnt="4">1月度</colspan>', // 前月度
    '<colspan type="pre" cnt="4">2月度</colspan>', // 当月度
    '<colspan type="pre" cnt="3">3月度</colspan>', // 次月度
  ];
  // ヘッダ1段目(品質状況)
  gridVal.GRID_TOP_COL_QUALITY_HEADERS = [
    '<rowspan type="top"> </rowspan>', // タブ種
    '<rowspan type="top"> </rowspan>', // ＫＰＩ項目
    '<colspan type="pre" cnt="4">1月度</colspan>', // 前月度
    '<colspan type="pre" cnt="4">2月度</colspan>', // 当月度
    '<colspan type="pre" cnt="4">3月度</colspan>', // 次月度
  ];
  // ヘッダ2段目
  gridVal.GRID_COL_HEADERS = [
    '<rowspan type="top"> </rowspan>', // タブ種
    '<rowspan type="top"> </rowspan>', // ＫＰＩ項目
    '<colspan type="pre" cnt="2">前年<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">計画<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">実績見込<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">実績<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">前年<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">計画<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">予定<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">実績見込<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">前年<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">計画<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
    '<colspan type="pre" cnt="2">予定<br>(t／千円)</colspan>',
    '<colspan type="top">円/kg</colspan>',
  ];
  // ヘッダ2段目(稼働状況)
  gridVal.GRID_COL_WORK_HEADERS = [
    '<rowspan type="top"> </rowspan>', // タブ種
    '<rowspan type="top"> </rowspan>', // 単位
    '<colspan type="top">前年</colspan>',
    '<colspan type="top">計画</colspan>',
    '<colspan type="top">実績見込</colspan>',
    '<colspan type="top">実績</colspan>',
    '<colspan type="top">前年</colspan>',
    '<colspan type="top">計画</colspan>',
    '<colspan type="top">予定</colspan>',
    '<colspan type="top">実績見込</colspan>',
    '<colspan type="top">前年</colspan>',
    '<colspan type="top">計画</colspan>',
    '<colspan type="top">予定</colspan>'
  ];
  // ヘッダ2段目(稼働状況)
  gridVal.GRID_COL_QUALITY_HEADERS = [
    '<rowspan type="top"> </rowspan>', // タブ種
    '<rowspan type="top"> </rowspan>', // 単位
    '<colspan type="top">母材重量</colspan>',
    '<colspan type="top">製品重量</colspan>',
    '<colspan type="top">ロス重量</colspan>',
    '<colspan type="top">歩留り</colspan>',
    '<colspan type="top">母材重量</colspan>',
    '<colspan type="top">製品重量</colspan>',
    '<colspan type="top">ロス重量</colspan>',
    '<colspan type="top">歩留り</colspan>',
    '<colspan type="top">母材重量</colspan>',
    '<colspan type="top">製品重量</colspan>',
    '<colspan type="top">ロス重量</colspan>',
    '<colspan type="top">歩留り</colspan>'
  ];
  // 通常のヘッダ（cnt属性は2期比較時のcolspan数）
  gridVal.getGridColHeaders = function(showType) {
    return [
      '',
      '',
      '前年',
      '円/kg',
      '計画',
      '円/kg',
      '実績見込',
      '円/kg',
      '実績',
      '円/kg',
      '前年',
      '円/kg',
      '計画',
      '円/kg',
      '予定',
      '円/kg',
      '実績見込',
      '円/kg',
      '前年',
      '円/kg',
      '計画',
      '円/kg',
      '予定',
      '円/kg'
    ];
  }; // 通常の際のカラム設定
  gridVal.getGridColumns = function(showType, sumFlg) {
    switch (showType) {
      case '品質状況':
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
            data: 'nbmtrweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer,
          },
          {
            data: 'nbprdweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nblosweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbyield',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
          {
            data: 'ntmtrweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntprdweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer,
          },
          {
            data: 'ntlosweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntyield',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
          {
            data: 'namtrweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'naprdweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer,
          },
          {
            data: 'nalosweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nayield',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
        ];
        break;
      case '稼働状況':
        return [{
            data: 'name',
            type: 'text',
            readOnly: true,
            renderer: colorRenderer
          },
          {
            data: 'unit',
            type: 'text',
            readOnly: true,
            renderer: colorRenderer
          },
          {
            data: 'nbpfHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer,
          },
          {
            data: 'nbplHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
          {
            data: 'nbppHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
          {
            data: 'nbpfHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
          {
            data: 'ntppHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer,
          },
          {
            data: 'ntplHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
          {
            data: 'ntpsHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
          {
            data: 'ntppHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
          {
            data: 'ntppHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer,
          },
          {
            data: 'naplHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
          {
            data: 'napsHour',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: manHourRenderer
          },
        ];
        break;
      default:
        return [{
            data: 'code',
            type: 'text',
            readOnly: true,
            renderer: colorRenderer
          },
          {
            data: 'name',
            type: 'text',
            readOnly: true,
            renderer: colorRenderer
          },
          {
            data: 'nblsprcweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nblsprcPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer,
          },
          {
            data: 'nblsprcUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbplweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbplPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbplUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbppweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbppPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbppUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbprcweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbprcPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nbprcUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntlsprcweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntlsprcPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer,
          },
          {
            data: 'ntlsprcUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntplweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntplPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntplUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntpsweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntpsPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntpsUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntppweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntppPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'ntppUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nalsprcweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'nalsprcPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer,
          },
          {
            data: 'nalsprcUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'naplweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'naplPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'naplUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'napsweight',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'napsPrice',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
          {
            data: 'napsUnit',
            type: 'numeric',
            format: '0,0',
            readOnly: true,
            renderer: monetaryRenderer
          },
        ];
    };
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
  var showAnalysisBody = function(type) {
    spinner.showSpinner();
    // ユーザの設定値(期間)の読み込み
    let period = func.getPeriodFromTo();
    let err = [];
    // 期間をsessionStorageに保存
    sessionStorage.setItem(val.SELECT_PERIOD_YEARMONTH, func.makeStorageYearMonth(period));
    let query = '';
    // 各アプリからのデータ取得の際に、自前で絞り込む条件を持つ
    let whereOption = {};
    let codeName = '品種カテゴリー';
    if (type === 'tab4') {
      /* Ｐ／Ｌ */
      codeName = '担当者コード';
    } else {
      /* 予実比較 */
    }
    // order by はコードで寄せる。
    whereOption.orderBy = codeName; // 並び替え
    // データの取得
    if (type === 'tab4' || type === 'Ｐ／Ｌ') {
      // 売上実績管理と在庫実績管理と予算管理のデータを取得
      kintone.Promise.all([
        func.getSalesBudgetList(period),
        func.getStockBudgetList(period)
      ]).then(function() {
        console.log(' -- get data process for disp tab4 --');
        // 表示を初期化
        $('#my-top-grid').empty();
        $('#my-grid').empty();
        // グリッドを表示
        func.showPerformListGrid(period, w2ui['radio_choice_tab'].active);
        spinner.hideSpinner();
      }).catch(function(error) {
        alert('システムエラーが発生しました');
        console.log(error);
        spinner.hideSpinner();
      });
    } else if (type === 'tab3' || type === '品質状況') {
      // 品質状況管理のデータを取得
      kintone.Promise.all([
        func.getHumanPerformList(period)
      ]).then(function() {
        console.log(' -- get data process for disp tab3 --');
        // 表示を初期化
        $('#my-top-grid').empty();
        $('#my-grid').empty();
        // グリッドを表示
        func.showPerformListGrid(period, w2ui['radio_choice_tab'].active);
        spinner.hideSpinner();
      }).catch(function(error) {
        alert('システムエラーが発生しました');
        console.log(error);
        spinner.hideSpinner();
      });
    } else if (type === 'tab2' || type === '稼働状況') {
      // 稼働状況管理のデータを取得
      kintone.Promise.all([
        func.getHumanPerformList(period)
      ]).then(function() {
        console.log(' -- get data process for disp tab2 --');
        // 表示を初期化
        $('#my-top-grid').empty();
        $('#my-grid').empty();
        // グリッドを表示
        func.showPerformListGrid(period, w2ui['radio_choice_tab'].active);
        spinner.hideSpinner();
      }).catch(function(error) {
        alert('システムエラーが発生しました');
        console.log(error);
        spinner.hideSpinner();
      });
    } else {
      // 仕入実績管理と生産実績管理と予算管理のデータを取得
      // 売上実績管理と在庫実績管理と予算管理のデータを取得
      kintone.Promise.all([
        func.getPurchaseBudgetList(period),
        func.getProductBudgetList(period),
        func.getSalesBudgetList(period),
        func.getStockBudgetList(period)
      ]).then(function() {
        console.log(' -- get data process for disp --');
        // 表示を初期化
        $('#my-top-grid').empty();
        $('#my-grid').empty();
        // グリッドを表示
        func.showPerformListGrid(period, w2ui['radio_choice_tab'].active);
        spinner.hideSpinner();
      }).catch(function(error) {
        alert('システムエラーが発生しました');
        console.log(error);
        spinner.hideSpinner();
      });
    }
  }

})(jQuery);
