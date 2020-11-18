jQuery.noConflict();
(function($) {

    var oneTimeFlg = true;

    "use strict";
    // 計画工数アプリを全レコード取得（担当者でのフィルターはkintone側で）
    function fetchRecords(appId, usr, opt_offset, opt_limit, opt_records) {
        var app_plan = emxasConf.getConfig('APP_PLAN_WORK');    //計画工数アプリID
        var usr = usr || '';
        var offset = opt_offset || 0;
        var limit = opt_limit || 100;
        var allRecords = opt_records || [];
        if (!usr || usr === "--") {
          var params = {app: app_plan, query: 'order by 対象月初日 desc limit ' + limit + ' offset ' + offset};
        } else {
          var params = {app: app_plan, query: '検索用担当者 = "' + usr + '" order by 対象月初日 desc limit ' + limit + ' offset ' + offset};
        }
        return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then(function(resp) {
            allRecords = allRecords.concat(resp.records);
            if (resp.records.length === limit) {
                return fetchRecords(appId, usr, offset + limit, limit, allRecords);
            }
            return allRecords;
        });
    }
    //予実管理データのカスタマイズビュー用データの作成
    function makeYojitsuData(records, opt_data, opt_i, user_list) {
        var i = opt_i || 0; //レコードのカウント
        var allData = opt_data || []; //予実の集計結果
        var userLabels = user_list || []; //担当者リスト
        var appId = emxasConf.getConfig('APP_DAILY_REPORT');   //日報アプリID
        var key1, key2, key3, key4, key5, key6;
        key1 = records[i]['検索用担当者']['value'];
        key1 = key1.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // 担当者リストの作成
        if (userLabels.indexOf(key1) < 0) {
          userLabels.push(key1);
        }
        let key2List = [];
        let dataList = records[i]['Table']['value'];
        for (var x = 0; x < dataList.length; x++) {
          if (!key2List[dataList[x]['value']['顧客コード']['value']]) {
            key2List[dataList[x]['value']['顧客コード']['value']] = 0;
          }
        }
        for (var y = 0; y < dataList.length; y++) {
          key2List[dataList[y]['value']['顧客コード']['value']] += parseFloat(dataList[y]['value']['投下時間']['value']);
        }
        key3 = records[i]['対象月初日']['value'];
        var key3Start = moment(key3).date(1);
        var key3End = moment(key3).date(moment(key3).daysInMonth());
        key3Start = key3Start.format('YYYY-MM-DD');
        key3End = key3End.format('YYYY-MM-DD');
        var params = {'app': appId, 'query': '担当者名 = "' + key1 + '" and 日付 >= "' + key3Start + '" and 日付 <= "' + key3End + '"'};

        return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then(function(resp) {
            if (resp.records) {
              let key4List = [];
              let thcodeList = [];
              let thnameList = [];
              for (var x = 0; x < resp.records.length; x++) {
                // 1日分の日報データ
                dataList = resp.records[x]['Table']['value'];
                for (var y = 0; y < dataList.length; y++) {
                  // ３コード・顧客の重複排除
                  if (thcodeList.indexOf(dataList[y]['value']['顧客コード']['value']) < 0) {
                    thcodeList.push(dataList[y]['value']['顧客コード']['value']);
                    thnameList.push(dataList[y]['value']['顧客名']['value']);
                  }
                  if (!key4List[dataList[y]['value']['顧客コード']['value']]) {
                    key4List[dataList[y]['value']['顧客コード']['value']] = 0;
                  }
                }
                // 特定担当者の特定月の３コード単位での工数実績を集計
                for (var y = 0; y < dataList.length; y++) {
                  key4List[dataList[y]['value']['顧客コード']['value']] += parseFloat(dataList[y]['value']['計算_作業時間']['value']);
                }
              }
              for (var j = 0; j < thcodeList.length; j++) {
                if (!key2List[thcodeList[j]]) {
                  key2List[thcodeList[j]] = 0;
                }
                key5 = key2List[thcodeList[j]] - key4List[thcodeList[j]];
                if (key2List[thcodeList[j]] === 0) {
                  key6 = "-";
                } else {
                  key6 = key4List[thcodeList[j]] / key2List[thcodeList[j]] * 100;
                  key6 = key6.toFixed(2);
                  key6 += "%";
                }
                allData.push({
                  segment: key1,
                  period: moment(key3).format('YYYY年MM月'),
                  customer: thnameList[j],
                  budget: key2List[thcodeList[j]],
                  results: key4List[thcodeList[j]],
                  Difference: key5,
                  AchievementRate: key6
                });
              }
            }else {
                event.error = '日報情報が取得できません。';
            }
            i = i + 1;
            if (records.length !== i) {
                return makeYojitsuData(records, allData, i, userLabels);
            }

            if (oneTimeFlg) {
              // 担当者別絞込みリスト
              $('#userSelect').find('option').remove();
              $('#userSelect').append($('<option></option>')
                          .attr('state', "--")
                          .val("--")
                          .text("--")
                        );
              for (var x = 0; x < userLabels.length; x++) {
                  $('#userSelect').append($('<option></option>')
                              .attr('state', userLabels[x])
                              .val(userLabels[x])
                              .text(userLabels[x])
                            );
              }
              // 担当者別絞込みリスト変更
              $("#userSelect").change(function() {
                 changeUserList($(this).val());
              });
              oneTimeFlg = false;
            }

            return allData;
        });
    }
    //差異のマイナス値を赤色に変更
    function cellDesign() {
        $('#view tr td').each(function(index, elm) {
            if ($(this).hasClass('Difference_class')) {
                if ($(this).text().indexOf("-") > -1) {
                    $(this).css('color', '#ff0000');
                }
            }
        });

    }
    //予実管理のカスタマイズビューを取得
    function dispYojitsuCustomizeView(records) {
        makeYojitsuData(records).then(function(data) {
            //列の設定
            var colModelSettings = [
                {name: "segment", index: "segment", width: 150, align: "left",
                classes: "segment_class"},
                {name: "period", index: "period", width: 150, align: "right",
                classes: "period_class"},
                {name: "customer", index: "customer", width: 250, align: "left",
                classes: "customer_class"},
                {name: "budget", index: "budget", width: 150, align: "right",
                classes: "budget_class", sorttype: "float"},
                {name: "results", index: "results", width: 150, align: "right",
                classes: "results_class", sorttype: "float"},
                {name: "Difference", index: "Difference", width: 150, align: "right",
                classes: "Difference_class", sorttype: "float"},
                {name: "AchievementRate", index: "AchievementRate", width: 150, align: "right",
                classes: "AchievementRate_class", sorttype: "float"}
            ];
            //列の表示名
            var colNames = ["担当者", "期間", "顧客名", "計画時間", "実績時間", "差異", "投下率"];
            $("#view").jqGrid({
                data: data,
                datatype: "local",
                colNames: colNames,
                colModel: colModelSettings,
                rowNum: 20,
                rowList: [20, 50, 100],
                caption: "工数予実管理",
                height: "auto",
                width: 1100,
                pager: 'pager',
                shrinkToFit: true,
                viewrecords: true,
                gridComplete: function() {
                    cellDesign();
                }
            });
        });
    }
    //担当者絞込み処理
    function changeUserList(usr) {
      $.jgrid.gridUnload("#view");
      var appId = emxasConf.getConfig('APP_DAILY_REPORT');  //日報アプリID
      fetchRecords(appId, usr).then(function(records) {
          dispYojitsuCustomizeView(records);
      });
    }
    //イベント処理
    kintone.events.on(['app.record.index.show'], function(event) {
      var appId = emxasConf.getConfig('APP_DAILY_REPORT');  //日報アプリID
        fetchRecords(appId).then(function(records) {
            dispYojitsuCustomizeView(records);
        });
    });

})(jQuery);
