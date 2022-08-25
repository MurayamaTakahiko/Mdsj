
(function() {
  'use strict';
  var events=[
    'app.record.detail.show',
    'app.record.edit.show'
  ];
  kintone.events.on(events, async (event) => {
  try {
    //中津店
    //var APP_ID= 74;  //請求登録
    //梅田店
    //var APP_ID= 169;  //請求登録
    //四条烏丸店
    //var APP_ID= 153;  //請求登録
    var APP_ID= 449;  //請求登録

    // 「請求番号」を取得
    var invoiceno =event.record.請求番号.value;

    // 表示する表を作成
    var tableHtml = '<thead class="subtable-header-gaia"><tr>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">種別</span></th>' +
        '<th class="subtable-label-gaia" style="width:256px;">' +
        '    <span class="subtable-inner-gaia">プラン・オプション</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">単価</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">数量</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">金額</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">税額</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">小計</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">摘要</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">利用対象期間(from)</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">利用対象期間(to)</span></th>' +
        '</tr>' +
        '</thead>' +
        '<tbody id = "tbody">';
        '</tbody>';

    // スペースフィールドに作成した表を表示
    var tableEl = document.createElement('table');
    tableEl.id = 'table';
    tableEl.className="subtable-gaia show-subtable-gaia  ";
    tableEl.style.textAlign = 'center';
    tableEl.insertAdjacentHTML('afterbegin', tableHtml);
    kintone.app.record.getSpaceElement('tableSpace').appendChild(tableEl);

    // レコードを取得
    var params = {
      'app': APP_ID,
      'query': '請求番号 = "' + invoiceno + '"'
    };
    const Records1= await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', params);
      var rec = Records1.records;
      var len=0;
      var ttl5=0;
      var ttl6=0;
      var ttl7=0;

      // 一次面接
      var tableRows = rec[0]['請求明細'].value;
      var tableRef = document.getElementById('tbody');
      len+=tableRows.length;
      tableRows.forEach(function(row) {
        var tableRow = tableRef.insertRow(-1);
        var cell1 = tableRow.insertCell(-1);
        var cell2 = tableRow.insertCell(-1);
        var cell3 = tableRow.insertCell(-1);
        var cell4 = tableRow.insertCell(-1);
        var cell5 = tableRow.insertCell(-1);
        var cell6 = tableRow.insertCell(-1);
        var cell7 = tableRow.insertCell(-1);
        var cell8= tableRow.insertCell(-1);
        var cell9 = tableRow.insertCell(-1);
        var cell10 = tableRow.insertCell(-1);

        cell3.style.cssText = "text-align:right;";
        cell4.style.cssText = "text-align:right;";
        cell5.style.cssText = "text-align:right;";
        cell6.style.cssText = "text-align:right;";
        cell7.style.cssText = "text-align:right;";

        cell1.innerHTML=GetColHtml(row.value['種別'].value,'left'); // "12,345",'left');
        cell2.innerHTML=GetColHtml(row.value['プラン・オプション'].value,'left');
        cell3.innerHTML=GetColHtml(Number(row.value['単価'].value).toLocaleString(),'right');
        cell4.innerHTML=GetColHtml(Number(row.value['数量'].value).toLocaleString(),'right');
        cell5.innerHTML=GetColHtml(Number(row.value['金額'].value).toLocaleString(),'right');
        cell6.innerHTML=GetColHtml(Number(row.value['税額'].value).toLocaleString(),'right');
        cell7.innerHTML=GetColHtml(Number(row.value['小計'].value).toLocaleString(),'right');
        cell8.innerHTML=GetColHtml(row.value['摘要'].value,'right');
        cell9.innerHTML=GetColHtml(row.value['利用対象期間_from'].value,'right');
        cell10.innerHTML=GetColHtml(row.value['利用対象期間_to'].value,'right');

        ttl5+=Number(row.value['金額'].value);
        ttl6+=Number(row.value['税額'].value);
        ttl7+=Number(row.value['小計'].value);

      });

      //合計
      var tableRow = tableRef.insertRow(-1);
      var cell1 = tableRow.insertCell(-1);
      var cell2 = tableRow.insertCell(-1);
      var cell3 = tableRow.insertCell(-1);
      var cell4 = tableRow.insertCell(-1);
      var cell5 = tableRow.insertCell(-1);
      var cell6 = tableRow.insertCell(-1);
      var cell7 = tableRow.insertCell(-1);
      var cell8= tableRow.insertCell(-1);
      var cell9 = tableRow.insertCell(-1);
      var cell10 = tableRow.insertCell(-1);


      cell3.style.cssText = "text-align:right;";
      cell4.style.cssText = "text-align:right;";
      cell5.style.cssText = "text-align:right;";
      cell6.style.cssText = "text-align:right;";
      cell7.style.cssText = "text-align:right;";
      cell4.innerHTML=GetColHtml('合計');
      cell5.innerHTML=GetColHtml(ttl5.toLocaleString(),'right');
      cell6.innerHTML=GetColHtml(ttl6.toLocaleString(),'right');
      cell7.innerHTML=GetColHtml(ttl7.toLocaleString(),'right');

      return event;
    } catch(e){
      // パラメータが間違っているなどAPI実行時にエラーが発生した場合
      alert(e.message);
      return event;
    }
});

function GetColHtml(value,align){
  return   '<div style="padding-right:8px;">' +
                  '<div class="" style="text-align: ' + align + ';">' +
                         '<span class="control-value-content-gaia">' + value +'</span>' +
                  '</div>' +
                  '<div class="control-design-gaia"></div>' +
                  '</div>';
}

var ev   = [
  'app.record.create.show',
  'app.record.edit.show',
  'app.record.create.change.複数入金',
  'app.record.edit.change.複数入金'
];

kintone.events.on(ev, function(event){
  var tableVal = event.record['複数入金'].value;
  tableVal.forEach(function(column) {
    column.value['入金日_複数'].disabled = false;
    column.value['入金額_複数'].disabled = false;
  });
    return event;
});

})();
