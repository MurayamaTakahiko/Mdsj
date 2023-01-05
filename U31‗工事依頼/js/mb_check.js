(function() {
 'use struct';
 moment.locale('ja');
 //kintone.events.on(['mobile.app.record.create.submit','mobile.app.record.edit.submit'], function(event) {
 kintone.events.on(['mobile.app.record.create.submit','mobile.app.record.edit.submit'], async (event) => {
     try{
       var record = event.record;
       var user = kintone.getLoginUser();
       if (user.code === 'uematsu-shain') {
         event.error = '保存する権限がありません。';
       }
       //請求番号採番***************
       var nowmindt=moment().startOf('month').format();
       var nowmaxdt=moment().endOf('month').format();
       var yy=moment().format('YYYY').slice(-2);
       var body = {
         'app': kintone.mobile.app.getId(),
         'query': '工事番号 != "" and 作成日時 >= "' + nowmindt +'" and 作成日時 <= "' + nowmaxdt + '" order by 工事番号 desc '
       };
       const resp2= await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body);
       var recno=resp2.records;
       var newno;
       if(recno.length==0){
         newno="2" + yy + "0001";
       }else{
         var ren=recno[0]['工事番号'].value;
         var iren=parseInt(ren.substr(-4));
         iren=iren+1;
         var sren=String(iren);
         sren=('0000' + sren).slice(-4);
           newno="2" + yy + sren;
       }
       record['工事番号'].value=newno;
       return event;
     }catch(e) {
       // パラメータが間違っているなどAPI実行時にエラーが発生した場合
         alert(e.message);
       return event;
     }
 })
})();
