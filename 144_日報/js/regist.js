jQuery.noConflict();
(function($) {
  "use strict";

  var createEditEvent = [
    "app.record.create.show",
    "app.record.edit.show"
  ];

  kintone.events.on(createEditEvent, function(e) {

    var spcRegist = kintone.app.record.getSpaceElement('spcRegist');
    var srcRegTaxWorkList = '' +
      '<div id="emxas-regist-taxworklist-area">'
      //業務処理簿アプリへ登録
      +
      '<button id="emxas-button-regist" class="emxas-custom-button">業務処理簿アプリへ登録</button>' +
      '</div>';
    $(spcRegist).html(srcRegTaxWorkList);

  });

  //「業務処理簿アプリへ登録」ボタンクリックイベント
  $(document).on('click', '#emxas-button-regist', function(e) {
    window.open("/k/" + emxasConf.getConfig("APP_TAX_WORK_LIST") + "/edit?action=999999");
  });
})(jQuery);
