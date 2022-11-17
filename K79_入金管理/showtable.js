
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
    var APP_ID= 153;  //請求登録
    //var APP_ID= 449;  //請求登録

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

      //
      var subtotal = rec[0]['課税対象額'].value;
      var subnototal = rec[0]['非課税対象額'].value;
      var taxtotal = rec[0]['消費税'].value;

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
        var cell6= tableRow.insertCell(-1);
        var cell7 = tableRow.insertCell(-1);
        var cell8 = tableRow.insertCell(-1);

        cell3.style.cssText = "text-align:right;";
        cell4.style.cssText = "text-align:right;";
        cell5.style.cssText = "text-align:right;";

        cell1.innerHTML=GetColHtml(row.value['種別'].value,'left'); // "12,345",'left');
        cell2.innerHTML=GetColHtml(row.value['プラン・オプション'].value,'left');
        cell3.innerHTML=GetColHtml(Number(row.value['単価'].value).toLocaleString(),'right');
        cell4.innerHTML=GetColHtml(Number(row.value['数量'].value).toLocaleString(),'right');
        cell5.innerHTML=GetColHtml(Number(row.value['金額'].value).toLocaleString(),'right');
        cell6.innerHTML=GetColHtml(row.value['摘要'].value,'right');
        cell7.innerHTML=GetColHtml(row.value['利用対象期間_from'].value,'right');
        cell8.innerHTML=GetColHtml(row.value['利用対象期間_to'].value,'right');


      });

      var tableRow = tableRef.insertRow(-1);
      var cell1 = tableRow.insertCell(-1);
      var cell2 = tableRow.insertCell(-1);
      var cell3 = tableRow.insertCell(-1);
      var cell4 = tableRow.insertCell(-1);
      var cell5 = tableRow.insertCell(-1);
      var cell6 = tableRow.insertCell(-1);
      var cell7 = tableRow.insertCell(-1);
      var cell8= tableRow.insertCell(-1);
      cell3.innerHTML=GetColHtml('課税対象額');
      cell4.innerHTML=GetColHtml('非課税対象額');
      cell5.innerHTML=GetColHtml('消費税');

      //合計
      tableRow = tableRef.insertRow(-1);
      cell1 = tableRow.insertCell(-1);
      cell2 = tableRow.insertCell(-1);
      cell3 = tableRow.insertCell(-1);
      cell4 = tableRow.insertCell(-1);
      cell5 = tableRow.insertCell(-1);
      cell6 = tableRow.insertCell(-1);
      cell7 = tableRow.insertCell(-1);
      cell8= tableRow.insertCell(-1);


      cell3.style.cssText = "text-align:right;";
      cell4.style.cssText = "text-align:right;";
      cell5.style.cssText = "text-align:right;";
      //cell4.innerHTML=GetColHtml('合計');
      cell3.innerHTML=GetColHtml(Number(subtotal).toLocaleString(),'right');
      cell4.innerHTML=GetColHtml(Number(subnototal).toLocaleString(),'right');
      cell5.innerHTML=GetColHtml(Number(taxtotal).toLocaleString(),'right');

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
