(function() {
  'use strict';

  const events = [
    // レコード追加画面または再利用画面で指定フィールドの値が変更されたとき、フォームの値を書き換えた時
    'app.record.create.change.Number',
    // レコード編集画面で、指定のフィールドの値が変更されたとき、フォームの値を書き換えた時
    'app.record.edit.change.Number',
  ];

  var sortTable = function(table, orderBy, isDesc) {
    table.sort(compareFunc);

    console.log(table);
    return table;
  };

  function compareFunc(a, b) {
    var v1 = parseFloat(a.value[orderBy].value);
    var v2 = parseFloat(b.value[orderBy].value);
    var pos = isDesc ? -1 : 1;
    if (v1 > v2) {
      return pos;
    }
    if (v1 < v2) {
      return pos * -1;
    }
  }

  kintone.events.on(events, function(event) {
    // ルックアップフィールドのフィールドコードを指定して、参照先のアプリIDを取得
    const targetAppId = kintone.app.getLookupTargetAppId('顧客名');
    const targetRecordId = event.record['Number'].value;
    // ルックアップクリアをしたらテーブルを空にする
    if (!targetRecordId) {
      event.record['月額報酬額テーブル'].value = [];
      return event;
    }

    const body = {
      app: targetAppId,
      id: targetRecordId
    };

    kintone.api(kintone.api.url('/k/v1/record', true), 'GET', body, function(resp) {
      // ルックアップ先のテーブル情報を取得
      var respRecords = resp.record['月額報酬額テーブル'].value;
      // 追加先のテーブル情報を取得
      var eventRecords = event.record['月額報酬額テーブル'].value;
      // 挿入するサブテーブルの数をカウントするための変数
      var subTableCount = 0;
      // 月額報酬額テーブルを適用開始日でソート
      sortTable(eventRecords, '適用開始日', true);
      // ルックアップ先のサブテーブルのサイズ分ループ
      for (var i = 0; i < respRecords.length; i++) {
        // 本日の日付・サブテーブルの運用開始・終了期間の日付をmomentオブジェクトとして取得
        var today = moment(new Date())
        var startDay = moment(respRecords[i].value['適用開始日'].value);
        startDay.subtract(1, "days");
        // var finishDay = moment(respRecords[i].value['適用終了日'].value);
        // finishDay.add(1, "days");
        // 本日が運用開始と終了期間の間であればサブテーブルを挿入
        // momentオブジェクトを使用して比較
        /*
                この条件を変えることで取得したレコードを指定できる
                */
        // if (startDay.isBefore(today) && finishDay.isAfter(today)) {
        if (startDay.isAfter(today)) {
          // 初めての挿入の場合は、初期サブテーブルに上書き
          if (subTableCount === 0) {
            eventRecords[0] = respRecords[i];
          }
          // 2回目以降の挿入は新たにサブテーブルを作成して挿入
          else {
            eventRecords.push(respRecords[i]);
          }
          subTableCount++;
        } else if (startDay.isBefore(today)) {
          // 初めての挿入の場合は、初期サブテーブルに上書き
          if (subTableCount === 0) {
            eventRecords[0] = respRecords[i];
          }
          // 2回目以降の挿入は新たにサブテーブルを作成して挿入
          else {
            eventRecords.push(respRecords[i]);
          }
          subTableCount++;
        }
      }

      // サブテーブルを編集不可にする場合
      event.record['月額報酬額テーブル'].value.forEach(function(obj) {
        Object.keys(obj.value).forEach(function(params) {
          obj.value[params].disabled = true;
        });
      });

      kintone.app.record.set(event);
    }, function(err) {
      window.alert('REST APIでエラーが発生しました');
    });
  });
})();
