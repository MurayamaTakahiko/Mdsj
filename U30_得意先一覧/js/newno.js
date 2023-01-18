(function() {
 'use struct';
 //kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function(event) {
kintone.events.on(['app.record.create.submit'], async (event) => {
  try{
    var record = event.record;
    //得意先CD採番***************
    var body = {
      'app': kintone.app.getId(),
      'query': '得意先CD != ""  order by 得意先CD desc '
    };
    const resp2= await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body);
    var recno=resp2.records;
    var newno;
    if(recno.length==0){
      newno="1" + "001";
    }else{
      var ren=recno[0]['得意先CD'].value;
      var iren=parseInt(ren.substr(-3));
      iren=iren+1;
      var sren=String(iren);
      sren=('000' + sren).slice(-3);
        newno="1" +  sren;
    }
    record['得意先CD'].value=newno;
    return event;
  }catch(e) {
    // パラメータが間違っているなどAPI実行時にエラーが発生した場合
      alert(e.message);
    return event;
  }

 })

})();
