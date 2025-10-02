//社員はすべての一覧の際にレコードを表示しない
(function() {
  'use strict';

  var events = [
    'mobile.app.record.index.show'
  ];
  kintone.events.on(events, async (event) => {
    try{
      var user = kintone.getLoginUser();
      if (user.code === 'uematsu-shain') {
      //if (user.code === 'admin') {
      //if (user.code ==="murayama@wing-j.co.jp"){
        $(".gaia-mobile-v2-indexviewpanel-tableview").css("display","none");
        $(".gaia-mobile-v2-indexviewpanel-tableview-pager").css("display","none");
      }
      return event;
    } catch(e) {
      // パラメータが間違っているなどAPI実行時にエラーが発生した場合
      alert(e.message);
      return event;
    }
  });
})();
