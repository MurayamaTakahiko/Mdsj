jQuery.noConflict();
(function($) {
  "use strict";

  const SUBMIT_EVETS = [
    "app.record.create.submit",
    "app.record.edit.submit"
  ];

  /**
   * 顧客カルテアプリのレコード更新／レコード追加
   * @param distinctWorks
   * @param respRecords
   */
  const makeUpsertRecordsParam = function(distinctWorks, respRecord) {
    const upsertRecords = $.extend(true, [], respRecord['Table_0']['value']);
    const insertRecords = [];
    // 日報の業務テーブル1行毎
    distinctWorks['作業'].forEach(function(work) {
      if (work['顧客コード'] !== respRecord['顧客コード']['value']) {
        // 顧客が異なる場合、スキップ
        return;
      }

      // 顧客カルテの訪問履歴テーブル1行毎
      var historyExists = false;
      upsertRecords.forEach(function(visitHistory) {
        // 同日付、同担当者の場合、その行を更新対象とする。（顧客カルテ側のフィールドに合わせて名称での比較）
        if ((distinctWorks['日付'] === visitHistory['value']['日付']['value'] &&
            distinctWorks['担当者名'] === visitHistory['value']['ルックアップ_報告者']['value'] &&
            work['報告区分'] === visitHistory['value']['報告区分']['value'])
          // 日付、担当者が空の場合も、その行を更新対象とする。
          ||
          ((!visitHistory['value']['報告区分']['value'] && !visitHistory['value']['日付']['value'] && !visitHistory['value']['ルックアップ_報告者']['value']))) {
          console.log('同じ顧客、同じ日付、同じ担当者');
          visitHistory['value']['日付']['value'] = distinctWorks['日付'];
          visitHistory['value']['報告区分']['value'] = work['報告区分'];
          visitHistory['value']['ルックアップ_報告者']['value'] = distinctWorks['担当者名'];
          visitHistory['value']['報告内容']['value'] = work['内容'];
          historyExists = true;
        }
      });

      // 同日付、同担当者の行が存在しなければ追加
      if (!historyExists) {
        insertRecords.push({
          'value': {
            '日付': {
              'type': 'SINGLE_LINE_TEXT',
              'value': distinctWorks['日付']
            },
            // 区分
            '報告区分': {
              'type': 'DROP_DOWN',
              'value': work['報告区分']
            },
            // 報告者（担当者）
            'ルックアップ_報告者': {
              'type': 'SINGLE_LINE_TEXT',
              'value': distinctWorks['担当者名']
            },
            // 内容
            '報告内容': {
              'type': 'MULTI_LINE_TEXT',
              'value': work['内容']
            },
          }
        });
      }
    });
    Array.prototype.push.apply(upsertRecords, insertRecords);
    console.log(upsertRecords);

    const param = {
      id: respRecord['$id']['value'],
      record: {
        'Table_0': {
          'value': upsertRecords
        }
      }
    };
    return param;
  };

  kintone.events.on(SUBMIT_EVETS, function(e) {
    const currentRecord = e.record;
    const customers = [];
    const distinctWorks = {
      '日付': currentRecord['日付']['value'],
      '担当者名': currentRecord['担当者名']['value'],
      '作業': []
    };
    currentRecord['Table']['value'].forEach(function(work) {
      const customerCode = work['value']['顧客コード']['value'];
      const division = (work['value']['報告区分']['value'] === undefined ? null : work['value']['報告区分']['value']);
      let report = (work['value']['顧客カルテに登録']['value'] === undefined ? "" : work['value']['顧客カルテに登録']['value']);

      // 顧客コード、報告内容が選択されていない場合、スキップ
      if (!customerCode || !report) {
        return;
      }

      customers.push('"' + customerCode + '"');
      let workExists = false;
      distinctWorks['作業'].forEach(function(distinctWork) {
        if (distinctWork['顧客コード'] === customerCode &&
          distinctWork['報告区分'] === division) {
          // 内容を既に保存している場合、改行コードを付与
          if (report) {
            report = "\n" + report;
          }
          distinctWork['内容'] += report;
          workExists = true;
        }
      });
      if (!workExists) {
        distinctWorks['作業'].push({
          '顧客コード': customerCode,
          '報告区分': division,
          '内容': report
        })
      }
    });

    // 更新対象顧客が設定されていない場合、終了
    if (customers.length === 0) {
      return e;
    }

    const param = {
      app: emxasConf.getConfig("APP_CUSTOMER"),
      query: '顧客コード in (' + customers.join(',') + ')',
      isGuest: true
    };

    return kintoneUtility.rest.getAllRecordsByQuery(param).then(function(resp) {
        const respRecords = resp.records;
        const upsertRecords = [];
        respRecords.forEach(function(respRecord) {
          upsertRecords.push(makeUpsertRecordsParam(distinctWorks, respRecord));
        });
        const upsertParam = {
          app: emxasConf.getConfig("APP_CUSTOMER"),
          records: upsertRecords
        };
        return kintoneUtility.rest.putAllRecords(upsertParam);
      })
      .then(function(resp) {
        return e;
      })
      .catch(function(error) {
        console.log(error);
        return e;
      });
  });
})(jQuery);
