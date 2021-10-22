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
    'app.record.edit.change.等級',
    'app.record.create.change.所属グループ',
    'app.record.edit.change.所属グループ'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    var runk = event.record.等級.value;
    var group = event.record.所属グループ.value;
    var jList = ["J", "S-1"];
    var sList = ["S-2", "Player", "Expert"];
    var mList = ["M-1", "M-2", "Professional", "Legend"];
    // 管理部は、クレド評価のみ
    console.log(group);
    if (group === "管理部") {
      kintone.app.record.setFieldShown('クレド５自己評価', true);
      kintone.app.record.setFieldShown('クレド５一次評価', true);
      kintone.app.record.setFieldShown('クレド５二次評価', true);
      kintone.app.record.setFieldShown('クレド５最終評価', true);
      kintone.app.record.setFieldShown('クレド５自己評価コメント', true);
      kintone.app.record.setFieldShown('クレド５一次評価コメント', true);
      // 能力評価
      kintone.app.record.setFieldShown('能力自己評価', false);
      kintone.app.record.setFieldShown('能力一次評価', false);
      kintone.app.record.setFieldShown('能力二次評価', false);
      kintone.app.record.setFieldShown('能力最終評価', false);
      kintone.app.record.setFieldShown('能力コメント', false);
      kintone.app.record.setFieldShown('能力加点', false);
      // kintone.app.record.setFieldShown('能力加点コメント', false);
      kintone.app.record.setFieldShown('職能要件書', false);
      kintone.app.record.setFieldShown('能力小計', false);
      // 行動評価
      kintone.app.record.setFieldShown('行動自己評価', false);
      kintone.app.record.setFieldShown('行動一次評価', false);
      kintone.app.record.setFieldShown('行動二次評価', false);
      kintone.app.record.setFieldShown('行動最終評価', false);
      // kintone.app.record.setFieldShown('行動コメント', false);
      kintone.app.record.setFieldShown('目標管理シート', false);
      kintone.app.record.setFieldShown('行動小計', false);
      // 成果評価
      kintone.app.record.setFieldShown('成果基準', false);
      kintone.app.record.setFieldShown('成果実績', false);
      kintone.app.record.setFieldShown('成果加点要素', false);
      kintone.app.record.setFieldShown('成果最終評価', false);
      kintone.app.record.setFieldShown('成果個人前々期', false);
      kintone.app.record.setFieldShown('成果個人前期', false);
      kintone.app.record.setFieldShown('成果個人今期', false);
      kintone.app.record.setFieldShown('成果個人平均', false);
      kintone.app.record.setFieldShown('目標課前々期', false);
      kintone.app.record.setFieldShown('目標課前期', false);
      kintone.app.record.setFieldShown('目標課今期', false);
      kintone.app.record.setFieldShown('目標課平均', false);
      kintone.app.record.setFieldShown('実績課前々期', false);
      kintone.app.record.setFieldShown('実績課前期', false);
      kintone.app.record.setFieldShown('実績課今期', false);
      kintone.app.record.setFieldShown('実績課平均', false);
      kintone.app.record.setFieldShown('目標チーム前々期', false);
      kintone.app.record.setFieldShown('目標チーム前期', false);
      kintone.app.record.setFieldShown('目標チーム今期', false);
      kintone.app.record.setFieldShown('目標チーム平均', false);
      kintone.app.record.setFieldShown('実績チーム前々期', false);
      kintone.app.record.setFieldShown('実績チーム前期', false);
      kintone.app.record.setFieldShown('実績チーム今期', false);
      kintone.app.record.setFieldShown('実績チーム平均', false);
      kintone.app.record.setFieldShown('成果振り返り', false);
      kintone.app.record.setFieldShown('成果翌期目標', false);
      kintone.app.record.setFieldShown('成果評価者コメント', false);
      kintone.app.record.setFieldShown('当期実績年棒', false);
      kintone.app.record.setFieldShown('来期希望年棒', false);
      kintone.app.record.setFieldShown('来期決定年棒', false);
      // 総括
      kintone.app.record.setFieldShown('合計', false);
      kintone.app.record.setFieldShown('評価ランク', false);
      kintone.app.record.setFieldShown('振り返り', true);
      kintone.app.record.setFieldShown('１次評価者コメント', true);
    } else {
      console.log(group);
      // ランクによって、表示項目を変更する
      // J,S-1
      for (var i = 0; i < jList.length; i++) {
        if (runk === jList[i]) {
          // クレド評価
          kintone.app.record.setFieldShown('クレド５自己評価', false);
          kintone.app.record.setFieldShown('クレド５一次評価', false);
          kintone.app.record.setFieldShown('クレド５二次評価', false);
          kintone.app.record.setFieldShown('クレド５最終評価', false);
          kintone.app.record.setFieldShown('クレド５自己評価コメント', false);
          kintone.app.record.setFieldShown('クレド５一次評価コメント', false);
          // 能力評価
          kintone.app.record.setFieldShown('能力自己評価', true);
          kintone.app.record.setFieldShown('能力一次評価', true);
          kintone.app.record.setFieldShown('能力二次評価', true);
          kintone.app.record.setFieldShown('能力最終評価', true);
          kintone.app.record.setFieldShown('能力コメント', true);
          kintone.app.record.setFieldShown('能力加点', true);
          // kintone.app.record.setFieldShown('能力加点コメント', true);
          kintone.app.record.setFieldShown('職能要件書', true);
          kintone.app.record.setFieldShown('能力小計', true);
          // 行動評価
          kintone.app.record.setFieldShown('行動自己評価', true);
          kintone.app.record.setFieldShown('行動一次評価', true);
          kintone.app.record.setFieldShown('行動二次評価', true);
          kintone.app.record.setFieldShown('行動最終評価', true);
          // kintone.app.record.setFieldShown('行動コメント', true);
          kintone.app.record.setFieldShown('目標管理シート', true);
          kintone.app.record.setFieldShown('行動小計', true);
          // 成果評価
          kintone.app.record.setFieldShown('成果基準', false);
          kintone.app.record.setFieldShown('成果実績', false);
          kintone.app.record.setFieldShown('成果加点要素', false);
          kintone.app.record.setFieldShown('成果最終評価', false);
          kintone.app.record.setFieldShown('成果個人前々期', false);
          kintone.app.record.setFieldShown('成果個人前期', false);
          kintone.app.record.setFieldShown('成果個人今期', false);
          kintone.app.record.setFieldShown('成果個人平均', false);
          kintone.app.record.setFieldShown('目標課前々期', false);
          kintone.app.record.setFieldShown('目標課前期', false);
          kintone.app.record.setFieldShown('目標課今期', false);
          kintone.app.record.setFieldShown('目標課平均', false);
          kintone.app.record.setFieldShown('実績課前々期', false);
          kintone.app.record.setFieldShown('実績課前期', false);
          kintone.app.record.setFieldShown('実績課今期', false);
          kintone.app.record.setFieldShown('実績課平均', false);
          kintone.app.record.setFieldShown('目標チーム前々期', false);
          kintone.app.record.setFieldShown('目標チーム前期', false);
          kintone.app.record.setFieldShown('目標チーム今期', false);
          kintone.app.record.setFieldShown('目標チーム平均', false);
          kintone.app.record.setFieldShown('実績チーム前々期', false);
          kintone.app.record.setFieldShown('実績チーム前期', false);
          kintone.app.record.setFieldShown('実績チーム今期', false);
          kintone.app.record.setFieldShown('実績チーム平均', false);
          kintone.app.record.setFieldShown('成果振り返り', false);
          kintone.app.record.setFieldShown('成果翌期目標', false);
          kintone.app.record.setFieldShown('成果評価者コメント', false);
          kintone.app.record.setFieldShown('当期実績年棒', false);
          kintone.app.record.setFieldShown('来期希望年棒', false);
          kintone.app.record.setFieldShown('来期決定年棒', false);
          // 総括
          kintone.app.record.setFieldShown('合計', true);
          kintone.app.record.setFieldShown('評価ランク', true);
          kintone.app.record.setFieldShown('振り返り', true);
          kintone.app.record.setFieldShown('１次評価者コメント', true);
          break;
        }
      }
      // S-2相当
      for (var i = 0; i < sList.length; i++) {
        if (runk === sList[i]) {
          // クレド評価
          kintone.app.record.setFieldShown('クレド５自己評価', true);
          kintone.app.record.setFieldShown('クレド５一次評価', true);
          kintone.app.record.setFieldShown('クレド５二次評価', true);
          kintone.app.record.setFieldShown('クレド５最終評価', true);
          kintone.app.record.setFieldShown('クレド５自己評価コメント', true);
          kintone.app.record.setFieldShown('クレド５一次評価コメント', true);
          // 能力評価
          kintone.app.record.setFieldShown('能力自己評価', true);
          kintone.app.record.setFieldShown('能力一次評価', true);
          kintone.app.record.setFieldShown('能力二次評価', true);
          kintone.app.record.setFieldShown('能力最終評価', true);
          kintone.app.record.setFieldShown('能力コメント', true);
          kintone.app.record.setFieldShown('能力加点', true);
          // kintone.app.record.setFieldShown('能力加点コメント', true);
          kintone.app.record.setFieldShown('職能要件書', true);
          kintone.app.record.setFieldShown('能力小計', true);
          // 行動評価
          kintone.app.record.setFieldShown('行動自己評価', false);
          kintone.app.record.setFieldShown('行動一次評価', false);
          kintone.app.record.setFieldShown('行動二次評価', false);
          kintone.app.record.setFieldShown('行動最終評価', false);
          // kintone.app.record.setFieldShown('行動コメント', false);
          kintone.app.record.setFieldShown('目標管理シート', false);
          kintone.app.record.setFieldShown('行動小計', false);
          // 成果評価
          kintone.app.record.setFieldShown('成果基準', true);
          kintone.app.record.setFieldShown('成果実績', true);
          kintone.app.record.setFieldShown('成果加点要素', true);
          kintone.app.record.setFieldShown('成果最終評価', true);
          kintone.app.record.setFieldShown('成果個人前々期', false);
          kintone.app.record.setFieldShown('成果個人前期', false);
          kintone.app.record.setFieldShown('成果個人今期', false);
          kintone.app.record.setFieldShown('成果個人平均', false);
          kintone.app.record.setFieldShown('目標課前々期', false);
          kintone.app.record.setFieldShown('目標課前期', false);
          kintone.app.record.setFieldShown('目標課今期', false);
          kintone.app.record.setFieldShown('目標課平均', false);
          kintone.app.record.setFieldShown('実績課前々期', false);
          kintone.app.record.setFieldShown('実績課前期', false);
          kintone.app.record.setFieldShown('実績課今期', false);
          kintone.app.record.setFieldShown('実績課平均', false);
          kintone.app.record.setFieldShown('目標チーム前々期', false);
          kintone.app.record.setFieldShown('目標チーム前期', false);
          kintone.app.record.setFieldShown('目標チーム今期', false);
          kintone.app.record.setFieldShown('目標チーム平均', false);
          kintone.app.record.setFieldShown('実績チーム前々期', false);
          kintone.app.record.setFieldShown('実績チーム前期', false);
          kintone.app.record.setFieldShown('実績チーム今期', false);
          kintone.app.record.setFieldShown('実績チーム平均', false);
          kintone.app.record.setFieldShown('成果振り返り', false);
          kintone.app.record.setFieldShown('成果翌期目標', false);
          kintone.app.record.setFieldShown('成果評価者コメント', false);
          kintone.app.record.setFieldShown('当期実績年棒', false);
          kintone.app.record.setFieldShown('来期希望年棒', false);
          kintone.app.record.setFieldShown('来期決定年棒', false);
          // 総括
          kintone.app.record.setFieldShown('合計', true);
          kintone.app.record.setFieldShown('評価ランク', true);
          kintone.app.record.setFieldShown('振り返り', true);
          kintone.app.record.setFieldShown('１次評価者コメント', true);
          break;
        }
      }
      // M以上
      for (var i = 0; i < mList.length; i++) {
        if (runk === mList[i]) {
          // クレド評価
          kintone.app.record.setFieldShown('クレド５自己評価', true);
          kintone.app.record.setFieldShown('クレド５一次評価', true);
          kintone.app.record.setFieldShown('クレド５二次評価', true);
          kintone.app.record.setFieldShown('クレド５最終評価', true);
          kintone.app.record.setFieldShown('クレド５自己評価コメント', true);
          kintone.app.record.setFieldShown('クレド５一次評価コメント', true);
          // 能力評価
          kintone.app.record.setFieldShown('能力自己評価', false);
          kintone.app.record.setFieldShown('能力一次評価', false);
          kintone.app.record.setFieldShown('能力二次評価', false);
          kintone.app.record.setFieldShown('能力最終評価', false);
          kintone.app.record.setFieldShown('能力コメント', false);
          kintone.app.record.setFieldShown('能力加点', false);
          // kintone.app.record.setFieldShown('能力加点コメント', false);
          kintone.app.record.setFieldShown('職能要件書', false);
          kintone.app.record.setFieldShown('能力小計', false);
          // 行動評価
          kintone.app.record.setFieldShown('行動自己評価', false);
          kintone.app.record.setFieldShown('行動一次評価', false);
          kintone.app.record.setFieldShown('行動二次評価', false);
          kintone.app.record.setFieldShown('行動最終評価', false);
          // kintone.app.record.setFieldShown('行動コメント', false);
          kintone.app.record.setFieldShown('目標管理シート', false);
          kintone.app.record.setFieldShown('行動小計', false);
          // 成果評価
          kintone.app.record.setFieldShown('成果基準', false);
          kintone.app.record.setFieldShown('成果実績', false);
          kintone.app.record.setFieldShown('成果加点要素', false);
          kintone.app.record.setFieldShown('成果最終評価', false);
          kintone.app.record.setFieldShown('成果個人前々期', true);
          kintone.app.record.setFieldShown('成果個人前期', true);
          kintone.app.record.setFieldShown('成果個人今期', true);
          kintone.app.record.setFieldShown('成果個人平均', true);
          kintone.app.record.setFieldShown('目標課前々期', true);
          kintone.app.record.setFieldShown('目標課前期', true);
          kintone.app.record.setFieldShown('目標課今期', true);
          kintone.app.record.setFieldShown('目標課平均', true);
          kintone.app.record.setFieldShown('実績課前々期', true);
          kintone.app.record.setFieldShown('実績課前期', true);
          kintone.app.record.setFieldShown('実績課今期', true);
          kintone.app.record.setFieldShown('実績課平均', true);
          kintone.app.record.setFieldShown('目標チーム前々期', true);
          kintone.app.record.setFieldShown('目標チーム前期', true);
          kintone.app.record.setFieldShown('目標チーム今期', true);
          kintone.app.record.setFieldShown('目標チーム平均', true);
          kintone.app.record.setFieldShown('実績チーム前々期', true);
          kintone.app.record.setFieldShown('実績チーム前期', true);
          kintone.app.record.setFieldShown('実績チーム今期', true);
          kintone.app.record.setFieldShown('実績チーム平均', true);
          kintone.app.record.setFieldShown('成果振り返り', true);
          kintone.app.record.setFieldShown('成果翌期目標', true);
          kintone.app.record.setFieldShown('成果評価者コメント', true);
          kintone.app.record.setFieldShown('当期実績年棒', true);
          kintone.app.record.setFieldShown('来期希望年棒', true);
          kintone.app.record.setFieldShown('来期決定年棒', true);
          // 総括
          kintone.app.record.setFieldShown('合計', false);
          kintone.app.record.setFieldShown('評価ランク', false);
          kintone.app.record.setFieldShown('振り返り', false);
          kintone.app.record.setFieldShown('１次評価者コメント', false);
          break;
        }
      }
    }
    return event;
  });

  var calevents = [
    'app.record.detail.show',
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.create.submit',
    'app.record.edit.submit',
    'app.record.create.change.クレド１最終評価',
    'app.record.create.change.クレド２最終評価',
    'app.record.create.change.クレド３最終評価',
    'app.record.create.change.クレド４最終評価',
    'app.record.create.change.クレド５最終評価',
    'app.record.create.change.能力最終評価',
    'app.record.create.change.能力加点',
    'app.record.create.change.行動最終評価',
    'app.record.create.change.成果最終評価',
    'app.record.edit.change.クレド１最終評価',
    'app.record.edit.change.クレド２最終評価',
    'app.record.edit.change.クレド３最終評価',
    'app.record.edit.change.クレド４最終評価',
    'app.record.edit.change.クレド５最終評価',
    'app.record.edit.change.能力最終評価',
    'app.record.edit.change.能力加点',
    'app.record.edit.change.行動最終評価',
    'app.record.edit.change.成果最終評価'
  ];
  kintone.events.on(calevents, function(event) {
    var record = event.record;
    var runk = event.record.等級.value;
    var score = record['合計'].value;
    if (Number(score) >= 91) {
      record['評価ランク']['value'] = "S";
    } else if (Number(score) <= 90 && Number(score) >= 81) {
      record['評価ランク']['value'] = "A+";
    } else if (Number(score) <= 80 && Number(score) >= 71) {
      record['評価ランク']['value'] = "A";
    } else if (Number(score) <= 70 && Number(score) >= 61) {
      record['評価ランク']['value'] = "B+";
    } else if (Number(score) <= 60) {
      record['評価ランク']['value'] = "B";
    }
    return event;
  });
})();
