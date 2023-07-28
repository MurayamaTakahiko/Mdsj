(function() {
 'use struct';
 moment.locale('ja');

  //const APP_INVOICE=74;  //中津店
  //const APP_INVOICE=169;  //梅田店
  //const APP_INVOICE=153;  //四条烏丸店
  const APP_INVOICE=449;

 var events=['app.record.create.submit','app.record.edit.submit'];
   kintone.events.on(events, async (event) => {
   try {

       var record = event.record;
       var subrec = record['料金テーブル'].value;
       var flgKbn1 = false;
       var flgKbn2 = false;
       for(let i=0;i<subrec.length;i++){
         if(subrec[i]['value']['支払区分'].value=="支払済"){
           flgKbn1 = true;
         }else{
           flgKbn2 = true;
         }
       }
       event.error="";
       if (flgKbn1===true  &&  flgKbn2 ===true ) {
         //ここでレコード保存されずに編集画面にもどす。
         event.error = '支払区分が混在しています。';
       }
       if(event.error !=""){
         return event;
       }
       if(record['強制保存'].value == ""){
         if(record['メンバーの場合'].value !=""){
           subrec=record['料金テーブル'].value;
           for(let i=0;i<subrec.length;i++){
              if(subrec[i]['value']['商品番号'].value !="" && subrec[i]['value']['自動計上済'].value == ""){
                var param = {
                  app: APP_INVOICE,
                  query: '顧客名 = "' + record['メンバーの場合'].value + '" and 利用対象期間_from <= "' + subrec[i]['value']['対象日'].value + '" ' +
                                         'and 利用対象期間_to >= "' + subrec[i]['value']['対象日'].value + '" and 金額 in ( '  + subrec[i]['value']['料金'].value + ')' +
                                         'and プラン・オプション like "' +  subrec[i]['value']['商品名'].value + '"'
                };
                const resp = await  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param);
                  if(resp.records.length !=0 ){
                    event.error = '請求登録データの重複を防ぐため、「自動計上済（自動）」に✔を入れてください。';
                    return event;
                  }
              }
            }

         }
       }

       for (var i = 0; i < subrec.length; i++) {
         if(subrec[i].value['商品名'].value.indexOf('保証金') != -1){
           //  alert('保証金が含まれています。保存後、「保証金登録」ボタンにて保証金の登録を行ってください。');
           //  break;
           var result = window.confirm('保証金が含まれています。\r\n保存後、「売上個別登録」ボタン⇒請求登録アプリの「保証金登録」ボタンにて保証金の登録を行ってください。');
           if( result ) {
           }
           else {
                event.error="キャンセルしました。";
                return event;
           }
         }
       }
       return event;

    }catch(e) {
      // パラメータが間違っているなどAPI実行時にエラーが発生した場合
        alert(e.message);
      return event;
    }
  });

  })(jQuery);
