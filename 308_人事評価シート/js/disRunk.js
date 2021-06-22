/*
 * 人事評価シートランク別表示制御プログラム
 * 20210622 MDSJ takahara
 */
(function() {
  'use strict';

  var events = [
    'app.record.detail.show',
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.create.change.等級',
    'app.record.edit.change.等級'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    var runk = event.record.等級.value;
    var jList = ["J", "S-1"];
    var sList = ["S-2", "Player", "Expert"];
    var mList = ["M-1", "M-2", "Professional", "Legend"];
    var jItemList = [
      "クレド１自己評価", "クレド１一次評価", "クレド１二次評価", "クレド１最終評価", "クレド１コメント",
      "クレド２自己評価", "クレド２一次評価", "クレド２二次評価", "クレド２最終評価", "クレド２コメント",
      "クレド３自己評価", "クレド３一次評価", "クレド３二次評価", "クレド３最終評価", "クレド３コメント",
      "クレド４自己評価", "クレド４一次評価", "クレド４二次評価", "クレド４最終評価", "クレド４コメント",
      "クレド５自己評価", "クレド５一次評価", "クレド５二次評価", "クレド５最終評価", "クレド５コメント",
    ];
    // ランクによって、表示項目を変更する
    for (var i = 0; i < jList.length; i++) {
      // J,S-1
      if (runk === jList[i]) {
        kintone.app.record.setFieldShown('クレド５自己評価', false);
        kintone.app.record.setFieldShown('クレド５一次評価', false);
        kintone.app.record.setFieldShown('クレド５二次評価', false);
        kintone.app.record.setFieldShown('クレド５最終評価', false);
        kintone.app.record.setFieldShown('クレド５コメント', false);
      }
    }
    return event;
  });
})();
