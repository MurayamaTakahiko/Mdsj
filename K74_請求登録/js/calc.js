(function($) {
    "use strict";

    //課税、非課税対象額合計
      var fields = ['税区分','単価','数量','税率','請求明細'];
       var kamokuInfos = {
       '課税': '課税対象額',
       '非課税': '非課税対象額'
        }

      var events = ["app.record.edit.show", "app.record.create.show"];
       fields.forEach(function(field) {
       events.push("app.record.edit.change." + field);
       events.push("app.record.create.change." + field);
       })

      var totalFields = [];
       Object.keys(kamokuInfos).forEach(function(kamoku) {
       var tcode = kamokuInfos[kamoku];
       if (totalFields.indexOf(tcode) < 0) {
       totalFields.push(tcode);
       }
       });

      kintone.events.on(events, function(event) {
       var record = event.record;
       record['消費税'].value =0;
       record['消費税'].disabled = true;
       record['請求総額'].value =0;
       record['請求総額'].disabled = true;
       totalFields.forEach(function(tcode) {
       record[tcode].value = 0;
       record[tcode].disabled = true;
       });
       var subTable = record['請求明細'].value;
       subTable.forEach(function(rows) {
         var kamoku = rows.value['税区分'].value;
         if (Object.keys(kamokuInfos).indexOf(kamoku) >= 0) {
           var tcode = kamokuInfos[kamoku];
             if (rows.value['単価'].value) {
               record[tcode].value += Number(rows.value['単価'].value)*Number(rows.value['数量'].value);
             }
           }
       });
       if(record['課税対象額'].value>=0){
          record['消費税'].value = Math.floor(record['課税対象額'].value * record['税率'].value / 100);
       }else{
         record['消費税'].value = Math.ceil(record['課税対象額'].value * record['税率'].value / 100);
       }
       record['請求総額'].value = record['課税対象額'].value + record['非課税対象額'].value + record['消費税'].value;
      return event;
       });
})(jQuery);
