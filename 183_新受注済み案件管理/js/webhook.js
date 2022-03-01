jQuery.noConflict();
(function($) {
  "use strict";
  var events = [
    'app.record.create.submit.success',
    'app.record.edit.submit.success'
  ];
  kintone.events.on(events, function(event) {
    var thisUrl = "https://mdsj.cybozu.com/k/" + kintone.app.getId() + "/show#record=" + event.recordId;
    var webhookUrl = 'https://mdsj.webhook.office.com/webhookb2/910c6cd7-6e26-45ba-8020-cf16b0be4881@54aa0467-fb36-4e3e-b3c7-233e79f88891/IncomingWebhook/f1702dda21da4ed8b209b21d2b1eee29/28686aa6-6a94-4fac-8f2f-45dd79bb3608';
    var msg='';
    if(event.type =='app.record.create.submit.success'){
      msg="登録";
    }else {
      msg="更新";
    }
    var record = event.record;
    var names = '';
    // 検索用カラムに主担当リストを格納
    for (var i in event.record.主担当.value) {
      if (names !== '') {
        names += ', '; //複数行文字列で改行するなら '\r\n'
      }
      names += event.record.主担当.value[i].name;
    }

    var num1 = event.record.累計計画額.value;
    var num2 = event.record.累計予測額.value;
    var num3 = event.record.累計実績額.value;
    ; // "12,345"

    var payload = {
    "text":
    "URL：" + "<a href=\"" + thisUrl + "\">" + thisUrl + "</a>" + "<br>" +
    "「受注済み案件管理」が" + msg + "されました。<br>" +
    "受注済み案件名：" + event.record.受注済み案件名.value + "<br>" +
    "顧客名：" + event.record.顧客名.value + "<br>" +
    "主担当：" + names + "<br>" +
    "累計計画額：" + Number(num1).toLocaleString()　+ "（千円）<br>" +
    "累計予測額：" + Number(num2).toLocaleString()　+ "（千円）<br>" +
    "累計実績額：" + Number(num3).toLocaleString()　+ "（千円）<br>"
    };
    return new kintone.Promise(function(resolve, reject) {
      kintone.proxy(webhookUrl, 'POST', {}, payload, function(body, status, headers) {
      console.log(status, body);
      resolve(event);
      });
    });
  });

})(jQuery);
