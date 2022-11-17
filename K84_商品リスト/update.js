(function ($) {
    "use strict";
    kintone.events.on(['app.record.index.show'], function (event) {
      var button = document.createElement('button');
      button.innerText = 'update';
      kintone.app.getHeaderMenuSpaceElement().appendChild(button);
      button.addEventListener('click', async (ev) => {
        try{


          var body = {
            'app': kintone.app.getId(),
            'query':'税区分 in ("") limit 500 '
          };

          const resp= await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body);
            // success
            var rec=resp.records;
            for(var i=0;i<rec.length;i++){
              var insbody={"app":kintone.app.getId(),
                      "id":rec[i]['レコード番号'].value,
                      "record":{
                          "税区分":{
                            "value":"課税"
                          }
                        }
                      };
              //登録
            const resp2 = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', insbody);
          }
        }catch(e){
          alert(e.message);
          return ev;
        }
      });

    });
})(jQuery);
