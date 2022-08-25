jQuery.noConflict();
(function($) {

  //中津店
  //APP_AZUKARI=188;
  //梅田店
  //APP_AZUKARI=190;
  //四条烏丸店
  //APP_AZUKARI=192;
  APP_AZUKARI=510;
  //取得ID変更時
  var showEvents=[
    'app.record.edit.change.種類',
    'app.record.create.change.種類'
  ];
    kintone.events.on(showEvents, function(ev) {
      var rec=ev.record;
      var torokuno = rec.登録NO_預り金.value;
      //  rec.入金日.value=moment;
      if(torokuno===undefined){
        torokuno=0;
      }
      var param = {
        app: APP_AZUKARI,
        query: "登録NO = " + torokuno + ""
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param, function(resp) {
      var rec2=resp.records;
      if(rec2.length!=0){
        for(var i=0;i<rec2.length;i++){
          rec.入金日.value=rec2[i]['入金日'].value;
          rec.入金額.value=rec2[i]['入金金額'].value;
        }
      }else{
        rec.入金日.value=null;
        rec.入金額.value="";
      }
      kintone.app.record.set({record: rec});
    });
  });


})(jQuery);
