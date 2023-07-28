jQuery.noConflict();
(function($) {

  var events = [
    "app.record.create.submit"
  ];
  kintone.events.on(events, async (event) => {
    try{
      var record = event.record;
      var subrec = record['請求明細'].value;
      event.error="";
      for (var i = 0; i < subrec.length; i++) {
        if(subrec[i].value['プラン・オプション'].value.indexOf('保証金') != -1){
          //  alert('保証金が含まれています。保存後、「保証金登録」ボタンにて保証金の登録を行ってください。');
          //  break;
          var result = window.confirm('保証金が含まれています。\r\n保存後、「保証金登録」ボタンにて保証金の登録を行ってください。');
          if( result ) {
          }
          else {
               event.error="キャンセルしました。";
               return event;
          }
        }
      }
      return event;
    } catch(e) {
      // パラメータが間違っているなどAPI実行時にエラーが発生した場合
      alert(e.message);
      return event;
    }
    });
})(jQuery);
