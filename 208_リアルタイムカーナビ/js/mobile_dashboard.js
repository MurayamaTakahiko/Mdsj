(function() {
  "use strict";

  // 受注済み案件管理アプリID
  var SALES_APPID = 27;
  // ダッシュボード用初期設定アプリID
  var PROP_APPID = 84;

  var oneTimeFlg = true;
  var chart1, chart2, chart3, chart4, chart5, chart6, chart7, chart8, chart9;
  var mbtable1;

  // ローディング画面を出す関数
  function setLoading() {
    var $body = $('body');
    $body.css('width', '100%');

    var $loading = $('<div>').attr('id', 'loading').attr('class', 'loading')
      .attr('style', 'width: 100%; height: 100%; position:absolute;' +
        ' top:0; left:0; text-align:center; background-color:#666666; opacity:0.6; z-index: 9;');
    var $div = $('<div>').attr('id', 'imgBox').attr('style', 'width: 100%; height: 100%;');
    var $img = $('<img>').attr('src', 'data:image/gif;base64,R0lGODlhZABkAPQAAAAAAP///' +
      '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');
    $loading.append($div.append($img));
    $body.append($loading);

    $('#imgBox').attr('style', 'margin-top: ' + Math.floor($('#loading').height() / 2) + 'px;');

    $body.css('position', 'fixed');
  }

  // ローディング画面を消す関数
  function removeLoading() {
    var $loading = $('.loading');
    $loading.remove();

    var $body = $('body');
    $body.css('position', '');
  }

  // data配列の中身を消す関数
  function refreshData(data) {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        data[key] = 0;
      }
    }
    return data;
  }

  // 全レコード取得関数
  function fetchRecords(appId, query, opt_offset, opt_limit, opt_records) {
    var offset = opt_offset || 0;
    var limit = opt_limit || 100;
    var allRecords = opt_records || [];
    var params = {
      app: appId,
      query: query + ' limit ' + limit + ' offset ' + offset
    };
    return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
      allRecords = allRecords.concat(resp.records);
      if (resp.records.length === limit) {
        return fetchRecords(appId, query, offset + limit, limit, allRecords);
      }
      return allRecords;
    });
  }

  function createCompareGraph(min, max) {
    // TODO
    // 売上案件登録時・失注時の通知機能
    // 変動費額の場合の計算
    // モバイルでのグラフ表示
    // 初期登録ツール
    // フィー登録
    // レイアウト微調整
    setLoading();
    var maxMonth, maxMonth2, minMonth, minMonth2, elevenMonthsBefore, tenMonthsBefore,
      nineMonthsBefore, eightMonthsBefore, sevenMonthsBefore, sixMonthsBefore, fiveMonthsBefore,
      fourMonthsBefore, threeMonthsBefore, twoMonthsBefore, oneMonthBefore, noMonthBefore;
    if (max) {
      maxMonth = '"' + moment(max).endOf("month").format('YYYY-MM-DD') + '"';
      maxMonth2 = '"' + moment(max).add(-12, "months").endOf("month").format('YYYY-MM-DD') + '"';
      elevenMonthsBefore = moment(max).add(-11, 'months').format("M月");
      tenMonthsBefore = moment(max).add(-10, 'months').format("M月");
      nineMonthsBefore = moment(max).add(-9, 'months').format("M月");
      eightMonthsBefore = moment(max).add(-8, 'months').format("M月");
      sevenMonthsBefore = moment(max).add(-7, 'months').format("M月");
      sixMonthsBefore = moment(max).add(-6, 'months').format("M月");
      fiveMonthsBefore = moment(max).add(-5, 'months').format("M月");
      fourMonthsBefore = moment(max).add(-4, 'months').format("M月");
      threeMonthsBefore = moment(max).add(-3, 'months').format("M月");
      twoMonthsBefore = moment(max).add(-2, 'months').format("M月");
      oneMonthBefore = moment(max).add(-1, 'months').format("M月");
      noMonthBefore = moment(max).format("M月");
    } else {
      maxMonth = "THIS_MONTH()";
      maxMonth2 = '"' + moment().add(-12, "months").endOf("month").format('YYYY-MM-DD') + '"';
      elevenMonthsBefore = moment().add(-11, 'months').format("M月");
      tenMonthsBefore = moment().add(-10, 'months').format("M月");
      nineMonthsBefore = moment().add(-9, 'months').format("M月");
      eightMonthsBefore = moment().add(-8, 'months').format("M月");
      sevenMonthsBefore = moment().add(-7, 'months').format("M月");
      sixMonthsBefore = moment().add(-6, 'months').format("M月");
      fiveMonthsBefore = moment().add(-5, 'months').format("M月");
      fourMonthsBefore = moment().add(-4, 'months').format("M月");
      threeMonthsBefore = moment().add(-3, 'months').format("M月");
      twoMonthsBefore = moment().add(-2, 'months').format("M月");
      oneMonthBefore = moment().add(-1, 'months').format("M月");
      noMonthBefore = moment().format("M月");
    }
    if (min) {
      minMonth = '"' + moment(min).format('YYYY-MM-DD') + '"';
      minMonth2 = '"' + moment(min).add(-12, "months").startOf("month").format('YYYY-MM-DD') + '"';
    } else {
      minMonth = '"' + moment().add(-11, "months").startOf("month").format('YYYY-MM-DD') + '"';
      minMonth2 = '"' + moment().add(-23, "months").startOf("month").format('YYYY-MM-DD') + '"';
    }

    // 今月から一年前までのレコード取得
    fetchRecords(SALES_APPID, '契約期間終了 <= ' + maxMonth + ' and 契約期間開始 >= ' + minMonth + ' order by OMS顧客コード asc')
      .then(function(canvas1Rec) {
        fetchRecords(PROP_APPID, 'order by 決算開始日 desc')
          .then(function(canvas1Rec2) {

            var data = [];
            data[elevenMonthsBefore] = 0;
            data[tenMonthsBefore] = 0;
            data[nineMonthsBefore] = 0;
            data[eightMonthsBefore] = 0;
            data[sevenMonthsBefore] = 0;
            data[sixMonthsBefore] = 0;
            data[fiveMonthsBefore] = 0;
            data[fourMonthsBefore] = 0;
            data[threeMonthsBefore] = 0;
            data[twoMonthsBefore] = 0;
            data[oneMonthBefore] = 0;
            data[noMonthBefore] = 0;

            var rate = [];
            rate[elevenMonthsBefore] = 0;
            rate[tenMonthsBefore] = 0;
            rate[nineMonthsBefore] = 0;
            rate[eightMonthsBefore] = 0;
            rate[sevenMonthsBefore] = 0;
            rate[sixMonthsBefore] = 0;
            rate[fiveMonthsBefore] = 0;
            rate[fourMonthsBefore] = 0;
            rate[threeMonthsBefore] = 0;
            rate[twoMonthsBefore] = 0;
            rate[oneMonthBefore] = 0;
            rate[noMonthBefore] = 0;

            for (var i = 0; i < canvas1Rec.length; i++) {
              var month;
              var tableRecords = canvas1Rec[i].売上管理表.value;
              for (var n = 0; n < tableRecords.length; n++) {
                var date = tableRecords[n].value['売上月'].value.split("-");
                if (date[1].charAt(0) === "0") {
                  month = date[1].charAt(1) + "月";
                } else {
                  month = date[1] + "月";
                }
                if (moment(tableRecords[n].value['売上月'].value).isSameOrBefore(moment())) {
                  data[month] += parseInt(tableRecords[n].value['実績請求額'].value, 10);
                } else {
                  data[month] += parseInt(tableRecords[n].value['予測額'].value, 10);
                }
              }
            }

            var eventuallyThisYearData = [data[elevenMonthsBefore], data[tenMonthsBefore], data[nineMonthsBefore],
              data[eightMonthsBefore], data[sevenMonthsBefore], data[sixMonthsBefore], data[fiveMonthsBefore],
              data[fourMonthsBefore], data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
              data[noMonthBefore]
            ];
            data = refreshData(data);

            // 決算開始日
            var fiscalStDay;
            // 本年度の利益額データ
            for (var v = 0; v < canvas1Rec2.length; v++) {
              var month3;
              var tableRecords5 = canvas1Rec2[v].固定費一覧.value;
              for (var w = 0; w < tableRecords5.length; w++) {
                month3 = tableRecords5[w].value['固定費月'].value + "月";
                data[month3] += parseInt(tableRecords5[w].value['固定費額'].value, 10);
              }
              var variCosts = canvas1Rec2[v].変動費率.value;
              if (v === 0) {
                fiscalStDay = canvas1Rec2[v].決算開始日.value;
              }
            }
            var eventuallyThisYearFixCost = [data[elevenMonthsBefore], data[tenMonthsBefore], data[nineMonthsBefore],
              data[eightMonthsBefore], data[sevenMonthsBefore], data[sixMonthsBefore], data[fiveMonthsBefore],
              data[fourMonthsBefore], data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
              data[noMonthBefore]
            ];
            data = refreshData(data);

            data[elevenMonthsBefore] = (eventuallyThisYearData[0] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[0];
            data[tenMonthsBefore] = (eventuallyThisYearData[1] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[1];
            data[nineMonthsBefore] = (eventuallyThisYearData[2] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[2];
            data[eightMonthsBefore] = (eventuallyThisYearData[3] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[3];
            data[sevenMonthsBefore] = (eventuallyThisYearData[4] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[4];
            data[sixMonthsBefore] = (eventuallyThisYearData[5] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[5];
            data[fiveMonthsBefore] = (eventuallyThisYearData[6] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[6];
            data[fourMonthsBefore] = (eventuallyThisYearData[7] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[7];
            data[threeMonthsBefore] = (eventuallyThisYearData[8] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[8];
            data[twoMonthsBefore] = (eventuallyThisYearData[9] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[9];
            data[oneMonthBefore] = (eventuallyThisYearData[10] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[10];
            data[noMonthBefore] = (eventuallyThisYearData[11] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[11];

            var eventuallyThisYearIncome = [data[elevenMonthsBefore], data[tenMonthsBefore], data[nineMonthsBefore],
              data[eightMonthsBefore], data[sevenMonthsBefore], data[sixMonthsBefore], data[fiveMonthsBefore],
              data[fourMonthsBefore], data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
              data[noMonthBefore]
            ];
            data = refreshData(data);

            // 本年度利益率データ
            rate[elevenMonthsBefore] = Math.floor(eventuallyThisYearIncome[0] / eventuallyThisYearData[0] * 100) / 100 * 100;
            rate[tenMonthsBefore] = Math.floor(eventuallyThisYearIncome[1] / eventuallyThisYearData[1] * 100) / 100 * 100;
            rate[nineMonthsBefore] = Math.floor(eventuallyThisYearIncome[2] / eventuallyThisYearData[2] * 100) / 100 * 100;
            rate[eightMonthsBefore] = Math.floor(eventuallyThisYearIncome[3] / eventuallyThisYearData[3] * 100) / 100 * 100;
            rate[sevenMonthsBefore] = Math.floor(eventuallyThisYearIncome[4] / eventuallyThisYearData[4] * 100) / 100 * 100;
            rate[sixMonthsBefore] = Math.floor(eventuallyThisYearIncome[5] / eventuallyThisYearData[5] * 100) / 100 * 100;
            rate[fiveMonthsBefore] = Math.floor(eventuallyThisYearIncome[6] / eventuallyThisYearData[6] * 100) / 100 * 100;
            rate[fourMonthsBefore] = Math.floor(eventuallyThisYearIncome[7] / eventuallyThisYearData[7] * 100) / 100 * 100;
            rate[threeMonthsBefore] = Math.floor(eventuallyThisYearIncome[8] / eventuallyThisYearData[8] * 100) / 100 * 100;
            rate[twoMonthsBefore] = Math.floor(eventuallyThisYearIncome[9] / eventuallyThisYearData[9] * 100) / 100 * 100;
            rate[oneMonthBefore] = Math.floor(eventuallyThisYearIncome[10] / eventuallyThisYearData[10] * 100) / 100 * 100;
            rate[noMonthBefore] = Math.floor(eventuallyThisYearIncome[11] / eventuallyThisYearData[11] * 100) / 100 * 100;

            var eventuallyIncomeRate = [rate[elevenMonthsBefore], rate[tenMonthsBefore], rate[nineMonthsBefore],
              rate[eightMonthsBefore], rate[sevenMonthsBefore], rate[sixMonthsBefore], rate[fiveMonthsBefore],
              rate[fourMonthsBefore], rate[threeMonthsBefore], rate[twoMonthsBefore], rate[oneMonthBefore],
              rate[noMonthBefore]
            ];
            rate = refreshData(rate);

            // 計画値データ
            for (var m = 0; m < canvas1Rec.length; m++) {
              var month4;
              var tableRecords4 = canvas1Rec[m].売上管理表.value;
              for (var o = 0; o < tableRecords4.length; o++) {
                var date4 = tableRecords4[o].value['売上月'].value.split("-");
                if (date4[1].charAt(0) === "0") {
                  month4 = date4[1].charAt(1) + "月";
                } else {
                  month4 = date4[1] + "月";
                }
                data[month4] += parseInt(tableRecords4[o].value['計画額'].value, 10);
              }
            }
            var eventuallyPlanThisYearData = [data[elevenMonthsBefore], data[tenMonthsBefore], data[nineMonthsBefore],
              data[eightMonthsBefore], data[sevenMonthsBefore], data[sixMonthsBefore], data[fiveMonthsBefore],
              data[fourMonthsBefore], data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
              data[noMonthBefore]
            ];
            data = refreshData(data);
            // 計画利益額データ
            data[elevenMonthsBefore] = (eventuallyPlanThisYearData[0] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[0];
            data[tenMonthsBefore] = (eventuallyPlanThisYearData[1] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[1];
            data[nineMonthsBefore] = (eventuallyPlanThisYearData[2] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[2];
            data[eightMonthsBefore] = (eventuallyPlanThisYearData[3] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[3];
            data[sevenMonthsBefore] = (eventuallyPlanThisYearData[4] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[4];
            data[sixMonthsBefore] = (eventuallyPlanThisYearData[5] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[5];
            data[fiveMonthsBefore] = (eventuallyPlanThisYearData[6] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[6];
            data[fourMonthsBefore] = (eventuallyPlanThisYearData[7] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[7];
            data[threeMonthsBefore] = (eventuallyPlanThisYearData[8] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[8];
            data[twoMonthsBefore] = (eventuallyPlanThisYearData[9] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[9];
            data[oneMonthBefore] = (eventuallyPlanThisYearData[10] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[10];
            data[noMonthBefore] = (eventuallyPlanThisYearData[11] * (100 - variCosts) / 100) - eventuallyThisYearFixCost[11];

            var eventuallyPlanThisYearIncome = [data[elevenMonthsBefore], data[tenMonthsBefore], data[nineMonthsBefore],
              data[eightMonthsBefore], data[sevenMonthsBefore], data[sixMonthsBefore], data[fiveMonthsBefore],
              data[fourMonthsBefore], data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
              data[noMonthBefore]
            ];
            data = refreshData(data);

            // 本年度利益率データ
            rate[elevenMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[0] / eventuallyPlanThisYearData[0] * 100) / 100 * 100;
            rate[tenMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[1] / eventuallyPlanThisYearData[1] * 100) / 100 * 100;
            rate[nineMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[2] / eventuallyPlanThisYearData[2] * 100) / 100 * 100;
            rate[eightMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[3] / eventuallyPlanThisYearData[3] * 100) / 100 * 100;
            rate[sevenMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[4] / eventuallyPlanThisYearData[4] * 100) / 100 * 100;
            rate[sixMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[5] / eventuallyPlanThisYearData[5] * 100) / 100 * 100;
            rate[fiveMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[6] / eventuallyPlanThisYearData[6] * 100) / 100 * 100;
            rate[fourMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[7] / eventuallyPlanThisYearData[7] * 100) / 100 * 100;
            rate[threeMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[8] / eventuallyPlanThisYearData[8] * 100) / 100 * 100;
            rate[twoMonthsBefore] = Math.floor(eventuallyPlanThisYearIncome[9] / eventuallyPlanThisYearData[9] * 100) / 100 * 100;
            rate[oneMonthBefore] = Math.floor(eventuallyPlanThisYearIncome[10] / eventuallyPlanThisYearData[10] * 100) / 100 * 100;
            rate[noMonthBefore] = Math.floor(eventuallyPlanThisYearIncome[11] / eventuallyPlanThisYearData[11] * 100) / 100 * 100;

            var eventuallyPlanIncomeRate = [rate[elevenMonthsBefore], rate[tenMonthsBefore], rate[nineMonthsBefore],
              rate[eightMonthsBefore], rate[sevenMonthsBefore], rate[sixMonthsBefore], rate[fiveMonthsBefore],
              rate[fourMonthsBefore], rate[threeMonthsBefore], rate[twoMonthsBefore], rate[oneMonthBefore],
              rate[noMonthBefore]
            ];
            rate = refreshData(rate);

            // 対計画比の算出
            rate[elevenMonthsBefore] = Math.floor(eventuallyThisYearData[0] / eventuallyPlanThisYearData[0] * 100) / 100 * 100;
            rate[tenMonthsBefore] = Math.floor(eventuallyThisYearData[1] / eventuallyPlanThisYearData[1] * 100) / 100 * 100;
            rate[nineMonthsBefore] = Math.floor(eventuallyThisYearData[2] / eventuallyPlanThisYearData[2] * 100) / 100 * 100;
            rate[eightMonthsBefore] = Math.floor(eventuallyThisYearData[3] / eventuallyPlanThisYearData[3] * 100) / 100 * 100;
            rate[sevenMonthsBefore] = Math.floor(eventuallyThisYearData[4] / eventuallyPlanThisYearData[4] * 100) / 100 * 100;
            rate[sixMonthsBefore] = Math.floor(eventuallyThisYearData[5] / eventuallyPlanThisYearData[5] * 100) / 100 * 100;
            rate[fiveMonthsBefore] = Math.floor(eventuallyThisYearData[6] / eventuallyPlanThisYearData[6] * 100) / 100 * 100;
            rate[fourMonthsBefore] = Math.floor(eventuallyThisYearData[7] / eventuallyPlanThisYearData[7] * 100) / 100 * 100;
            rate[threeMonthsBefore] = Math.floor(eventuallyThisYearData[8] / eventuallyPlanThisYearData[8] * 100) / 100 * 100;
            rate[twoMonthsBefore] = Math.floor(eventuallyThisYearData[9] / eventuallyPlanThisYearData[9] * 100) / 100 * 100;
            rate[oneMonthBefore] = Math.floor(eventuallyThisYearData[10] / eventuallyPlanThisYearData[10] * 100) / 100 * 100;
            rate[noMonthBefore] = Math.floor(eventuallyThisYearData[11] / eventuallyPlanThisYearData[11] * 100) / 100 * 100;

            var eventuallyPlanRate = [rate[elevenMonthsBefore], rate[tenMonthsBefore], rate[nineMonthsBefore],
              rate[eightMonthsBefore], rate[sevenMonthsBefore], rate[sixMonthsBefore], rate[fiveMonthsBefore],
              rate[fourMonthsBefore], rate[threeMonthsBefore], rate[twoMonthsBefore], rate[oneMonthBefore],
              rate[noMonthBefore]
            ];
            rate = refreshData(rate);

            fetchRecords(SALES_APPID, '契約期間終了 <= ' + maxMonth2 + ' and 契約期間開始 >= ' + minMonth2 + ' order by OMS顧客コード asc')
              .then(function(canvas1Rec2) {
                data = refreshData(data);
                // 前年同月比グラフのデータ作成
                for (var j = 0; j < canvas1Rec2.length; j++) {
                  var month2;
                  var tableRecords2 = canvas1Rec2[j].売上管理表.value;
                  for (var p = 0; p < tableRecords2.length; p++) {
                    var date2 = tableRecords2[p].value['売上月'].value.split("-");
                    if (date2[1].charAt(0) === "0") {
                      month2 = date2[1].charAt(1) + "月";
                    } else {
                      month2 = date2[1] + "月";
                    }
                    data[month2] += parseInt(tableRecords2[p].value['実績請求額'].value, 10);
                  }
                }
                var eventuallyLastYearData = [data[elevenMonthsBefore], data[tenMonthsBefore],
                  data[nineMonthsBefore], data[eightMonthsBefore], data[sevenMonthsBefore],
                  data[sixMonthsBefore], data[fiveMonthsBefore], data[fourMonthsBefore],
                  data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
                  data[noMonthBefore]
                ];
                data = refreshData(data);

                // 対前年比の算出
                rate[elevenMonthsBefore] = Math.floor(eventuallyThisYearData[0] / eventuallyLastYearData[0] * 100) / 100 * 100;
                rate[tenMonthsBefore] = Math.floor(eventuallyThisYearData[1] / eventuallyLastYearData[1] * 100) / 100 * 100;
                rate[nineMonthsBefore] = Math.floor(eventuallyThisYearData[2] / eventuallyLastYearData[2] * 100) / 100 * 100;
                rate[eightMonthsBefore] = Math.floor(eventuallyThisYearData[3] / eventuallyLastYearData[3] * 100) / 100 * 100;
                rate[sevenMonthsBefore] = Math.floor(eventuallyThisYearData[4] / eventuallyLastYearData[4] * 100) / 100 * 100;
                rate[sixMonthsBefore] = Math.floor(eventuallyThisYearData[5] / eventuallyLastYearData[5] * 100) / 100 * 100;
                rate[fiveMonthsBefore] = Math.floor(eventuallyThisYearData[6] / eventuallyLastYearData[6] * 100) / 100 * 100;
                rate[fourMonthsBefore] = Math.floor(eventuallyThisYearData[7] / eventuallyLastYearData[7] * 100) / 100 * 100;
                rate[threeMonthsBefore] = Math.floor(eventuallyThisYearData[8] / eventuallyLastYearData[8] * 100) / 100 * 100;
                rate[twoMonthsBefore] = Math.floor(eventuallyThisYearData[9] / eventuallyLastYearData[9] * 100) / 100 * 100;
                rate[oneMonthBefore] = Math.floor(eventuallyThisYearData[10] / eventuallyLastYearData[10] * 100) / 100 * 100;
                rate[noMonthBefore] = Math.floor(eventuallyThisYearData[11] / eventuallyLastYearData[11] * 100) / 100 * 100;

                var eventuallyLastYearRate = [rate[elevenMonthsBefore], rate[tenMonthsBefore], rate[nineMonthsBefore],
                  rate[eightMonthsBefore], rate[sevenMonthsBefore], rate[sixMonthsBefore], rate[fiveMonthsBefore],
                  rate[fourMonthsBefore], rate[threeMonthsBefore], rate[twoMonthsBefore], rate[oneMonthBefore],
                  rate[noMonthBefore]
                ];

                // 実績累計データの算出
                data[elevenMonthsBefore] = eventuallyThisYearData[0];
                data[tenMonthsBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1];
                data[nineMonthsBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2];
                data[eightMonthsBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2] +
                  eventuallyThisYearData[3];
                data[sevenMonthsBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2] +
                  eventuallyThisYearData[3] + eventuallyThisYearData[4];
                data[sixMonthsBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2] +
                  eventuallyThisYearData[3] + eventuallyThisYearData[4] + eventuallyThisYearData[5];
                data[fiveMonthsBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2] +
                  eventuallyThisYearData[3] + eventuallyThisYearData[4] + eventuallyThisYearData[5] + eventuallyThisYearData[6];
                data[fourMonthsBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2] +
                  eventuallyThisYearData[3] + eventuallyThisYearData[4] + eventuallyThisYearData[5] + eventuallyThisYearData[6] +
                  eventuallyThisYearData[7];
                data[threeMonthsBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2] +
                  eventuallyThisYearData[3] + eventuallyThisYearData[4] + eventuallyThisYearData[5] + eventuallyThisYearData[6] +
                  eventuallyThisYearData[7] + eventuallyThisYearData[8];
                data[twoMonthsBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2] +
                  eventuallyThisYearData[3] + eventuallyThisYearData[4] + eventuallyThisYearData[5] + eventuallyThisYearData[6] +
                  eventuallyThisYearData[7] + eventuallyThisYearData[8] + eventuallyThisYearData[9];
                data[oneMonthBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2] +
                  eventuallyThisYearData[3] + eventuallyThisYearData[4] + eventuallyThisYearData[5] + eventuallyThisYearData[6] +
                  eventuallyThisYearData[7] + eventuallyThisYearData[8] + eventuallyThisYearData[9] + eventuallyThisYearData[10];
                data[noMonthBefore] = eventuallyThisYearData[0] + eventuallyThisYearData[1] + eventuallyThisYearData[2] +
                  eventuallyThisYearData[3] + eventuallyThisYearData[4] + eventuallyThisYearData[5] + eventuallyThisYearData[6] +
                  eventuallyThisYearData[7] + eventuallyThisYearData[8] + eventuallyThisYearData[9] + eventuallyThisYearData[10] +
                  eventuallyThisYearData[11];
                var sumThisYearData = [data[elevenMonthsBefore], data[tenMonthsBefore],
                  data[nineMonthsBefore], data[eightMonthsBefore], data[sevenMonthsBefore],
                  data[sixMonthsBefore], data[fiveMonthsBefore], data[fourMonthsBefore],
                  data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
                  data[noMonthBefore]
                ];
                data = refreshData(data);

                // 計画累計データの算出
                data[elevenMonthsBefore] = eventuallyPlanThisYearData[0];
                data[tenMonthsBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1];
                data[nineMonthsBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2];
                data[eightMonthsBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2] +
                  eventuallyPlanThisYearData[3];
                data[sevenMonthsBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2] +
                  eventuallyPlanThisYearData[3] + eventuallyPlanThisYearData[4];
                data[sixMonthsBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2] +
                  eventuallyPlanThisYearData[3] + eventuallyPlanThisYearData[4] + eventuallyPlanThisYearData[5];
                data[fiveMonthsBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2] +
                  eventuallyPlanThisYearData[3] + eventuallyPlanThisYearData[4] + eventuallyPlanThisYearData[5] + eventuallyPlanThisYearData[6];
                data[fourMonthsBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2] +
                  eventuallyPlanThisYearData[3] + eventuallyPlanThisYearData[4] + eventuallyPlanThisYearData[5] + eventuallyPlanThisYearData[6] +
                  eventuallyPlanThisYearData[7];
                data[threeMonthsBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2] +
                  eventuallyPlanThisYearData[3] + eventuallyPlanThisYearData[4] + eventuallyPlanThisYearData[5] + eventuallyPlanThisYearData[6] +
                  eventuallyPlanThisYearData[7] + eventuallyPlanThisYearData[8];
                data[twoMonthsBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2] +
                  eventuallyPlanThisYearData[3] + eventuallyPlanThisYearData[4] + eventuallyPlanThisYearData[5] + eventuallyPlanThisYearData[6] +
                  eventuallyPlanThisYearData[7] + eventuallyPlanThisYearData[8] + eventuallyPlanThisYearData[9];
                data[oneMonthBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2] +
                  eventuallyPlanThisYearData[3] + eventuallyPlanThisYearData[4] + eventuallyPlanThisYearData[5] + eventuallyPlanThisYearData[6] +
                  eventuallyPlanThisYearData[7] + eventuallyPlanThisYearData[8] + eventuallyPlanThisYearData[9] + eventuallyPlanThisYearData[10];
                data[noMonthBefore] = eventuallyPlanThisYearData[0] + eventuallyPlanThisYearData[1] + eventuallyPlanThisYearData[2] +
                  eventuallyPlanThisYearData[3] + eventuallyPlanThisYearData[4] + eventuallyPlanThisYearData[5] + eventuallyPlanThisYearData[6] +
                  eventuallyPlanThisYearData[7] + eventuallyPlanThisYearData[8] + eventuallyPlanThisYearData[9] + eventuallyPlanThisYearData[10] +
                  eventuallyPlanThisYearData[11];
                var sumPlanThisYearData = [data[elevenMonthsBefore], data[tenMonthsBefore],
                  data[nineMonthsBefore], data[eightMonthsBefore], data[sevenMonthsBefore],
                  data[sixMonthsBefore], data[fiveMonthsBefore], data[fourMonthsBefore],
                  data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
                  data[noMonthBefore]
                ];
                data = refreshData(data);

                // 前年実績累計データの算出
                data[elevenMonthsBefore] = eventuallyLastYearData[0];
                data[tenMonthsBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1];
                data[nineMonthsBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2];
                data[eightMonthsBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2] +
                  eventuallyLastYearData[3];
                data[sevenMonthsBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2] +
                  eventuallyLastYearData[3] + eventuallyLastYearData[4];
                data[sixMonthsBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2] +
                  eventuallyLastYearData[3] + eventuallyLastYearData[4] + eventuallyLastYearData[5];
                data[fiveMonthsBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2] +
                  eventuallyLastYearData[3] + eventuallyLastYearData[4] + eventuallyLastYearData[5] + eventuallyLastYearData[6];
                data[fourMonthsBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2] +
                  eventuallyLastYearData[3] + eventuallyLastYearData[4] + eventuallyLastYearData[5] + eventuallyLastYearData[6] +
                  eventuallyLastYearData[7];
                data[threeMonthsBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2] +
                  eventuallyLastYearData[3] + eventuallyLastYearData[4] + eventuallyLastYearData[5] + eventuallyLastYearData[6] +
                  eventuallyLastYearData[7] + eventuallyLastYearData[8];
                data[twoMonthsBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2] +
                  eventuallyLastYearData[3] + eventuallyLastYearData[4] + eventuallyLastYearData[5] + eventuallyLastYearData[6] +
                  eventuallyLastYearData[7] + eventuallyLastYearData[8] + eventuallyLastYearData[9];
                data[oneMonthBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2] +
                  eventuallyLastYearData[3] + eventuallyLastYearData[4] + eventuallyLastYearData[5] + eventuallyLastYearData[6] +
                  eventuallyLastYearData[7] + eventuallyLastYearData[8] + eventuallyLastYearData[9] + eventuallyLastYearData[10];
                data[noMonthBefore] = eventuallyLastYearData[0] + eventuallyLastYearData[1] + eventuallyLastYearData[2] +
                  eventuallyLastYearData[3] + eventuallyLastYearData[4] + eventuallyLastYearData[5] + eventuallyLastYearData[6] +
                  eventuallyLastYearData[7] + eventuallyLastYearData[8] + eventuallyLastYearData[9] + eventuallyLastYearData[10] +
                  eventuallyLastYearData[11];
                var sumLastYearData = [data[elevenMonthsBefore], data[tenMonthsBefore],
                  data[nineMonthsBefore], data[eightMonthsBefore], data[sevenMonthsBefore],
                  data[sixMonthsBefore], data[fiveMonthsBefore], data[fourMonthsBefore],
                  data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
                  data[noMonthBefore]
                ];
                data = refreshData(data);

                // 実績利益累計データの算出
                data[elevenMonthsBefore] = eventuallyThisYearIncome[0];
                data[tenMonthsBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1];
                data[nineMonthsBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2];
                data[eightMonthsBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2] +
                  eventuallyThisYearIncome[3];
                data[sevenMonthsBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2] +
                  eventuallyThisYearIncome[3] + eventuallyThisYearIncome[4];
                data[sixMonthsBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2] +
                  eventuallyThisYearIncome[3] + eventuallyThisYearIncome[4] + eventuallyThisYearIncome[5];
                data[fiveMonthsBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2] +
                  eventuallyThisYearIncome[3] + eventuallyThisYearIncome[4] + eventuallyThisYearIncome[5] + eventuallyThisYearIncome[6];
                data[fourMonthsBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2] +
                  eventuallyThisYearIncome[3] + eventuallyThisYearIncome[4] + eventuallyThisYearIncome[5] + eventuallyThisYearIncome[6] +
                  eventuallyThisYearIncome[7];
                data[threeMonthsBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2] +
                  eventuallyThisYearIncome[3] + eventuallyThisYearIncome[4] + eventuallyThisYearIncome[5] + eventuallyThisYearIncome[6] +
                  eventuallyThisYearIncome[7] + eventuallyThisYearIncome[8];
                data[twoMonthsBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2] +
                  eventuallyThisYearIncome[3] + eventuallyThisYearIncome[4] + eventuallyThisYearIncome[5] + eventuallyThisYearIncome[6] +
                  eventuallyThisYearIncome[7] + eventuallyThisYearIncome[8] + eventuallyThisYearIncome[9];
                data[oneMonthBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2] +
                  eventuallyThisYearIncome[3] + eventuallyThisYearIncome[4] + eventuallyThisYearIncome[5] + eventuallyThisYearIncome[6] +
                  eventuallyThisYearIncome[7] + eventuallyThisYearIncome[8] + eventuallyThisYearIncome[9] + eventuallyThisYearIncome[10];
                data[noMonthBefore] = eventuallyThisYearIncome[0] + eventuallyThisYearIncome[1] + eventuallyThisYearIncome[2] +
                  eventuallyThisYearIncome[3] + eventuallyThisYearIncome[4] + eventuallyThisYearIncome[5] + eventuallyThisYearIncome[6] +
                  eventuallyThisYearIncome[7] + eventuallyThisYearIncome[8] + eventuallyThisYearIncome[9] + eventuallyThisYearIncome[10] +
                  eventuallyThisYearIncome[11];
                var sumThisYearIncome = [data[elevenMonthsBefore], data[tenMonthsBefore],
                  data[nineMonthsBefore], data[eightMonthsBefore], data[sevenMonthsBefore],
                  data[sixMonthsBefore], data[fiveMonthsBefore], data[fourMonthsBefore],
                  data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
                  data[noMonthBefore]
                ];
                data = refreshData(data);

                // 計画利益累計データの算出
                data[elevenMonthsBefore] = eventuallyPlanThisYearIncome[0];
                data[tenMonthsBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1];
                data[nineMonthsBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2];
                data[eightMonthsBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2] +
                  eventuallyPlanThisYearIncome[3];
                data[sevenMonthsBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2] +
                  eventuallyPlanThisYearIncome[3] + eventuallyPlanThisYearIncome[4];
                data[sixMonthsBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2] +
                  eventuallyPlanThisYearIncome[3] + eventuallyPlanThisYearIncome[4] + eventuallyPlanThisYearIncome[5];
                data[fiveMonthsBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2] +
                  eventuallyPlanThisYearIncome[3] + eventuallyPlanThisYearIncome[4] + eventuallyPlanThisYearIncome[5] + eventuallyPlanThisYearIncome[6];
                data[fourMonthsBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2] +
                  eventuallyPlanThisYearIncome[3] + eventuallyPlanThisYearIncome[4] + eventuallyPlanThisYearIncome[5] + eventuallyPlanThisYearIncome[6] +
                  eventuallyPlanThisYearIncome[7];
                data[threeMonthsBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2] +
                  eventuallyPlanThisYearIncome[3] + eventuallyPlanThisYearIncome[4] + eventuallyPlanThisYearIncome[5] + eventuallyPlanThisYearIncome[6] +
                  eventuallyPlanThisYearIncome[7] + eventuallyPlanThisYearIncome[8];
                data[twoMonthsBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2] +
                  eventuallyPlanThisYearIncome[3] + eventuallyPlanThisYearIncome[4] + eventuallyPlanThisYearIncome[5] + eventuallyPlanThisYearIncome[6] +
                  eventuallyPlanThisYearIncome[7] + eventuallyPlanThisYearIncome[8] + eventuallyPlanThisYearIncome[9];
                data[oneMonthBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2] +
                  eventuallyPlanThisYearIncome[3] + eventuallyPlanThisYearIncome[4] + eventuallyPlanThisYearIncome[5] + eventuallyPlanThisYearIncome[6] +
                  eventuallyPlanThisYearIncome[7] + eventuallyPlanThisYearIncome[8] + eventuallyPlanThisYearIncome[9] + eventuallyPlanThisYearIncome[10];
                data[noMonthBefore] = eventuallyPlanThisYearIncome[0] + eventuallyPlanThisYearIncome[1] + eventuallyPlanThisYearIncome[2] +
                  eventuallyPlanThisYearIncome[3] + eventuallyPlanThisYearIncome[4] + eventuallyPlanThisYearIncome[5] + eventuallyPlanThisYearIncome[6] +
                  eventuallyPlanThisYearIncome[7] + eventuallyPlanThisYearIncome[8] + eventuallyPlanThisYearIncome[9] + eventuallyPlanThisYearIncome[10] +
                  eventuallyPlanThisYearIncome[11];
                var sumPlanThisYearIncome = [data[elevenMonthsBefore], data[tenMonthsBefore],
                  data[nineMonthsBefore], data[eightMonthsBefore], data[sevenMonthsBefore],
                  data[sixMonthsBefore], data[fiveMonthsBefore], data[fourMonthsBefore],
                  data[threeMonthsBefore], data[twoMonthsBefore], data[oneMonthBefore],
                  data[noMonthBefore]
                ];
                data = refreshData(data);

                // モバイル向けグリッドデータ作成
                var mbTableData = [
                  [elevenMonthsBefore, eventuallyLastYearData[0], eventuallyPlanThisYearData[0], eventuallyThisYearData[0], eventuallyPlanRate[0], eventuallyLastYearRate[0]],
                  [tenMonthsBefore, eventuallyLastYearData[1], eventuallyPlanThisYearData[1], eventuallyThisYearData[1], eventuallyPlanRate[1], eventuallyLastYearRate[1]],
                  [nineMonthsBefore, eventuallyLastYearData[2], eventuallyPlanThisYearData[2], eventuallyThisYearData[2], eventuallyPlanRate[2], eventuallyLastYearRate[2]],
                  [eightMonthsBefore, eventuallyLastYearData[3], eventuallyPlanThisYearData[3], eventuallyThisYearData[3], eventuallyPlanRate[3], eventuallyLastYearRate[3]],
                  [sevenMonthsBefore, eventuallyLastYearData[4], eventuallyPlanThisYearData[4], eventuallyThisYearData[4], eventuallyPlanRate[4], eventuallyLastYearRate[4]],
                  [sixMonthsBefore, eventuallyLastYearData[5], eventuallyPlanThisYearData[5], eventuallyThisYearData[5], eventuallyPlanRate[5], eventuallyLastYearRate[5]],
                  [fiveMonthsBefore, eventuallyLastYearData[6], eventuallyPlanThisYearData[6], eventuallyThisYearData[6], eventuallyPlanRate[6], eventuallyLastYearRate[6]],
                  [fourMonthsBefore, eventuallyLastYearData[7], eventuallyPlanThisYearData[7], eventuallyThisYearData[7], eventuallyPlanRate[7], eventuallyLastYearRate[7]],
                  [threeMonthsBefore, eventuallyLastYearData[8], eventuallyPlanThisYearData[8], eventuallyThisYearData[8], eventuallyPlanRate[8], eventuallyLastYearRate[8]],
                  [twoMonthsBefore, eventuallyLastYearData[9], eventuallyPlanThisYearData[9], eventuallyThisYearData[9], eventuallyPlanRate[9], eventuallyLastYearRate[9]],
                  [oneMonthBefore, eventuallyLastYearData[10], eventuallyPlanThisYearData[10], eventuallyThisYearData[10], eventuallyPlanRate[10], eventuallyLastYearRate[10]],
                  [noMonthBefore, eventuallyLastYearData[11], eventuallyPlanThisYearData[11], eventuallyThisYearData[11], eventuallyPlanRate[11], eventuallyLastYearRate[11]]
                ];

                // ドーナツグラフのデータ作成
                var prodData = [];
                var prodLabels = [];
                var userData = [];
                var userLabels = [];
                var userCodes = [];
                for (var l = 0; l < canvas1Rec.length; l++) {
                  var prod = canvas1Rec[l].案件タイプ.value;
                  if (typeof(prodData[prod]) === "undefined") {
                    prodData[prod] = 0;
                    prodLabels.push(prod);
                  }
                  var user = canvas1Rec[l].主担当.value[0].name;
                  var code = canvas1Rec[l].主担当.value[0].code;
                  if (typeof(userData[user]) === "undefined") {
                    userData[user] = 0;
                    userLabels.push(user);
                    userCodes.push(user + ":" + code);
                  }
                  var tableRecords3 = canvas1Rec[l].売上管理表.value;
                  for (var q = 0; q < tableRecords3.length; q++) {
                    if (moment(tableRecords3[q].value['売上月'].value).isSameOrBefore(moment())) {
                      prodData[prod] += parseInt(tableRecords3[q].value['実績請求額'].value, 10);
                      userData[user] += parseInt(tableRecords3[q].value['実績請求額'].value, 10);
                    } else {
                      prodData[prod] += parseInt(tableRecords3[q].value['予測額'].value, 10);
                      userData[user] += parseInt(tableRecords3[q].value['予測額'].value, 10);
                    }
                  }
                }

                var eventuallyByProductData = [];
                var eventuallyByUserData = [];
                // 製品背景色
                var prodBGColorMST = {
                  税務顧問: "rgba(54, 162, 235, 0.4)",
                  経営コンサルティング: "rgba(255, 99, 132, 0.4)",
                  事業承継: "rgba(0, 100, 0, 0.4)",
                  MandA: "rgba(255, 60, 255, 0.4)",
                  個人資産税: "rgba(255, 255, 0, 0.4)",
                  人事コンサルティング: "rgba(255, 112, 0, 0.4)",
                  ITコンサルティング: "rgba(60, 60, 120, 0.4)"
                  //kintone: "rgba(255, 0, 0, 0.4)",
                  //安否確認: "rgba(0, 255, 255, 0.4)"
                };
                // 【参考】製品縁取り色
                /*var prodBDColorMST = {
                	プリントクリエイター:"rgba(54, 162, 235, 1)",
                	フォームクリエイター:"rgba(255,99,132,1)",
                	kBackup:"rgba(0, 170, 0, 1)",
                	kViewer:"rgba(255, 170, 255, 1)",
                	タイムスタンプ:"rgba(255, 255, 0, 1)",
                	メールワイズ:"rgba(255, 112, 0, 1)",
                	ガルーン:"rgba(100, 0, 0, 1)",
                	kintone:"rgba(255, 184, 184, 1)",
                	安否確認:"rgba(0, 255, 255, 1)"
                };*/
                var prodBGColor = [];
                var userBGColor = [];
                //var prodBDColor = [];

                // 降順にソート
                prodLabels.sort(function(a, b) {
                  if (prodData[a] > prodData[b]) {
                    return -1;
                  }
                  if (prodData[a] < prodData[b]) {
                    return 1;
                  }
                  return 0;
                });
                userLabels.sort(function(a, b) {
                  if (userData[a] > userData[b]) {
                    return -1;
                  }
                  if (userData[a] < userData[b]) {
                    return 1;
                  }
                  return 0;
                });

                for (var t = 0; t < prodLabels.length; t++) {
                  eventuallyByProductData.push(prodData[prodLabels[t]]);
                  prodBGColor.push(prodBGColorMST[prodLabels[t]]);
                  // 【参考】縁取り色をつける場合
                  //prodBDColor.push(prodBDColorMST[prodLabels[m]]);
                  // 【参考】ランダムで配色する場合の処理
                  //prodBGColor.push(dynamicColors());
                  //prodBDColor.push(dynamicColors());
                }
                for (var u = 0; u < userLabels.length; u++) {
                  eventuallyByUserData.push(userData[userLabels[u]]);
                  //prodBGColor.push(prodBGColorMST[prodLabels[m]]);
                  // 【参考】縁取り色をつける場合
                  //prodBDColor.push(prodBDColorMST[prodLabels[m]]);
                  // 【参考】ランダムで配色する場合の処理
                  userBGColor.push(dynamicColors());
                }

                // 前年同月比グラフを描画
                var ctx = document.getElementById("canvas1");
                if (chart1) {
                  chart1.destroy();
                }
                chart1 = new Chart(ctx, {
                  type: 'bar',
                  data: {
                    labels: [elevenMonthsBefore, tenMonthsBefore, nineMonthsBefore, eightMonthsBefore,
                      sevenMonthsBefore, sixMonthsBefore, fiveMonthsBefore, fourMonthsBefore,
                      threeMonthsBefore, twoMonthsBefore, oneMonthBefore, noMonthBefore
                    ],
                    datasets: [{
                        yAxisID: "y-axis-1",
                        type: 'line',
                        label: '対計画比',
                        data: eventuallyPlanRate,
                        backgroundColor: "rgba(204, 0, 204, 0.05)",
                        borderColor: 'rgba(204, 0, 204, 1)',
                        borderWidth: 1
                      },
                      {
                        yAxisID: "y-axis-1",
                        type: 'line',
                        label: '対前年比',
                        data: eventuallyLastYearRate,
                        backgroundColor: "rgba(255, 102, 0, 0.05)",
                        borderColor: 'rgba(255, 102, 0, 1)',
                        borderWidth: 1
                      },
                      {
                        yAxisID: "y-axis-0",
                        type: 'bar',
                        label: '前年同月売上',
                        data: eventuallyLastYearData,
                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                      },
                      {
                        yAxisID: "y-axis-0",
                        type: 'bar',
                        label: '本年度売上目標',
                        data: eventuallyPlanThisYearData,
                        backgroundColor: "rgba(41, 197, 123, 0.2)",
                        borderColor: 'rgba(41, 197, 123, 1)',
                        borderWidth: 1
                      },
                      {
                        yAxisID: "y-axis-0",
                        type: 'bar',
                        label: min ? moment(min).format('YYYY年M月～') + moment(max).format('YYYY年M月売上＋予測') : moment().add(-11, "months").format('YYYY年M月～') + moment().format('YYYY年M月売上＋予測'),
                        data: eventuallyThisYearData,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1
                      }
                    ]
                  },
                  options: {
                    responsive: true,
                    scales: {
                      yAxes: [{
                        position: "left",
                        id: "y-axis-0",
                        display: true,
                        scaleLabel: {
                          display: true,
                          labelString: '売上',
                          fontFamily: 'monospace'
                        },
                        ticks: {
                          beginAtZero: true,
                          maxTicksLimit: 8,
                          callback: function(value) {
                            return value + '千円';
                          }
                        }
                      }, {
                        position: "right",
                        id: "y-axis-1",
                        display: true,
                        scaleLabel: {
                          display: true,
                          labelString: '対計画・前年比',
                          fontFamily: 'monospace'
                        },
                        ticks: {
                          beginAtZero: true,
                          maxTicksLimit: 6
                        }
                      }]
                    },
                    tooltips: {
                      enabled: true,
                      mode: 'single',
                      callbacks: {
                        title: function(tooltipItems, titleData) {
                          //var val = $("#slider").dateRangeSlider("values");
                          //var min2 = moment(val.min);
                          var stval2 = $("#calst").val();
                          var enval2 = $("#calen").val();
                          var min2 = moment(stval2.substr(0, 4) + stval2.substr(5, 2) + stval2.substr(-3, 2));
                          var max2 = moment(enval2.substr(0, 4) + enval2.substr(5, 2) + enval2.substr(-3, 2));
                          var tmp = tooltipItems[0].xLabel.split("月");
                          var first = moment(min2.format("YYYY-") + tmp[0] + '-1', 'YYYY-M-D');
                          if (first.isBetween(min2, max2, null, '[]')) {
                            if (tooltipItems[0].datasetIndex === 0) {
                              return min2.add(-1, 'years').format("YYYY年") + tmp[0] + '月';
                            }
                            return min2.format("YYYY年") + tmp[0] + '月';
                          }
                          if (tooltipItems[0].datasetIndex === 0) {
                            return min2.format("YYYY年") + tmp[0] + '月';
                          }
                          return min2.add(1, 'years').format("YYYY年") + tmp[0] + '月';
                        },
                        label: function(tooltipItems, data3) {
                          if (tooltipItems.datasetIndex === 0 || tooltipItems.datasetIndex === 1) {
                            return '対計画・前年比：' + tooltipItems.yLabel + '％';
                          }
                          return tooltipItems.yLabel + '千円';
                        }
                      }
                    }
                  }
                });

                // 前年同月グリッドを描画
                // var mbt = document.getElementById("mbtable");
                if (mbtable1) {
                  mbtable1.destroy();
                }
                mbtable1 = $("#mbtable").DataTable({
                  // 日本語化
                  language: {
                    url: "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Japanese.json"
                  },
                  // 件数制限
                  'lengthChange': false,
                  // キーワード検索
                  'searching': false,
                  // ソート機能
                  'ordering': false,
                  // 件数表示
                  'info': false,
                  // ページング機能
                  'paging': false,
                  'autoWidth': true,
                  // 'scrollX'     : true,
                  // 'scrollY'     : true,
                  "emptyTable": "表示するデータがありません。",
                  "thousands": ",",
                  "zeroRecords": "一致するデータが見つかりません。",
                  data: mbTableData
                });
                // 累積グラフを描画
                var ctx4 = document.getElementById("canvas4");
                if (chart4) {
                  chart4.destroy();
                }
                chart4 = new Chart(ctx4, {
                  type: 'line',
                  data: {
                    labels: [elevenMonthsBefore, tenMonthsBefore, nineMonthsBefore, eightMonthsBefore,
                      sevenMonthsBefore, sixMonthsBefore, fiveMonthsBefore, fourMonthsBefore,
                      threeMonthsBefore, twoMonthsBefore, oneMonthBefore, noMonthBefore
                    ],
                    datasets: [{
                        label: '前年同月売上',
                        data: sumLastYearData,
                        backgroundColor: "rgba(54, 162, 235, 0.1)",
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                      },
                      {
                        label: '本年度売上目標',
                        data: sumPlanThisYearData,
                        backgroundColor: "rgba(41, 197, 123, 0.1)",
                        borderColor: 'rgba(41, 197, 123, 1)',
                        borderWidth: 1
                      },
                      {
                        label: min ? moment(min).format('YYYY年M月～') + moment(max).format('YYYY年M月売上＋予測') : moment().add(-11, "months").format('YYYY年M月～') + moment().format('YYYY年M月売上＋予測'),
                        data: sumThisYearData,
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1
                      }
                    ]
                  },
                  options: {
                    scales: {
                      yAxes: [{
                        position: "left",
                        display: true,
                        scaleLabel: {
                          display: true,
                          labelString: '売上',
                          fontFamily: 'monospace'
                        },
                        ticks: {
                          beginAtZero: true,
                          maxTicksLimit: 8,
                          callback: function(value) {
                            return value + '千円';
                          }
                        }
                      }]
                    },
                    tooltips: {
                      enabled: true,
                      mode: 'single',
                      callbacks: {
                        title: function(tooltipItems, titleData) {
                          //var val = $("#slider").dateRangeSlider("values");
                          //var min2 = moment(val.min);
                          var stval2 = $("#calst").val();
                          var enval2 = $("#calen").val();
                          var min2 = moment(stval2.substr(0, 4) + stval2.substr(5, 2) + stval2.substr(-3, 2));
                          var max2 = moment(enval2.substr(0, 4) + enval2.substr(5, 2) + enval2.substr(-3, 2));
                          var tmp = tooltipItems[0].xLabel.split("月");
                          var first = moment(min2.format("YYYY-") + tmp[0] + '-1', 'YYYY-M-D');
                          if (first.isBetween(min2, max2, null, '[]')) {
                            if (tooltipItems[0].datasetIndex === 0) {
                              return min2.add(-1, 'years').format("YYYY年") + tmp[0] + '月';
                            }
                            return min2.format("YYYY年") + tmp[0] + '月';
                          }
                          if (tooltipItems[0].datasetIndex === 0) {
                            return min2.format("YYYY年") + tmp[0] + '月';
                          }
                          return min2.add(1, 'years').format("YYYY年") + tmp[0] + '月';
                        },
                        label: function(tooltipItems, data3) {
                          return tooltipItems.yLabel + '千円';
                        }
                      }
                    }
                  }
                });

                // グラフのデフォルトフォントサイズ
                Chart.defaults.global.defaultFontSize = 10.5;
                // 決算開始日
                var mincalst = fiscalStDay.substr(0, 4) + fiscalStDay.substr(5, 2) + fiscalStDay.substr(-2, 2);
                mincalst = moment(mincalst).format("YYYY月MM月DD日");
                $("#calst").val(mincalst);
                var maxcalst = mincalst.substr(0, 4) + mincalst.substr(5, 2) + mincalst.substr(-3, 2);
                maxcalst = moment(maxcalst).add(11, 'months').endOf('month').format("YYYY月MM月DD日");
                $("#calen").val(maxcalst);
                // 集計値を表示
                $("#totalCal").val(sumThisYearData[11]);
                $("#totalPlan").val(sumPlanThisYearData[11]);
                var hardleCnt = sumPlanThisYearData[11] - sumThisYearData[11];
                $("#totalHardle").val(hardleCnt);
                var hardleRate = hardleCnt / sumPlanThisYearData[11];
                // 応援メッセージ
                var fightMsg;
                if (hardleRate > 0.5) {
                  fightMsg = "目標達成まではまだまだ　全員で力を合わせて頑張ろう！！";
                } else if (hardleRate > 0.25 && hardleRate <= 0.5) {
                  fightMsg = "目標達成が少し見えてきた！　更に頑張っていこう！";
                } else if (hardleRate > 0.1 && hardleRate <= 0.25) {
                  fightMsg = "目標達成が見えてきた！　この調子！！";
                } else if (hardleRate > 0 && hardleRate <= 0.1) {
                  fightMsg = "目標達成まであと少し！！　ラストスパート！";
                } else if (hardleRate <= 0) {
                  fightMsg = "目標達成おめでとう！！　今年もお疲れ様！";
                } else {
                  fightMsg = "";
                }
                $("#fightmsg").text(fightMsg);
                // 案件タイプ別売上高リスト
                $('#prodSelect').find('option').remove
                for (var z = 0; z < prodLabels.length; z++) {
                  $('#prodSelect').append($('<option></option>')
                    .attr('state', prodLabels[z])
                    .val(prodLabels[z])
                    .text(prodLabels[z])
                  );
                }
                // 担当者別売上高リスト
                $('#userSelect').find('option').remove
                for (var x = 0; x < userLabels.length; x++) {
                  $('#userSelect').append($('<option></option>')
                    .attr('state', userLabels[x])
                    .val(userCodes[x])
                    .text(userCodes[x])
                  );
                }
                // 期間指定スライダーの横幅調整
                $("#slider").css("width", "43%");
                // スライダーの作成は画面読み込み時のみ
                if (oneTimeFlg) {
                  createSlider();
                }
                removeLoading();
              });
          });
      });
  }

  function createProdGraph(sprd) {
    var elevenMonthsBeforeP, tenMonthsBeforeP, nineMonthsBeforeP, eightMonthsBeforeP, sevenMonthsBeforeP, sixMonthsBeforeP,
      fiveMonthsBeforeP, fourMonthsBeforeP, threeMonthsBeforeP, twoMonthsBeforeP, oneMonthBeforeP, noMonthBeforeP;
    var maxMonthP = $("#calen").val().substr(0, 4) + $("#calen").val().substr(5, 2) + $("#calen").val().substr(-3, 2);
    var minMonthP = $("#calst").val().substr(0, 4) + $("#calst").val().substr(5, 2) + $("#calst").val().substr(-3, 2);
    var maxMonthP2 = '"' + moment(maxMonthP).add(-12, "months").endOf("month").format('YYYY-MM-DD') + '"';
    elevenMonthsBeforeP = moment(maxMonthP).add(-11, 'months').format("M月");
    tenMonthsBeforeP = moment(maxMonthP).add(-10, 'months').format("M月");
    nineMonthsBeforeP = moment(maxMonthP).add(-9, 'months').format("M月");
    eightMonthsBeforeP = moment(maxMonthP).add(-8, 'months').format("M月");
    sevenMonthsBeforeP = moment(maxMonthP).add(-7, 'months').format("M月");
    sixMonthsBeforeP = moment(maxMonthP).add(-6, 'months').format("M月");
    fiveMonthsBeforeP = moment(maxMonthP).add(-5, 'months').format("M月");
    fourMonthsBeforeP = moment(maxMonthP).add(-4, 'months').format("M月");
    threeMonthsBeforeP = moment(maxMonthP).add(-3, 'months').format("M月");
    twoMonthsBeforeP = moment(maxMonthP).add(-2, 'months').format("M月");
    oneMonthBeforeP = moment(maxMonthP).add(-1, 'months').format("M月");
    noMonthBeforeP = moment(maxMonthP).format("M月");

    var minMonthP2 = '"' + moment(minMonthP).add(-12, "months").startOf("month").format('YYYY-MM-DD') + '"';
    maxMonthP = '"' + moment(maxMonthP).format('YYYY-MM-DD') + '"';
    minMonthP = '"' + moment(minMonthP).format('YYYY-MM-DD') + '"';
    fetchRecords(SALES_APPID, '契約期間終了 <= ' + maxMonthP + ' and 契約期間開始 >= ' + minMonthP + ' and 案件タイプ in ("' + sprd + '") order by OMS顧客コード asc')
      .then(function(prod1Canvas) {
        fetchRecords(SALES_APPID, '契約期間終了 <= ' + maxMonthP2 + ' and 契約期間開始 >= ' + minMonthP2 + ' and 案件タイプ in ("' + sprd + '") order by OMS顧客コード asc')
          .then(function(prod1Canvas2) {
            var data = [];
            data[elevenMonthsBeforeP] = 0;
            data[tenMonthsBeforeP] = 0;
            data[nineMonthsBeforeP] = 0;
            data[eightMonthsBeforeP] = 0;
            data[sevenMonthsBeforeP] = 0;
            data[sixMonthsBeforeP] = 0;
            data[fiveMonthsBeforeP] = 0;
            data[fourMonthsBeforeP] = 0;
            data[threeMonthsBeforeP] = 0;
            data[twoMonthsBeforeP] = 0;
            data[oneMonthBeforeP] = 0;
            data[noMonthBeforeP] = 0;

            // 実績＋予測値データ
            for (var oo = 0; oo < prod1Canvas.length; oo++) {
              var monthP;
              var tableRecordsP = prod1Canvas[oo].売上管理表.value;
              for (var pp = 0; pp < tableRecordsP.length; pp++) {
                var dateP = tableRecordsP[pp].value['売上月'].value.split("-");
                if (dateP[1].charAt(0) === "0") {
                  monthP = dateP[1].charAt(1) + "月";
                } else {
                  monthP = dateP[1] + "月";
                }
                if (moment(tableRecordsP[pp].value['売上月'].value).isSameOrBefore(moment())) {
                  data[monthP] += parseInt(tableRecordsP[pp].value['実績請求額'].value, 10);
                } else {
                  data[monthP] += parseInt(tableRecordsP[pp].value['予測額'].value, 10);
                }
              }
            }
            var prodThisYearData = [data[elevenMonthsBeforeP], data[tenMonthsBeforeP], data[nineMonthsBeforeP],
              data[eightMonthsBeforeP], data[sevenMonthsBeforeP], data[sixMonthsBeforeP], data[fiveMonthsBeforeP],
              data[fourMonthsBeforeP], data[threeMonthsBeforeP], data[twoMonthsBeforeP], data[oneMonthBeforeP],
              data[noMonthBeforeP]
            ];
            data = refreshData(data);

            // 計画値データ
            for (var qq = 0; qq < prod1Canvas.length; qq++) {
              var monthP2;
              var tableRecordsP2 = prod1Canvas[qq].売上管理表.value;
              for (var rr = 0; rr < tableRecordsP2.length; rr++) {
                var dateP2 = tableRecordsP2[rr].value['売上月'].value.split("-");
                if (dateP2[1].charAt(0) === "0") {
                  monthP2 = dateP2[1].charAt(1) + "月";
                } else {
                  monthP2 = dateP2[1] + "月";
                }
                data[monthP2] += parseInt(tableRecordsP2[rr].value['計画額'].value, 10);
              }
            }
            var prodPlanThisYearData = [data[elevenMonthsBeforeP], data[tenMonthsBeforeP], data[nineMonthsBeforeP],
              data[eightMonthsBeforeP], data[sevenMonthsBeforeP], data[sixMonthsBeforeP], data[fiveMonthsBeforeP],
              data[fourMonthsBeforeP], data[threeMonthsBeforeP], data[twoMonthsBeforeP], data[oneMonthBeforeP],
              data[noMonthBeforeP]
            ];
            data = refreshData(data);

            // 前年同月比グラフのデータ作成
            for (var ss = 0; ss < prod1Canvas2.length; ss++) {
              var monthP3;
              var tableRecordsP3 = prod1Canvas2[ss].売上管理表.value;
              for (var tt = 0; tt < tableRecordsP3.length; tt++) {
                var dateP3 = tableRecordsP3[tt].value['売上月'].value.split("-");
                if (dateP3[1].charAt(0) === "0") {
                  monthP3 = dateP3[1].charAt(1) + "月";
                } else {
                  monthP3 = dateP3[1] + "月";
                }
                data[monthP3] += parseInt(tableRecordsP3[tt].value['実績請求額'].value, 10);
              }
            }
            var prodLastYearData = [data[elevenMonthsBeforeP], data[tenMonthsBeforeP], data[nineMonthsBeforeP],
              data[eightMonthsBeforeP], data[sevenMonthsBeforeP], data[sixMonthsBeforeP], data[fiveMonthsBeforeP],
              data[fourMonthsBeforeP], data[threeMonthsBeforeP], data[twoMonthsBeforeP], data[oneMonthBeforeP],
              data[noMonthBeforeP]
            ];
            data = refreshData(data);

            // 前年同月比グラフを描画
            var ctx8 = document.getElementById("canvas8");
            if (chart8) {
              chart8.destroy();
            }
            chart8 = new Chart(ctx8, {
              type: 'bar',
              data: {
                labels: [elevenMonthsBeforeP, tenMonthsBeforeP, nineMonthsBeforeP, eightMonthsBeforeP,
                  sevenMonthsBeforeP, sixMonthsBeforeP, fiveMonthsBeforeP, fourMonthsBeforeP,
                  threeMonthsBeforeP, twoMonthsBeforeP, oneMonthBeforeP, noMonthBeforeP
                ],
                datasets: [{
                    label: '前年同月売上',
                    data: prodLastYearData,
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                  },
                  {
                    label: '本年度売上目標',
                    data: prodPlanThisYearData,
                    backgroundColor: "rgba(41, 197, 123, 0.2)",
                    borderColor: 'rgba(41, 197, 123, 1)',
                    borderWidth: 1
                  },
                  {
                    label: minMonthP ? moment(minMonthP).format('YYYY年M月～') + moment(maxMonthP).format('YYYY年M月売上＋予測') : moment(minMonthP2).format('YYYY年M月～') + moment(maxMonthP2).format('YYYY年M月売上＋予測'),
                    data: prodThisYearData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1
                  }
                ]
              },
              options: {
                scales: {
                  yAxes: [{
                    position: "left",
                    id: "y-axis-0",
                    display: true,
                    scaleLabel: {
                      display: true,
                      labelString: '売上',
                      fontFamily: 'monospace'
                    },
                    ticks: {
                      beginAtZero: true,
                      maxTicksLimit: 8,
                      callback: function(value) {
                        return value + '千円';
                      }
                    }
                  }]
                },
                tooltips: {
                  enabled: true,
                  mode: 'single',
                  callbacks: {
                    title: function(tooltipItems, titleData) {
                      //var val = $("#slider").dateRangeSlider("values");
                      //var min2 = moment(val.min);
                      var stvalP = $("#calst").val();
                      var envalP = $("#calen").val();
                      var minP = moment(stvalP.substr(0, 4) + stvalP.substr(5, 2) + stvalP.substr(-3, 2));
                      var maxP = moment(envalP.substr(0, 4) + envalP.substr(5, 2) + envalP.substr(-3, 2));
                      var tmp = tooltipItems[0].xLabel.split("月");
                      var first = moment(minP.format("YYYY-") + tmp[0] + '-1', 'YYYY-M-D');
                      if (first.isBetween(minP, maxP, null, '[]')) {
                        if (tooltipItems[0].datasetIndex === 0) {
                          return minP.add(-1, 'years').format("YYYY年") + tmp[0] + '月';
                        }
                        return minP.format("YYYY年") + tmp[0] + '月';
                      }
                      if (tooltipItems[0].datasetIndex === 0) {
                        return minP.format("YYYY年") + tmp[0] + '月';
                      }
                      return minP.add(1, 'years').format("YYYY年") + tmp[0] + '月';
                    },
                    label: function(tooltipItems, data3) {
                      return tooltipItems.yLabel + '千円';
                    }
                  }
                }
              }
            });
          });
      });
  }

  function createUserGraph(susr) {
    var elevenMonthsBeforeU, tenMonthsBeforeU, nineMonthsBeforeU, eightMonthsBeforeU, sevenMonthsBeforeU, sixMonthsBeforeU,
      fiveMonthsBeforeU, fourMonthsBeforeU, threeMonthsBeforeU, twoMonthsBeforeU, oneMonthBeforeU, noMonthBeforeU;
    var maxMonthU = $("#calen").val().substr(0, 4) + $("#calen").val().substr(5, 2) + $("#calen").val().substr(-3, 2);
    var minMonthU = $("#calst").val().substr(0, 4) + $("#calst").val().substr(5, 2) + $("#calst").val().substr(-3, 2);
    var maxMonthU2 = '"' + moment(maxMonthU).add(-12, "months").endOf("month").format('YYYY-MM-DD') + '"';
    elevenMonthsBeforeU = moment(maxMonthU).add(-11, 'months').format("M月");
    tenMonthsBeforeU = moment(maxMonthU).add(-10, 'months').format("M月");
    nineMonthsBeforeU = moment(maxMonthU).add(-9, 'months').format("M月");
    eightMonthsBeforeU = moment(maxMonthU).add(-8, 'months').format("M月");
    sevenMonthsBeforeU = moment(maxMonthU).add(-7, 'months').format("M月");
    sixMonthsBeforeU = moment(maxMonthU).add(-6, 'months').format("M月");
    fiveMonthsBeforeU = moment(maxMonthU).add(-5, 'months').format("M月");
    fourMonthsBeforeU = moment(maxMonthU).add(-4, 'months').format("M月");
    threeMonthsBeforeU = moment(maxMonthU).add(-3, 'months').format("M月");
    twoMonthsBeforeU = moment(maxMonthU).add(-2, 'months').format("M月");
    oneMonthBeforeU = moment(maxMonthU).add(-1, 'months').format("M月");
    noMonthBeforeU = moment(maxMonthU).format("M月");

    var minMonthU2 = '"' + moment(minMonthU).add(-12, "months").startOf("month").format('YYYY-MM-DD') + '"';
    maxMonthU = '"' + moment(maxMonthU).format('YYYY-MM-DD') + '"';
    minMonthU = '"' + moment(minMonthU).format('YYYY-MM-DD') + '"';
    var scod = susr.split(':')[1];
    fetchRecords(SALES_APPID, '契約期間終了 <= ' + maxMonthU + ' and 契約期間開始 >= ' + minMonthU + ' and 主担当 in ("' + scod + '") order by OMS顧客コード asc')
      .then(function(user1Canvas) {
        fetchRecords(SALES_APPID, '契約期間終了 <= ' + maxMonthU2 + ' and 契約期間開始 >= ' + minMonthU2 + ' and 主担当 in ("' + scod + '") order by OMS顧客コード asc')
          .then(function(user1Canvas2) {
            var data = [];
            data[elevenMonthsBeforeU] = 0;
            data[tenMonthsBeforeU] = 0;
            data[nineMonthsBeforeU] = 0;
            data[eightMonthsBeforeU] = 0;
            data[sevenMonthsBeforeU] = 0;
            data[sixMonthsBeforeU] = 0;
            data[fiveMonthsBeforeU] = 0;
            data[fourMonthsBeforeU] = 0;
            data[threeMonthsBeforeU] = 0;
            data[twoMonthsBeforeU] = 0;
            data[oneMonthBeforeU] = 0;
            data[noMonthBeforeU] = 0;

            // 実績＋予測値データ
            for (var ii = 0; ii < user1Canvas.length; ii++) {
              var monthU;
              var tableRecordsU = user1Canvas[ii].売上管理表.value;
              for (var jj = 0; jj < tableRecordsU.length; jj++) {
                var dateU = tableRecordsU[jj].value['売上月'].value.split("-");
                if (dateU[1].charAt(0) === "0") {
                  monthU = dateU[1].charAt(1) + "月";
                } else {
                  monthU = dateU[1] + "月";
                }
                if (moment(tableRecordsU[jj].value['売上月'].value).isSameOrBefore(moment())) {
                  data[monthU] += parseInt(tableRecordsU[jj].value['実績請求額'].value, 10);
                } else {
                  data[monthU] += parseInt(tableRecordsU[jj].value['予測額'].value, 10);
                }
              }
            }
            var userThisYearData = [data[elevenMonthsBeforeU], data[tenMonthsBeforeU], data[nineMonthsBeforeU],
              data[eightMonthsBeforeU], data[sevenMonthsBeforeU], data[sixMonthsBeforeU], data[fiveMonthsBeforeU],
              data[fourMonthsBeforeU], data[threeMonthsBeforeU], data[twoMonthsBeforeU], data[oneMonthBeforeU],
              data[noMonthBeforeU]
            ];
            data = refreshData(data);

            // 計画値データ
            for (var kk = 0; kk < user1Canvas.length; kk++) {
              var monthU2;
              var tableRecordsU2 = user1Canvas[kk].売上管理表.value;
              for (var ll = 0; ll < tableRecordsU2.length; ll++) {
                var dateU2 = tableRecordsU2[ll].value['売上月'].value.split("-");
                if (dateU2[1].charAt(0) === "0") {
                  monthU2 = dateU2[1].charAt(1) + "月";
                } else {
                  monthU2 = dateU2[1] + "月";
                }
                data[monthU2] += parseInt(tableRecordsU2[ll].value['計画額'].value, 10);
              }
            }
            var userPlanThisYearData = [data[elevenMonthsBeforeU], data[tenMonthsBeforeU], data[nineMonthsBeforeU],
              data[eightMonthsBeforeU], data[sevenMonthsBeforeU], data[sixMonthsBeforeU], data[fiveMonthsBeforeU],
              data[fourMonthsBeforeU], data[threeMonthsBeforeU], data[twoMonthsBeforeU], data[oneMonthBeforeU],
              data[noMonthBeforeU]
            ];
            data = refreshData(data);

            // 前年同月比グラフのデータ作成
            for (var mm = 0; mm < user1Canvas2.length; mm++) {
              var monthU3;
              var tableRecordsU3 = user1Canvas2[mm].売上管理表.value;
              for (var nn = 0; nn < tableRecordsU3.length; nn++) {
                var dateU3 = tableRecordsU3[nn].value['売上月'].value.split("-");
                if (dateU3[1].charAt(0) === "0") {
                  monthU3 = dateU3[1].charAt(1) + "月";
                } else {
                  monthU3 = dateU3[1] + "月";
                }
                data[monthU3] += parseInt(tableRecordsU3[nn].value['実績請求額'].value, 10);
              }
            }
            var userLastYearData = [data[elevenMonthsBeforeU], data[tenMonthsBeforeU], data[nineMonthsBeforeU],
              data[eightMonthsBeforeU], data[sevenMonthsBeforeU], data[sixMonthsBeforeU], data[fiveMonthsBeforeU],
              data[fourMonthsBeforeU], data[threeMonthsBeforeU], data[twoMonthsBeforeU], data[oneMonthBeforeU],
              data[noMonthBeforeU]
            ];
            data = refreshData(data);

            // 前年同月比グラフを描画
            var ctx9 = document.getElementById("canvas9");
            if (chart9) {
              chart9.destroy();
            }
            chart9 = new Chart(ctx9, {
              type: 'bar',
              data: {
                labels: [elevenMonthsBeforeU, tenMonthsBeforeU, nineMonthsBeforeU, eightMonthsBeforeU,
                  sevenMonthsBeforeU, sixMonthsBeforeU, fiveMonthsBeforeU, fourMonthsBeforeU,
                  threeMonthsBeforeU, twoMonthsBeforeU, oneMonthBeforeU, noMonthBeforeU
                ],
                datasets: [{
                    label: '前年同月売上',
                    data: userLastYearData,
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                  },
                  {
                    label: '本年度売上目標',
                    data: userPlanThisYearData,
                    backgroundColor: "rgba(41, 197, 123, 0.2)",
                    borderColor: 'rgba(41, 197, 123, 1)',
                    borderWidth: 1
                  },
                  {
                    label: minMonthU ? moment(minMonthU).format('YYYY年M月～') + moment(maxMonthU).format('YYYY年M月売上＋予測') : moment(minMonthU2).format('YYYY年M月～') + moment(maxMonthU2).format('YYYY年M月売上＋予測'),
                    data: userThisYearData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1
                  }
                ]
              },
              options: {
                scales: {
                  yAxes: [{
                    position: "left",
                    id: "y-axis-0",
                    display: true,
                    scaleLabel: {
                      display: true,
                      labelString: '売上',
                      fontFamily: 'monospace'
                    },
                    ticks: {
                      beginAtZero: true,
                      maxTicksLimit: 8,
                      callback: function(value) {
                        return value + '千円';
                      }
                    }
                  }]
                },
                tooltips: {
                  enabled: true,
                  mode: 'single',
                  callbacks: {
                    title: function(tooltipItems, titleData) {
                      //var val = $("#slider").dateRangeSlider("values");
                      //var min2 = moment(val.min);
                      var stvalU = $("#calst").val();
                      var envalU = $("#calen").val();
                      var minU = moment(stvalU.substr(0, 4) + stvalU.substr(5, 2) + stvalU.substr(-3, 2));
                      var maxU = moment(envalU.substr(0, 4) + envalU.substr(5, 2) + envalU.substr(-3, 2));
                      var tmp = tooltipItems[0].xLabel.split("月");
                      var first = moment(minU.format("YYYY-") + tmp[0] + '-1', 'YYYY-M-D');
                      if (first.isBetween(minU, maxU, null, '[]')) {
                        if (tooltipItems[0].datasetIndex === 0) {
                          return minU.add(-1, 'years').format("YYYY年") + tmp[0] + '月';
                        }
                        return minU.format("YYYY年") + tmp[0] + '月';
                      }
                      if (tooltipItems[0].datasetIndex === 0) {
                        return minU.format("YYYY年") + tmp[0] + '月';
                      }
                      return minU.add(1, 'years').format("YYYY年") + tmp[0] + '月';
                    },
                    label: function(tooltipItems, data3) {
                      return tooltipItems.yLabel + '千円';
                    }
                  }
                }
              }
            });
          });
      });
  }

  function reset() {
    // スライダーの初期位置
    $("#slider").dateRangeSlider("values", moment().add(-1, 'years')
      .startOf("month").toDate(), moment().startOf("month").toDate());
    // スライダーの位置を微調整
    $("#slider").css("margin-bottom", "20px");
  }

  function createSlider() {
    // 決算開始日
    $("#calst").datepicker({
      changeMonth: true,
      changeYear: true,
      showOtherMonths: true,
      closeText: "閉じる",
      prevText: "&#x3C;前",
      nextText: "次&#x3E;",
      currentText: "今日",
      monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      monthNamesShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      dayNames: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
      dayNamesShort: ["日", "月", "火", "水", "木", "金", "土"],
      dayNamesMin: ["日", "月", "火", "水", "木", "金", "土"],
      weekHeader: "週",
      dateFormat: "yy年mm月dd日",
      firstDay: 0,
      isRTL: !1,
      showMonthAfterYear: !0,
      yearSuffix: "年",
      onSelect: function(dateText) {
        var mincalst = dateText.substr(0, 4) + dateText.substr(5, 2) + dateText.substr(-3, 2);
        var maxcalst = moment(mincalst).add(11, 'months').endOf('month').format("YYYY月MM月DD日");
        $("#calen").val(maxcalst);
      }
    });
    // 決算期変更ボタン
    $("#calBt").on({
      'click': function() {
        var stval = $("#calst").val();
        var enval = $("#calen").val();
        var mincal = stval.substr(0, 4) + stval.substr(5, 2) + stval.substr(-3, 2);
        var maxcal = enval.substr(0, 4) + enval.substr(5, 2) + enval.substr(-3, 2);
        createCompareGraph(mincal, maxcal);
      }
    });
    // 案件タイプ別売上高リスト変更
    $("#prodSelect").change(function() {
      createProdGraph($(this).val());
    });
    // 担当者別売上高リスト変更
    $("#userSelect").change(function() {
      createUserGraph($(this).val());
    });

    oneTimeFlg = false;
  }

  // 【参考】ドーナツグラフの各製品色をランダムに決定する関数
  function dynamicColors() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  /* 【参考】ドーナツグラフの各項目を常に表示
    Chart.pluginService.register({
        beforeRender: function (chart) {
            if (chart.config.options.showAllTooltips) {
                chart.pluginTooltips = [];
                chart.config.data.datasets.forEach(function (dataset, i) {
                    chart.getDatasetMeta(i).data.forEach(function (sector, j) {
                        chart.pluginTooltips.push(new Chart.Tooltip({
                            _chart: chart.chart,
                            _chartInstance: chart,
                            _data: chart.data,
                            _options: chart.options.tooltips,
                            _active: [sector]
                        }, chart));
                    });
                });
                chart.options.tooltips.enabled = false;
            }
        },
        afterDraw: function (chart, easing) {
            if (chart.config.options.showAllTooltips) {
                if (!chart.allTooltipsOnce) {
                    if (easing !== 1)
                        return;
                    chart.allTooltipsOnce = true;
                }
                chart.options.tooltips.enabled = true;
                Chart.helpers.each(chart.pluginTooltips, function (tooltip) {
                    tooltip.initialize();
                    tooltip.update();
                    tooltip.pivot();
                    tooltip.transition(easing).draw();
                });
                chart.options.tooltips.enabled = false;
            }
        }
    });*/

  kintone.events.on('mobile.app.record.index.show', function(event) {
    if (event.viewName === "モバイルダッシュボード") {
      createCompareGraph();
    }
    return event;
  });

})();
