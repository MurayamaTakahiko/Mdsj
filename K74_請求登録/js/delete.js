jQuery.noConflict();
(function($) {

  //中津店
  //APP_URI=82;
  //APP_NYUKIN=79;
  //梅田店
  //APP_URI=168;
  //APP_NYUKIN=170;
  //四条烏丸店
  APP_URI=152;
  APP_NYUKIN=154;

  //
  //APP_URI=446;
  //APP_NYUKIN=448;

  //取得ID変更時
  var showEvents=[
    'app.record.detail.delete.submit',
    'app.record.index.delete.submit'
  ];
  kintone.events.on(showEvents, async (ev) => {
    try{


      var rec=ev.record;
      var seikyuno = rec.請求番号.value;
      if(seikyuno===undefined){
        seikyuno=0;
      }
      //売上管理
      var param = {
        'app': APP_URI,
        'query': '請求番号 = "' + seikyuno + '"'
      };
      const getResp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param);

			// 削除対象のレコードID配列
			const deleteIds = getResp.records.map((getRecord) => {
				return getRecord.$id.value;
			});
      const deleteParams = {
				'app': APP_URI,		// アプリID
				'ids': deleteIds	// レコードID配列
			};
      await kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', deleteParams);
      //入金管理
      param = {
        'app': APP_NYUKIN,
        'query': '請求番号 = "' + seikyuno + '"'
      };
      const getResp2 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param);
			// 削除対象のレコードID配列
			const deleteIds2 = getResp2.records.map((getRecord) => {
				return getRecord.$id.value;
			});
      const deleteParams2 = {
				'app': APP_NYUKIN,		// アプリID
				'ids': deleteIds2	// レコードID配列
			};
      await kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', deleteParams2);
     } catch(e) {
      alert('売上管理、入金管理削除に失敗した恐れがあります。ご確認ください。');
      return ev;
    }

    });

})(jQuery);
