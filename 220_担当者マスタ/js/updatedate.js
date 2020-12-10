//https://qiita.com/iNaoki04/items/3cf8655ad58f2c9a1308

(function() {
  "use strict";
  // レコード一覧画面の表示後イベント
  kintone.events.on('app.record.index.show', function(event) {
    // 増殖バグを防ぐ
    if (document.getElementById('my_index_button') !== null) {
      return;
    }

    // ボタン
    var myIndexButton = document.createElement('button');
    myIndexButton.id = 'my_index_button';
    myIndexButton.innerText = '年齢更新';

    //今日の日付を求める
    var date = new Date();
    var year = date.getFullYear();
    var month  = date.getMonth()+1;
    var day = date.getDate();
    var todayDate = year + "-" + month + "-" + day;

    // ボタンクリック時の処理
    myIndexButton.onclick = function() {
      var manager = new KintoneRecordManager;
      manager.getRecords(function(records) {
        // レコード取得後の処理
        console.log(records);

        // 取得したレコードを空更新する
        var body = {
          "app": manager.appId,
          "records": []
        }
        var record = {};
        var recordArr = [];
        for (var i = 0; i < records.length; i++) {
          record[i] = {
            "id": records[i]['レコード番号']['value'],
            "record": {
              '本日日付':{
                'value':todayDate
              }
            }
          }
          recordArr.push(record[i]);
        }
        // 100件ずつ更新
        var s = 0;
        var e = 0;
        while (s < recordArr.length) {
          e = s + 100;
          body.records = recordArr.slice(s, e);
          kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', body, function(resp) {
            // success
            console.log(resp);
          }, function(error) {
            // error
            console.log(error);
          });
          s = s + 100;
        }
      });

      // 再読み込み
      location.reload();
    };

    // メニューの右側の空白部分にボタンを設置
    kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
  });

  /**
  * kintoneと通信を行うクラス
  */
  var KintoneRecordManager = (function() {
    KintoneRecordManager.prototype.records = [];    // 取得したレコード
    KintoneRecordManager.prototype.appId = null;    // アプリID
    KintoneRecordManager.prototype.query = '';      // 検索クエリ
    KintoneRecordManager.prototype.limit = 100;     // 一回あたりの最大取得件数
    KintoneRecordManager.prototype.offset = 0;      // オフセット

    function KintoneRecordManager() {
      this.appId = kintone.app.getId();
      this.records = [];
    }

    // すべてのレコード取得する
    KintoneRecordManager.prototype.getRecords = function(callback) {
      kintone.api(
        kintone.api.url('/k/v1/records', true),
        'GET',
        {
          app: this.appId,
          query: this.query + (' limit ' + this.limit + ' offset ' + this.offset)
        },
        (function(_this) {
          return function(res) {
            var len;
            Array.prototype.push.apply(_this.records, res.records);
            len = res.records.length;
            _this.offset += len;
            if (len < _this.limit) { // まだレコードがあるか？
              _this.ready = true;
              if (callback !== null) {
                callback(_this.records); // レコード取得後のcallback
              }
            } else {
              _this.getRecords(callback); // 自分自身をコール
            }
          };
        })(this)
      );
    };
    return KintoneRecordManager;
  })();
})();
