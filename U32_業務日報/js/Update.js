(function ($) {
    "use strict";
    var events=[
      'app.record.create.submit.success',
      'app.record.edit.submit.success'
    ];
    kintone.events.on(events, async (ev) => {
        showSpinner(); // スピナー表示
        try{
          //var APP_KOJI_ID = 31  //工事依頼
          var APP_KOJI_ID = 479  //工事依頼

          var appId = ev.appId;
          var sumWork = "00:00";
          var record = ev.record;
          var koji_no=record['工事番号'].value;
          var check=[];
          var updateflg=false;
          var intoffset=0;

          do{
            var param = {
              'app': appId,
              'query': '工事番号 = "' + koji_no + '" limit 500 offset ' + intoffset
            };
            const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param);
            var rec=resp.records;
            if (rec.length==0){
              break;
            }
            for (let i = 0 ; i < rec.length ; i++){
                if(rec[i]['完工区分'].value==="完"){
                  updateflg=true;
                }
            }
            for (let i = 0 ; i < rec.length ; i++){
              if(updateflg==true){
                sumWork = timeMath.sum(sumWork, rec[i].工数合計.value);
              }
              if(rec[i]['完工区分'].value !="完"){
              　check=["未"];
              }
            }
            if (rec.length<500){
              break;
            }
            intoffset+=500;
          }while(intoffset<=10000);



            var param2 = {
              'app': APP_KOJI_ID,
              'query': '工事番号 = "' + koji_no + '" limit 500 '
            };
            var sums = sumWork.split(':');
            sumWork = sums[0] + '時間' + sums[1] + '分';
            const resp2 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param2);
            var rec2=resp2.records;

            for (let i = 0 ; i < rec2.length ; i++){
              //工事依頼更新
              var updparam = {
                "app": APP_KOJI_ID,
                "id":rec2[i]['レコード番号'].value,
                "record": {
                  "工事工数合計": {
                    "value":sumWork
                  },"完工チェック": {
                    "value":check
                  }
                }
              };
              await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', updparam);
            }
          hideSpinner(); // スピナー非表示
          return ev;


        } catch(e) {
          // パラメータが間違っているなどAPI実行時にエラーが発生した場合
          hideSpinner(); // スピナー非表示
          alert(e.message);
          return ev;
        }
      });

        // スピナーを動作させる関数
        function showSpinner() {
            // 要素作成等初期化処理
            if ($('.kintone-spinner').length == 0) {
                // スピナー設置用要素と背景要素の作成
                var spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
                var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');

                // スピナー用要素をbodyにappend
                $(document.body).append(spin_div, spin_bg_div);

                // スピナー動作に伴うスタイル設定
                $(spin_div).css({
                    'position': 'fixed',
                    'top': '50%',
                    'left': '50%',
                    'z-index': '510',
                    'background-color': '#fff',
                    'padding': '26px',
                    '-moz-border-radius': '4px',
                    '-webkit-border-radius': '4px',
                    'border-radius': '4px'
                });

                $(spin_bg_div).css({
                    'position': 'fixed',
                    'top': '0px',
                    'left': '0px',
                    'z-index': '500',
                    'width': '100%',
                    'height': '200%',
                    'background-color': '#000',
                    'opacity': '0.5',
                    'filter': 'alpha(opacity=50)',
                    '-ms-filter': "alpha(opacity=50)"
                });

                // スピナーに対するオプション設定
                var opts = {
                    'color': '#000'
                };

                // スピナーを作動
                new Spinner(opts).spin(document.getElementById('kintone-spin'));
            }

            // スピナー始動（表示）
            $('.kintone-spinner').show();
        }

        // スピナーを停止させる関数
        function hideSpinner() {
            // スピナー停止（非表示）
            $('.kintone-spinner').hide();
        }
        var timeMath = {
          // 加算
          sum : function() {
            var result, times, second, i,
              len = arguments.length;
            if (len === 0) return;
            for (i = 0; i < len; i++) {
              if (!arguments[i] || !arguments[i].match(/^[0-9]+:[0-9]{2}$/)) continue;
              times = arguments[i].split(':');
              second = this.toSecond(times[0], times[1]);
              if ((!second && second !== 0)) continue;
              if (i === 0) {
                result = second;
              } else {
                result += second;
              }
            }
            return this.toTimeFormat(result);
          },
          // 時間を秒に変換
          toSecond : function(hour, minute) {
            if (!hour || !minute || hour === null || minute === null ||
              typeof hour === 'boolean' ||
              typeof minute === 'boolean' ||
              typeof Number(hour) === 'NaN' ||
              typeof Number(minute) === 'NaN') return;

            return (Number(hour) * 60 * 60) + (Number(minute) * 60);
          },
          // 秒を時間（hh:mm）のフォーマットに変換
          toTimeFormat : function(fullSecond) {
            var hour, minute;
            if ((!fullSecond && fullSecond !== 0) || !String(fullSecond).match(/^[\-0-9][0-9]*?$/)) return;
            var paddingZero = function(n) {
              return (n < 10)  ? '0' + n : n;
            };

            hour   = Math.floor(Math.abs(fullSecond) / 3600);
            minute = Math.floor(Math.abs(fullSecond) % 3600 / 60);
            minute = paddingZero(minute);

            return ((fullSecond < 0) ? '-' : '') + hour + ':' + minute;
          }
        };
})(jQuery);
