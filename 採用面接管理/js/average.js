
(function() {
  'use strict';
  var events=[
    'app.record.detail.show',
    'app.record.edit.show'
  ];
  kintone.events.on(events, async (event) => {
  try {
    var APP_ID= kintone.app.getId();

    // 「レコード番号」を取得
    var applicationNumber =kintone.app.record.getId();

    // 表示する表を作成
    var tableHtml = '<thead class="subtable-header-gaia"><tr>' +
        '<th class="subtable-label-gaia" style="width:352px;">' +
        '    <span class="subtable-inner-gaia"></span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">Comms能力</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">専門能力</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">論理的思考力</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">積極性</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">共感力</span></th>' +
        '<th class="subtable-label-gaia" style="width:128px;">' +
        '    <span class="subtable-inner-gaia">誠実性</span></th>' +
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
      'query': 'レコード番号 = ' + applicationNumber
    };
    const Records1= await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', params);
      var rec = Records1.records;
      var len=0;
      var avr2=0;
      var avr3=0;
      var avr4=0;
      var avr5=0;
      var avr6=0;
      var avr7=0;

      // 同じ「出張申請番号」のレコードが「旅費精算申請アプリ」に存在しないときにエラーを表示


      // 一次面接
      var tableRows = rec[0]['採点表1'].value;
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

        cell2.style.cssText = "text-align:right;";
        cell3.style.cssText = "text-align:right;";
        cell4.style.cssText = "text-align:right;";
        cell5.style.cssText = "text-align:right;";
        cell6.style.cssText = "text-align:right;";
        cell7.style.cssText = "text-align:right;";

        cell1.innerHTML=GetColHtml('一次面接者　' + row.value['面接者1']['value'][0].name,'left');
        cell2.innerHTML=GetColHtml(row.value['コミュニケーション能力1'].value,'right');
        cell3.innerHTML=GetColHtml(row.value['専門能力1'].value,'right');
        cell4.innerHTML=GetColHtml(row.value['論理的思考力1'].value,'right');
        cell5.innerHTML=GetColHtml(row.value['積極性1'].value,'right');
        cell6.innerHTML=GetColHtml(row.value['共感力1'].value,'right');
        cell7.innerHTML=GetColHtml(row.value['誠実性1'].value,'right');
        // cell1.appendChild(document.createTextNode('一次面接者　' + row.value['面接者1']['value'][0].name));
        // cell2.appendChild(document.createTextNode(row.value['コミュニケーション能力1'].value));
        // cell3.appendChild(document.createTextNode(row.value['専門能力1'].value));
        // cell4.appendChild(document.createTextNode(row.value['論理的思考力1'].value));
        // cell5.appendChild(document.createTextNode(row.value['積極性1'].value));
        // cell6.appendChild(document.createTextNode(row.value['共感力1'].value));
        // cell7.appendChild(document.createTextNode(row.value['誠実性1'].value));

        avr2+=Number(row.value['コミュニケーション能力1'].value);
        avr3+=Number(row.value['専門能力1'].value);
        avr4+=Number(row.value['論理的思考力1'].value);
        avr5+=Number(row.value['積極性1'].value);
        avr6+=Number(row.value['共感力1'].value);
        avr7+=Number(row.value['誠実性1'].value);

      });
      //最終面接
      len+=tableRows.length;
      tableRows = rec[0]['採点表_最終1'].value;
      tableRows.forEach(function(row) {
        var tableRow = tableRef.insertRow(-1);
        var cell1 = tableRow.insertCell(-1);
        var cell2 = tableRow.insertCell(-1);
        var cell3 = tableRow.insertCell(-1);
        var cell4 = tableRow.insertCell(-1);
        var cell5 = tableRow.insertCell(-1);
        var cell6 = tableRow.insertCell(-1);
        var cell7 = tableRow.insertCell(-1);

        cell2.style.cssText = "text-align:right;";
        cell3.style.cssText = "text-align:right;";
        cell4.style.cssText = "text-align:right;";
        cell5.style.cssText = "text-align:right;";
        cell6.style.cssText = "text-align:right;";
        cell7.style.cssText = "text-align:right;";
        cell1.innerHTML=GetColHtml('最終面接者　' + row.value['面接者_最終1']['value'][0].name,'left');
        cell2.innerHTML=GetColHtml(row.value['コミュニケーション能力_最終1'].value,'right');
        cell3.innerHTML=GetColHtml(row.value['専門能力_最終1'].value,'right');
        cell4.innerHTML=GetColHtml(row.value['論理的思考力_最終1'].value,'right');
        cell5.innerHTML=GetColHtml(row.value['積極性_最終1'].value,'right');
        cell6.innerHTML=GetColHtml(row.value['共感力_最終1'].value,'right');
        cell7.innerHTML=GetColHtml(row.value['誠実性_最終1'].value,'right');

        //cell1.appendChild(document.createTextNode('<div class="control-value-gaia " style="text-align: right;"><span class="control-value-content-gaia">' + '最終面接者　' + row.value['面接者_最終1']['value'][0].name +'</span></div>'));
        //cell2.appendChild(document.createTextNode(row.value['コミュニケーション能力_最終1'].value));
        //cell3.appendChild(document.createTextNode(row.value['専門能力_最終1'].value));
        //cell4.appendChild(document.createTextNode(row.value['論理的思考力_最終1'].value));
        //cell5.appendChild(document.createTextNode(row.value['積極性_最終1'].value));
        //cell6.appendChild(document.createTextNode(row.value['共感力_最終1'].value));
        //cell7.appendChild(document.createTextNode(row.value['誠実性_最終1'].value));

        avr2+=Number(row.value['コミュニケーション能力_最終1'].value);
        avr3+=Number(row.value['専門能力_最終1'].value);
        avr4+=Number(row.value['論理的思考力_最終1'].value);
        avr5+=Number(row.value['積極性_最終1'].value);
        avr6+=Number(row.value['共感力_最終1'].value);
        avr7+=Number(row.value['誠実性_最終1'].value);

      });
      //平均
      var tableRow = tableRef.insertRow(-1);
      var cell1 = tableRow.insertCell(-1);
      var cell2 = tableRow.insertCell(-1);
      var cell3 = tableRow.insertCell(-1);
      var cell4 = tableRow.insertCell(-1);
      var cell5 = tableRow.insertCell(-1);
      var cell6 = tableRow.insertCell(-1);
      var cell7 = tableRow.insertCell(-1);

      cell2.style.cssText = "text-align:right;";
      cell3.style.cssText = "text-align:right;";
      cell4.style.cssText = "text-align:right;";
      cell5.style.cssText = "text-align:right;";
      cell6.style.cssText = "text-align:right;";
      cell7.style.cssText = "text-align:right;";
      cell1.innerHTML=GetColHtml('平均');
      cell2.innerHTML=GetColHtml(Math.round((avr2/len*10))/10,'right');
      cell3.innerHTML=GetColHtml(Math.round((avr3/len*10))/10,'right');
      cell4.innerHTML=GetColHtml(Math.round((avr4/len*10))/10,'right');
      cell5.innerHTML=GetColHtml(Math.round((avr5/len*10))/10,'right');
      cell6.innerHTML=GetColHtml(Math.round((avr6/len*10))/10,'right');
      cell7.innerHTML=GetColHtml(Math.round((avr7/len*10))/10,'right');

      // cell1.appendChild(document.createTextNode('平均'));
      // cell2.appendChild(document.createTextNode(Math.round((avr2/len*10))/10));
      // cell3.appendChild(document.createTextNode(Math.round((avr3/len*10))/10));
      // cell4.appendChild(document.createTextNode(Math.round((avr4/len*10))/10));
      // cell5.appendChild(document.createTextNode(Math.round((avr5/len*10))/10));
      // cell6.appendChild(document.createTextNode(Math.round((avr6/len*10))/10));
      // cell7.appendChild(document.createTextNode(Math.round((avr7/len*10))/10));
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
})();

// (function() {
//   'use strict';
//   const events = [
//     'app.record.create.change.採点表①',
//     'app.record.edit.change.採点表①',
//   ];
//   kintone.events.on(events, async (event) => {
//     const targetAppId = kintone.app.getLookupTargetAppId('Lookup');
//     const targetRecordId = event.record['Number'].value;
//
//     // ルックアップクリアをしたらテーブルを空にする
//     if (!targetRecordId) {
//       event.record['Table'].value = [];
//       return event;
//     }
//
//     const body = {
//       app: targetAppId,
//       id: targetRecordId,
//     };
//     const resp = kintone.api(kintone.api.url('/k/v1/record', true), 'GET', body);
//       event.record['Table'].value = resp.record['Table'].value;
//
//       // サブテーブルを編集不可にする場合
//       event.record['Table'].value.forEach(function(obj) {
//         Object.keys(obj.value).forEach(function(params) {
//           obj.value[params].disabled = true;
//         });
//       });
//
//       kintone.app.record.set(event);
//     }, function(err) {
//       window.alert('REST APIでエラーが発生しました');
//     });
//   });
// })();
