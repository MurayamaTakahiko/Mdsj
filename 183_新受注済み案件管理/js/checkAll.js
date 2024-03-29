jQuery.noConflict();
(function($) {
  "use strict";
  var events = [
    'app.record.create.show',
    'app.record.edit.show'
  ];
  kintone.events.on(events, function(event) {
    kintone.app.record.setFieldShown('検索用担当者', false);
    var record = event.record;
    var names = '';
    // 検索用カラムに主担当リストを格納
    for (var i in record['主担当'].value) {
      if (names !== '') {
        name += ', '; //複数行文字列で改行するなら '\r\n'
      }
      names += record['主担当'].value[i].name;
    }
    record['検索用担当者']['value'] = names;
    // 契約期間・終了は自動反映するので編集不可
    record.契約期間開始.disabled = true;
    record.契約期間終了.disabled = true;
    // 過去計上日データを編集不可
    record.売上管理表.value.forEach(function(row) {
      var sellDate = row.value['売上月']['value'];
      if (sellDate == null) {} else if (moment(sellDate).isBefore(moment().add(-1, 'days'), 'day')) {
        row.value.売上月.disabled = true;
        row.value.組織選択.disabled = true;
        row.value.担当者.disabled = true;
        row.value.計画額.disabled = true;
        row.value.予測額.disabled = true;
        row.value.実績請求額.disabled = true;
        row.value.交通費.disabled = true;
      } else if (moment(sellDate).isAfter(moment(), 'month')) {
        //来月以降は編集可能に
        // row.value.売上月.disabled = true;
        row.value.計画額.disabled = true;
      } else {
        //今月分は一部編集可能に
        row.value.売上月.disabled = true;
        row.value.計画額.disabled = true;
        row.value.予測額.disabled = true;
      }
      // 複数担当者入力チェック
      var selectedUsers = row.value['担当者']['value'];
      if (selectedUsers.length > 1) {
        event.error = "担当者は一人しか指定できません。";
      }
    });
    return event;
  });

  // 検索用カラムに主担当リストを格納
  var ctevents = [
    'app.record.create.change.主担当',
    'app.record.edit.change.主担当'
  ];
  kintone.events.on(ctevents, function(event) {
    kintone.app.record.setFieldShown('検索用担当者', false);
    var record = event.record;
    var names = '';
    for (var i in record['主担当'].value) {
      if (names !== '') {
        name += ', '; //複数行文字列で改行するなら '\r\n'
      }
      names += record['主担当'].value[i].name;
    }
    record['検索用担当者']['value'] = names;
    return event;
  });

  // 複数担当者入力チェック
  var ptevents = [
    'app.record.create.change.担当者',
    'app.record.edit.change.担当者'
  ];
  kintone.events.on(ptevents, function(event) {
    var prow = event.changes.row;
    var selectedUsers = prow.value['担当者']['value'];
    if (selectedUsers.length > 1) {
      event.error = "担当者は一人しか指定できません。";
    }
    return event;
  });

  // 売上月の最小を契約期間開始、最大を契約期間終了に自動反映
  var crevents = [
    'app.record.create.change.売上月',
    'app.record.edit.change.売上月'
  ];
  kintone.events.on(crevents, function(event) {
    var minPrdDate = "";
    var maxPrdDate = "";
    var record = event.record;
    record.売上管理表.value.forEach(function(row) {
      if (!minPrdDate || (row.value['売上月']['value'] < minPrdDate)) {
        minPrdDate = moment(row.value['売上月']['value']).format("YYYY-MM-DD");
      }
      if (!maxPrdDate || (row.value['売上月']['value'] > maxPrdDate)) {
        maxPrdDate = moment(row.value['売上月']['value']).format("YYYY-MM-DD");
      }
    });
    record['契約期間開始']['value'] = minPrdDate;
    record['契約期間終了']['value'] = maxPrdDate;
    // 過去計上日データは登録不可
    var crow = event.changes.row;
    var sellDate = crow.value['売上月']['value'];
    if (moment(sellDate).isBefore(moment().add(-1, 'days'), 'day')) {
      crow.value['売上月']['value'] = "";
      event.error = "過去日での売上計上はできません。";
    }
    return event;
  });

  // 保存時も同様にチェック
  var dbcevents = [
    'app.record.create.submit'
  ];
  kintone.events.on(dbcevents, function(event) {
    var minPrdDate = "";
    var maxPrdDate = "";
    var record = event.record;

    record.売上管理表.value.forEach(function(row) {
      if (!minPrdDate || (row.value['売上月']['value'] < minPrdDate)) {
        minPrdDate = moment(row.value['売上月']['value']).format("YYYY-MM-DD");
      }
      if (!maxPrdDate || (row.value['売上月']['value'] > maxPrdDate)) {
        maxPrdDate = moment(row.value['売上月']['value']).format("YYYY-MM-DD");
      }
      var sellDate = row.value['売上月']['value'];
      event.error = "";
      if (moment(sellDate).isBefore(moment().add(-1, 'days'), 'day')) {
        row.value['売上月']['value'] = "";
        event.error = "過去日での売上計上はできません。";
      }
      var selectedUsers = row.value['担当者']['value'];
      if (selectedUsers.length > 1) {
        event.error += "担当者は一人しか指定できません。";
      }
      // var planSale = row.value['計画額']['value'];
      // if (planSale != 0) {
      //   event.error += "期中での追加案件では計画額は0円にしてください。";
      // }
    });
    record['契約期間開始']['value'] = minPrdDate;
    record['契約期間終了']['value'] = maxPrdDate;
    return event;
  });

  // 保存時も同様にチェック
  var dbeevents = [
    'app.record.edit.submit'
  ];
  kintone.events.on(dbeevents, function(event) {
    var minPrdDate = "";
    var maxPrdDate = "";

    var record = event.record;
    var temp=record.仮受注.value;
    var tempflg=0;
    for(let i=0;i<temp.length;i++){
      if(temp[i]=="仮受注"){
        tempflg=1;
        break;
      }
    }
    record.売上管理表.value.forEach(function(row) {
      if (!minPrdDate || (row.value['売上月']['value'] < minPrdDate)) {
        minPrdDate = moment(row.value['売上月']['value']).format("YYYY-MM-DD");
      }
      if (!maxPrdDate || (row.value['売上月']['value'] > maxPrdDate)) {
        maxPrdDate = moment(row.value['売上月']['value']).format("YYYY-MM-DD");
      }
      var sellDate = row.value['売上月']['value'];
      event.error = "";
      if (moment(sellDate).isBefore(moment().add(-1, 'days'), 'day')) {
        row.value['売上月']['value'] = "";
        event.error = "過去日での売上計上はできません。";
      }
      var selectedUsers = row.value['担当者']['value'];
      if (selectedUsers.length > 1) {
        event.error += "担当者は一人しか指定できません。";
      }

      if(tempflg==1){
        if(row.value['実績請求額']['value'] !=0){
          event.error += "仮受注時は実績請求額は入力できません";
        }
      }
    });
    record['契約期間開始']['value'] = minPrdDate;
    record['契約期間終了']['value'] = maxPrdDate;
    return event;

  });
  // 仮受注チェック、実績請求額変更時も同様にチェック
  var dbeevents = [
    'app.record.edit.change.仮受注',
    'app.record.edit.change.実績請求額',
    'app.record.edit.change.受注申請番号',
    'app.record.create.change.仮受注',
    'app.record.create.change.実績請求額',
    'app.record.create.change.受注申請番号'
  ];
  kintone.events.on(dbeevents, function(event) {
    event.error = "";
    var minPrdDate = "";
    var maxPrdDate = "";
    var record = event.record;
    var temp=record.仮受注.value;
    var tempflg=0;
    for(let i=0;i<temp.length;i++){
      if(temp[i]=="仮受注"){
        tempflg=1;
        break;
      }
    }
    record.売上管理表.value.forEach(function(row) {
      if(tempflg==1){
        if(row.value['実績請求額']['value'] !=0){
          event.error = "仮受注時は実績請求額は入力できません";
          return event;
        }
      }
    });
    if(tempflg==1){
      if(record.受注申請番号.value){
        event.error = "仮受注時は受注申請番号は入力できません";
      }
    }else{
      if(!record.受注申請番号.value){
        event.error = "受注申請番号を入力してください。";
      }
    }
    return event;

  });
})(jQuery);
