//社員はすべての一覧の際にレコードを表示しない
(function() {
  'use strict';

  var events = [
    'app.record.index.show'
  ];
  kintone.events.on(events, async (event) => {
    try{
      var user = kintone.getLoginUser();
      //if (user.code === 'uematsu-shain') {
      //if (user.code === 'admin') {
      if (user.code ==="murayama@wing-j.co.jp"){
        $(".contents-gaia.app-index-contents-gaia").css("display","none");
        $(".component-app-listtable-countitem").css("display","none");
      }
      return event;
    } catch(e) {
      // パラメータが間違っているなどAPI実行時にエラーが発生した場合
      alert(e.message);
      return event;
    }
  });
})();
