/*
 * 見積明細追加プログラム
 * 20200729 MDSJ takahara
 */
(function() {
  "use strict";
  kintone.events.on('app.record.edit.show', function(event) {
    var field_check = event.record.見積番号.value;
    //元アプリの引継ぎ対象フィールドでの入力を確認
    if (!field_check) {
      return;
    }
    var mySpaceFieldButton = kintone.app.record.getSpaceElement('newCtl');
    //ボタンを設置
    var $button = $('<button title="見積明細を作成する" class="kintoneplugin-button-normal">見積明細登録</button>');
    $button.click(function() {
      //関連レコードのアプリIDの取得
      var related = kintone.app.getRelatedRecordsTargetAppId('見積明細');
      //関連レコードの新規作成画面のURLへのジャンプ
      var new_window = window.open("/k/" + related + "/edit");
      new_window.addEventListener("load", function() {
        window.postMessage(new_window.kintone !== null, location.origin);
      });
      window.addEventListener("message", (function() {
        return function field_set() {
          //新規レコード側のフィールドを指定してsetする
          var new_app = new_window.kintone;
          var new_record = new_app.app.record.get();
          new_record.record.見積番号.value = field_check;
          //ここから新規で開いたkintone画面でルックアップ先の更新処理を行う
          new_record.record.見積番号.lookup = true;
          new_app.app.record.set(new_record);
          window.removeEventListener("message", field_set, false);
          // キャンセルボタン動作
          var cancel1 = new_window.document.getElementsByClassName('gaia-ui-actionmenu-cancel');
          cancel1[0].addEventListener('click', function() {
            new_window.close();
          }, false);
        };
      })(), false);
    });
    $(mySpaceFieldButton).append($button);
  });
})();
