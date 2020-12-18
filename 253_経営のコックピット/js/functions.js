jQuery.noConflict();
(function($) {
  "use strict";
  moment.locale('ja');

  console.log('--- func js start ---');
  /** 文字色（金額がマイナス値を示す） */
  var COLOR_MINUS = "#f00";
  var COLOR_GAIN = 'blue';
  var COLOR_LOSS = 'red';

  /** 年月絞り込み条件の、表示開始年 */
  var DISP_START_MONTH_NUM = 2020; // 2020年～2026年

  /** システムで使用する、名称が得られなかった場合に使用する文字列 */
  var SYS_VALUE_NOT_EXIST_NAME = '--- NO NAME --';
  /** リストから名称を得られなかったときの表示文字列 */
  var DISP_VALUE_NOT_EXIST_CUSTOMER_NAME = '顧客未選択';
  var DISP_VALUE_NOT_EXIST_CHARGE_NAME = '担当者未選択';
  /** タブ名 */
  var TAB_NAME = 'myTab';
  /** CSV出力関連 */
  var csvDataList = null; // CSV出力用データ保持
  var isComp;
  const csvColumnsSingle = {
    '生産性分析': {
      '顧客別': {
        // 実際のCSVに出力する列名 : csvDataListのキー名
        '３コード': '３コード',
        '顧客名': '顧客名',
        '報酬': '報酬',
        '工数': '工数',
        '時間あたり報酬': '時間あたり',
        '人件費': '人件費',
        '損益': '損益',
        '利益率': '利益率',
        '区分': '担当者毎集計担当者区分',
        '担当者': '担当者毎集計担当者名称',
        '業務': '業務毎集計業務名称',
        '担当者工数': '業務毎集計担当者工数',
        '担当者人件費': '業務毎集計担当者人件費',
        '割合': '業務毎集計割合',
      },
      '担当者別': {
        // 実際のCSVに出力する列名 : csvDataListのキー名
        '担当者コード': '担当者コード',
        '担当者名': '担当者名',
        '報酬': '報酬',
        '工数': '工数',
        '時間あたり報酬': '時間あたり',
        '業務': '業務毎集計業務名称',
        '担当者工数': '業務毎集計担当者工数',
        '割合': '業務毎集計割合',
      }
    },
    '損益分析': {
      '顧客別': {
        // 実際のCSVに出力する列名 : csvDataListのキー名
        '３コード': '３コード',
        '顧客名': '顧客名',
        '報酬': '報酬',
        '人件費': '人件費',
        '損益': '損益',
        '利益率': '利益率'
      },
      '担当者別': {
        // 実際のCSVに出力する列名 : csvDataListのキー名
        '担当者コード': '担当者コード',
        '担当者名': '担当者名',
        '報酬': '報酬',
        '人件費': '人件費',
        '損益': '損益',
        '利益率': '利益率'
      },
    },
  };
  const csvColumnsComp = {
    '生産性分析': {
      '顧客別': {
        // 実際のCSVに出力する列名 : csvDataListのキー名
        '３コード': '３コード',
        '顧客名': '顧客名',
        '報酬[今期]': '報酬',
        '報酬[増減]': '報酬Comp',
        '工数[今期]': '工数',
        '工数[増減]': '工数Comp',
        '時間あたり報酬[今期]': '時間あたり',
        '時間あたり報酬[増減]': '時間あたりComp'
      },
      '担当者別': {
        // 実際のCSVに出力する列名 : csvDataListのキー名
        '担当者コード': '担当者コード',
        '担当者名': '担当者名',
        '報酬[今期]': '報酬',
        '報酬[増減]': '報酬Comp',
        '工数[今期]': '工数',
        '工数[増減]': '工数Comp',
        '時間あたり報酬[今期]': '時間あたり',
        '時間あたり報酬[増減]': '時間あたりComp'
      },
    },
    '損益分析': {
      '顧客別': {
        // 実際のCSVに出力する列名 : csvDataListのキー名
        '３コード': '３コード',
        '顧客名': '顧客名',
        '報酬[今期]': '報酬',
        '報酬[増減]': '報酬Comp',
        '人件費[今期]': '人件費',
        '人件費[増減]': '人件費Comp',
        '損益[今期]': '損益',
        '損益[増減]': '損益Comp',
        // '利益率[今期]': '利益率',
        // '利益率[増減]': '利益率Comp',
      },
      '担当者別': {
        // 実際のCSVに出力する列名 : csvDataListのキー名
        '担当者コード': '担当者コード',
        '担当者名': '担当者名',
        '報酬[今期]': '報酬',
        '報酬[増減]': '報酬Comp',
        '人件費[今期]': '人件費',
        '人件費[増減]': '人件費Comp',
        '損益[今期]': '損益',
        '損益[増減]': '損益Comp',
        // '利益率[今期]': '利益率',
        // '利益率[増減]': '利益率Comp'
      },
    },
  };

  const INTEGRATE_BY_CHARGE = {
    '担当者毎集計担当者名称': '',
    '担当者毎集計担当者区分': '',
    '担当者毎集計担当者時給': 0,
    '業務毎集計': {}
  };

  const INTEGRATE_BY_JOB = {
    '業務毎集計業務名称': '',
    '業務毎集計担当者工数': 0,
    '業務毎集計担当者人件費': 0,
    '業務毎集計割合': 0
  };

  const MDSJ_JOBNUMBER = "0420_P_0111";

  const INTRN_CODE = "interncom@mdsj.jp";

  /**
   * 0埋め時刻の生成
   */
  var getTimeString = function(date) {
    return (("0000" + date.getFullYear()).slice(-4)) +
      (("00" + date.getMonth()).slice(-2)) +
      (("00" + date.getDate()).slice(-2)) +
      (("00" + date.getHours()).slice(-2)) +
      (("00" + date.getMinutes()).slice(-2)) +
      (("00" + date.getSeconds()).slice(-2));
  };

  /**
   * エスケープ処理
   */
  var escapeStr = function(value) {
    return '"' + (value ? String(value).replace(/"/g, '""') : '') + '"';
  };

  /**
   * CSV作成処理
   */
  var exportCSV = function() {
    // 生産性／損益の区分、顧客別／担当者別の区分に応じて、出力列名を取得
    const analysis = (dispViewId == emxasConf.getConfig('VIEW_PRODUCTIVITY_ANALYSIS') ? '生産性分析' : '損益分析');
    const type = w2ui[TAB_NAME].active;
    let fileNameComp = "";
    let columns = csvColumnsSingle[analysis][type];
    if (isComp) {
      columns = csvColumnsComp[analysis][type];
      fileNameComp = "2期比較_";
    }


    // CSVデータの生成（ヘッダ）
    let content = '\"' + Object.keys(columns).join('","') + '\"\r\n';
    // CSVデータの生成（ボディ）
    csvDataList.forEach(function(csvData) {
      const value = [];
      Object.keys(columns).forEach(function(key) {
        value.push(escapeStr(csvData[columns[key]]));
      });
      content += value.join(',') + '\r\n';
    });

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); //UTF-8を意味するBOM
    const blob = new Blob([bom, content], {
      "type": "text/csv"
    });

    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    $("#link-csv").attr('href', url);

    const fileName = analysis + '_' + type + '_' + fileNameComp + getTimeString(new Date());

    // IE／Edge独自オブジェクトが見つかればIE／Edgeと判定
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName + ".csv");
    } else {
      $('#link-csv').attr("download", fileName + ".csv");
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * 年月のセレクトボックスを作成します
   * 引数の年月部分を選択状態にします。
   *
   * DISP_START_MONTH_NUM(2018)年～来年(今が2018年なら2019年)までの選択肢を作成します
   */
  var nowDate = moment();
  var makeSelectYearMonth = function(seleYear, seleMonth, nameYear, nameMonth) {
    return makeSelectYearMonth_fromToYear(DISP_START_MONTH_NUM, nowDate.year() + 10, seleYear, seleMonth, nameYear, nameMonth);
  }
  var makeSelectYearMonth_fromToYear = function(fromYear, toYear, seleYear, seleMonth, nameYear, nameMonth) {
    // year
    var yearTag = $('<select>').attr('id', nameYear);
    for (var y = fromYear; y <= toYear; y++) {
      var op = $('<option>').val(y).text(y + '年');
      if (y && seleYear === y) {
        op.attr('selected', 'selected');
      }
      yearTag.append(op);
    }
    // month
    var monTag = $('<select>').attr('id', nameMonth);
    for (var m = 1; m <= 12; m++) {
      var op = $('<option>').val(m).text(m + '月');
      if (m && seleMonth === m) {
        op.attr('selected', 'selected');
      }
      monTag.append(op);
    }
    return $('<div>').append(yearTag).append(monTag);
  };

  /**
   * 指定桁まで頭ゼロ埋めをします
   */
  var headZero = function(value, size) {
    let str = String(value);
    for (let ix = 0; str.length < size; ix++) {
      str = '0' + str;
    }
    return str;
  }

  const toPercentage = function(dividend, divisor) {
    if (dividend === null || dividend === "" || dividend === undefined || dividend === 0) {
      return 0;
    }
    if (divisor === null || divisor === "" || divisor === undefined || divisor === 0) {
      return 0;
    }
    // Math.round(dataRecDest['損益'] / dataRecDest['報酬'] * 100 * 100) / 100;
    return Math.round((Number(dividend) / Number(divisor)) * 100 * 100) / 100;
  };

  const toHourFromMinute = function(value) {
    return Math.round(toNumber(value) * 100 / 60) / 100;
  }

  /**
   * 工数値の表示フォーマットで文字列を返します
   * 1,000.00
   */
  var toManHourSt = function(value) {
    let numSt = Number(value).toLocaleString();
    let pos = numSt.lastIndexOf('.');
    if (pos < 0) {
      numSt += '.00';
    } else if (numSt.length - pos < 3) {
      numSt += '0';
    }
    return numSt;
  }

  /**
   * 同じパラメータ条件を結合した文字列を作ります
   * paramName operator "list[0]" connector paramName operator "list[1]" connector paramName operator "list[2]" ...
   * 例) 引数が以下の場合('名前', 'or', '=' ['aaa', 'bbb', 'ccc'])
   * 　→ 名前 = "aaa" or 名前 = "bbb" or 名前 = "ccc"
   */
  var makeWhereString = function(paramName, connector, operator, list) {
    let list2 = [];
    let st = '';
    for (let ix = 0; ix < list.length; ix++) {
      list2.push('"' + list[ix] + '"');
    }
    if (operator === "in") {
      st = paramName + ' ' + operator + ' ( ' + list2.join(', ') + ' ) ';
    } else {
      let st1 = paramName + ' ' + operator + ' '; // '名前 = '
      st = st1 + list2.join(' ' + connector + ' ' + st1);
    }
    return st;
  };

  /**
   * 時間の文字列を分に変換します。
   * kintoneの時間の計算フィールドの値が来るので、"hh:mm"以外はあり得ないかと思われます。
   * 空の場合は何も返しません。
   */
  var getMinutes = function(timeSt) {
    if (!timeSt || timeSt === '') {
      return;
    }
    let sep = timeSt.split(':');
    if (sep.length < 2) return;
    return sep[0] * 60 + Number(sep[1]);
  }

  /**
   * 期間終了年月から、期間終了年月日の文字列を作成します
   */
  var makeToDateSt = function(year, month) {
    let m = moment(year + '-' + month + '-1', 'YYYY-M-D')
    m.date(m.daysInMonth());
    return m.format('YYYY-MM-DD');
  }

  /**
   * 期間開始年月から、期間開始年月日の文字列を作成します
   */
  var makeFromDateSt = function(year, month) {
    return moment(year + '-' + month + '-1', 'YYYY-M-D').format('YYYY-MM-DD');
  }

  /**
   * 期間年月から、期間開始年月日(先月)の文字列を作成します
   */
  var makeFromPreDateSt = function(period) {
    period = moment(period).add(-1, 'month');
    return moment(period).startOf('months').format('YYYY-MM-DD');
  }

  /**
   * 期間年月から、期間終了年月日(来月)の文字列を作成します
   */
  var makeToNxDateSt = function(period) {
    period = moment(period).add(1, 'month');
    return moment(period).endOf('months').format('YYYY-MM-DD');
  }

  /**
   * 期間年月から、期間開始年月日(前年の先月)の文字列を作成します
   */
  var makeFromLastPreDateSt = function(period) {
    period = moment(period).add(-13, 'month');
    return moment(period).startOf('months').format('YYYY-MM-DD');
  }

  /**
   * 期間年月から、期間終了年月日(前年の来月)の文字列を作成します
   */
  var makeToLastNxDateSt = function(period) {
    period = moment(period).add(-11, 'month');
    return moment(period).endOf('months').format('YYYY-MM-DD');
  }

  /**
   * 指定の日付文字列から、年月の文字列を作成します
   */
  var makeYearMonthSt = function(dateSt) {
    let m = moment(dateSt);
    return m.format('YYYYMM');
  }

  /**
   * 年月の文字列から、指定の日付文字列を作成します
   */
  var makeDateSt = function(dateSt) {
    let m = moment(dateSt.substr(0, 4) + dateSt.substr(4, 2) + '01');
    return m.format('YYYY-MM-DD');
  }

  /**
   * 渡された値を数値にして返します。
   * 数値でない場合はゼロを返します。
   */
  var toNumber = function(val) {
    let num = Number(val);
    if (isNaN(num)) num = 0;
    return num;
  }

  /**
   * val1とval2の差(val1 - val2)を計算します。
   * val1、2には数値(数字)か''(空文字)を許容します。
   * ''の場合、計算値としては0で計算します。
   * val1とval2が共に''の場合は、''を返します。
   */
  var calcDiff = function(val1, val2) {
    if ((val1 !== '' && val1 !== void 0) || (val2 !== '' && val2 !== void 0)) {
      let sa = toNumber(val1) - toNumber(val2);
      return sa;
    }
    return '';
  }
  var getTotalGridColumns = function(showType) {
    let col = $.extend(true, [], gridVal.getGridColumns(showType));
    let lastOne = col[col.length - 1];
    // delete lastOne['renderer'];
    return col;
  }
  var get2TermTotalGridColumns = function(showType) {
    let col = $.extend(true, [], gridVal.get2TermGridColumns(showType));
    let lastOne = col[col.length - 1];
    delete lastOne['renderer'];
    return col;
  }

////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * 工数(分)、人件費をdataRecDestListの各データに加算します。
   * 工数、人件費がそれぞれ存在しない場合は追加しません。
   * @param dataRecDestList
   */
  var addWorkingHourPersonCost = function(sourceRec, dataRecDestList) {
    let workingHour = toNumber(sourceRec['作業時間_分']);
    if (workingHour !== 0) {
      for (let ix = 0; ix < dataRecDestList.length; ix++) {
        let keepVal = toNumber(dataRecDestList[ix]['工数_分']);
        dataRecDestList[ix]['工数_分'] = keepVal + workingHour;

        addIntegrateByCharge(
          sourceRec,
          dataRecDestList[ix],
          INTEGRATE_BY_CHARGE,
          INTEGRATE_BY_JOB
        );
      }
    }
    let manFee = toNumber(sourceRec['人件費']);
    if (manFee !== 0) {
      for (let ix = 0; ix < dataRecDestList.length; ix++) {
        let keepVal = toNumber(dataRecDestList[ix]['人件費']);
        dataRecDestList[ix]['人件費'] = keepVal + manFee;
      }
    }
  };

  const addIntegrateByCharge = function(source, dist, chargeTemplate, jobTemplate) {
    // [担当者毎集計]が存在しない場合、作成（顧客未選択時）
    if (!dist['担当者毎集計']) {
      dist['担当者毎集計'] = {};
    }
    // 担当者がdist（dataRecDestList）に保持されているか
    let chargeCode = source['担当者']['value'][0]['code'];
    if (!(chargeCode in dist['担当者毎集計'])) {
      dist['担当者毎集計'][chargeCode] = $.extend(true, {}, chargeTemplate);
      dist['担当者毎集計'][chargeCode]['担当者毎集計担当者区分'] = (isMainStaff(chargeCode, dist['３コード']) ? '担当' : '非');
      dist['担当者毎集計'][chargeCode]['担当者毎集計担当者名称'] = source['担当者']['value'][0]['name'];
      dist['担当者毎集計'][chargeCode]['担当者毎集計担当者時給'] = (isNaN(parseInt(getManHourFee(chargeCode))) ? 0 : parseInt(getManHourFee(chargeCode)));
    }

    // 担当者毎の業務がdist(dataRecDestList)に保持されているか
    let jobCode = source['業務コード']['value'];
    if (!(jobCode in dist['担当者毎集計'][chargeCode]['業務毎集計'])) {
      dist['担当者毎集計'][chargeCode]['業務毎集計'][jobCode] = $.extend(true, {}, jobTemplate);
      dist['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計業務名称'] = source['業務名称']['value'];
    }
    dist['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計担当者工数'] += toHourFromMinute(isNaN(parseInt(source['作業時間_分'])) ? 0 : parseInt(source['作業時間_分']));
  }

  /**
   * 追加フィールドの計算
   * 工数、報酬、人件費が入力値
   * 損益、利益率、時間あたりを計算して追加
   */
  var processingAddField = function(dataRecDest) {
    if (dataRecDest['工数'] === void 0 || dataRecDest['報酬'] === void 0 || dataRecDest['人件費'] === void 0) throw new Error('パラメータに工数/報酬/人件費が存在しません');
    // 工数の有無によって「時間あたり」の計算の有無が決まる
    if (dataRecDest['工数'] === '' || Number(dataRecDest['工数']) === 0) {
      // 工数が空かゼロの場合、ゼロ除算はできないので、時間あたりはナシ
      dataRecDest['時間あたり'] = '';
    } else if (dataRecDest['報酬'] !== '') {
      // 工数があって、報酬がある場合は、時間あたりを計算する
      let ans = Math.round(dataRecDest['報酬'] / dataRecDest['工数']);
      if (isNaN(ans)) {
        dataRecDest['時間あたり'] = '';
      } else {
        dataRecDest['時間あたり'] = ans;
      }
    }
    // 報酬の有無によって
    if (dataRecDest['報酬'] === '' || Number(dataRecDest['報酬']) === 0) {
      if (dataRecDest['人件費'] === void 0 || dataRecDest['人件費'] === '' || Number(dataRecDest['人件費']) === 0) {
        // 報酬と人件費の両方が空の場合は、損益、利益率は共にナシ
        dataRecDest['損益'] = '';
        dataRecDest['利益率'] = '';
      } else {
        // 人件費が存在する場合は損益はアリ、利益率はナシ
        dataRecDest['損益'] = -toNumber(dataRecDest['人件費']);
        dataRecDest['利益率'] = Math.round(dataRecDest['損益'] / dataRecDest['人件費'] * 100 * 100) / 100;
      }
    } else {
      // 報酬があれば、人件費の有無に関わらず損益、利益率は計算
      dataRecDest['損益'] = toNumber(dataRecDest['報酬']) - toNumber(dataRecDest['人件費']);
      dataRecDest['利益率'] = Math.round(dataRecDest['損益'] / dataRecDest['報酬'] * 100 * 100) / 100;
    }
  };

  /**
   * 報酬/工数がないものは非表示にする
   * 表示対象のデータをdestに入れて返します。
   */
  var delNoManHourReword = function(sourceList, dest) {
    // 生産性分析Viewの場合は工数、損益分析Viewの場合は人件費の有無を確認
    let fieldName1 = (dispViewId == emxasConf.getConfig('VIEW_PRODUCTIVITY_ANALYSIS')) ? '工数' : '人件費';
    let fieldName2 = fieldName1 + 'Comp';
    for (let ix = 0; ix < sourceList.length; ix++) {
      let one = sourceList[ix];
      if (one['報酬Comp'] !== void 0) {
        if (one['報酬'] !== '' || one[fieldName1] !== '' || one['報酬Comp'] !== '' || one[fieldName2] !== '') {
          dest.push(one);
        }
      } else {
        if (one['報酬'] !== '' || one[fieldName1] !== '') {
          dest.push(one);
        }
      }
    }
  };

  /**
   * 指定のリスト(月毎の集計の配列)の各行をそれぞれ足し合わせます。
   * 足し合わせたものをdestに格納して返します
   */
  var integratePeriodData = function(list, dest) {
    // listには1ヶ月分の集計(顧客or担当者で並んでいて同じになっている)が複数月配列で入っている
    // destにひと月分の行を作成
    for (let ix = 0; ix < list[0].length; ix++) {
      let one = {
        '３コード': list[0][ix]['３コード'],
        '担当者コード': list[0][ix]['担当者コード'],
        '顧客名': list[0][ix]['顧客名'],
        '担当者名': list[0][ix]['担当者名'],
        '報酬': '',
        '工数': '',
        '人件費': '',
        '担当者毎集計': {}
      };

      if (list[0][ix].no_code) { // no_codeは引き継ぐ
        one.no_code = list[0][ix].no_code;
      }
      dest.push(one);
    }
    // 各月(ix)毎の各行(iy)を足し合わせてdestに入れていく
    for (let iy = 0; iy < list[0].length; iy++) {
      // iy行目の全月分を加算してdestに格納
      for (let ix = 0; ix < list.length; ix++) {
        let reword = toNumber(list[ix][iy]['報酬']);
        let personExp = toNumber(list[ix][iy]['人件費']);
        let manHour = toNumber(list[ix][iy]['工数_分']);
        if (list[ix][iy]['報酬'] && list[ix][iy]['報酬'] !== '')
          dest[iy]['報酬'] = toNumber(dest[iy]['報酬']) + reword;
        if (list[ix][iy]['工数_分'] && list[ix][iy]['工数_分'] !== '')
          dest[iy]['工数_分'] = toNumber(dest[iy]['工数_分']) + manHour;
        if (list[ix][iy]['人件費'] && list[ix][iy]['人件費'] !== '')
          dest[iy]['人件費'] = toNumber(dest[iy]['人件費']) + personExp;

        if (!list[ix][iy]['担当者毎集計']) {
          continue;
        }
        Object.keys(list[ix][iy]['担当者毎集計']).forEach(function(chargeCode) {
          Object.keys(list[ix][iy]['担当者毎集計'][chargeCode]['業務毎集計']).forEach(function(jobCode) {
            // 担当者コードのキーが存在しなければ作成
            if (!dest[iy]['担当者毎集計'][chargeCode]) {
              dest[iy]['担当者毎集計'][chargeCode] = $.extend(true, {}, INTEGRATE_BY_CHARGE);
              dest[iy]['担当者毎集計'][chargeCode]['担当者毎集計担当者名称'] = list[ix][iy]['担当者毎集計'][chargeCode]['担当者毎集計担当者名称'];
              dest[iy]['担当者毎集計'][chargeCode]['担当者毎集計担当者区分'] = list[ix][iy]['担当者毎集計'][chargeCode]['担当者毎集計担当者区分'];
              dest[iy]['担当者毎集計'][chargeCode]['担当者毎集計担当者時給'] = list[ix][iy]['担当者毎集計'][chargeCode]['担当者毎集計担当者時給'];
            }
            // 業務コードのキーが存在しなければ作成
            if (!dest[iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]) {
              dest[iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode] = $.extend(true, {}, INTEGRATE_BY_JOB);
              dest[iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計業務名称'] = list[ix][iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計業務名称'];
            }
            dest[iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計担当者工数'] += list[ix][iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計担当者工数'];
          });
        });
      }

      // 顧客毎の集計が完了したら、業務毎の人件費の割合を算出
      Object.keys(dest[iy]['担当者毎集計']).forEach(function(chargeCode) {
        Object.keys(dest[iy]['担当者毎集計'][chargeCode]['業務毎集計']).forEach(function(jobCode) {
          dest[iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計担当者人件費'] = dest[iy]['担当者毎集計'][chargeCode]['担当者毎集計担当者時給'] * dest[iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計担当者工数'];
          dest[iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計割合'] =
            toPercentage(dest[iy]['担当者毎集計'][chargeCode]['業務毎集計'][jobCode]['業務毎集計担当者人件費'], dest[iy]['人件費']);
        });
      });

      if (dest[iy]['工数_分'] && dest[iy]['工数_分'] !== '' && dest[iy]['工数_分'] > 0) {
        // 工数を分から時間で小数点以下2位に計算
        dest[iy]['工数'] = toHourFromMinute(dest[iy]['工数_分']);
      } else {
        dest[iy]['工数'] = '';
      }
      // iy行目のdestの追加項目を計算
      processingAddField(dest[iy]);
    }
  };

  /**
   * 指定のリストの合計行を作成
   * @param list 合計を求めるリスト
   * @param dest 合計行のデータの格納(連想配列)
   */
  var integrateTotal = function(list, dest) {
    // 連想配列のキー列を作って、それをreduce関数で各項目の合計を求める
    let totalKey = Object.keys(list[0]);
    // 最初は「code」で集計対象外なので除外
    totalKey.shift();
    let bugrec = {};
    bugrec.name = list[0].code + "合計";
    bugrec.nblsprcweight = list.reduce((p, x) => toNumber(p) + toNumber(x.nblsprcweight), 0);
    bugrec.nblsprcPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.nblsprcPrice), 0);
    bugrec.nbplweight = list.reduce((p, x) => toNumber(p) + toNumber(x.nbplweight), 0);
    bugrec.nbplPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.nbplPrice), 0);
    bugrec.nbppweight = list.reduce((p, x) => toNumber(p) + toNumber(x.nbppweight), 0);
    bugrec.nbppPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.nbppPrice), 0);
    bugrec.nbprcweight = list.reduce((p, x) => toNumber(p) + toNumber(x.nbprcweight), 0);
    bugrec.nbprcPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.nbprcPrice), 0);
    bugrec.nbsalweight = list.reduce((p, x) => toNumber(p) + toNumber(x.nbsalweight), 0);
    bugrec.nbsalPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.nbsalPrice), 0);
    bugrec.ntlsprcweight = list.reduce((p, x) => toNumber(p) + toNumber(x.ntlsprcweight), 0);
    bugrec.ntlsprcPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.ntlsprcPrice), 0);
    bugrec.ntplweight = list.reduce((p, x) => toNumber(p) + toNumber(x.ntplweight), 0);
    bugrec.ntplPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.ntplPrice), 0);
    bugrec.ntpsweight = list.reduce((p, x) => toNumber(p) + toNumber(x.ntpsweight), 0);
    bugrec.ntpsPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.ntpsPrice), 0);
    bugrec.ntppweight = list.reduce((p, x) => toNumber(p) + toNumber(x.ntppweight), 0);
    bugrec.ntppPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.ntppPrice), 0);
    bugrec.nalsprcweight = list.reduce((p, x) => toNumber(p) + toNumber(x.nalsprcweight), 0);
    bugrec.nalsprcPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.nalsprcPrice), 0);
    bugrec.naplweight = list.reduce((p, x) => toNumber(p) + toNumber(x.naplweight), 0);
    bugrec.naplPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.naplPrice), 0);
    bugrec.napsweight = list.reduce((p, x) => toNumber(p) + toNumber(x.napsweight), 0);
    bugrec.napsPrice = list.reduce((p, x) => toNumber(p) + toNumber(x.napsPrice), 0);
    // 率は後で合計値から算出
    bugrec.nblsprcUnit = Math.floor(bugrec.nblsprcPrice / bugrec.nblsprcweight);
    bugrec.nbplUnit = Math.floor(bugrec.nbplPrice / bugrec.nbplweight);
    bugrec.nbppUnit = Math.floor(bugrec.nbppPrice / bugrec.nbppweight);
    bugrec.nbprcUnit = Math.floor(bugrec.nbprcPrice / bugrec.nbprcweight);
    bugrec.nbsalUnit = Math.floor(bugrec.nbsalPrice / bugrec.nbsalweight);
    bugrec.ntlsprcUnit = Math.floor(bugrec.ntlsprcPrice / bugrec.ntlsprcweight);
    bugrec.ntplUnit = Math.floor(bugrec.ntplPrice / bugrec.ntplweight);
    bugrec.ntpsUnit = Math.floor(bugrec.ntpsPrice / bugrec.ntpsweight);
    bugrec.ntppUnit = Math.floor(bugrec.ntppPrice / bugrec.ntppweight);
    bugrec.nalsprcUnit = Math.floor(bugrec.nalsprcPrice / bugrec.nalsprcweight);
    bugrec.naplUnit = Math.floor(bugrec.naplPrice / bugrec.naplweight);
    bugrec.napsUnit = Math.floor(bugrec.napsPrice / bugrec.napsweight);
    list.push(bugrec);
    for (var ix = 0; ix < list.length; ix++) {
      dest.push(list[ix]);
    }
  };

  /**
   * period形式からセッションオブジェクトに格納する値に変更します。
   * 「YYYY/MM-YYYY/MM」の形で記録します
   * @see getPeriodFromStorage
   */
  var makeStorageYearMonth = function(period) {
    let st = period.moment.apply.format('YYYY/M');
    return st;
  };
  /**
   * セッションストレージから取得した値を簡易的にperiod形式に戻します。
   * 返すperiodはmomentを含んでいないので注意して下さい。
   * 「YYYY/MM-YYYY/MM」の形で記録されています
   * @see makeStorageYearMonth
   */
  var getPeriodFromStorage = function(strageVal) {
    if (strageVal === null || strageVal === void 0) return void 0;
    let a = strageVal.split('-');
    let period = {};
    let from = a[0].split('/'); //moment(a[0], 'YYYY/M');
    let to = a[1].split('/'); //moment(a[1], 'YYYY/M')
    period.from = {};
    period.from.year = from[0];
    period.from.month = from[1];
    period.to = {};
    period.to.year = to[0];
    period.to.month = to[1];
    return period;
  };
  ////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * 期間の選択から値を取得して連想配列に詰めて返します。
   * 前後チェックのみ行います。
   * 前後チェックがNGな場合は何も返しません。
   *
   * period.from.year     例「2017」
   * period.from.month    例「5」
   * period.to.year       例「2018」
   * period.to.month      例「4」
   * period.moment.from   例「2017-05-01」のmomentオブジェクト
   * period.moment.to     例「2018-04-30(月末日)」のmomentオブジェクト
   */
  var getPeriodFromTo = function() {
    let applyYear = $('#select-year-apply').val();
    let applyMonth = $('#select-month-apply').val();
    /** if (toNumber(fromYear) > toNumber(toYear)) {
      return;
    }
    if (toNumber(fromYear) === toNumber(toYear) && toNumber(fromMonth) > toNumber(toMonth)) {
      return;
    } */
    let period = {};
    period.apply = {};
    period.apply.year = applyYear;
    period.apply.month = applyMonth;
    let apply = moment(period.apply.year + '-' + period.apply.month + '-' + 1, 'YYYY-M-D');
    period.moment = {};
    period.moment.apply = apply;
    return period;
  };
  /**
   * 期間のチェックをします。
   * NGなものがあった場合、エラーメッセージを配列に格納します。
   * チェック内容は以下を全て行います。
   *  1.前後チェック
   *  2.期間(1年以内)
   *
   * @return true: 期間は有効です
   *        false: 期間指定にエラーがあります
   * @param errorMsgListDest:エラーがあった時にエラーを示す文字列を格納する配列
   */
  var checkPeriod = function(period, errorMsgListDest) {
    if (errorMsgListDest === void 0) {
      errorMsgListDest = [];
    }
    if (period === void 0) {
      errorMsgListDest.push('終了年月は開始年月以降を指定してください。');
      return false;
    }
    let maxMoment = period.moment.from.clone();
    maxMoment.add(1, 'years');

    if (!maxMoment.isAfter(period.moment.to)) {
      errorMsgListDest.push('期間の範囲は1年以内を指定してください。');
    }

    if (errorMsgListDest.length > 0) return false;
    return true;
  }

  /**
   * 担当者一覧の取得
   *
   * 期間指定がない場合は、登録されている全担当者を取得します。
   * whereOptionが存在する場合は、値が存在する場合、以下の絞込みを行います
   *   keyword.charge:キーワードによる絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getPersonOfChargeList = function(period, whereOption, period2) {
    let isAllList = (period === void 0);
    let querySt = ' order by 担当者コード asc ';
    if (!isAllList) {
      // 絞り込み条件がある場合
      if (whereOption) {
        if (whereOption.keyword && whereOption.keyword.charge) {
          if (whereOption.keyword.charge.length > 0) {
            querySt = ' and (' + makeWhereString('担当者コード', 'or', '=', whereOption.keyword.charge) + ') ' +
              querySt;
          } else {
            // 1件も対象にない場合は、1件も引っかからないようにする。
            querySt = ' and (担当者コード = "") ' +
              querySt;
          }
        }
      }
      // 期間での絞り込み条件
      let fromDate = makeFromDateSt(period.from.year, period.from.month);
      let toDate = makeToDateSt(period.to.year, period.to.month);
      let periodSt = '((入社日 != "" and 入社日 <= "' + toDate + '") and ' +
        '(退社日 = "" or 退社日 >= "' + fromDate + '")) ';
      if (period2) {
        let fromDate2 = makeFromDateSt(period2.from.year, period2.from.month);
        let toDate2 = makeToDateSt(period2.to.year, period2.to.month);
        periodSt = '(' + periodSt + ' or ((入社日 != "" and 入社日 <= "' + toDate2 + '") and ' +
          '(退社日 = "" or 退社日 >= "' + fromDate2 + '"))) ';
      }
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_PERSON_OF_CHARGE_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = {};
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        rec[records[ix]['担当者コード'].value] = {
          name: records[ix]['担当者名'].value,
          hourReward: records[ix]['担当者時給'].value, // 時給
          periodStart: records[ix]['入社日'].value,
          periodEnd: records[ix]['退社日'].value,
        };
      }
      if (isAllList) {
        //全リストを取得した場合はこちらに入れる
        myVal.ALL_SRC_LIST_PERSON_OF_CHARGE = resp.records;
        myVal.ALL_LIST_PERSON_OF_CHARGE = rec;
      }
      myVal.SRC_LIST_PERSON_OF_CHARGE = resp.records;
      myVal.LIST_PERSON_OF_CHARGE = rec;
      return Promise.resolve(resp);
    });
  }

  /**
   * 仕入予算一覧の取得
   *
   * 期間指定がない場合は、登録されている全予算を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getPurchaseBudgetList = function(period, whereOption, period2) {
    let isAllList = (period === void 0);
    let querySt = ' 予算種別 in ("仕入") order by 品種コード asc, 対象年月 asc ';
    if (!isAllList) {
      // 期間の絞り込み
      let fromDate = makeFromPreDateSt(period.moment.apply);
      let toDate = makeToNxDateSt(period.moment.apply);
      let lastFromDate = makeFromLastPreDateSt(period.moment.apply);
      let lastToDate = makeToLastNxDateSt(period.moment.apply);
      let periodSt = '((対象年月 <= "' + toDate + '" and ' + '対象年月 >= "' + fromDate
        + '") or (対象年月 <= "' + lastToDate + '" and 対象年月 >= "' + lastFromDate + '")) and ';
      if (period2) {
         // let fromDate2 = makeFromDateSt(period2.from.year, period2.from.month);
         // let toDate2 = makeToDateSt(period2.to.year, period2.to.month);
         // periodSt = '(' + periodSt +  'or ((契約開始日 != "" and 契約開始日 <= "' + toDate2 + '") and ' +
        //     '(契約完了日 = "" or 契約完了日 >= "' + fromDate2 + '"))) and ';
      }
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_BUDGET_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = [];
      let prcd = "";
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        prcd = makeYearMonthSt(records[ix]['対象年月'].value);
        rec[ix] = {
          month: prcd, // 対象年月
          code: records[ix]['品種コード'].value, // 品種コード
          name: records[ix]['品種名'].value, // 品種名
          plweight: records[ix]['計画重量'].value, // 計画重量
          plPrice: records[ix]['計画金額'].value, // 計画金額
          psweight: records[ix]['予定重量'].value, // 予定重量
          psPrice: records[ix]['予定金額'].value, // 予定金額
          ppweight: records[ix]['実績見込み重量'].value, // 見込重量
          ppPrice: records[ix]['実績見込み金額'].value // 見込金額
        };
      }
      console.log(rec);
      if (isAllList) {
        myVal.ALL_LIST_PURCHASE_BUDGET = rec;
        myVal.ALL_SRC_LIST_PURCHASE_BUDGET = records;
      }
      myVal.LIST_PURCHASE_BUDGET = rec;
      myVal.SRC_LIST_PURCHASE_BUDGET = records;
      return Promise.resolve(rec);
    });
  };

  /**
   * 生産予算一覧の取得
   *
   * 期間指定がない場合は、登録されている全予算を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getProductBudgetList = function(period, whereOption, period2) {
    let isAllList = (period === void 0);
    let querySt = ' 予算種別 in ("生産") order by 品種コード asc, 対象年月 asc ';
    if (!isAllList) {
      // 期間の絞り込み
      let fromDate = makeFromPreDateSt(period.moment.apply);
      let toDate = makeToNxDateSt(period.moment.apply);
      let lastFromDate = makeFromLastPreDateSt(period.moment.apply);
      let lastToDate = makeToLastNxDateSt(period.moment.apply);
      let periodSt = '((対象年月 <= "' + toDate + '" and ' + '対象年月 >= "' + fromDate
        + '") or (対象年月 <= "' + lastToDate + '" and 対象年月 >= "' + lastFromDate + '")) and ';
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_BUDGET_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = [];
      let prcd = "";
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        prcd = makeYearMonthSt(records[ix]['対象年月'].value);
        rec[ix] = {
          month: prcd, // 対象年月
          code: records[ix]['品種コード'].value, // 品種コード
          name: records[ix]['品種名'].value, // 品種名
          plweight: records[ix]['計画重量'].value, // 計画重量
          plPrice: records[ix]['計画金額'].value, // 計画金額
          psweight: records[ix]['予定重量'].value, // 予定重量
          psPrice: records[ix]['予定金額'].value, // 予定金額
          ppweight: records[ix]['実績見込み重量'].value, // 見込重量
          ppPrice: records[ix]['実績見込み金額'].value // 見込金額
        };
      }
      console.log(rec);
      if (isAllList) {
        myVal.ALL_LIST_PRODUCT_BUDGET = rec;
        myVal.ALL_SRC_LIST_PRODUCT_BUDGET = records;
      }
      myVal.LIST_PRODUCT_BUDGET = rec;
      myVal.SRC_LIST_PRODUCT_BUDGET = records;
      return Promise.resolve(rec);
    });
  };

  /**
   * 販売予算一覧の取得
   *
   * 期間指定がない場合は、登録されている全予算を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getSalesBudgetList = function(period) {
    let isAllList = (period === void 0);
    let querySt = ' 予算種別 in ("売上高") order by 品種コード asc, 対象年月 asc ';
    if (!isAllList) {
      // 期間の絞り込み
      let fromDate = makeFromPreDateSt(period.moment.apply);
      let toDate = makeToNxDateSt(period.moment.apply);
      let lastFromDate = makeFromLastPreDateSt(period.moment.apply);
      let lastToDate = makeToLastNxDateSt(period.moment.apply);
      let periodSt = '((対象年月 <= "' + toDate + '" and ' + '対象年月 >= "' + fromDate
        + '") or (対象年月 <= "' + lastToDate + '" and 対象年月 >= "' + lastFromDate + '")) and ';
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_BUDGET_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = [];
      let prcd = "";
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        prcd = makeYearMonthSt(records[ix]['対象年月'].value);
        rec[ix] = {
          month: prcd, // 対象年月
          code: records[ix]['品種コード'].value, // 品種コード
          name: records[ix]['品種名'].value, // 品種名
          plweight: records[ix]['計画重量'].value, // 計画重量
          plPrice: records[ix]['計画金額'].value, // 計画金額
          psweight: records[ix]['予定重量'].value, // 予定重量
          psPrice: records[ix]['予定金額'].value, // 予定金額
          ppweight: records[ix]['実績見込み重量'].value, // 見込重量
          ppPrice: records[ix]['実績見込み金額'].value // 見込金額
        };
      }
      console.log(rec);
      if (isAllList) {
        myVal.ALL_LIST_SALES_BUDGET = rec;
        myVal.ALL_SRC_LIST_SALES_BUDGET = records;
      }
      myVal.LIST_SALES_BUDGET = rec;
      myVal.SRC_LIST_SALES_BUDGET = records;
      return Promise.resolve(rec);
    });
  };

  /**
   * 在庫予算一覧の取得
   *
   * 期間指定がない場合は、登録されている全予算を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getStockBudgetList = function(period, whereOption, period2) {
    let isAllList = (period === void 0);
    let querySt = ' 予算種別 in ("製品在庫") order by 品種コード asc, 対象年月 asc ';
    if (!isAllList) {
      // 期間の絞り込み
      let fromDate = makeFromPreDateSt(period.moment.apply);
      let toDate = makeToNxDateSt(period.moment.apply);
      let lastFromDate = makeFromLastPreDateSt(period.moment.apply);
      let lastToDate = makeToLastNxDateSt(period.moment.apply);
      let periodSt = '((対象年月 <= "' + toDate + '" and ' + '対象年月 >= "' + fromDate
        + '") or (対象年月 <= "' + lastToDate + '" and 対象年月 >= "' + lastFromDate + '")) and ';
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_BUDGET_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = [];
      let prcd = "";
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        prcd = makeYearMonthSt(records[ix]['対象年月'].value);
        rec[ix] = {
          month: prcd, // 対象年月
          code: records[ix]['品種コード'].value, // 品種コード
          name: records[ix]['品種名'].value, // 品種名
          plweight: records[ix]['計画重量'].value, // 計画重量
          plPrice: records[ix]['計画金額'].value, // 計画金額
          psweight: records[ix]['予定重量'].value, // 予定重量
          psPrice: records[ix]['予定金額'].value, // 予定金額
          ppweight: records[ix]['実績見込み重量'].value, // 見込重量
          ppPrice: records[ix]['実績見込み金額'].value // 見込金額
        };
      }
      console.log(rec);
      if (isAllList) {
        myVal.ALL_LIST_PRDSTOCK_BUDGET = rec;
        myVal.ALL_SRC_LIST_PRDSTOCK_BUDGET = records;
      }
      myVal.LIST_PRDSTOCK_BUDGET = rec;
      myVal.SRC_LIST_PRDSTOCK_BUDGET = records;
      return Promise.resolve(rec);
    });
  };

  /**
   * 仕入実績一覧の取得
   *
   * 期間指定がない場合は、登録されている全予算を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getPurchasePerformList = function(period, whereOption, period2) {
    let isAllList = (period === void 0);
    let querySt = ' order by 品種コード asc, 仕入日付 asc ';
    if (!isAllList) {
      // 期間の絞り込み
      let fromDate = makeFromPreDateSt(period.moment.apply);
      let toDate = makeToNxDateSt(period.moment.apply);
      let lastFromDate = makeFromLastPreDateSt(period.moment.apply);
      let lastToDate = makeToLastNxDateSt(period.moment.apply);
      let periodSt = '(仕入日付 <= "' + toDate + '" and 仕入日付 >= "' + fromDate
        + '") or (仕入日付 <= "' + lastToDate + '" and 仕入日付 >= "' + lastFromDate + '")';
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_PURCHASE_PERFORM_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = [];
      let recas = [];
      let prcd = "";
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        prcd = makeYearMonthSt(records[ix]['仕入日付'].value);
        recas[ix] = {
          date: prcd, // 仕入日付
          code: records[ix]['品種コード'].value, // 品種コード
          name: records[ix]['品種名'].value, // 品種名
          prcweight: records[ix]['仕入重量'].value, // 仕入重量
          prclength: records[ix]['総ロール長'].value, // 総ロール長
          prcPrice: records[ix]['仕入価格'].value // 仕入価格
        };
      }
      // 同月同品種のものは集約する
      var sumrec = recas.reduce(function (result, current) {
        var element = result.find(function (p) {
          return p.date === current.date && p.code === current.code
        });
        if (element) {
          var ele1 = parseFloat(element.prcweight);
          element.prcweight = String(ele1 + parseFloat(current.prcweight));
          var ele2 = parseFloat(element.prclength);
          element.prclength = String(ele2 + parseFloat(current.prclength));
          var ele3 = parseFloat(element.prcPrice);
          element.prcPrice = String(ele3 + parseFloat(current.prcPrice));
        } else {
          result.push({
            date: current.date,
            code: current.code,
            prcweight: current.prcweight,
            prclength: current.prclength,
            prcPrice: current.prcPrice
          });
        }
        return result;
      }, []);
      console.log(sumrec);
      if (isAllList) {
        myVal.ALL_LIST_PURCHASE_PERFORM = sumrec;
        myVal.ALL_SRC_LIST_PURCHASE_PERFORM = records;
      }
      myVal.LIST_PURCHASE_PERFORM = sumrec;
      myVal.SRC_LIST_PURCHASE_PERFORM = records;
      return Promise.resolve(sumrec);
    });
  };

  /**
   * 生産実績一覧の取得
   *
   * 期間指定がない場合は、登録されている全予算を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getProductPerformList = function(period, prflg, whereOption) {
    let isAllList = (period === void 0);
    let querySt = ' order by 品種コード asc, 品番 asc, 生産日付 asc ';
    if (!isAllList) {
      // 期間の絞り込み
      let fromDate = "";
      let toDate = "";
      let periodSt = "";
      if (prflg) {
        // 対象月のみ
        fromDate = makeFromDateSt(period.apply.year, period.apply.month);
        toDate = makeToDateSt(period.apply.year, period.apply.month);
        periodSt = '(生産日付 <= "' + toDate + '" and ' + '生産日付 >= "' + fromDate + '")';
      } else {
        // 対象月前後３ヶ月
        fromDate = makeFromPreDateSt(period.moment.apply);
        toDate = makeToNxDateSt(period.moment.apply);
        let lastFromDate = makeFromLastPreDateSt(period.moment.apply);
        let lastToDate = makeToLastNxDateSt(period.moment.apply);
        periodSt = '(生産日付 <= "' + toDate + '" and 生産日付 >= "' + fromDate
          + '") or (生産日付 <= "' + lastToDate + '" and 生産日付 >= "' + lastFromDate + '")';
      }
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_PRODUCT_PERFORM_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = [];
      let recas = [];
      let prcd = "";
      let records = resp.records;
      // TODO ロス・歩留まり
      for (let ix = 0; ix < records.length; ix++) {
        prcd = makeYearMonthSt(records[ix]['生産日付'].value);
        recas[ix] = {
          date: prcd, // 生産日付
          code: records[ix]['品番'].value, // 品番
          type: records[ix]['品種コード'].value, // 品種コード
          rank: records[ix]['等級コード'].value, // 等級コード
          mtrweight: records[ix]['母材重量'].value, // 母材重量
          prdweight: records[ix]['製品重量'].value, // 製品重量
          prdnum: records[ix]['本数'].value, // 本数
          prdhour: records[ix]['稼働時間'].value, // 稼働時間
          prdstop: records[ix]['停止時間'].value, // 停止時間
          prdlength: records[ix]['総ロール長'].value // 総ロール長
        };
      }
      // 同月同品種のものは集約する
      var sumrec = recas.reduce(function (result, current) {
        var element = result.find(function (p) {
          return p.date === current.date && p.type === current.type && p.rank === current.rank
        });
        if (element) {
          var ele1 = parseFloat(element.mtrweight);
          element.mtrweight = String(ele1 + parseFloat(current.mtrweight));
          var ele2 = parseFloat(element.prdweight);
          element.prdweight = String(ele2 + parseFloat(current.prdweight));
          var ele3 = parseFloat(element.prdlength);
          element.prdlength = String(ele3 + parseFloat(current.prdlength));
          var ele4 = parseFloat(element.prdnum);
          element.prdnum = String(ele4 + parseFloat(current.prdnum));
          var ele5 = parseFloat(element.prdhour);
          element.prdhour = String(ele5 + parseFloat(current.prdhour));
          var ele6 = parseFloat(element.prdstop);
          element.prdstop = String(ele6 + parseFloat(current.prdstop));
        } else {
          result.push({
            date: current.date,
            type: current.type,
            rank: current.rank,
            mtrweight: current.mtrweight,
            prdweight: current.prdweight,
            prdnum: current.prdnum,
            prdhour: current.prdhour,
            prdstop: current.prdstop,
            prdlength: current.prdlength
          });
        }
        return result;
      }, []);
      console.log(sumrec);
      // 同月のものは集約する（稼働状況向け）
      var totalrec = recas.reduce(function (result, current) {
        var element = result.find(function (p) {
          return p.date === current.date
        });
        if (element) {
          var ele1 = parseFloat(element.mtrweight);
          element.mtrweight = String(ele1 + parseFloat(current.mtrweight));
          var ele2 = parseFloat(element.prdweight);
          element.prdweight = String(ele2 + parseFloat(current.prdweight));
          var ele3 = parseFloat(element.prdlength);
          element.prdlength = String(ele3 + parseFloat(current.prdlength));
          var ele4 = parseFloat(element.prdnum);
          element.prdnum = String(ele4 + parseFloat(current.prdnum));
          var ele5 = parseFloat(element.prdhour);
          element.prdhour = String(ele5 + parseFloat(current.prdhour));
          var ele6 = parseFloat(element.prdstop);
          element.prdstop = String(ele6 + parseFloat(current.prdstop));
        } else {
          result.push({
            date: current.date,
            type: current.type,
            rank: current.rank,
            mtrweight: current.mtrweight,
            prdweight: current.prdweight,
            prdnum: current.prdnum,
            prdhour: current.prdhour,
            prdstop: current.prdstop,
            prdlength: current.prdlength
          });
        }
        return result;
      }, []);
      console.log(totalrec);
      if (isAllList) {
        myVal.ALL_LIST_PRODUCT_PERFORM = sumrec;
        myVal.ALL_LIST_PLANT_PERFORM = totalrec;
        myVal.ALL_SRC_LIST_PRODUCT_PERFORM = records;
      }
      myVal.LIST_PRODUCT_PERFORM = sumrec;
      myVal.LIST_PLANT_PERFORM = totalrec;
      myVal.SRC_LIST_PRODUCT_PERFORM = records;
      return Promise.resolve(rec);
    });
  };

  /**
   * 販売実績一覧の取得
   *
   * 期間指定がない場合は、登録されている全予算を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getSalesPerformList = function(period, prflg, whereOption) {
    let isAllList = (period === void 0);
    let querySt = ' order by 品種コード asc, 販売日付 asc ';
    if (!isAllList) {
      // 期間の絞り込み
      let fromDate = "";
      let toDate = "";
      let periodSt = "";
      if (prflg) {
        // 対象月のみ
        fromDate = makeFromDateSt(period.apply.year, period.apply.month);
        toDate = makeToDateSt(period.apply.year, period.apply.month);
        periodSt = '(販売日付 <= "' + toDate + '" and ' + '販売日付 >= "' + fromDate + '")';
      } else {
        // 対象月前後３ヶ月
        fromDate = makeFromPreDateSt(period.moment.apply);
        toDate = makeToNxDateSt(period.moment.apply);
        let lastFromDate = makeFromLastPreDateSt(period.moment.apply);
        let lastToDate = makeToLastNxDateSt(period.moment.apply);
        periodSt = '(販売日付 <= "' + toDate + '" and 販売日付 >= "' + fromDate
          + '") or (販売日付 <= "' + lastToDate + '" and 販売日付 >= "' + lastFromDate + '")';
      }
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_SALES_PERFORM_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = [];
      let recas = [];
      let prcd = "";
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        prcd = makeYearMonthSt(records[ix]['販売日付'].value);
        recas[ix] = {
          date: prcd, // 販売日付
          code: records[ix]['品番'].value, // 品番
          type: records[ix]['品種コード'].value, // 品種コード
          rank: records[ix]['等級コード'].value, // 等級コード
          name: records[ix]['品種名'].value, // 品種名
          salweight: records[ix]['販売重量'].value, // 販売重量
          sallength: records[ix]['総ロール長'].value, // 総ロール長
          salPrice: records[ix]['販売価格'].value // 販売価格
        };
      }
      // 同月同品種のものは集約する
      var sumrec = recas.reduce(function (result, current) {
        var element = result.find(function (p) {
          return p.date === current.date && p.type === current.type && p.rank === current.rank
        });
        if (element) {
          var ele1 = parseFloat(element.salweight);
          element.salweight = String(ele1 + parseFloat(current.salweight));
          var ele2 = parseFloat(element.sallength);
          element.sallength = String(ele2 + parseFloat(current.sallength));
          var ele3 = parseFloat(element.salPrice);
          element.salPrice = String(ele3 + parseFloat(current.salPrice));
        } else {
          result.push({
            date: current.date,
            type: current.type,
            rank: current.rank,
            salweight: current.salweight,
            sallength: current.sallength,
            salPrice: current.salPrice
          });
        }
        return result;
      }, []);
      console.log(sumrec);
      if (isAllList) {
        myVal.ALL_LIST_SALES_PERFORM = sumrec;
        myVal.ALL_SRC_LIST_SALES_PERFORM = records;
      }
      myVal.LIST_SALES_PERFORM = sumrec;
      myVal.SRC_LIST_SALES_PERFORM = records;
      return Promise.resolve(sumrec);
    });
  };

/**
 * 販売実績一覧の取得(顧客別)
 *
 * 期間指定がない場合は、登録されている全予算を取得します。
 * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
 *   keyword.customer:キーワードによる絞り込み
 *   mainChargeCustomers:「主担当のみ」による絞り込み
 *
 * @param period 期間指定(オプション)
 * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
 * @param period2 2つ目の期間指定(オプション)
 *
 * @see makeWhereOption
 * @see getPeriodFromTo
 */
var getSalesCustomerList = function(period, prflg, whereOption) {
  let isAllList = (period === void 0);
  let querySt = ' order by 得意先コード asc, 品種コード asc, 品番 asc, 販売日付 asc ';
  if (!isAllList) {
    // 期間の絞り込み
    let fromDate = "";
    let toDate = "";
    let periodSt = "";
    if (prflg) {
      // 対象月のみ
      fromDate = makeFromDateSt(period.apply.year, period.apply.month);
      toDate = makeToDateSt(period.apply.year, period.apply.month);
      periodSt = '(販売日付 <= "' + toDate + '" and ' + '販売日付 >= "' + fromDate + '")';
    } else {
      // 対象月前後３ヶ月
      fromDate = makeFromPreDateSt(period.moment.apply);
      toDate = makeToNxDateSt(period.moment.apply);
      let lastFromDate = makeFromLastPreDateSt(period.moment.apply);
      let lastToDate = makeToLastNxDateSt(period.moment.apply);
      periodSt = '(販売日付 <= "' + toDate + '" and 販売日付 >= "' + fromDate
        + '") or (販売日付 <= "' + lastToDate + '" and 販売日付 >= "' + lastFromDate + '")';
    }
    querySt = periodSt + querySt;
  }
  return kintoneUtility.rest.getAllRecordsByQuery({
    app: emxasConf.getConfig('APP_SALES_PERFORM_LIST'),
    query: querySt,
    isGuest: true
  }).then(function(resp) {
    let recas = [];
    let prcd = "";
    let records = resp.records;
    // TODO 販売数量
    for (let ix = 0; ix < records.length; ix++) {
      prcd = makeYearMonthSt(records[ix]['販売日付'].value);
      recas[ix] = {
        date: prcd, // 販売日付
        code: records[ix]['品番'].value, // 品番
        type: records[ix]['品種コード'].value, // 品種コード
        rank: records[ix]['等級コード'].value, // 等級コード
        name: records[ix]['品種名'].value, // 品種名
        cstcode: records[ix]['得意先コード'].value, // 得意先コード
        cstname: records[ix]['得意先名'].value, // 得意先名
        salweight: records[ix]['販売重量'].value, // 販売重量
        sallength: records[ix]['総ロール長'].value, // 総ロール長
        salPrice: records[ix]['販売価格'].value // 販売価格
      };
    }
    // 同月同得意先同品種のものは集約する
    var sumrec = recas.reduce(function (result, current) {
      var element = result.find(function (p) {
        return p.date === current.date && p.cstcode === current.cstcode && p.code === current.code && p.rank === current.rank
      });
      if (element) {
        var ele1 = parseFloat(element.salweight);
        element.salweight = String(ele1 + parseFloat(current.salweight));
        var ele2 = parseFloat(element.sallength);
        element.sallength = String(ele2 + parseFloat(current.sallength));
        var ele3 = parseFloat(element.salPrice);
        element.salPrice = String(ele3 + parseFloat(current.salPrice));
      } else {
        result.push({
          date: current.date,
          cstcode: current.cstcode,
          cstname: current.cstname,
          code: current.code,
          name: current.name,
          type: current.type,
          rank: current.rank,
          salweight: current.salweight,
          sallength: current.sallength,
          salPrice: current.salPrice
        });
      }
      return result;
    }, []);
    console.log(sumrec);
    if (isAllList) {
      myVal.ALL_LIST_SALES_CUSTOMER = sumrec;
      myVal.ALL_SRC_LIST_SALES_CUSTOMER = records;
    }
    myVal.LIST_SALES_CUSTOMER = sumrec;
    myVal.SRC_LIST_SALES_CUSTOMER = records;
    return Promise.resolve(sumrec);
  });
};

  /**
   * 在庫実績一覧の取得
   *
   * 期間指定がない場合は、登録されている全予算を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getStockPerformList = function(period, whereOption, period2) {
    // TODO 仕入在庫の実装
    let isAllList = (period === void 0);
    let querySt = ' order by 品種コード asc, 生産日付 asc ';
    if (!isAllList) {
      // 期間の絞り込み
      let fromDate = makeFromPreDateSt(period.moment.apply);
      let toDate = makeToNxDateSt(period.moment.apply);
      let lastFromDate = makeFromLastPreDateSt(period.moment.apply);
      let lastToDate = makeToLastNxDateSt(period.moment.apply);
      let periodSt = '(生産日付 <= "' + toDate + '" and 生産日付 >= "' + fromDate
        + '") or (生産日付 <= "' + lastToDate + '" and 生産日付 >= "' + lastFromDate + '")';
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_PRDSTOCK_PERFORM_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = [];
      let recas = [];
      let prcd = "";
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        prcd = makeYearMonthSt(records[ix]['生産日付'].value);
        recas[ix] = {
          date: prcd, // 販売日付
          code: records[ix]['品番'].value, // 品番
          type: records[ix]['品種コード'].value, // 品種コード
          rank: records[ix]['等級コード'].value, // 等級コード
          name: records[ix]['品種名'].value, // 品種名
          stcweight: records[ix]['製品重量'].value, // 製品重量
          stclength: records[ix]['総ロール長'].value, // 総ロール長
          stcPrice: records[ix]['在庫評価価格'].value // 在庫評価価格
        };
      }
      // 同月同品種のものは集約する
      var sumrec = recas.reduce(function (result, current) {
        var element = result.find(function (p) {
          return p.date === current.date && p.type === current.type && p.rank === current.rank
        });
        if (element) {
          var ele1 = parseFloat(element.stcweight);
          element.stcweight = String(ele1 + parseFloat(current.stcweight));
          var ele2 = parseFloat(element.stclength);
          element.stclength = String(ele2 + parseFloat(current.stclength));
          var ele3 = parseFloat(element.stcPrice);
          element.stcPrice = String(ele3 + parseFloat(current.stcPrice));
        } else {
          result.push({
            date: current.date,
            type: current.type,
            rank: current.rank,
            stcweight: current.stcweight,
            stclength: current.stclength,
            stcPrice: current.stcPrice
          });
        }
        return result;
      }, []);
      console.log(sumrec);
      if (isAllList) {
        myVal.ALL_LIST_PRDSTOCK_PERFORM = sumrec;
        myVal.ALL_SRC_LIST_PRDSTOCK_PERFORM = records;
      }
      myVal.LIST_PRDSTOCK_PERFORM = sumrec;
      myVal.SRC_LIST_PRDSTOCK_PERFORM = records;
      return Promise.resolve(sumrec);
    });
  };

    /**
     * 稼働状況一覧の取得
     *
     * 期間指定がない場合は、登録されている全予算を取得します。
     * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
     *   keyword.customer:キーワードによる絞り込み
     *   mainChargeCustomers:「主担当のみ」による絞り込み
     *
     * @param period 期間指定(オプション)
     * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
     * @param period2 2つ目の期間指定(オプション)
     *
     * @see makeWhereOption
     * @see getPeriodFromTo
     */
    var getHumanPerformList = function(period, whereOption, period2) {
      let isAllList = (period === void 0);
      let querySt = ' order by 対象年月 asc ';
      if (!isAllList) {
        // 期間の絞り込み
        let fromDate = makeFromPreDateSt(period.moment.apply);
        let toDate = makeToNxDateSt(period.moment.apply);
        let periodSt = '(対象年月 <= "' + toDate + '" and ' + '対象年月 >= "' + fromDate + '")';
        querySt = periodSt + querySt;
      }
      return kintoneUtility.rest.getAllRecordsByQuery({
        app: emxasConf.getConfig('APP_HUMAN_PERFORM_LIST'),
        query: querySt,
        isGuest: true
      }).then(function(resp) {
        let recas = [];
        let prcd = "";
        let records = resp.records;
        for (let ix = 0; ix < records.length; ix++) {
          prcd = makeYearMonthSt(records[ix]['対象年月'].value);
          recas[ix] = {
            date: prcd, // 対象年月
            plworkDay: records[ix]['計画所定日数'].value, // 計画所定日数
            plworkHour: records[ix]['計画所定勤務時間'].value, // 計画所定勤務時間
            plplantDay: records[ix]['計画工場稼働日数'].value, // 計画工場稼働日数
            plplantHour: records[ix]['計画所定工場稼働時間'].value, // 計画所定工場稼働時間
            psworkDay: records[ix]['予定所定日数'].value, // 予定所定日数
            psworkHour: records[ix]['予定所定勤務時間'].value, // 予定所定勤務時間
            psplantDay: records[ix]['予定工場稼働日数'].value, // 予定工場稼働日数
            psplantHour: records[ix]['予定所定工場稼働時間'].value, // 予定所定工場稼働時間
            ppworkDay: records[ix]['実績見込み所定日数'].value, // 実績見込み所定日数
            ppworkHour: records[ix]['実績見込み所定勤務時間'].value, // 実績見込み所定勤務時間
            ppplantDay: records[ix]['実績見込み工場稼働日数'].value, // 実績見込み工場稼働日数
            ppplantHour: records[ix]['実績見込み所定工場稼働時間'].value, // 実績見込み所定工場稼働時間
            pfworkDay: records[ix]['実績所定日数'].value, // 実績所定日数
            pfworkHour: records[ix]['実績所定勤務時間'].value, // 実績所定勤務時間
            pfplantDay: records[ix]['実績工場稼働日数'].value, // 実績工場稼働日数
            pfplantHour: records[ix]['実績所定工場稼働時間'].value // 実績所定工場稼働時間
          };
        }
        console.log(recas);
        if (isAllList) {
          myVal.ALL_LIST_HUMAN_PERFORM = recas;
          myVal.ALL_SRC_LIST_HUMAN_PERFORM = records;
        }
        myVal.LIST_HUMAN_PERFORM = recas;
        myVal.SRC_LIST_HUMAN_PERFORM = records;
        return Promise.resolve(recas);
      });
    };



  /**
   * 顧客一覧の取得
   *
   * 期間指定がない場合は、登録されている全顧客を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getCustomerList = function(period, whereOption, period2) {
    let isAllList = (period === void 0);
    let querySt = ' order by ３コード asc ';
    if (!isAllList) {

      // オプションで絞り込まれる場合の設定
      if (whereOption) {
        // ３コードによる絞り込み
        if (whereOption.keyword && whereOption.keyword.customer) {
          if (whereOption.keyword.customer.length > 0) {
            querySt = ' (' +
              makeWhereString('３コード', 'or', '=', whereOption.keyword.customer) + ') ' +
              querySt;
          } else {
            // 1件も対象にない場合は、1件も引っかからないようにする。
            querySt = ' (３コード = "") ' +
              querySt;
          }
        }
        // 「主担当のみ」による絞り込み
        if (whereOption.mainChargeCustomers) {
          if (whereOption.mainChargeCustomers.length > 0) {
            querySt = ' (' +
              makeWhereString('３コード', 'or', '=', whereOption.mainChargeCustomers) + ') ' +
              querySt;
          } else {
            // 1件も対象にない場合は、1件も引っかからないようにする。
            querySt = ' (３コード = "") ' +
              querySt;
          }
        }
      }
      // 期間の絞り込み不可 MDSJでは顧客に契約期間を設けていない
      let periodSt = '';
      // let fromDate = makeFromDateSt(period.from.year, period.from.month);
      // let toDate = makeToDateSt(period.to.year, period.to.month);
      // let periodSt = '((契約開始日 != "" and 契約開始日 <= "' + toDate + '") and ' +
      //         '(契約完了日 = "" or 契約完了日 >= "' + fromDate + '")) ';
      // if (period2) {
      //     let fromDate2 = makeFromDateSt(period2.from.year, period2.from.month);
      //     let toDate2 = makeToDateSt(period2.to.year, period2.to.month);
      //     periodSt = '(' + periodSt +  'or ((契約開始日 != "" and 契約開始日 <= "' + toDate2 + '") and ' +
      //         '(契約完了日 = "" or 契約完了日 >= "' + fromDate2 + '"))) ';
      //
      // }
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_CUSTOMER_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec = {};
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        let chargeCode = '';
        if (records[ix]['主担当者'].length > 0) {
          chargeCode = records[ix]['主担当者'].value[0].code
        }
        rec[records[ix]['３コード'].value] = {
          name: records[ix]['顧客名'].value,
          // reward: records[ix]['月額報酬額'].value,
          // periodStart: records[ix]['契約開始日'].value,
          // periodEnd: records[ix]['契約完了日'].value,
          chargeCode: chargeCode // 主担当者コード
        };
      }
      if (isAllList) {
        myVal.ALL_LIST_CUSTOMER = rec;
        myVal.ALL_SRC_LIST_CUSTOMER = records;
      }
      myVal.LIST_CUSTOMER = rec;
      myVal.SRC_LIST_CUSTOMER = records;
      return Promise.resolve(rec);
    });
  };

  /**
   * 受注済み案件一覧の取得
   *
   * 期間指定がない場合は、登録されている全顧客を取得します。
   * whereOptionが存在する場合は、各値が存在する場合、以下の絞込みを行います
   *   keyword.customer:キーワードによる絞り込み
   *   mainChargeCustomers:「主担当のみ」による絞り込み
   *
   * @param period 期間指定(オプション)
   * @param whereOption makeWhereOption()で取得したオプションオブジェクト(オプション)
   * @param period2 2つ目の期間指定(オプション)
   *
   * @see makeWhereOption
   * @see getPeriodFromTo
   */
  var getOrderedMatterList = function(period, whereOption, period2) {
    let isAllList = (period === void 0);
    let querySt = ' order by 案件番号 asc ';
    if (!isAllList) {

      // オプションで絞り込まれる場合の設定
      if (whereOption) {
        // ３コードによる絞り込み
        if (whereOption.keyword && whereOption.keyword.customer) {
          if (whereOption.keyword.customer.length > 0) {
            querySt = ' and (' +
              makeWhereString('３コード', 'or', '=', whereOption.keyword.customer) + ') ' +
              querySt;
          } else {
            // 1件も対象にない場合は、1件も引っかからないようにする。
            querySt = ' and (３コード = "") ' +
              querySt;
          }
        }
        // 「主担当のみ」による絞り込み
        if (whereOption.mainChargeCustomers) {
          if (whereOption.mainChargeCustomers.length > 0) {
            querySt = ' and (' +
              makeWhereString('３コード', 'or', '=', whereOption.mainChargeCustomers) + ') ' +
              querySt;
          } else {
            // 1件も対象にない場合は、1件も引っかからないようにする。
            querySt = ' and (３コード = "") ' +
              querySt;
          }
        }
      }
      // 期間の絞り込み
      let fromDate = makeFromDateSt(period.from.year, period.from.month);
      let toDate = makeToDateSt(period.to.year, period.to.month);
      let periodSt = '((契約期間開始 != "" and 契約期間開始 <= "' + toDate + '") and ' +
        '(契約期間終了 = "" or 契約期間終了 >= "' + fromDate + '")) ';
      if (period2) {
        let fromDate2 = makeFromDateSt(period2.from.year, period2.from.month);
        let toDate2 = makeToDateSt(period2.to.year, period2.to.month);
        periodSt = '(' + periodSt + 'or ((契約期間開始 != "" and 契約期間開始 <= "' + toDate2 + '") and ' +
          '(契約期間終了 = "" or 契約期間終了 >= "' + fromDate2 + '"))) ';

      }
      querySt = periodSt + querySt;
    }
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_ORDER_LIST'),
      query: querySt,
      isGuest: true
    }).then(function(resp) {
      let rec1 = [];
      let rec2 = [];
      let rec3 = [];
      let one = {};
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        // 受注済み案件管理から直接取って来るのでサブテーブル1行＝1レコードに加工する
        let projectCode = records[ix]['案件番号'].value;
        let projectName = records[ix]['受注済み案件名'].value;
        let customerCode = records[ix]['３コード'].value;
        for (let iy = 0; iy < records[ix]['売上管理表'].value.length; iy++) {
          let chargeCode = "";
          if (records[ix]['売上管理表'].value[iy].value['担当者'].value.length > 0) {
            chargeCode = records[ix]['売上管理表'].value[iy].value['担当者'].value[0].code;
          }
          let salesDate = makeYearMonthSt(records[ix]['売上管理表'].value[iy].value['売上月'].value);
          one[iy] = {
            project: projectCode, // 案件番号
            code: customerCode, // 3コード
            name: records[ix]['顧客名'].value,
            projectName: projectName, // 受注済み案件名
            reward: records[ix]['売上管理表'].value[iy].value['実績請求額'].value,
            period: salesDate, // 売上月
            chargeCode: chargeCode // 担当者コード
          };
          rec1.push(one[iy]);
          // 期間指定１がある場合、売上月と比較
          if (!isAllList) {
            let compDate = records[ix]['売上管理表'].value[iy].value['売上月'].value;
            let fromDate = makeFromDateSt(period.from.year, period.from.month);
            let toDate = makeToDateSt(period.to.year, period.to.month);
            if (compDate !== "" && compDate <= toDate && compDate >= fromDate) {
              rec2.push(one[iy]);
              // 更に期間指定２がある場合、売上月と比較
              if (period2) {
                let fromDate2 = makeFromDateSt(period2.from.year, period2.from.month);
                let toDate2 = makeToDateSt(period2.to.year, period2.to.month);
                if (compDate !== "" && compDate <= toDate2 && compDate >= fromDate2) {
                  rec3.push(one[iy]);
                }
              }
            }
          }
        }
        one = {};
      }
      if (isAllList) {
        myVal.ALL_LIST_MATTER = rec1;
        myVal.ALL_SRC_LIST_MATTER = records;
      }
      myVal.LIST_MATTER = rec1;
      if (!isAllList) {
        myVal.LIST_MATTER = rec2;
        if (period2) {
          myVal.LIST_MATTER = rec3;
        }
      }
      myVal.SRC_LIST_MATTER = records; // 期間絞り込み不可のため利用不可
      return Promise.resolve(rec1);
    });
  }

  /**
   * 業務分類一覧の取得
   *
   * 連想配列で、キーが区分コード、値が区分名称をLIST_BUSINESS_CATEGORYに格納
   * 元のrecordsは元のままの形でSRC_LIST_BUSINESS_CATEGORYに格納
   */
  var getBusinessCategoryList = function() {
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_BUSINESS_LIST'),
      query: ' order by 区分コード asc ',
      isGuest: true
    }).then(function(resp) {
      let rec = {};
      let records = resp.records;
      for (let ix = 0; ix < records.length; ix++) {
        rec[records[ix]['区分コード'].value] = records[ix]['区分名称'].value
      }
      myVal.LIST_BUSINESS_CATEGORY = rec;
      myVal.SRC_LIST_BUSINESS_CATEGORY = records;
      return Promise.resolve(rec);
    });
  }

  /**
   * 日報アプリのデータの取得
   * サブテーブルの1行＝1レコードに変更したレコードを返します。
   *
   * サブテーブルのデータに関わる絞り込みは、独自に絞込みを行います。
   * @param query     クエリ文字列
   * @param option    makeWhereOption()で取得したオプションオブジェクト
   *                  ※option.orderByは必ず存在するものと前提しています。
   *
   * @see makeWhereOption
   */
  var getDailyReportAppData = function(query, option) {
    return kintoneUtility.rest.getAllRecordsByQuery({
      app: emxasConf.getConfig('APP_DAILY_REPORT'),
      query: query,
      isGuest: true
    }).then(function(resp) {
      // 日報から直接取って来るのでサブテーブル1行＝1レコードに加工する
      let myRecord = [];
      for (let ix = 0; ix < resp.records.length; ix++) {
        let one = $.extend(true, {}, resp.records[ix]);
        one['年月'] = {
          value: makeYearMonthSt(one['日付'].value)
        };
        let chargeCode = resp.records[ix]['担当者'].value[0].code;
        for (let iy = 0; iy < resp.records[ix]['Table'].value.length; iy++) {
          let customerCode = resp.records[ix]['Table'].value[iy].value['３コード'].value;
          let categoryCode = resp.records[ix]['Table'].value[iy].value['区分コード'].value;
          let jobNumber = resp.records[ix]['Table'].value[iy].value['案件番号'].value;
          // 絞り込み(顧客未選択の工数を除く)
          if (option.expectNoCustomer) {
            // ３コードが空ではなく、存在する３コード→利用／そうでなければ不使用
            // 存在しない３コードの指定された日報登録行は弾く(期間内の有効な契約の３コードでの判定ではない)
            if (customerCode === '' || myVal.LIST_CUSTOMER[customerCode] === void 0) {
              //                                if (customerCode !== '' && myVal.LIST_CUSTOMER[customerCode] !== void 0){
              //                                    // 存在するので使用する
              //                                } else {
              continue;
            }
          }
          // 絞り込み(主担当先のみ)
          if (option.mainChargeCustomers) {
            if (option.mainChargeCustomers.indexOf(customerCode) < 0) {
              // 指定の３コード配列に存在しないものは排除
              continue;
            }
          }
          // キーワードの絞り込み
          if (option.keyword && option.keyword.customer) {
            // ３コードの絞り込みのみ対応(担当者コードの絞込みはクエリで対応)
            if (option.keyword.customer.indexOf(customerCode) < 0) {
              // 指定の３コード配列に存在しないものは排除
              continue;
            }
          }
          // 絞り込み(業務分類を個別に選択)
          if (option.duty) {
            if (option.duty.indexOf(categoryCode) < 0) {
              continue;
            }
          }
          // 日報用案件の投下時間は除外
          if (jobNumber === MDSJ_JOBNUMBER) {
            continue;
          }
          let tableOne = $.extend(true, {}, one);
          tableOne = $.extend(true, tableOne, resp.records[ix]['Table'].value[iy].value);
          let workMin = tableOne['投下時間'].value * 60;
          // インターン生の工数は半分で生産性に反映
          if (chargeCode === INTRN_CODE) {
            workMin = workMin * 0.5;
          }
          tableOne['作業時間_分'] = workMin;
          tableOne['人件費'] = Math.round(workMin * 100 / 60) / 100 * getManHourFee(chargeCode);
          // 1行分のデータを追加
          myRecord.push(tableOne);
        }
      }
      // 自前で並び替え(orderByの文字列(顧客/担当者コード)で昇順
      myRecord.sort(function(a, b) {
        if (option.orderBy === "３コード") {
          if (a[option.orderBy].value < b[option.orderBy].value) return -1;
          if (a[option.orderBy].value > b[option.orderBy].value) return 1;
          return 0;
        } else {
          if (a['担当者'].value[0].code < b['担当者'].value[0].code) return -1;
          if (a['担当者'].value[0].code > b['担当者'].value[0].code) return 1;
          return 0;
        }
      });

      return Promise.resolve(myRecord);
    });
  };

  /**
   * 担当者コードから担当者名を取得します。
   * リストが存在しない場合は、コードをそのまま返します。
   * リスト内に指定のコードに相当する名称がない場合は、SYS_VALUE_NOT_EXIST_NAMEを返します
   * 期間指定がある場合、その期間に在職している場合に担当者名を、在職していない場合はSYS_VALUE_NOT_EXIST_NAMEを返します
   *
   * @param chargeCode 担当者コード
   * @param period 期間指定
   *
   * @see getPeriodFromTo
   */
  var getChargeName = function(chargeCode, period) {
    let list = myVal.LIST_PERSON_OF_CHARGE;
    if (!list) {
      return chargeCode;
    }
    let val = list[chargeCode];
    if (val) {
      if (period === void 0) {
        return val.name;
      } else if (underContract(val, period)) {
        return val.name;
      }
    }
    return SYS_VALUE_NOT_EXIST_NAME;
  };

  /**
   * 指定の期間中に契約中であり、指定の担当者コードが主担当である３コードのリストを返します。
   * 期間の指定がない場合は例外を発生します
   *
   * @param chargeCode 担当者コード
   * @param period 例) {fromDate: '2017-01-01', toDate: '2018-04-30'}
   * @return 担当者コードの配列(空の配列の場合あり)
   */
  var getMainChargeCustomerCodeList = function(chargeCode, period) {
    if (!period) throw new Error('期間の指定がありません');
    let dest = [];
    // let list = myVal.ALL_SRC_LIST_CUSTOMER;
    // for (let ix = 0; ix < list.length; ix++) {
    //   if (list[ix]['主担当者'].value.length > 0) {
    //     if (list[ix]['主担当者'].value[0].code === chargeCode) {
    //       if ( havingContract(myVal.ALL_LIST_CUSTOMER[list[ix]['３コード'].value], period)) {
    // 契約期間チェックがある場合はこちら
    //       dest.push(list[ix]['３コード'].value);
    //       }
    //     }
    //   }
    // }
    let list = myVal.LIST_MATTER;
    for (let ix = 0; ix < list.length; ix++) {
      if (list[ix].chargeCode !== "" && list[ix].chargeCode === chargeCode) {
        let compDate = makeDateSt(list[ix].period);
        if (compDate !== "" && compDate <= period.toDate && compDate >= period.fromDate) {
          dest.push(list[ix].code);
        }
      }
    }

    dest = dest.filter((x, i, self) => self.indexOf(x) === i);
    return dest;
  }
  /**
   * 指定の文字列を含む(部分一致)３コードのリスト(配列)を返します。
   * 顧客名か３コードかのどちらかに指定の文字列が含まれているものを返します
   * @return ３コードの配列(空の配列の場合あり)
   */
  var getCustomerCodeListByBroadKeyword = function(keyword) {
    let dest = [];
    let list = myVal.ALL_SRC_LIST_CUSTOMER;
    for (let ix = 0; ix < list.length; ix++) {
      if (list[ix]['顧客名'].value.indexOf(keyword) >= 0 || list[ix]['３コード'].value.indexOf(keyword) >= 0) {
        dest.push(list[ix]['３コード'].value);
      }
    }

    return dest;
  };
  /**
   * 指定の文字列を含む(部分一致)担当者コードのリスト(配列)を返します。
   * 担当者名か担当者コードかのどちらかに指定の文字列が含まれているものを返します
   * @return 担当者コードの配列(空の配列の場合あり)
   */
  var getChargeCodeListByBroadKeyword = function(keyword) {
    let dest = [];
    let list = myVal.ALL_SRC_LIST_PERSON_OF_CHARGE;
    for (let ix = 0; ix < list.length; ix++) {
      if (list[ix]['担当者名'].value.indexOf(keyword) >= 0 || list[ix]['担当者コード'].value.indexOf(keyword) >= 0) {
        dest.push(list[ix]['担当者コード'].value);
      }
    }
    return dest;
  };

  /**
   * 指定の期間内で契約が有効で担当者の指定がない顧客全ての月額報酬の合計を返します。
   * @param period 例) {fromDate: '2017-01-01', toDate: '2018-04-30'}
   */
  var getNoChargeReward = function(period) {
    // 指定の期間の契約が有効な顧客のリスト
    // →報酬の有無
    // →担当者の有無
    let reward = '';
    for (let key in myVal.LIST_CUSTOMER) {
      let one = myVal.LIST_CUSTOMER[key];
      // 契約があり
      if (havingContract(one, period)) {
        // 月額報酬が存在
        let oneReward = toNumber(one.reward);
        if (one.reward && one.reward !== '' && oneReward > 0) {

          // 担当者が設定されていない
          // もしくは、担当者が設定されているけど、在職期間ではない
          let personData = myVal.ALL_LIST_PERSON_OF_CHARGE[one.chargeCode];
          if (!one.chargeCode || one.chargeCode === null || one.chargeCode === '' ||
            !underContract(personData, period)) {
            reward = toNumber(reward) + oneReward;
          }
        }
      }
    }
    return reward;
  }
  /**
   * 担当者コードから担当顧客(複数)の月額報酬額計を返します。
   * パラメータに３コードが存在する場合、その３コードのみの月額報酬を返します。
   * リストが存在しない場合は、''を返します。
   *
   * @param chargeCode 担当者コード
   * @param period 指定されている場合、契約が有効な場合のみ値を返します。
   *  periodの例) {fromDate: '2017-01-01', toDate: '2018-04-30'}
   * @param customerCode ３コード(指定の担当者の月額報酬のうち、指定の３コードの月額報酬のみを返します)
   */
  var getMainChargeCustomerReward = function(chargeCode, period, customerCode) {
    // 指定期間に有効な担当顧客のCodeの配列を取得
    // let customerCodeList = getMainChargeCustomerCodeList(chargeCode, period);
    // customerCodeの指定がある場合
    if (customerCode !== void 0) {
      // if (customerCodeList.indexOf(customerCode) < 0){
      //     return '';
      // }
      return getCustomerReward(customerCode, period);
    }

    // customerCodeの指定がない場合は月額報酬の合計を出す
    return getCustomerReward('', period, chargeCode);
    // let sum = '';
    // for (let ix = 0; ix < customerCodeList.length; ix++) {
    //     let reward = getCustomerReward(customerCodeList[ix], period);
    //     if (reward !== '' && toNumber(reward) > 0 ) {
    //         sum = toNumber(sum) + toNumber(reward);
    //     }
    // }
    // return sum;
  };
  /**
   * ３コードから顧客の月額報酬額を返します。
   * リストが存在しない場合は、''を返します。
   * @param period 指定されている場合、契約が有効な場合のみ値を返します。
   *  periodの例) {fromDate: '2017-01-01', toDate: '2018-04-30'}
   */
  var getCustomerReward = function(customerCode, period, chargeCode) {
    let list = myVal.LIST_MATTER;
    if (!list) {
      console.log('受注済み案件リストが取得されていません');
      return '';
    }
    let reward = 0;
    let compDate = '';
    if (customerCode !== "") {
      for (let ix = 0; ix < list.length; ix++) {
        if (list[ix].code === customerCode) {
          compDate = makeDateSt(list[ix].period);
          if (compDate !== "" && compDate <= period.toDate && compDate >= period.fromDate) {
            reward = toNumber(reward) + toNumber(list[ix].reward);
          }
        }
      }
    } else {
      for (let ix = 0; ix < list.length; ix++) {
        if (list[ix].chargeCode !== "" && list[ix].chargeCode === chargeCode) {
          compDate = makeDateSt(list[ix].period);
          if (compDate !== "" && compDate <= period.toDate && compDate >= period.fromDate) {
            reward = toNumber(reward) + toNumber(list[ix].reward);
          }
        }
      }
    }
    // MDSJでは顧客に契約期間を設けていない
    return reward * 1000;
  };
  /**
   * 指定の顧客情報は指定の期間に契約期間中が存在するか？
   * 指定期間内にわずかでも契約期間が存在したらtrueを返します。
   * @param period 例) {fromDate: '2017-01-01', toDate: '2018-04-30'}
   */
  var havingContract = function(customerHash, period) {
    // 顧客マスタに契約開始日/終了日が入力されていない場合がある TODO:要確認→確認中No.19
    if (customerHash.periodStart === null || customerHash.periodStart === '') return false;

    let customerStart = moment(customerHash.periodStart);
    let customerEnd;
    if (customerHash.periodEnd && customerHash.periodEnd !== '') {
      customerEnd = moment(customerHash.periodEnd);
    } else {
      customerEnd = moment();
    }
    // 顧客情報の開始日、終了日が1日/末日ではない場合があるので、月初月末を算出
    customerStart.date(1);
    customerEnd.date(customerEnd.daysInMonth());

    // チェックする期間と比較
    let pStart = moment(period.fromDate);
    let pEnd = moment(period.toDate);
    // 期間の始まりより顧客の終了日月末が後か、期間の終わりより顧客の開始日月初が前か
    return (customerEnd.diff(pStart) >= 0 && pEnd.diff(customerStart) >= 0);
  }

  /**
   * 指定の期間に指定の担当者は在職中か？
   * 指定期間内にわずかでも在職期間が存在したらtrueを返します。
   * @param period 例) {fromDate: '2017-01-01', toDate: '2018-04-30'}
   */
  var underContract = function(chargePersonHash, period) {
    let chargeStart = moment(chargePersonHash.periodStart);
    let chargeEnd;
    if (chargePersonHash.periodEnd && chargePersonHash.periodEnd !== '') {
      chargeEnd = moment(chargePersonHash.periodEnd);
    } else {
      chargeEnd = moment();
    }
    let pStart = moment(period.fromDate);
    let pEnd = moment(period.toDate);
    return (chargeEnd.diff(pStart) >= 0 && pEnd.diff(chargeStart) >= 0);
  }
  /**
   * ３コードから顧客名を取得します。
   * 顧客リストが存在しない場合は、コードをそのまま返します。
   * リスト内に指定のコードに相当する名称がない場合は、SYS_VALUE_NOT_EXIST_NAMEを返します
   * periodが指定されている場合、指定の期間内に契約が有効な顧客以外は、SYS_VALUE_NOT_EXIST_NAMEを返します。
   *
   * @param period 期間指定(オプション)
   * @see getPeriodFromTo
   */
  var getCustomerName = function(customerCode, period) {
    let list = myVal.LIST_CUSTOMER;
    if (!list) {
      console.log('顧客リストが取得されていません');
      return customerCode;
    }
    let val = list[customerCode];
    if (val) {
      // MDSJでは顧客に契約期間を設けていない
      return val.name;
      // if (period === void 0) {
      // 期間が無指定の場合
      //     return val.name;
      // } else if (havingContract(val, period)) {
      // 期間が指定されている場合は、期間内に有効な契約があればOK、無ければ存在しないと返す
      //     return val.name;
      // }
    }
    return SYS_VALUE_NOT_EXIST_NAME;
  };

  /**
   * 担当者コード、３コードを元に、指定顧客の主担当者かどうかを判定します。
   *
   * @param chargeCode 担当者コード
   * @param customerCode ３コード
   * @see isMainStaff
   */
  var isMainStaff = function(chargeCode, customerCode) {
    let customerData = myVal.ALL_LIST_CUSTOMER[customerCode];
    if (!customerData) {
      console.log('顧客データが存在しません：' + customerData);
    } else {
      if (customerData.chargeCode === chargeCode) {
        return true;
      }
    }
    return false;
  };

  /**
   * 担当者コードから、その人の時給を返します
   * 期間が指定されている場合、指定の期間に在職していない場合は0を返します。
   *
   * @param period 期間指定(オプション)
   * @see getPeriodFromTo
   */
  var getManHourFee = function(chargeCode, period) {
    let personData = myVal.ALL_LIST_PERSON_OF_CHARGE[chargeCode];
    if (!personData) {
      console.log('該当者が存在しません：' + chargeCode);
    } else {
      if (period === void 0) {
        return personData.hourReward;
      } else if (underContract(personData, period)) {
        return personData.hourReward;
      }
    }
    return 0;
  };

  /**
   * 業務分類の設定を取得します。
   *
   * 業務分類の絞り込み設定が「すべて」の場合、trueを返します。
   * 「個別に選択」の場合、チェックがONになっているもののコードのIDの配列を返します。
   * チェックONがひとつも存在しない場合には何も返しません。
   *
   * 業務分類の絞り込み設定の入力値が正常であるか否かは、戻り値が存在するか？で確認可能です。
   * 正常：「すべて」or「個別に選択」でひとつ以上のチェックが存在する
   */
  var getDutyOption = function() {
    let selectVal = $('input[type="radio"][name="duty-flg"]:checked').val();
    if (selectVal === 'all') {
      return true;
    }
    let checkedOption = $('input[name^="duty-check-"]:checked');
    if (checkedOption.size() === 0) {
      return;
    }

    // チェックがONのもののIDの配列を作成
    let options = [];
    for (let ix = 0; ix < checkedOption.length; ix++) {
      options.push($(checkedOption[ix]).val());
    }
    return options;
  };

  ///////////////////////////////// handsontable renderer //////////////////////////////////

  /**
   * 金額表示のレンダラー
   * 表示は「0,000」となります。
   * マイナス値の場合は、文字前のマイナスが△に、文字色は赤色になります。
   */
  var monetaryRenderer = function(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.NumericRenderer.apply(this, arguments);
    if (value !== null && value !== '' && value !== '' && !isNaN(Number(value))) {
      if (Number(value) < 0) {
        td.style.color = COLOR_MINUS;
        td.innerText = '△ ' + numbro(Number(value) * -1).format('0,0');
      } else {
        td.innerText = numbro(Number(value)).format('0,0');
      }
    }
    return colorRenderer(instance, td, row, col, prop, td.innerText, cellProperties);
    // return td;
  };

  /**
   * 工数表示のレンダラー
   * 表示は「0,000.00」となります。
   */
  var manHourRenderer = function(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.NumericRenderer.apply(this, arguments);
    if (value !== null && value !== '' && !isNaN(Number(value))) {
      td.innerText = toManHourSt(value);
    }
    return colorRenderer(instance, td, row, col, prop, td.innerText, cellProperties);
    // return td;
  };

  /**
   * ％表示のレンダラー
   * 表示は「0.00 %」となります。
   */
  var percentageRenderer = function(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.NumericRenderer.apply(this, arguments);

    if (value !== null && value !== "" && !isNaN(Number(value))) {
      td.style.textAlign = 'right';
      if (Number(value) < 0) {
        td.style.color = COLOR_MINUS;
        td.innerText = '△ ' + toManHourSt(value * -1) + ' %';
      } else {
        td.innerText = toManHourSt(value) + ' %';
      }
    }
    return colorRenderer(instance, td, row, col, prop, td.innerText, cellProperties);
    // return td;
  };
  /**
   * 増減のレンダラー
   * 数値の色をプラスなら青、マイナスなら赤に着色だけをします。
   * 表示文字列のフォーマット変更が必要なら、これを呼んだ後のtdのinnerTextを変更して下さい。
   * このレンダラーは直接指定はしないで下さい。
   */
  var gainLossColorRenderer = function(instance, td, row, col, prop, value, cellProperties) {

    if (Number(value) < 0) {
      td.style.color = COLOR_LOSS;
    } else if (Number(value) > 0) {
      td.style.color = COLOR_GAIN;
    } else {}
    return td;
  };

  var colorRenderer = function(instance, td, row, col, prop, value, cellProperties) {
    td.innerText = (value === null ? "" : value);
    td.classList.add('htDimmed');
    return td;

    /** // 合計用の場合、何もしない
    if (instance.rootElement.id === 'total-grid') {
      return td;
    }

    // 同顧客／同担当者の場合、分けて表示する列の終わり
    let mergedColumnEnd;
    if (w2ui[TAB_NAME].active === '顧客別') {
      mergedColumnEnd = 7;
    } else {
      mergedColumnEnd = 4;
    }
    mergedColumnEnd = 7;
    if (col > mergedColumnEnd) {
      return td;
    }
    const upperRowCustomer = instance.getDataAtCell(row - 1, 0);
    const currentRowCustomer = instance.getDataAtCell(row, 0);
    const lowerRowCustomer = instance.getDataAtCell(row + 1, 0);

    // if (upperRowCustomer === currentRowCustomer) {
    //     td.style.color = "white";
    // }
    // 上の行と同じ顧客の場合、文字色と上のボーダーを消す
    if (upperRowCustomer === currentRowCustomer) {
      td.style.color = "white";
      td.style.borderTopStyle = "hidden";
    }

    // 下の行と同じ顧客の場合、文字色と下のボーダーを消す
    if (lowerRowCustomer === currentRowCustomer) {
      td.style.borderBottomStyle = "hidden";
    }

    return td;
    */
  };

  /**
   * 工数用の増減表示用レンダラー
   * 表示は「±0,000.00」となります。
   *
   * 数値の色はプラスなら青、マイナスなら赤に着色します。
   * マイナス値は△ではありません。
   */
  var manHourGainLossColorRenderer = function(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.NumericRenderer.apply(this, arguments);

    td.style.textAlign = 'right';
    if (value !== null && value !== "" && !isNaN(Number(value))) {
      td.style.textAlign = 'right';
      if (Number(value) <= 0) {
        td.innerText = toManHourSt(value);
      } else if (Number(value) > 0) {
        td.innerText = '+' + toManHourSt(value);
      }
    }
    //        console.log('工数増減render: value: '+ value + ' text:' + td.innerText);
    // 増減表示着色用のレンダラーを通す
    return gainLossColorRenderer(instance, td, row, col, prop, value, cellProperties);
  };

  /**
   * 金額表示の増減表示用レンダラー
   * 表示は「±0,000」となります。
   * 数値の色はプラスなら青、マイナスなら赤に着色します。
   */
  var monetaryGainLossRenderer = function(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.NumericRenderer.apply(this, arguments);

    td.style.textAlign = 'right';
    if (value !== null && value !== '' && value !== '' && !isNaN(Number(value))) {
      if (Number(value) > 0) {
        td.innerText = '+' + numbro(Number(value)).format('0,0');
      } else {
        td.innerText = numbro(Number(value)).format('0,0');
      }
    }
    //        console.log('金額増減render: value: '+ value + ' text:' + td.innerText);
    // 増減表示着色用のレンダラーを通す
    return gainLossColorRenderer(instance, td, row, col, prop, value, cellProperties);
  };

  /***** グラフ描画用のレンダラー *****/
  /**
   * 損益のプラスマイナス表示グラフ描画のレンダラー
   * グラフを指定している列ではなく、損益列のカラムのデータを元に棒グラフを表示します。
   * 「損益」列(列名指定)の値の絶対値での最大を±100％とし、プラスは右に、マイナスは左に棒グラフを表示します。
   * グラフ表示はcssに大きく依存しています。
   */
  var plusMinusProfitLossRenderer = function(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.HtmlRenderer.apply(this, arguments);

    let redPercent = 0;
    let bluePercent = 0;

    let colHeadList = instance.getColHeader();
    let valList = instance.getDataAtCol(colHeadList.indexOf('損益'));
    let val = valList[row];
    let max = Math.max.apply([], valList);
    let min = Math.min.apply([], valList);
    let maxAbs = Math.max(max, Math.abs(min));
    if (val !== null && val !== '' && val !== '' && !isNaN(Number(val))) {
      if (Number(val) > 0) {
        bluePercent = Math.round(Number(val) / maxAbs * 100 * 100) / 100;
      } else if (Number(val) === 0) {} else {
        redPercent = Math.round(Math.abs(Number(val)) / maxAbs * 100 * 100) / 100;
      }
    }
    let str = '<div class="graph-bar-box graph-bar-box-left">' +
      '<div class="graph-bar graph-bar-red" style="width: ' + redPercent + '%;">&nbsp;</div>' +
      '</div>' +
      '<div class="graph-bar-box graph-bar-box-right">' +
      '<div class="graph-bar graph-bar-blue" style="width: ' + bluePercent + '%;">&nbsp;</div>' +
      '</div>';
    td.innerHTML = str;

    return td;
  }
  /**
   * ひとつ前の列の値のプラスマイナス表示グラフ描画のレンダラー
   * グラフを指定している列のひとつ前の列のカラムのデータを元に棒グラフを表示します。
   * 参照列の値の絶対値での最大を±100％とし、プラスは右に、マイナスは左に棒グラフを表示します。
   * グラフ表示はcssに大きく依存しています。
   */
  var plusMinusRenderer = function(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.HtmlRenderer.apply(this, arguments);

    let redPercent = 0;
    let bluePercent = 0;

    let valList = instance.getDataAtCol(col - 1);
    let val = valList[row];
    let max = Math.max.apply([], valList);
    let min = Math.min.apply([], valList);
    let maxAbs = Math.max(max, Math.abs(min));
    if (val !== null && val !== '' && val !== '' && !isNaN(Number(val))) {
      if (Number(val) > 0) {
        bluePercent = Math.round(Number(val) / maxAbs * 100 * 100) / 100;
      } else if (Number(val) === 0) {} else {
        redPercent = Math.round(Math.abs(Number(val)) / maxAbs * 100 * 100) / 100;
      }
    }
    let str = '<div class="graph-bar-box graph-bar-box-left">' +
      '<div class="graph-bar graph-bar-red" style="width: ' + redPercent + '%;">&nbsp;</div>' +
      '</div>' +
      '<div class="graph-bar-box graph-bar-box-right">' +
      '<div class="graph-bar graph-bar-blue" style="width: ' + bluePercent + '%;">&nbsp;</div>' +
      '</div>';
    td.innerHTML = str;

    return td;
  }
  /**
   * ひとつ前の列の値のプラス表示グラフ描画のレンダラー
   * グラフを指定している列のひとつ前の列のカラムのデータを元に棒グラフを表示します。
   * 参照列の値の最大値の1.1倍を100％とし、棒グラフを表示します。
   * グラフ表示はcssに大きく依存しています。
   */
  var plusRenderer = function(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.HtmlRenderer.apply(this, arguments);

    let redPercent = 0;
    let bluePercent = 0;

    let valList = instance.getDataAtCol(col - 1);
    let val = valList[row];
    let max = Math.max.apply([], valList);
    if (val !== null && val !== '' && val !== '' && !isNaN(Number(val))) {
      if (Number(val) > 0) {
        bluePercent = Math.round(Number(val) / (max * 1.1) * 100 * 100) / 100;
      }
    }
    let str = '<div class="graph-bar-box graph-bar-box-full">' +
      '<div class="graph-bar graph-bar-blue" style="width: ' + bluePercent + '%;">&nbsp;</div>' +
      '</div>';
    td.innerHTML = str;

    return td;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////// 生産性、損益分析での集計計算 //////////////////////////////
  /**
   * 担当者別の当て込み集約をしてdataListDestに格納します
   * 基本、１ヶ月毎(periodで指定)にこれでデータを作成します。
   *
   * @param period 例) {fromDate: '2017-01-01', toDate: '2018-04-30'}
   * @see myVal.SRC_LIST_PERSON_OF_CHARGE 当て込み先(担当者)
   */
  var makeByChargeList = function(sourceList, dataListDest, period) {
    //
    let allList = myVal.SRC_LIST_PERSON_OF_CHARGE;
    // 存在しない担当者用の行
    let noCodeOne = {
      担当者名: DISP_VALUE_NOT_EXIST_CHARGE_NAME,
      no_code: true,
      // 指定の期間に報酬が存在するが担当者が指定されていない分を合計したもの
      報酬: getNoChargeReward(period),
    };

    // 当て込み処理
    for (let ix = 0, iy = 0; ix < allList.length; ix++) {
      let code = allList[ix]['担当者コード'].value
      if (dataListDest.length === ix) {
        // 現行分の1行分データを作成
        let one = {
          '担当者コード': code,
          '担当者名': getChargeName(code),
          報酬: getMainChargeCustomerReward(code, period),
          工数_分: '',
          工数: '',
          人件費: '', // アプリデータ
          年月: '', //debug用
          損益: '',
          時間あたり: '',
          利益率: ''
        }; // 計算結果格納用
        dataListDest.push(one);
      }
      // ソースデータを回す
      for (; iy < sourceList.length; iy++) {
        // 全行回す
        if (getChargeName(sourceList[iy]['担当者'].value[0].code, period) === SYS_VALUE_NOT_EXIST_NAME) {
          addWorkingHourPersonCost(sourceList[iy], [noCodeOne]);
        } else if (sourceList[iy]['担当者'].value[0].code !== code) {
          // 存在するコードだけどallリストの現行と不一致なら、allリストの次の行に
          break;
        } else {
          // コードが一致してるなら、加算
          addWorkingHourPersonCost(sourceList[iy], [dataListDest[ix]]);
        }
      }
    }
    // 担当者コードに該当する値を持たないレコードは、最後に追加
    dataListDest.push(noCodeOne);
  };
  /**
   * 顧客別の当て込み集約をしてdataListDestに格納します
   * @param period 指定されている場合、契約が有効な場合のみ値を返します。
   * @param option whereOptionオブジェクト（担当者選択時の条件を参照するため）
   * @see makeWhereOption
   * @see myVal.SRC_LIST_CUSTOMER 当て込み先(顧客)
   */
  var makeByCustomerList = function(sourceList, dataListDest, period, option) {
    // sourceList: 日報データ
    let allList = myVal.SRC_LIST_CUSTOMER;
    let noCodeOne = {
      顧客名: DISP_VALUE_NOT_EXIST_CUSTOMER_NAME,
      no_code: true
    };
    for (let ix = 0, iy = 0; ix < allList.length; ix++) {
      let code = allList[ix]['３コード'].value
      if (code == "") {
        console.log("未選択");
      }
      // 当顧客の月額報酬
      // 絞り込みで担当者を指定されている場合、担当者の月額報酬のみ。
      // 担当者を絞り込まれていない場合は、単にその顧客の月額報酬。
      let reward = '';
      if (option === void 0 || option.chargeId === void 0) {
        reward = getCustomerReward(code, period);
      } else {
        reward = getMainChargeCustomerReward(option.chargeId, period, code);
      }
      if (dataListDest.length === ix) {
        // 現行分の1行分データを作成
        let one = {
          '３コード': code,
          '顧客名': getCustomerName(code),
          '報酬': reward,
          '工数_分': '',
          '工数': '',
          '人件費': '', // アプリデータ
          '年月': '', // debug用
          '損益': '', // 計算結果格納用
          '時間あたり': '', // 計算結果格納用
          '利益率': '', // 計算結果格納用
          '担当者毎集計': {}
        };
        dataListDest.push(one);
      }
      // ソースデータを回す
      for (; iy < sourceList.length; iy++) {
        // 全行回す
        if (getCustomerName(sourceList[iy]['３コード'].value) === SYS_VALUE_NOT_EXIST_NAME) {
          // ３コードが存在しない or マスタに存在しないコードは専用のnoCodeOneに加算
          // (顧客未選択の工数を除く)場合はtotalに加算しない
          addWorkingHourPersonCost(sourceList[iy], [noCodeOne]);
        } else if (sourceList[iy]['３コード'].value !== code) {
          // 存在するコードだけどallリストの現行と不一致なら、allリストの次の行に
          break;
        } else {
          // コードが一致してるなら、加算
          addWorkingHourPersonCost(sourceList[iy], [dataListDest[ix]]);
        }
      }
    }
    // ３コードに該当する値を持たないレコードは、最後に追加
    dataListDest.push(noCodeOne);
  };

  /**
   * ソースデータを元に、生産性/損益分析のリストデータを作成する
   * 指定の顧客/担当者一覧に当て込む形でデータを作る
   * 指定のフィールドコードで寄せて合計する(渡されるsourceListは指定のフィールドコードでorder byされている)
   * ３コード未指定/該当コード顧客不在(有効期限外含む)、または該当担当者不在(有効期限外含む)の場合の合計行を追加
   *
   * @param sourceList 元データ
   * @param dataListDest  加工後のデータを格納する配列
   * @param codeName      データを寄せるのに使用するフィールドコード名
   * @param period        取得したデータの期間(当て込む顧客、担当者の有効期限の判定に使用)
   *                      ※ ここで用いるperiodは {fromDate: '2017-01-01', toDate: '2018-04-30'}
   *
   * @see myVal.SRC_LIST_CUSTOMER 当て込み先(顧客)
   * @see myVal.SRC_LIST_PERSON_OF_CHARGE 当て込み先(担当者)
   */
  var integrateOneMonthData = function(sourceList, dataListDest, codeName, period, option) {
    // 該当しないデータを纏める行用
    // データの集約
    if (codeName === '３コード') {
      makeByCustomerList(sourceList, dataListDest, period, option);
    } else { // 担当者コード
      makeByChargeList(sourceList, dataListDest, period, option);
    }
  };

  /**
   * 指定の期間のクエリを1ヶ月毎に実行して、それぞれ集約して配列にして返す
   * 集約は担当者毎/顧客毎のいずれかの集約で、codeName('担当者コード'/'３コード')で指定します。
   * 集約で当て込む先は、直前に検索された担当者/顧客リストです。
   *
   * @see makeWhereOption
   */
  var getOneMonthDailyReport = function(dest, query, whereOption, period, codeName, ix) {
    // let nowReadMonth = period.moment.from.clone();
    // nowReadMonth.add(ix, 'months');
    // if (moment(period.to.year + '-' + period.to.month + '-1', 'YYYY-M-D').diff(nowReadMonth, 'months') < 0) {
    //     return Promise.resolve(dest);
    // }
    // let p = {};// 期間
    // p.fromDate = makeFromDateSt(nowReadMonth.year(), (nowReadMonth.month() + 1));// month() 0～11
    // p.toDate = makeToDateSt(nowReadMonth.year(), (nowReadMonth.month() + 1));
    // let myQuery = ' 日付 >= "' + p.fromDate + '" ' +
    //             ' and 日付 <= "' + p.toDate + '" ' +
    //             query;

    // return getDailyReportAppData(myQuery, whereOption).then( function(resp) {
    //     let dataList = [];
    //     // ひと月分の集約
    //     integrateOneMonthData(resp, dataList, codeName, p, whereOption);
    //     dest.push(dataList);
    //     return getOneMonthDailyReport(dest, query, whereOption, period, codeName, ++ix);
    // });

    const promises = [];
    let nowReadMonth = period.moment.from.clone();
    for (; moment(period.to.year + '-' + period.to.month + '-1', 'YYYY-M-D').diff(nowReadMonth, 'months') >= 0; nowReadMonth.add(1, 'months')) {
      let p = {}; // 期間
      p.fromDate = makeFromDateSt(nowReadMonth.year(), (nowReadMonth.month() + 1)); // month() 0～11
      p.toDate = makeToDateSt(nowReadMonth.year(), (nowReadMonth.month() + 1));
      let myQuery = ' 日付 >= "' + p.fromDate + '" ' +
        ' and 日付 <= "' + p.toDate + '" ' +
        query;

      var promise = getDailyReportAppData(myQuery, whereOption).then(function(resp) {
        let dataList = [];
        // ひと月分の集約
        integrateOneMonthData(resp, dataList, codeName, p, whereOption);
        return dataList;
      });
      promises.push(promise);
    }
    console.log(promises);
    return kintone.Promise.all(promises).then(function(resp) {
      return resp;
    });
  }
  /************************************* 生産性/損益分析用メイン処理 ********************************************/
  var headerHot; /** ヘッダー上部行 */
  var hot; /** データ一覧 */
  var totalHot; /** 総合計行 */

  var dispViewId; /** 工数/人件費のどちらか？ */
  var gridVal;
  /**
   * グリッドに使用する値が設定されたものを、gridValに設定します
   * 画面表示の最初に1度呼び出してください。
   */
  var setGridVal = function(hash) {
    gridVal = hash;
  }

  /**
   * 生産性分析と損益分析のメイン表示
   */
  var doMainDisplay = function(viewId) {
    dispViewId = viewId;

    // 前表示で担当者選択があった場合の、担当者ID
    let chargeId = sessionStorage.getItem(myVal.SELECT_CHARGE_ID);
    console.log(' select id: ' + chargeId);
    // 期間をsessionStorageから取得
    let keepPeriod = sessionStorage.getItem(myVal.SELECT_PERIOD_YEARMONTH);
    let prePeriod = getPeriodFromStorage(keepPeriod);
    console.log(' select period: ' + keepPeriod);

    // 画面構成に必要なdivを用意
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'tab'));
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'condition'));
    $('#contents').append($('<div>').addClass('solo-row-block').addClass('search-button').attr('id', 'search-button'));
    $('#contents').append($('<div>').addClass('solo-row-block').attr('id', 'mybody')
      .append(
        $('<div>').attr('id', 'my-top-grid')
      ).append(
        $('<div>').attr('id', 'my-grid')
      ).append(
        $('<div>').attr('id', 'total-grid')
      ));

    // 画面描画物の構築
    // タブ (顧客別と担当者別)
    $('#tab').w2tabs({
      name: TAB_NAME,
      active: '顧客別',
      tabs: [{
          id: '顧客別',
          caption: '顧客別'
        },
        {
          id: '担当者別',
          caption: '担当者別'
        },
      ],
      onClick: function(event) {
        let period = getPeriodFromTo();
        let err = [];
        if (!checkPeriod(period, err)) {
          // 期間の前後が不正なので、期間は初期表示に変更
          $('#select-year-from').val(fromDate.year());
          $('#select-month-from').val(fromDate.month() + 1);
          $('#select-year-to').val(toDate.year());
          $('#select-month-to').val(toDate.month() + 1);
        }
        console.log('----- tab click event -----');
        console.log(event);
        if (event.object.text === '顧客別') {
          $('#op2').hide();
          $('#table-row-charge').show();
          gridVal.COL_WIDTH = (gridVal.COL_WIDTH_CUSTOMER ? gridVal.COL_WIDTH_CUSTOMER : gridVal.COL_WIDTH);
        } else {
          $('#op2').show();
          $('#table-row-charge').hide();
          gridVal.COL_WIDTH = (gridVal.COL_WIDTH_CHARGE ? gridVal.COL_WIDTH_CHARGE : gridVal.COL_WIDTH);
        }
        showListGrid(period, event.object.text);

      }
    });
    // 表示に必要なデータの取得
    kintone.Promise.all([
      getPersonOfChargeList(),
      getCustomerList(),
      getBusinessCategoryList()
    ]).then(function(responses) {
      let code = responses[2];
      // getPersonOfChargeList() .then(function() {
      //     return getCustomerList();
      // }).then(function() {
      //     return getBusinessCategoryList();
      // }).then(function(code) {
      // 絞り込み条件を描画
      makeConditionTable(code);

      // 担当者IDを持っていたら、担当者を選択
      if (chargeId && chargeId !== null && chargeId !== '') {
        $('select#select_charge').val(chargeId);
        $('input#ch1').prop('disabled', false);
      }
      if (prePeriod) {
        // 期間表示を変更
        $('#select-year-from').val(prePeriod.from.year);
        $('#select-month-from').val(prePeriod.from.month);
        $('#select-year-to').val(prePeriod.to.year);
        $('#select-month-to').val(prePeriod.to.month);
      }
      // 期間を取得
      let period = getPeriodFromTo();
      let err = [];
      if (!checkPeriod(period, err)) {
        alert(err);
        return;
      }
      // グリッドを表示
      showListGrid(period);

    }).catch(function(error) {
      alert('システムエラーが発生しました。' + error);
      console.log(error);
    });
  };

  /**
   * 絞り込み条件入力欄を表示
   */
  var makeConditionTable = function(businessCategoryList) {
    let chargeList = myVal.ALL_SRC_LIST_PERSON_OF_CHARGE;
    // 絞り込み条件の表示
    let toDate = moment();
    toDate.add(-1, 'months');
    let fromDate = moment(toDate);
    fromDate.add(-11, 'months');

    //$('#condition');
    let filter = $('<fieldset>').addClass('condition-fieldset').append($('<legend>').text('絞り込み'));
    let table = $('<table>').addClass('condition-table');
    // 担当者選択のSELECT作成
    let html1 = '<tr id="table-row-charge"><th>担当者</th><td colspan="3">' +
      '<select id="select_charge">' +
      '<option value="all">すべて表示</option>';
    for (let ix = 0; ix < chargeList.length; ix++) {
      html1 += '<option value="' + chargeList[ix]['担当者コード'].value + '">' + chargeList[ix]['担当者名'].value + '</option>';
    }
    html1 +=
      '</select>' +
      '<input type="checkbox" id="ch1" disabled></input><label for="ch1">主担当先のみ</label></td></tr>';
    let html2 = '<tr><th>期間</th><td>' +
      makeSelectYearMonth(fromDate.year(), fromDate.month() + 1, 'select-year-from', 'select-month-from').html() +
      '～' +
      makeSelectYearMonth(toDate.year(), toDate.month() + 1, 'select-year-to', 'select-month-to').html() +
      '<button id="button-pre-month">前月</button><button id="button-pre-year">直近1年間</button>' +
      '<input type="checkbox" id="ch2"></input><label for="ch2">2期比較</label></td>' +
      '<th>キーワード</th><td><input id="keyword" type="text"></input></td>' +
      '</tr>';

    let html3 = '<tr><th>業務分類</th><td colspan="3">' +
      '<div class="radio-duty-choice" id="">' +
      '<span class="radio-duty-choice-row" style="-ms-grid-row:1;"><input type="radio" name="duty-flg" id="r3" value="all"></input><label for="r3">すべて</label></span>' +
      '<span class="radio-duty-choice-row" style="-ms-grid-row:2;"><input type="radio" name="duty-flg" id="r4" value="choice"></input><label for="r4">個別に選択<span class="description">※こちらにチェックを入れると下に業務分類が表示されます。</span></label></span>' +
      '</div>' +
      '<fieldset id="duty-list" style="display: none;">' +
      '<input type="checkbox" class="menu" id="menu-all-check" checked onClick="this.checked=true;"><label for="menu-all-check">全て選択</label>' +
      '<input type="checkbox" class="menu" id="menu-all-check-clear" onClick="this.checked=false;"><label for="menu-all-check-clear">全て選択解除</label><br />';
    let cnt = 0;
    for (let key in businessCategoryList) {
      html3 += '<input type="checkbox" name="duty-check-' + key + '" value="' + key + '" id="duty-check-id-' + key + '" ><label for="duty-check-id-' + key + '">' + businessCategoryList[key] + '</label>';
      if (++cnt % 7 === 0) {
        html3 += '<br />';
      }
    }
    html3 += '</fieldset>' +
      '</td></tr>';

    let dispStr = (dispViewId == emxasConf.getConfig('VIEW_PRODUCTIVITY_ANALYSIS')) ? '工数' : '人件費';
    let html4 = '<tr><th>オプション</th><td colspan="3">' +
      '<div class="check-option-choice" id="">' +
      '<span id="op1" class="check-option-choice-row" style="-ms-grid-row:1;">' +
      '<input type="checkbox" id="ch3" checked></input><label for="ch3">報酬、' + dispStr + 'がないものを非表示にする</label></span>' +
      '<span id="op2" class="check-option-choice-row" style="-ms-grid-row:2;">' +
      '<input type="checkbox" id="ch4"></input><label for="ch4">顧客未選択の工数を除く</label></span>' +
      '</div>' +
      '</td></tr>';

    table.append($(html1)).append($(html2)).append($(html3)).append($(html4));
    filter.append(table);
    $('#condition').append(filter);

    // 「絞り込み」ボタン、「CSV出力」ボタン設置
    $('#search-button').append(
      $('<button>').attr('id', 'button-search').text('絞り込み'),
      $('<button>').attr('id', 'button-csv').text('CSV出力')
    );
    // 「CSV出力」ボタンに関するCSS
    $('#button-csv').css({
        "float": "right",
        "margin-right": "6px",
        "color": "black"
      }),
      // 「CSV出力」ボタンを<a>タグで囲む
      $('#button-csv').wrap('<a id="link-csv"></a>');

    //////////// Javascript動作設定 /////////////
    // ラジオボタンの選択で個別リストの表示/非表示
    $('input[type="radio"][name="duty-flg"]').change(function() {
      if ($(this).val() === 'all') {
        $('#duty-list').hide();
      } else {
        $('#duty-list').show();
      }
    });
    // 個別選択のチェックボックスの操作、全選択
    $('#menu-all-check').click(function() {
      $('input[type="checkbox"][name^="duty-check-"]').prop('checked', true);
    });
    // 個別選択のチェックボックスの操作、全クリア
    $('#menu-all-check-clear').click(function() {
      $('input[type="checkbox"][name^="duty-check-"]').prop('checked', false);
    });

    // 前月のボタン押下
    $('#button-pre-month').click(function() {
      $('#select-year-from').val(toDate.year());
      $('#select-month-from').val(toDate.month() + 1);
      $('#select-year-to').val(toDate.year());
      $('#select-month-to').val(toDate.month() + 1);
    });
    // 直近1年間のボタン押下
    $('#button-pre-year').click(function() {
      $('#select-year-from').val(fromDate.year());
      $('#select-month-from').val(fromDate.month() + 1);
      $('#select-year-to').val(toDate.year());
      $('#select-month-to').val(toDate.month() + 1);
    });
    // 担当者コンボボックスの選択を変更
    $('select#select_charge').change(function() {
      if ($(this).val() === 'all') {
        $('input#ch1').prop('disabled', true);
      } else {
        $('input#ch1').prop('disabled', false);
      }
    });

    // 「絞り込み」ボタン押下
    $('#button-search').click(function() {
      // 期間の前後チェック
      let period = getPeriodFromTo();
      let err = [];
      if (!checkPeriod(period, err)) {
        alert(err);
        return;
      }
      // 業務分類の検索条件取得
      let dutyOption = getDutyOption();
      if (!dutyOption) {
        alert('業務分類を選択してください。');
        return;
      }
      // グリッドを表示
      showListGrid(period);
    });

    // CSV出力
    $('#link-csv').click(function() {
      exportCSV();
    });


    //////////// Javascript動作設定 end /////////////

    //////////// 初期表示を設定 /////////////
    // 初期表示時の選択を実行
    // 業務分類「すべて」を選択
    $('#r3').prop('checked', true);
    // オプション「顧客未選択の工数を除く」を隠す
    $('#op2').hide();
    //////////// 初期表示を設定 end /////////////
  }

  /**
   * 仕入・生産タブ内のグリッドを表示します。
   * データは現在の条件で取得
   */
   var showPerformListGrid = function(period, type) {
     // エラー表示があったら削除
     $('#error_msg').remove();
     // CSV出力データクリア
     csvDataList = [];
     // 2期比較にチェックONか？
     if ($('#ch2').prop('checked')) {
       // 二期比較は違うロジック
       dispTowTerm(period, showType);
       // CSV出力用フラグ（2期比較）
       isComp = true;
     } else {
       // データを取得してグリッドに表示
       let showType = "予実比較";
       switch (type) {
         case "tab2":
           showType = "稼働状況";
           dispOneTermSecondTab(period, showType);
           break;
         case "tab3":
           showType = "品質状況";
           dispOneTermThirdTab(period, showType);
           break;
         case "tab4":
           showType = "Ｐ／Ｌ";
           break;
         default:
           dispOneTerm(period);
       }
       console.log(showType);
       // CSV出力用フラグ（2期比較ではない）
       isComp = false;
     }
   };

   /**
    * 製品別時間当たり収益のグリッドを表示します。
    * データは現在の条件で取得
    */
    var showPerhourListGrid = function(period, type) {
      // エラー表示があったら削除
      $('#error_msg').remove();
      // CSV出力データクリア
      csvDataList = [];
      // データを取得してグリッドに表示
      console.log('------- dispPerhour --------');
      // データ取得
      let prflg = true;
      getProductPerformList(period, prflg).then(function() {
        let purList = [];
        let proList = [];
        // 生産実績、販売実績どちらも1件以上あれば、次へ。
    　  if (Object.keys(myVal.LIST_PRODUCT_PERFORM).length > 0 && Object.keys(myVal.LIST_SALES_PERFORM).length > 0) {
    　    return getPurhourReport(period, purList);
    　  } else {
  　      // 生産実績＆販売実績が共に1件以上存在しない場合は、分析対象が存在しないので、ここでデータ取得は離脱
　        return Promise.reject('分析対象が存在しません。');
　      }
      }).then(function(resp) {
        //////// 取得データの加工 ////////
        // 製品別時間当たり収益項目の計算
        let dataList = [];
        getPerhourCulculateList(resp, dataList);
        ////// 取得データの加工 end //////
        if (dataList.length < 1) {
          return Promise.reject('分析対象が存在しません。');
        }
        ////// グリッドの表示 ///////
        let headerContainer = document.getElementById('my-top-grid');
        let container = document.getElementById('my-grid');
        let totalContainer = document.getElementById('total-grid');
        // 既に存在していたら破棄
        destroyHandsonGrid(hot);
        destroyHandsonGrid(totalHot);
        destroyHandsonGrid(headerHot);
        // ヘッダー2段の場合の上部分
        headerHot = new Handsontable(headerContainer, {
          data: [],
          columns: gridVal.getGridColumns(),
          colHeaders: gridVal.GRID_TOP_COL_HEADERS,
          colWidths: gridVal.COL_WIDTH_CKP,
          columnSorting: false,
          stretchH: 'last',
          // width: gridVal.GRID_WIDTH,
        });
        // グリッド本体
        hot = new Handsontable(container, {
          data: dataList,
          columns: gridVal.getGridColumns(),
          colHeaders: gridVal.GRID_COL_HEADERS,
          colWidths: gridVal.COL_WIDTH_CKP,
          columnSorting: (dispViewId == emxasConf.getConfig('VIEW_PRD_PERHOUR_PROFIT') ? false : true),
          sortIndicator: true,
          stretchH: 'last',
          // width: gridVal.GRID_WIDTH,
          afterGetColHeader: null,
          afterRender: function(isForced) {
            // colspanとrowspanの処理をまとめて行う
            // (下側のグリッド表示後に実行されるので、headerHotは描画済み)
            if (isForced) {
              treatMyHeaderTags();
            }
          },
          // autoColumnSize: true
        });
        // 合計行用のtable表示
        /** totalHot = new Handsontable(totalContainer, {
          data: [totalRec],
          columns: getTotalGridColumns(),
          colHeaders: false,
          colWidths: gridVal.COL_WIDTH,
          stretchH: 'last',
          width: gridVal.GRID_WIDTH,
        }); */

        // 独自ソート関数
        const customSort = function(selectedColumn, sortConfig) {
          dataList.sort(function(a, b) {
            // 指定列のソート（列値有りの場合、値でソート。ソート無しの場合も昇順）
            if (a[selectedColumn] && b[selectedColumn]) {
              if (a[selectedColumn] < b[selectedColumn]) return (sortConfig === 0 ? -1 : sortConfig);
              if (a[selectedColumn] > b[selectedColumn]) return (sortConfig === 0 ? 1 : (sortConfig * -1));
            }
            // 指定列のソート（列値無しの場合、値無しを優先でソート）
            // ソート無しの場合、コード値無しは最終行に表示する為、降順になる
            if (!a[selectedColumn] || !b[selectedColumn]) {
              if (!a[selectedColumn] && b[selectedColumn]) return (sortConfig === 0 ? 1 : sortConfig);
              if (a[selectedColumn] && !b[selectedColumn]) return (sortConfig === 0 ? -1 : (sortConfig * -1));
            }

            // コードの昇順は全てのケースで行う
            if (a[(showType === '顧客別' ? '３コード' : '担当者コード')] < b[(showType === '顧客別' ? '３コード' : '担当者コード')]) return -1;
            if (a[(showType === '顧客別' ? '３コード' : '担当者コード')] > b[(showType === '顧客別' ? '３コード' : '担当者コード')]) return 1;

            return 0;
          });

          // // ソート無しの場合、コード未選択を最終行にする。
          // if (sortConfig === 0) {
          //     let noCodeData = [];
          //     let dataListForSort = $.extend(true, [], dataList);
          //     dataListForSort.forEach(function(data, i) {
          //         // コード未選択以外はスキップ
          //         if (data['no_code']) {
          //             return;
          //         }
          //         noCodeData.push(data);
          //         dataList.splice(i, 1);
          //     });
          //     dataList.push(noCodeData);
          // }
          hot.render();
        };

        // 生産性分析時のみの独自ソートトリガー用クリックイベント
        if (dispViewId == emxasConf.getConfig('VIEW_PRC_PDCT_ANALYSIS')) {
          $('table.htCore th span.colHeader').parent('div').addClass('custom-sort-header');
          $(document).off('click', 'table.htCore span.colHeader');
          $(document).on('click', 'table.htCore span.colHeader', function(e) {
            let sortConfig = null;
            // クリック列
            let clickedColumn = $(this).parents('th').index();
            // 前回ソート列
            let sortedColumn = $('.sort-indicator').parents('th').index();
            // 前回ソート内容
            let beforeSortConfig = 0;

            // 前回ソート内容取得
            if ($(this).parents('th').find(".ascending").length > 0) {
              beforeSortConfig = -1;
            } else if ($(this).parents('th').find(".descending").length > 0) {
              beforeSortConfig = 1;
            }

            // 前回ソート内容保持クラス削除
            $(this).removeClass("ascending");
            $(this).removeClass("descending");
            $(this).parents('tr').find('.sort-indicator').remove();

            // 現在ソート無し or 前回ソートと違う列をクリック ⇒ 昇順でソートする
            if (beforeSortConfig === 0 || clickedColumn !== sortedColumn) {
              sortConfig = -1;
              e.target.classList.add("ascending");
              e.target.classList.remove("descending");
              $(this).after('<span class="sort-indicator">▲</span>');

              // 現在昇順 and 前回ソートと同じ列をクリック ⇒ 降順でソートする
            } else if (beforeSortConfig === -1 && clickedColumn === sortedColumn) {
              sortConfig = 1;
              e.target.classList.add("descending");
              e.target.classList.remove("ascending");
              $(this).after('<span class="sort-indicator">▼</span>');

              // 現在降順 and 前回ソートと同じ列をクリック ⇒ ３コード／担当者コード順でソート（初期表示状態）
            } else if (beforeSortConfig === 1 && clickedColumn === sortedColumn) {
              sortConfig = 0; // ソート無し
              clickedColumn = 0; // ３コード／担当者コード列をクリックした事にする。
              e.target.classList.remove("descending");
              e.target.classList.remove("ascending");
            }
            let columnName = gridVal.getGridColumns(showType)[clickedColumn]['data'];
            customSort(columnName, sortConfig);
          });
        }

        ////// グリッドの表示 end ///////
        spinner.hideSpinner();
      }).catch(function(error) {
        console.log(error);
        spinner.hideSpinner();
        if (typeof error === 'string') {
          // グリッドが存在したら削除
          destroyHandsonGrid(hot);
          destroyHandsonGrid(totalHot);
          destroyHandsonGrid(headerHot);
          // エラーメッセージを画面に表示(#my-gridに)
          let msg = $('<div>').attr('id', 'error_msg').text(error);
          $('#my-grid').append(msg);
          return;
        }
        alert('システムエラーが発生しました');
      });
      console.log();
      // CSV出力用フラグ（2期比較ではない）
      isComp = false;
    };

    /**
     * 製品別時間当たり収益に必要な計算を行い、dataList側に計算フィールドを追加し値を格納します。
     *
     */
    var getPerhourCulculateList = function(dataList, dataListComp) {
      for (let ix = 0; ix < dataList.length; ix++) {
        let bughour = {};
        bughour = dataList[ix];
        bughour.mtrUnitPrc = parseFloat(dataList[ix]['mtrprice'] / dataList[ix]['mtrweight']); // 母材単価
        bughour.salUnitPrc = parseFloat(dataList[ix]['salprice'] / dataList[ix]['salweight']); // 販売単価
        bughour.losUnit = parseFloat(dataList[ix]['losweight'] / dataList[ix]['mtrweight'] * 100).toFixed(2); // 実ﾛｽ率
        bughour.prdUnitPrc = parseFloat(dataList[ix]['mtrprice'] / dataList[ix]['prdweight']); // 製品単価（簡易原価）
        bughour.prdYieldThr = parseFloat(dataList[ix]['prdweight'] * 100 / (dataList[ix]['mtrweight'] - dataList[ix]['losweight'])).toFixed(2); // 製品歩留（理論）
        bughour.prdYield = parseFloat(dataList[ix]['prdweight'] * 100 / dataList[ix]['mtrweight']).toFixed(2); // 製品歩留
        bughour.spreadPrice = bughour.salUnitPrc - bughour.prdUnitPrc; // スプレッド金額
        bughour.spreadPer = parseFloat(bughour.spreadPrice / bughour.salUnitPrc * 100).toFixed(2); // スプレッド率
        bughour.perHourPrd = parseFloat(dataList[ix]['prdweight'] / dataList[ix]['drophour']).toFixed(2); // 時間当たり生産量
        bughour.perHourPrf = parseFloat(bughour.spreadPrice * dataList[ix]['prdweight'] / dataList[ix]['drophour']); // 時間当たり収益
        // 計算したフィールドをリストへ追加
        dataListComp.push(bughour);
        console.log(bughour);
      }
      console.log(dataListComp);
      return dataListComp;
    };

    /**
     * 顧客別ABC分析のグリッドを表示します。
     * データは現在の条件で取得
     */
     var showCstSalesRunkGrid = function(period, type) {
       // エラー表示があったら削除
       $('#error_msg').remove();
       // CSV出力データクリア
       csvDataList = [];
       // データを取得してグリッドに表示
       console.log('------- dispCstSales --------');
       // データ取得
       let prflg = true;
       kintone.Promise.all([
         getSalesCustomerList(period, prflg), // 顧客別・品番別販売実績
         getSalesPerformList(period, prflg), // 販売実績
         getProductPerformList(period, prflg) // 生産実績
       ]).then(function() {
         let purList = [];
         let runkList = [];
         // 生産実績、販売実績どちらも1件以上あれば、次へ。
     　  if (Object.keys(myVal.LIST_PRODUCT_PERFORM).length > 0 && Object.keys(myVal.LIST_SALES_PERFORM).length > 0) {
           purList = getPurhourReport(period, purList);
           // 製品別時間当たり収益項目の計算
           return getPerhourCulculateList(purList, runkList);
     　  } else {
   　      // 生産実績＆販売実績が共に1件以上存在しない場合は、分析対象が存在しないので、ここでデータ取得は離脱
 　        return Promise.reject('分析対象が存在しません。');
 　      }
       }).then(function(resp) {
         //////// 取得データの加工 ////////
         // 顧客別スプレッドの計算
         console.log(resp);
         let dataList = [];
         getSctRunkReport(resp, dataList);
         ////// 取得データの加工 end //////
         if (dataList.length < 1) {
           return Promise.reject('分析対象が存在しません。');
         }
         ////// グリッドの表示 ///////
         let headerContainer = document.getElementById('my-top-grid');
         let container = document.getElementById('my-grid');
         let totalContainer = document.getElementById('total-grid');
         // 既に存在していたら破棄
         destroyHandsonGrid(hot);
         destroyHandsonGrid(totalHot);
         destroyHandsonGrid(headerHot);
         // ヘッダー2段の場合の上部分
         headerHot = new Handsontable(headerContainer, {
           data: [],
           columns: gridVal.getGridColumns(),
           colHeaders: gridVal.GRID_TOP_COL_HEADERS,
           colWidths: gridVal.COL_WIDTH_CKP,
           columnSorting: false,
           stretchH: 'last',
           // width: gridVal.GRID_WIDTH,
         });
         // グリッド本体
         hot = new Handsontable(container, {
           data: dataList,
           columns: gridVal.getGridColumns(),
           colHeaders: gridVal.GRID_COL_HEADERS,
           colWidths: gridVal.COL_WIDTH_CKP,
           columnSorting: (dispViewId == emxasConf.getConfig('VIEW_PRD_PERHOUR_PROFIT') ? false : true),
           sortIndicator: true,
           stretchH: 'last',
           // width: gridVal.GRID_WIDTH,
           afterGetColHeader: null,
           afterRender: function(isForced) {
             // colspanとrowspanの処理をまとめて行う
             // (下側のグリッド表示後に実行されるので、headerHotは描画済み)
             if (isForced) {
               treatMyHeaderTags();
             }
           },
           // autoColumnSize: true
         });
         // 合計行用のtable表示
         /** totalHot = new Handsontable(totalContainer, {
           data: [totalRec],
           columns: getTotalGridColumns(),
           colHeaders: false,
           colWidths: gridVal.COL_WIDTH,
           stretchH: 'last',
           width: gridVal.GRID_WIDTH,
         }); */

         // 独自ソート関数
         const customSort = function(selectedColumn, sortConfig) {
           dataList.sort(function(a, b) {
             // 指定列のソート（列値有りの場合、値でソート。ソート無しの場合も昇順）
             if (a[selectedColumn] && b[selectedColumn]) {
               if (a[selectedColumn] < b[selectedColumn]) return (sortConfig === 0 ? -1 : sortConfig);
               if (a[selectedColumn] > b[selectedColumn]) return (sortConfig === 0 ? 1 : (sortConfig * -1));
             }
             // 指定列のソート（列値無しの場合、値無しを優先でソート）
             // ソート無しの場合、コード値無しは最終行に表示する為、降順になる
             if (!a[selectedColumn] || !b[selectedColumn]) {
               if (!a[selectedColumn] && b[selectedColumn]) return (sortConfig === 0 ? 1 : sortConfig);
               if (a[selectedColumn] && !b[selectedColumn]) return (sortConfig === 0 ? -1 : (sortConfig * -1));
             }

             // コードの昇順は全てのケースで行う
             if (a[(showType === '顧客別' ? '３コード' : '担当者コード')] < b[(showType === '顧客別' ? '３コード' : '担当者コード')]) return -1;
             if (a[(showType === '顧客別' ? '３コード' : '担当者コード')] > b[(showType === '顧客別' ? '３コード' : '担当者コード')]) return 1;

             return 0;
           });

           // // ソート無しの場合、コード未選択を最終行にする。
           // if (sortConfig === 0) {
           //     let noCodeData = [];
           //     let dataListForSort = $.extend(true, [], dataList);
           //     dataListForSort.forEach(function(data, i) {
           //         // コード未選択以外はスキップ
           //         if (data['no_code']) {
           //             return;
           //         }
           //         noCodeData.push(data);
           //         dataList.splice(i, 1);
           //     });
           //     dataList.push(noCodeData);
           // }
           hot.render();
         };

         // 生産性分析時のみの独自ソートトリガー用クリックイベント
         if (dispViewId == emxasConf.getConfig('VIEW_PRC_PDCT_ANALYSIS')) {
           $('table.htCore th span.colHeader').parent('div').addClass('custom-sort-header');
           $(document).off('click', 'table.htCore span.colHeader');
           $(document).on('click', 'table.htCore span.colHeader', function(e) {
             let sortConfig = null;
             // クリック列
             let clickedColumn = $(this).parents('th').index();
             // 前回ソート列
             let sortedColumn = $('.sort-indicator').parents('th').index();
             // 前回ソート内容
             let beforeSortConfig = 0;

             // 前回ソート内容取得
             if ($(this).parents('th').find(".ascending").length > 0) {
               beforeSortConfig = -1;
             } else if ($(this).parents('th').find(".descending").length > 0) {
               beforeSortConfig = 1;
             }

             // 前回ソート内容保持クラス削除
             $(this).removeClass("ascending");
             $(this).removeClass("descending");
             $(this).parents('tr').find('.sort-indicator').remove();

             // 現在ソート無し or 前回ソートと違う列をクリック ⇒ 昇順でソートする
             if (beforeSortConfig === 0 || clickedColumn !== sortedColumn) {
               sortConfig = -1;
               e.target.classList.add("ascending");
               e.target.classList.remove("descending");
               $(this).after('<span class="sort-indicator">▲</span>');

               // 現在昇順 and 前回ソートと同じ列をクリック ⇒ 降順でソートする
             } else if (beforeSortConfig === -1 && clickedColumn === sortedColumn) {
               sortConfig = 1;
               e.target.classList.add("descending");
               e.target.classList.remove("ascending");
               $(this).after('<span class="sort-indicator">▼</span>');

               // 現在降順 and 前回ソートと同じ列をクリック ⇒ ３コード／担当者コード順でソート（初期表示状態）
             } else if (beforeSortConfig === 1 && clickedColumn === sortedColumn) {
               sortConfig = 0; // ソート無し
               clickedColumn = 0; // ３コード／担当者コード列をクリックした事にする。
               e.target.classList.remove("descending");
               e.target.classList.remove("ascending");
             }
             let columnName = gridVal.getGridColumns(showType)[clickedColumn]['data'];
             customSort(columnName, sortConfig);
           });
         }

         ////// グリッドの表示 end ///////
         spinner.hideSpinner();
       }).catch(function(error) {
         console.log(error);
         spinner.hideSpinner();
         if (typeof error === 'string') {
           // グリッドが存在したら削除
           destroyHandsonGrid(hot);
           destroyHandsonGrid(totalHot);
           destroyHandsonGrid(headerHot);
           // エラーメッセージを画面に表示(#my-gridに)
           let msg = $('<div>').attr('id', 'error_msg').text(error);
           $('#my-grid').append(msg);
           return;
         }
         alert('システムエラーが発生しました');
       });
       console.log();
       // CSV出力用フラグ（2期比較ではない）
       isComp = false;
     };

  /**
   * グリッドを表示します。
   * データは現在の条件で取得
   */
  var showListGrid = function(period, type) {
    spinner.showSpinner();

    // エラー表示があったら削除
    $('#error_msg').remove();

    // データを取得してグリッドに表示
    let showType = (type === void 0) ? w2ui[TAB_NAME].active : type;

    // CSV出力データクリア
    csvDataList = [];

    // 2期比較にチェックONか？
    if ($('#ch2').prop('checked')) {
      // 二期比較は違うロジック
      dispTowTerm(period, showType);
      // CSV出力用フラグ（2期比較）
      isComp = true;
    } else {
      dispOneTerm(period, showType);
      // CSV出力用フラグ（2期比較ではない）
      isComp = false;
    }
  };

  /**
   * 2期間の比較データを表示します
   * @param showType: 顧客別か担当者別か
   */
  var dispTowTerm = function(period, showType) {
    console.log('------- dispTowTerm --------');
    let useCodeName = (showType === '顧客別') ? '３コード' : '担当者コード';

    let whereOption = makeWhereOption(showType, useCodeName, period);
    let querySt = whereOption.query;

    // 当期：period
    // fromの1日からtoの月末の日付まで
    // 比較期
    // fromの1日からtoの月末の日付まで
    let periodComp = {};
    periodComp.from = {
      month: period.from.month,
      year: period.from.year - 1
    };
    periodComp.to = {
      month: period.to.month,
      year: period.to.year - 1
    };
    periodComp.moment = {
      from: period.moment.from.clone().add(-1, 'years'),
      to: period.moment.to.clone().add(-1, 'years')
    };

    let resp;
    // データ取得
    kintone.Promise.all([
      getPersonOfChargeList(period, whereOption, periodComp), // 担当者一覧取得
      getCustomerList(period, whereOption, periodComp) // 顧客一覧取得
    ]).then(function() {
      // getPersonOfChargeList(period, whereOption, periodComp) .then(function() {// 担当者一覧取得
      //     return getCustomerList(period, whereOption, periodComp);            // 顧客一覧取得
      // }).then(function() {
      // 担当者一覧＆顧客一覧が共に1件以上存在しない場合は、分析対象が存在しないので、ここでデータ取得は離脱
      if (Object.keys(myVal.LIST_PURCHASE_PERFORM).length > 0 && Object.keys(myVal.LIST_PRODUCT_PERFORM).length > 0) {
        // 日報データ取得
        return getDailyReportData(querySt, whereOption, period, useCodeName);
      } else {
        return Promise.reject('分析対象が存在しません。');
      }
    }).then(function(ret) {
      resp = ret;
      // 比較対象の日報データ取得
      return getDailyReportData(querySt, whereOption, periodComp, useCodeName);
    }).then(function(respComp) {

      //////// 取得データの加工 ////////
      let totalRec = {
        '報酬': '',
        '人件費': '',
        '工数': '',
        '担当者名': '合計',
        '損益': '',
        '利益率': ''
      };
      let totalRecComp = {
        '報酬': '',
        '人件費': '',
        '工数': '',
        '担当者名': '合計',
        '損益': '',
        '利益率': ''
      };
      let dataList = resp.period;
      let dataListComp = respComp.period;

      // 合計行を作成
      integrateTotal(dataList, totalRec);
      integrateTotal(dataListComp, totalRecComp);

      // 差分を計算してデータを今期分に登録
      processing2TotalTermComp(dataList, dataListComp);
      processing2TotalTermComp([totalRec], [totalRecComp]);

      // CSV出力用データ生成
      csvDataList = $.extend(true, [], dataList); // 元の配列に影響がないようにコピー
      csvDataList.push(totalRec); //合計行を配列に追加し、CSV出力対象とする。

      // 担当者不明または顧客未選択行のデータが存在しない場合は削除
      // 生産性分析Viewの場合は工数、損益分析Viewの場合は人件費の有無を確認
      let fieldName1 = (dispViewId == emxasConf.getConfig('VIEW_PRODUCTIVITY_ANALYSIS')) ? '工数' : '人件費';
      let fieldName2 = fieldName1 + 'Comp';
      let ixLast = dataList.length - 1;
      if (dataList[ixLast].no_code) {
        if ((dataList[ixLast]['報酬'] === '' || dataList[ixLast]['報酬'] === 0) &&
          (dataList[ixLast][fieldName1] === '' || dataList[ixLast][fieldName1] === 0) &&
          (!dataList[ixLast]['報酬Comp'] || dataList[ixLast]['報酬Comp'] === '' || dataList[ixLast]['報酬Comp'] === 0) &&
          (!dataList[ixLast][fieldName2] || dataList[ixLast][fieldName2] === '' || dataList[ixLast][fieldName2] === 0)) {
          dataList.pop();
        }
      }
      // 報酬、工数がないものを非表示にする加工
      if ($('#ch3').prop('checked')) {
        let sourceList = dataList;
        let destList = [];
        delNoManHourReword(sourceList, destList);
        dataList = destList;
      }
      ////// 取得データの加工 end //////
      if (dataList.length < 1) {
        return Promise.reject('分析対象が存在しません。');
      }

      ////// グリッドの表示 ///////
      let headerContainer = document.getElementById('my-top-grid');
      let container = document.getElementById('my-grid');
      let totalContainer = document.getElementById('total-grid');

      // 既に存在していたら破棄
      destroyHandsonGrid(hot);
      destroyHandsonGrid(totalHot);
      destroyHandsonGrid(headerHot);

      // ヘッダー2段の場合の上部分
      headerHot = new Handsontable(headerContainer, {
        data: [],
        columns: gridVal.get2TermGridColumns(showType),
        colHeaders: gridVal.GRID_TOP_COL_HEADERS,
        colWidths: gridVal.COL_WIDTH_2TERM,
        columnSorting: false,
        stretchH: 'last',
        width: gridVal.GRID_WIDTH,
      });
      //グリッド本体表示
      hot = new Handsontable(container, {
        data: dataList,
        columns: gridVal.get2TermGridColumns(showType),
        colHeaders: gridVal.get2TermGridColHeaders(showType),
        colWidths: gridVal.COL_WIDTH_2TERM,
        columnSorting: true,
        sortIndicator: true,
        stretchH: 'last',
        width: gridVal.GRID_WIDTH,
        afterRender: function(isForced) {
          // (下側のグリッド表示後に実行されるので、headerHotは描画済み)
          if (isForced) {
            treatMyHeaderTags();
          }
        },
      });
      // 合計行用のtable表示
      totalHot = new Handsontable(totalContainer, {
        data: [totalRec],
        columns: get2TermTotalGridColumns(showType),
        colWidths: gridVal.COL_WIDTH_2TERM,
        colHeaders: false,
        stretchH: 'last',
        width: gridVal.GRID_WIDTH,
      });
      ////// グリッドの表示 end ///////
      spinner.hideSpinner();
    }).catch(function(error) {
      console.log(error);
      spinner.hideSpinner();
      if (typeof error === 'string') {
        // グリッドが存在したら削除
        destroyHandsonGrid(hot);
        destroyHandsonGrid(totalHot);
        destroyHandsonGrid(headerHot);
        // エラーメッセージを画面に表示(#my-gridに)
        let msg = $('<div>').attr('id', 'error_msg').text(error);
        $('#my-grid').append(msg);
        return;
      }
      alert('システムエラーが発生しました。');
    });
  };
  /**
   * 1期間のデータを表示します
   */
  var dispOneTerm = function(period, showType) {
    console.log('------- dispOneTerm --------');
    // データ取得
    kintone.Promise.all([
      getPurchasePerformList(period), // 仕入実績取得
      getProductPerformList(period), // 生産実績取得
      getSalesPerformList(period), // 販売実績取得
      getStockPerformList(period) // 在庫実績取得
    ]).then(function() {
        let purList = [];
        let proList = [];
        let salList = [];
        let stcList = [];
        // 仕入実績、生産実績、販売実績、在庫実績いずれも1件以上あれば、次へ。
    　  if (Object.keys(myVal.LIST_PURCHASE_PERFORM).length > 0 && Object.keys(myVal.LIST_PRODUCT_PERFORM).length
          && Object.keys(myVal.LIST_SALES_PERFORM).length > 0 && Object.keys(myVal.LIST_PRDSTOCK_BUDGET).length > 0) {
    　    purList = getPurchaseReport(period, purList);
          proList = getProductReport(period, purList, proList);
          salList = getSalesReport(period, proList, salList);
          return getStockReport(period, salList, stcList);
    　  } else {
  　      // 仕入実績＆生産実績＆販売実績＆在庫実績が共に1件以上存在しない場合は、分析対象が存在しないので、ここでデータ取得は離脱
　        return Promise.reject('分析対象が存在しません。');
　      }
    }).then(function(resp) {
      //////// 取得データの加工 ////////
      let totalRec = {
        '報酬': '',
        '人件費': '',
        '工数': '',
        '担当者名': '合計',
        '損益': '',
        '利益率': ''
      };
      let dataList = resp;
      ////// 取得データの加工 end //////
      if (dataList.length < 1) {
        return Promise.reject('分析対象が存在しません。');
      }
      ////// グリッドの表示 ///////
      let headerContainer = document.getElementById('my-top-grid');
      let container = document.getElementById('my-grid');
      let totalContainer = document.getElementById('total-grid');
      // 既に存在していたら破棄
      destroyHandsonGrid(hot);
      destroyHandsonGrid(totalHot);
      destroyHandsonGrid(headerHot);
      // ヘッダー2段の場合の上部分
      headerHot = new Handsontable(headerContainer, {
        data: [],
        columns: gridVal.getGridColumns(showType),
        colHeaders: gridVal.GRID_TOP_COL_HEADERS,
        colWidths: gridVal.COL_WIDTH_CKP,
        columnSorting: false,
        stretchH: 'last',
        width: gridVal.GRID_WIDTH,
      });
      // グリッド本体
      hot = new Handsontable(container, {
        data: dataList,
        columns: gridVal.getGridColumns(showType),
        colHeaders: gridVal.GRID_COL_HEADERS,
        colWidths: gridVal.COL_WIDTH_CKP,
        columnSorting: (dispViewId == emxasConf.getConfig('VIEW_PRC_PDCT_ANALYSIS') ? false : true),
        sortIndicator: true,
        stretchH: 'last',
        width: gridVal.GRID_WIDTH,
        afterGetColHeader: null,
        afterRender: function(isForced) {
          // colspanとrowspanの処理をまとめて行う
          // (下側のグリッド表示後に実行されるので、headerHotは描画済み)
          if (isForced) {
            treatMyHeaderTags();
          }
        },
        autoColumnSize: true
      });
      // 合計行用のtable表示
      /** totalHot = new Handsontable(totalContainer, {
        data: [totalRec],
        columns: getTotalGridColumns(showType),
        colHeaders: false,
        colWidths: gridVal.COL_WIDTH,
        stretchH: 'last',
        width: gridVal.GRID_WIDTH,
      }); */

      // 独自ソート関数
      const customSort = function(selectedColumn, sortConfig) {
        dataList.sort(function(a, b) {
          // 指定列のソート（列値有りの場合、値でソート。ソート無しの場合も昇順）
          if (a[selectedColumn] && b[selectedColumn]) {
            if (a[selectedColumn] < b[selectedColumn]) return (sortConfig === 0 ? -1 : sortConfig);
            if (a[selectedColumn] > b[selectedColumn]) return (sortConfig === 0 ? 1 : (sortConfig * -1));
          }
          // 指定列のソート（列値無しの場合、値無しを優先でソート）
          // ソート無しの場合、コード値無しは最終行に表示する為、降順になる
          if (!a[selectedColumn] || !b[selectedColumn]) {
            if (!a[selectedColumn] && b[selectedColumn]) return (sortConfig === 0 ? 1 : sortConfig);
            if (a[selectedColumn] && !b[selectedColumn]) return (sortConfig === 0 ? -1 : (sortConfig * -1));
          }

          // コードの昇順は全てのケースで行う
          if (a[(showType === '顧客別' ? '３コード' : '担当者コード')] < b[(showType === '顧客別' ? '３コード' : '担当者コード')]) return -1;
          if (a[(showType === '顧客別' ? '３コード' : '担当者コード')] > b[(showType === '顧客別' ? '３コード' : '担当者コード')]) return 1;

          return 0;
        });

        // // ソート無しの場合、コード未選択を最終行にする。
        // if (sortConfig === 0) {
        //     let noCodeData = [];
        //     let dataListForSort = $.extend(true, [], dataList);
        //     dataListForSort.forEach(function(data, i) {
        //         // コード未選択以外はスキップ
        //         if (data['no_code']) {
        //             return;
        //         }
        //         noCodeData.push(data);
        //         dataList.splice(i, 1);
        //     });
        //     dataList.push(noCodeData);
        // }
        hot.render();
      };

      // 生産性分析時のみの独自ソートトリガー用クリックイベント
      if (dispViewId == emxasConf.getConfig('VIEW_PRC_PDCT_ANALYSIS')) {
        $('table.htCore th span.colHeader').parent('div').addClass('custom-sort-header');
        $(document).off('click', 'table.htCore span.colHeader');
        $(document).on('click', 'table.htCore span.colHeader', function(e) {
          let sortConfig = null;
          // クリック列
          let clickedColumn = $(this).parents('th').index();
          // 前回ソート列
          let sortedColumn = $('.sort-indicator').parents('th').index();
          // 前回ソート内容
          let beforeSortConfig = 0;

          // 前回ソート内容取得
          if ($(this).parents('th').find(".ascending").length > 0) {
            beforeSortConfig = -1;
          } else if ($(this).parents('th').find(".descending").length > 0) {
            beforeSortConfig = 1;
          }

          // 前回ソート内容保持クラス削除
          $(this).removeClass("ascending");
          $(this).removeClass("descending");
          $(this).parents('tr').find('.sort-indicator').remove();

          // 現在ソート無し or 前回ソートと違う列をクリック ⇒ 昇順でソートする
          if (beforeSortConfig === 0 || clickedColumn !== sortedColumn) {
            sortConfig = -1;
            e.target.classList.add("ascending");
            e.target.classList.remove("descending");
            $(this).after('<span class="sort-indicator">▲</span>');

            // 現在昇順 and 前回ソートと同じ列をクリック ⇒ 降順でソートする
          } else if (beforeSortConfig === -1 && clickedColumn === sortedColumn) {
            sortConfig = 1;
            e.target.classList.add("descending");
            e.target.classList.remove("ascending");
            $(this).after('<span class="sort-indicator">▼</span>');

            // 現在降順 and 前回ソートと同じ列をクリック ⇒ ３コード／担当者コード順でソート（初期表示状態）
          } else if (beforeSortConfig === 1 && clickedColumn === sortedColumn) {
            sortConfig = 0; // ソート無し
            clickedColumn = 0; // ３コード／担当者コード列をクリックした事にする。
            e.target.classList.remove("descending");
            e.target.classList.remove("ascending");
          }
          let columnName = gridVal.getGridColumns(showType)[clickedColumn]['data'];
          customSort(columnName, sortConfig);
        });
      }

      ////// グリッドの表示 end ///////
      spinner.hideSpinner();
    }).catch(function(error) {
      console.log(error);
      spinner.hideSpinner();
      if (typeof error === 'string') {
        // グリッドが存在したら削除
        destroyHandsonGrid(hot);
        destroyHandsonGrid(totalHot);
        destroyHandsonGrid(headerHot);
        // エラーメッセージを画面に表示(#my-gridに)
        let msg = $('<div>').attr('id', 'error_msg').text(error);
        $('#my-grid').append(msg);
        return;
      }
      alert('システムエラーが発生しました');
    });
  };
  /**
   * handsontable列タイトル文字列用の自前タグを処理します。
   * afterRender でisForcedの場合に呼び出してください。
   * 自前タグは一旦削除するので、再度呼び出しても再加工はされません。
   */
   var dispOneTermSecondTab = function(period, showType) {//稼働状況
     console.log('------- dispOneTermSecondTab --------');
     // データ取得
     getProductPerformList(period).then(function() {
       let humList = [];
       // 稼働状況、生産実績どちらも1件以上あれば、次へ。
     　if (Object.keys(myVal.LIST_HUMAN_PERFORM).length > 0 && Object.keys(myVal.LIST_PLANT_PERFORM).length > 0) {
         return getHumanReport(period, humList);
       } else {
   　    // 稼働状況、生産実績が共に1件以上存在しない場合は、分析対象が存在しないので、ここでデータ取得は離脱
 　      return Promise.reject('分析対象が存在しません。');
 　    }
     }).then(function(resp) {
     // 稼働状況、生産実績どちらも1件以上あれば、次へ。
         let dataList = resp;
         if (dataList.length < 1) {
           return Promise.reject('分析対象が存在しません。');
         }
         ////// グリッドの表示 ///////
         let headerContainer = document.getElementById('my-top-grid');
         let container = document.getElementById('my-grid');
         let totalContainer = document.getElementById('total-grid');
         // 既に存在していたら破棄
         destroyHandsonGrid(hot);
         destroyHandsonGrid(totalHot);
         destroyHandsonGrid(headerHot);
         // ヘッダー2段の場合の上部分
         headerHot = new Handsontable(headerContainer, {
           data: [],
           columns: gridVal.getGridColumns(showType),
           colHeaders: gridVal.GRID_TOP_COL_WORK_HEADERS,
           colWidths: gridVal.COL_WIDTH_WORK_CKP,
           columnSorting: false,
           stretchH: 'last',
           width: gridVal.GRID_WIDTH_WORK,
         });
         // グリッド本体
         hot = new Handsontable(container, {
           data: dataList,
           columns: gridVal.getGridColumns(showType),
           colHeaders: gridVal.GRID_COL_WORK_HEADERS,
           colWidths: gridVal.COL_WIDTH_WORK_CKP,
           columnSorting: (dispViewId == emxasConf.getConfig('VIEW_PRC_PDCT_ANALYSIS') ? false : true),
           sortIndicator: true,
           stretchH: 'last',
           width: gridVal.GRID_WIDTH_WORK,
           afterGetColHeader: null,
           afterRender: function(isForced) {
             // colspanとrowspanの処理をまとめて行う
             // (下側のグリッド表示後に実行されるので、headerHotは描画済み)
             if (isForced) {
               treatMyHeaderTags();
             }
           },
           autoColumnSize: true
         });
         // 独自ソート関数
         const customSort = function(selectedColumn, sortConfig) {
           dataList.sort(function(a, b) {
             // 指定列のソート（列値有りの場合、値でソート。ソート無しの場合も昇順）
             if (a[selectedColumn] && b[selectedColumn]) {
               if (a[selectedColumn] < b[selectedColumn]) return (sortConfig === 0 ? -1 : sortConfig);
               if (a[selectedColumn] > b[selectedColumn]) return (sortConfig === 0 ? 1 : (sortConfig * -1));
             }
             // 指定列のソート（列値無しの場合、値無しを優先でソート）
             // ソート無しの場合、コード値無しは最終行に表示する為、降順になる
             if (!a[selectedColumn] || !b[selectedColumn]) {
               if (!a[selectedColumn] && b[selectedColumn]) return (sortConfig === 0 ? 1 : sortConfig);
               if (a[selectedColumn] && !b[selectedColumn]) return (sortConfig === 0 ? -1 : (sortConfig * -1));
             }

             // コードの昇順は全てのケースで行う
             if (a[(showType === '顧客別' ? '３コード' : '担当者コード')] < b[(showType === '顧客別' ? '３コード' : '担当者コード')]) return -1;
             if (a[(showType === '顧客別' ? '３コード' : '担当者コード')] > b[(showType === '顧客別' ? '３コード' : '担当者コード')]) return 1;

             return 0;
           });
           hot.render();
         };
         // 生産性分析時のみの独自ソートトリガー用クリックイベント
         if (dispViewId == emxasConf.getConfig('VIEW_PRC_PDCT_ANALYSIS')) {
           $('table.htCore th span.colHeader').parent('div').addClass('custom-sort-header');
           $(document).off('click', 'table.htCore span.colHeader');
           $(document).on('click', 'table.htCore span.colHeader', function(e) {
             let sortConfig = null;
             // クリック列
             let clickedColumn = $(this).parents('th').index();
             // 前回ソート列
             let sortedColumn = $('.sort-indicator').parents('th').index();
             // 前回ソート内容
             let beforeSortConfig = 0;

             // 前回ソート内容取得
             if ($(this).parents('th').find(".ascending").length > 0) {
               beforeSortConfig = -1;
             } else if ($(this).parents('th').find(".descending").length > 0) {
               beforeSortConfig = 1;
             }

             // 前回ソート内容保持クラス削除
             $(this).removeClass("ascending");
             $(this).removeClass("descending");
             $(this).parents('tr').find('.sort-indicator').remove();

             // 現在ソート無し or 前回ソートと違う列をクリック ⇒ 昇順でソートする
             if (beforeSortConfig === 0 || clickedColumn !== sortedColumn) {
               sortConfig = -1;
               e.target.classList.add("ascending");
               e.target.classList.remove("descending");
               $(this).after('<span class="sort-indicator">▲</span>');

               // 現在昇順 and 前回ソートと同じ列をクリック ⇒ 降順でソートする
             } else if (beforeSortConfig === -1 && clickedColumn === sortedColumn) {
               sortConfig = 1;
               e.target.classList.add("descending");
               e.target.classList.remove("ascending");
               $(this).after('<span class="sort-indicator">▼</span>');

               // 現在降順 and 前回ソートと同じ列をクリック ⇒ ３コード／担当者コード順でソート（初期表示状態）
             } else if (beforeSortConfig === 1 && clickedColumn === sortedColumn) {
               sortConfig = 0; // ソート無し
               clickedColumn = 0; // ３コード／担当者コード列をクリックした事にする。
               e.target.classList.remove("descending");
               e.target.classList.remove("ascending");
             }
             let columnName = gridVal.getGridColumns(showType)[clickedColumn]['data'];
             customSort(columnName, sortConfig);
           });
         }
         ////// グリッドの表示 end ///////
         spinner.hideSpinner();
       }).catch(function(error) {
         console.log(error);
         spinner.hideSpinner();
         if (typeof error === 'string') {
           // グリッドが存在したら削除
           destroyHandsonGrid(hot);
           destroyHandsonGrid(totalHot);
           destroyHandsonGrid(headerHot);
           // エラーメッセージを画面に表示(#my-gridに)
           let msg = $('<div>').attr('id', 'error_msg').text(error);
           $('#my-grid').append(msg);
           return;
         }
         alert('システムエラーが発生しました');
       });
   };

  function treatMyHeaderTags() {
    // ヘッダ行の指定の項目の列ソートリンク表示(class:columnSorting)を外す
    let noSort = $('table.htCore th nosort');
    for (let ix = 0; ix < noSort.length; ix++) {
      let span = noSort[ix].parentNode;
      $(span).removeClass('columnSorting');
      noSort[ix].parentNode.innerText = noSort[ix].innerText;
    }
    // ヘッダ行の指定の項目のセルのcolspanを作成する
    let colspan = $('table.htCore th colspan[type="pre"]');
    for (let ix = 0; ix < colspan.length; ix++) {
      let th = colspan[ix].parentNode.parentNode.parentNode;
      th.colSpan = $(colspan[ix]).attr('cnt');
      colspan[ix].parentNode.innerText = colspan[ix].innerText;
    }
    // ヘッダ行の指定の項目のセルの擬似rowspanの為に、上下のborderを消す
    let rowspan2 = $('table.htCore th rowspan[type="top"]');
    if (rowspan2.length > 1) {
      for (let ix = 0; ix < rowspan2.length; ix++) {
        let th = rowspan2[ix].parentNode.parentNode.parentNode;
        if (rowspan2[ix].getAttribute('type') === 'top') {
          // 下側のborderを消す
          th.style.borderBottom = 'none';
        } else {}
        rowspan2[ix].parentNode.innerText = rowspan2[ix].innerText;
      }
    }
    let rowspan = $('table.htCore th rowspan[type="bottom"]');
    if (rowspan.length > 1) {
      for (let ix = 0; ix < rowspan.length; ix++) {
        let th = rowspan[ix].parentNode.parentNode.parentNode;
        if (rowspan[ix].getAttribute('type') === 'bottom') {
          // 上側のborderを消す
          th.style.borderTop = 'none';
        } else {}
        rowspan[ix].parentNode.innerText = rowspan[ix].innerText;
      }
    }
  }
  /**
   * Handsontableのオブジェクトをdestroyします
   */
  function destroyHandsonGrid(delHot) {
    if (delHot) {
      delHot.destroy();
      // destroy()したものを、undefinedに
      switch (delHot) {
        case hot:
          hot = void 0;
          break;
        case headerHot:
          headerHot = void 0;
          break;
        case totalHot:
          totalHot = void 0;
          break;
      }
    }
    return void 0;
  };
  /**
   * データを取得する際に必要となる絞り込み条件を保存するオブジェクトを返します
   * オブジェクトに設定されるフィールドは以下
   * query                日付の絞り込み条件(クエリ実行前に付与)の後ろに追加されるクエリ文字列
   * expectNoCustomer     trueなら「顧客未選択の工数を除く」
   * chargeId             担当者による絞込み対象の担当者ID(存在するなら担当者を選択)
   * mainChargeCustomers  主担当の顧客IDのリスト(存在するなら主担当のみ)
   * keyword.customer     存在するなら、抽出対象の顧客IDのリスト
   * keyword.charge       存在するなら、抽出対象の担当者IDのリスト
   * duty                 存在するなら、業務分類で抽出する業務分類のコードのリスト
   * orderBy              (必須)並び替える対象のフィールド名
   *
   */
  function makeWhereOption(showType, useCodeName, period) {
    // 日報アプリからのデータ取得の場合、自前で絞り込む条件を持つ
    let whereOption = {};

    whereOption.query = '';
    // 日付の絞込みはperiodを渡して、1月毎のループの中で行う

    if (showType === '担当者別' && $('#ch4').prop('checked')) {
      // 「顧客未選択の工数を除く」にチェックON
      whereOption.expectNoCustomer = true;
    }
    // 担当者選択
    if (showType === '顧客別') {
      let val = $('select#select_charge').val();
      if (val !== 'all') {
        // 選択値がallでなければ、誰かが選択されている。
        // 日報データからの抽出を指定の担当者で制限
        whereOption.chargeId = val;
        whereOption.query += ' and 担当者 in ("' + val + '")';
      } else {
        // すべて表示なので、sessionStorageの選択担当者IDを空に
        sessionStorage.removeItem(myVal.SELECT_CHARGE_ID);
      }
      // 主担当のみか否かをチェック
      if ($('input#ch1').prop('checked')) {
        // 主担当の３コードのリストを取得
        let p = {};
        p.fromDate = makeFromDateSt(period.from.year, period.from.month);
        p.toDate = makeToDateSt(period.to.year, period.to.month);
        let list = getMainChargeCustomerCodeList(val, p);
        whereOption.mainChargeCustomers = list;
      }
    } else {
      // 顧客別ではないので選択されている担当者は存在しないから、sessionStorageの選択担当者IDを空に
      sessionStorage.removeItem(myVal.SELECT_CHARGE_ID);
    }
    // キーワードの処理
    let keyword = $('#keyword').val();
    if (keyword && keyword !== '') {
      whereOption.keyword = {};
      if (showType === '顧客別') {
        // 顧客別なら顧客名か３コードに部分一致
        let ccl = getCustomerCodeListByBroadKeyword(keyword);
        whereOption.keyword.customer = ccl;
      } else {
        // 担当者別なら担当者名か担当者コードに部分一致
        let cl = getChargeCodeListByBroadKeyword(keyword);
        whereOption.keyword.charge = cl;
        if (cl.length > 0) {
          whereOption.query += ' and (' + makeWhereString('担当者コード', 'or', 'in', cl) + ')';
          //' and (担当者コード = "xxx" or 担当者コード = "xx2")';
        }
      }
    }
    // 業務分類の条件
    let dutyOption = getDutyOption();
    if (dutyOption instanceof Array) {
      whereOption.duty = dutyOption;
    }
    whereOption.orderBy = useCodeName; // 並び替え
    return whereOption;
  }
  /**
   * 日報データを取得します。指定の期間を一ヶ月毎に取得してきたものを、ここで集約します。
   * @see makeWhereOption
   */
  var getDailyReportData = function(query, whereOption, period, codeName) {
    return getOneMonthDailyReport([], query, whereOption, period, codeName, 0).then(function(resp) {
      let periodList = [];
      // 全期間分のデータを集約
      integratePeriodData(resp, periodList);

      // 全部集約したものをperiodに入れて返す
      let ret = {};
      ret.period = periodList;
      return Promise.resolve(ret);
    });
  };
  /**
   * 2期比較の計算を行い、dataList側に比較フィールドを追加し値を格納します。
   * 比較の計算は、dataList側 - dataListComp側 です。
   */
  var processing2TotalTermComp = function(dataList, dataListComp) {
    for (let ix = 0; ix < dataList.length; ix++) {
      dataList[ix]['報酬Comp'] = calcDiff(dataList[ix]['報酬'], dataListComp[ix]['報酬']);
      dataList[ix]['人件費Comp'] = calcDiff(dataList[ix]['人件費'], dataListComp[ix]['人件費']);
      dataList[ix]['工数Comp'] = calcDiff(dataList[ix]['工数'], dataListComp[ix]['工数']);
      dataList[ix]['損益Comp'] = calcDiff(dataList[ix]['損益'], dataListComp[ix]['損益']);
      dataList[ix]['時間あたりComp'] = calcDiff(dataList[ix]['時間あたり'], dataListComp[ix]['時間あたり']);
    }
  };
  /**
   * 仕入CKPエリアのデータに整理する
   */
  var getPurchaseReport = function(period, bugCkpListThreewithT) {
    let bugCList = myVal.LIST_PURCHASE_BUDGET;
    let perCList = myVal.LIST_PURCHASE_PERFORM;
    // 予定は必ず全品種コード分登録することを前提とする
    var bugCkpList = bugCList.map(function (itemb) {
      var perCkpList = perCList.reduce(function(resultp, itemp) {
        if (itemb.month === itemp.date && itemb.code === itemp.code) {
          resultp = {
            month: itemb.month, // 対象年月
            // code: itemb.code, // 品種コード
            code: "仕入",
            name: itemb.name, // 品種名
            plweight: itemb.plweight, // 計画重量
            plPrice: itemb.plPrice, // 計画金額
            plUnit: toNumber(Math.floor(itemb.plPrice / itemb.plweight)),
            psweight: itemb.psweight, // 予定重量
            psPrice: itemb.psPrice, // 予定金額
            psUnit: toNumber(Math.floor(itemb.psPrice / itemb.psweight)),
            ppweight: itemb.ppweight, // 見込重量
            ppPrice: itemb.ppPrice, // 見込金額
            ppUnit: toNumber(Math.floor(itemb.ppPrice / itemb.ppweight)),
            prcweight: itemp.prcweight, // 実績重量
            prcPrice: itemp.prcPrice, // 実績金額
            prcUnit: toNumber(Math.floor(itemp.prcPrice / itemp.prcweight)),
          };
        }
        return resultp;
      }, []);
      return perCkpList;
    });
    // 配列を1ヶ月単位に3ヶ月レイアウトに変更
    let bugCkpListThree = [];
    for (let ix = 0; ix < bugCkpList.length; ix = ix + 6) {
      let bugrec = {};
      bugrec.code = bugCkpList[ix+3].code;
      bugrec.name = bugCkpList[ix+3].name;
      bugrec.nblsprcweight = bugCkpList[ix].prcweight;
      bugrec.nblsprcPrice = bugCkpList[ix].prcPrice;
      bugrec.nblsprcUnit = bugCkpList[ix].prcUnit;
      bugrec.nbplweight = bugCkpList[ix+3].plweight;
      bugrec.nbplPrice = bugCkpList[ix+3].plPrice;
      bugrec.nbplUnit = bugCkpList[ix+3].plUnit;
      bugrec.nbppweight = bugCkpList[ix+3].ppweight;
      bugrec.nbppPrice = bugCkpList[ix+3].ppPrice;
      bugrec.nbppUnit = bugCkpList[ix+3].ppUnit;
      bugrec.nbprcweight = bugCkpList[ix+3].prcweight;
      bugrec.nbprcPrice = bugCkpList[ix+3].prcPrice;
      bugrec.nbprcUnit = bugCkpList[ix+3].prcUnit;
      bugrec.ntlsprcweight = bugCkpList[ix+1].prcweight;
      bugrec.ntlsprcPrice = bugCkpList[ix+1].prcPrice;
      bugrec.ntlsprcUnit = bugCkpList[ix+1].prcUnit;
      bugrec.ntplweight = bugCkpList[ix+4].plweight;
      bugrec.ntplPrice = bugCkpList[ix+4].plPrice;
      bugrec.ntplUnit = bugCkpList[ix+4].plUnit;
      bugrec.ntpsweight = bugCkpList[ix+4].psweight;
      bugrec.ntpsPrice = bugCkpList[ix+4].psPrice;
      bugrec.ntpsUnit = bugCkpList[ix+4].psUnit;
      bugrec.ntppweight = bugCkpList[ix+4].ppweight;
      bugrec.ntppPrice = bugCkpList[ix+4].ppPrice;
      bugrec.ntppUnit = bugCkpList[ix+4].ppUnit;
      bugrec.nalsprcweight = bugCkpList[ix+2].prcweight;
      bugrec.nalsprcPrice = bugCkpList[ix+2].prcPrice;
      bugrec.nalsprcUnit = bugCkpList[ix+2].prcUnit;
      bugrec.naplweight = bugCkpList[ix+5].plweight;
      bugrec.naplPrice = bugCkpList[ix+5].plPrice;
      bugrec.naplUnit = bugCkpList[ix+5].plUnit;
      bugrec.napsweight = bugCkpList[ix+5].psweight;
      bugrec.napsPrice = bugCkpList[ix+5].psPrice;
      bugrec.napsUnit = bugCkpList[ix+5].psUnit;
      bugCkpListThree.push(bugrec);
    }
    integrateTotal(bugCkpListThree, bugCkpListThreewithT);
    console.log(bugCkpListThreewithT);
    return bugCkpListThreewithT;
  }
  /**
   * 生産CKPエリアのデータに整理する
   */
  var getProductReport = function(period, bugCkpListThreewithT, perCkpListThreewithT) {
    let bugRList = myVal.LIST_PRODUCT_BUDGET;
    let perRList = myVal.LIST_PRODUCT_PERFORM;
    perCkpListThreewithT = bugCkpListThreewithT;
    // 予定は必ず全品種コード分登録することを前提とする
    var bugCkpList = bugRList.map(function (itemb) {
      var perCkpList = perRList.reduce(function(resultp, itemp) {
        if (itemb.month === itemp.date && itemb.code === itemp.type) {
          resultp = {
            month: itemb.month, // 対象年月
            // code: itemb.code, // 品種コード
            code: "生産",
            name: itemb.name, // 品種名
            plweight: itemb.plweight, // 計画重量
            plPrice: itemb.plPrice, // 計画金額
            plUnit: toNumber(Math.floor(itemb.plPrice / itemb.plweight)),
            psweight: itemb.psweight, // 予定重量
            psPrice: itemb.psPrice, // 予定金額
            psUnit: toNumber(Math.floor(itemb.psPrice / itemb.psweight)),
            ppweight: itemb.ppweight, // 見込重量
            ppPrice: itemb.ppPrice, // 見込金額
            ppUnit: toNumber(Math.floor(itemb.ppPrice / itemb.ppweight)),
            mtrweight: itemp.mtrweight, // 母材重量
            prdweight: itemp.prdweight, // 実績重量
            prcUnit: toNumber(Math.floor(itemp.prcPrice / itemp.prcweight)),
          };
        }
        return resultp;
      }, []);
      return perCkpList;
    });
    console.log(bugCkpList);
    // 配列を1ヶ月単位に3ヶ月レイアウトに変更し、仕入CKPの後ろに追加
    // 合計行を出すために、生産実績のみのリストを作成
    let perCkpListBefore = [];
    let perCkpListBeforewithT = [];
    for (let ix = 0; ix < bugCkpList.length; ix = ix + 6) {
      let bugrec = {};
      bugrec.code = bugCkpList[ix+3].code;
      bugrec.name = bugCkpList[ix+3].name;
      bugrec.nblsprcweight = bugCkpList[ix].prdweight;
      bugrec.nblsprcPrice = "";
      bugrec.nblsprcUnit = bugCkpList[ix].prcUnit;
      bugrec.nbplweight = bugCkpList[ix+3].plweight;
      bugrec.nbplPrice = bugCkpList[ix+3].plPrice;
      bugrec.nbplUnit = bugCkpList[ix+3].plUnit;
      bugrec.nbppweight = bugCkpList[ix+3].ppweight;
      bugrec.nbppPrice = bugCkpList[ix+3].ppPrice;
      bugrec.nbppUnit = bugCkpList[ix+3].ppUnit;
      bugrec.nbprcweight = bugCkpList[ix+3].prdweight;
      bugrec.nbprcPrice = "";
      bugrec.nbprcUnit = bugCkpList[ix+3].prcUnit;
      bugrec.ntlsprcweight = bugCkpList[ix+1].prdweight;
      bugrec.ntlsprcPrice = "";;
      bugrec.ntlsprcUnit = bugCkpList[ix+1].prcUnit;
      bugrec.ntplweight = bugCkpList[ix+4].plweight;
      bugrec.ntplPrice = bugCkpList[ix+4].plPrice;
      bugrec.ntplUnit = bugCkpList[ix+4].plUnit;
      bugrec.ntpsweight = bugCkpList[ix+4].psweight;
      bugrec.ntpsPrice = bugCkpList[ix+4].psPrice;
      bugrec.ntpsUnit = bugCkpList[ix+4].psUnit;
      bugrec.ntppweight = bugCkpList[ix+4].ppweight;
      bugrec.ntppPrice = bugCkpList[ix+4].ppPrice;
      bugrec.ntppUnit = bugCkpList[ix+4].ppUnit;
      bugrec.nalsprcweight = bugCkpList[ix+2].prdweight;
      bugrec.nalsprcPrice = "";
      bugrec.nalsprcUnit = bugCkpList[ix+2].prcUnit;
      bugrec.naplweight = bugCkpList[ix+5].plweight;
      bugrec.naplPrice = bugCkpList[ix+5].plPrice;
      bugrec.naplUnit = bugCkpList[ix+5].plUnit;
      bugrec.napsweight = bugCkpList[ix+5].psweight;
      bugrec.napsPrice = bugCkpList[ix+5].psPrice;
      bugrec.napsUnit = bugCkpList[ix+5].psUnit;
      perCkpListBefore.push(bugrec);
    }
    integrateTotal(perCkpListBefore, perCkpListBeforewithT);
    for (var ix = 0; ix < perCkpListBeforewithT.length; ix++) {
      perCkpListThreewithT.push(perCkpListBeforewithT[ix]);
    }
    console.log(perCkpListThreewithT);
    return perCkpListThreewithT;
  }
  /**
   * 売上高CKPエリアのデータに整理する
   */
  var getSalesReport = function(period, perCkpListThreewithT, salCkpListThreewithT) {
    let bugSList = myVal.LIST_SALES_BUDGET;
    let perSList = myVal.LIST_SALES_PERFORM;
    salCkpListThreewithT = perCkpListThreewithT;
    // 予定は必ず全品種コード分登録することを前提とする
    var bugCkpList = bugSList.map(function (itemb) {
      var perCkpList = perSList.reduce(function(resultp, itemp) {
        if (itemb.month === itemp.date && itemb.code === itemp.type) {
          resultp = {
            month: itemb.month, // 対象年月
            // code: itemb.code, // 品種コード
            code: "売上高",
            name: itemb.name, // 品種名
            plweight: itemb.plweight, // 計画重量
            plPrice: itemb.plPrice, // 計画金額
            plUnit: toNumber(Math.floor(itemb.plPrice / itemb.plweight)),
            psweight: itemb.psweight, // 予定重量
            psPrice: itemb.psPrice, // 予定金額
            psUnit: toNumber(Math.floor(itemb.psPrice / itemb.psweight)),
            ppweight: itemb.ppweight, // 見込重量
            ppPrice: itemb.ppPrice, // 見込金額
            ppUnit: toNumber(Math.floor(itemb.ppPrice / itemb.ppweight)),
            salweight: itemp.salweight, // 実績重量
            salPrice: itemp.salPrice, // 実績金額
            salUnit: toNumber(Math.floor(itemp.salPrice / itemp.salweight)),
          };
        }
        return resultp;
      }, []);
      return perCkpList;
    });
    console.log(bugCkpList);
    // 配列を1ヶ月単位に3ヶ月レイアウトに変更
    let salCkpListBefore = [];
    let salCkpListBeforewithT = [];
    for (let ix = 0; ix < bugCkpList.length; ix = ix + 6) {
      let bugrec = {};
      bugrec.code = bugCkpList[ix+3].code;
      bugrec.name = bugCkpList[ix+3].name;
      bugrec.nblsprcweight = bugCkpList[ix].salweight;
      bugrec.nblsprcPrice = bugCkpList[ix].salPrice;
      bugrec.nblsprcUnit = bugCkpList[ix].salUnit;
      bugrec.nbplweight = bugCkpList[ix+3].plweight;
      bugrec.nbplPrice = bugCkpList[ix+3].plPrice;
      bugrec.nbplUnit = bugCkpList[ix+3].plUnit;
      bugrec.nbppweight = bugCkpList[ix+3].ppweight;
      bugrec.nbppPrice = bugCkpList[ix+3].ppPrice;
      bugrec.nbppUnit = bugCkpList[ix+3].ppUnit;
      bugrec.nbprcweight = bugCkpList[ix+3].salweight;
      bugrec.nbprcPrice = bugCkpList[ix+3].salPrice;
      bugrec.nbprcUnit = bugCkpList[ix+3].salUnit;
      bugrec.ntlsprcweight = bugCkpList[ix+1].salweight;
      bugrec.ntlsprcPrice = bugCkpList[ix+1].salPrice;
      bugrec.ntlsprcUnit = bugCkpList[ix+1].salUnit;
      bugrec.ntplweight = bugCkpList[ix+4].plweight;
      bugrec.ntplPrice = bugCkpList[ix+4].plPrice;
      bugrec.ntplUnit = bugCkpList[ix+4].plUnit;
      bugrec.ntpsweight = bugCkpList[ix+4].psweight;
      bugrec.ntpsPrice = bugCkpList[ix+4].psPrice;
      bugrec.ntpsUnit = bugCkpList[ix+4].psUnit;
      bugrec.ntppweight = bugCkpList[ix+4].ppweight;
      bugrec.ntppPrice = bugCkpList[ix+4].ppPrice;
      bugrec.ntppUnit = bugCkpList[ix+4].ppUnit;
      bugrec.nalsprcweight = bugCkpList[ix+2].salweight;
      bugrec.nalsprcPrice = bugCkpList[ix+2].salPrice;
      bugrec.nalsprcUnit = bugCkpList[ix+2].salUnit;
      bugrec.naplweight = bugCkpList[ix+5].plweight;
      bugrec.naplPrice = bugCkpList[ix+5].plPrice;
      bugrec.naplUnit = bugCkpList[ix+5].plUnit;
      bugrec.napsweight = bugCkpList[ix+5].psweight;
      bugrec.napsPrice = bugCkpList[ix+5].psPrice;
      bugrec.napsUnit = bugCkpList[ix+5].psUnit;
      salCkpListBefore.push(bugrec);
    }
    integrateTotal(salCkpListBefore, salCkpListBeforewithT);
    for (var ix = 0; ix < salCkpListBeforewithT.length; ix++) {
      salCkpListThreewithT.push(salCkpListBeforewithT[ix]);
    }
    console.log(salCkpListThreewithT);
    return salCkpListThreewithT;
  }
  /**
   * 在庫CKPエリアのデータに整理する
   */
  var getStockReport = function(period, salCkpListThreewithT, stcCkpListThreewithT) {
    let bugTList = myVal.LIST_PRDSTOCK_BUDGET;
    let perTList = myVal.LIST_PRDSTOCK_PERFORM;
    stcCkpListThreewithT = salCkpListThreewithT;
    // 予定は必ず全品種コード分登録することを前提とする
    var bugCkpList = bugTList.map(function (itemb) {
      var perCkpList = perTList.reduce(function(resultp, itemp) {
        if (itemb.month === itemp.date && itemb.code === itemp.type) {
          resultp = {
            month: itemb.month, // 対象年月
            // code: itemb.code, // 品種コード
            code: "在庫",
            name: itemb.name, // 品種名
            plweight: itemb.plweight, // 計画重量
            plPrice: itemb.plPrice, // 計画金額
            plUnit: toNumber(Math.floor(itemb.plPrice / itemb.plweight)),
            psweight: itemb.psweight, // 予定重量
            psPrice: itemb.psPrice, // 予定金額
            psUnit: toNumber(Math.floor(itemb.psPrice / itemb.psweight)),
            ppweight: itemb.ppweight, // 見込重量
            ppPrice: itemb.ppPrice, // 見込金額
            ppUnit: toNumber(Math.floor(itemb.ppPrice / itemb.ppweight)),
            stcweight: itemp.stcweight, // 実績重量
            stcPrice: itemp.stcPrice, // 実績金額
            stcUnit: toNumber(Math.floor(itemp.stcPrice / itemp.stcweight)),
          };
        }
        return resultp;
      }, []);
      return perCkpList;
    });
    console.log(bugCkpList);
    // 配列を1ヶ月単位に3ヶ月レイアウトに変更し、売上高CKPの後ろに追加
    // 合計行を出すために、生産実績のみのリストを作成
    let stcCkpListBefore = [];
    let stcCkpListBeforewithT = [];
    for (let ix = 0; ix < bugCkpList.length; ix = ix + 6) {
      let bugrec = {};
      bugrec.code = bugCkpList[ix+3].code;
      bugrec.name = bugCkpList[ix+3].name;
      bugrec.nblsprcweight = bugCkpList[ix].stcweight;
      bugrec.nblsprcPrice = bugCkpList[ix].stcPrice;
      bugrec.nblsprcUnit = bugCkpList[ix].stcUnit;
      bugrec.nbplweight = bugCkpList[ix+3].plweight;
      bugrec.nbplPrice = bugCkpList[ix+3].plPrice;
      bugrec.nbplUnit = bugCkpList[ix+3].plUnit;
      bugrec.nbppweight = bugCkpList[ix+3].ppweight;
      bugrec.nbppPrice = bugCkpList[ix+3].ppPrice;
      bugrec.nbppUnit = bugCkpList[ix+3].ppUnit;
      bugrec.nbprcweight = bugCkpList[ix+3].stcweight;
      bugrec.nbprcPrice = bugCkpList[ix+3].stcPrice;
      bugrec.nbprcUnit = bugCkpList[ix+3].stcUnit;
      bugrec.ntlsprcweight = bugCkpList[ix+1].stcweight;
      bugrec.ntlsprcPrice = bugCkpList[ix+1].stcPrice;
      bugrec.ntlsprcUnit = bugCkpList[ix+1].stcUnit;
      bugrec.ntplweight = bugCkpList[ix+4].plweight;
      bugrec.ntplPrice = bugCkpList[ix+4].plPrice;
      bugrec.ntplUnit = bugCkpList[ix+4].plUnit;
      bugrec.ntpsweight = bugCkpList[ix+4].psweight;
      bugrec.ntpsPrice = bugCkpList[ix+4].psPrice;
      bugrec.ntpsUnit = bugCkpList[ix+4].psUnit;
      bugrec.ntppweight = bugCkpList[ix+4].ppweight;
      bugrec.ntppPrice = bugCkpList[ix+4].ppPrice;
      bugrec.ntppUnit = bugCkpList[ix+4].ppUnit;
      bugrec.nalsprcweight = bugCkpList[ix+2].stcweight;
      bugrec.nalsprcPrice = bugCkpList[ix+2].stcPrice;
      bugrec.nalsprcUnit = bugCkpList[ix+2].stcUnit;
      bugrec.naplweight = bugCkpList[ix+5].plweight;
      bugrec.naplPrice = bugCkpList[ix+5].plPrice;
      bugrec.naplUnit = bugCkpList[ix+5].plUnit;
      bugrec.napsweight = bugCkpList[ix+5].psweight;
      bugrec.napsPrice = bugCkpList[ix+5].psPrice;
      bugrec.napsUnit = bugCkpList[ix+5].psUnit;
      stcCkpListBefore.push(bugrec);
    }
    integrateTotal(stcCkpListBefore, stcCkpListBeforewithT);
    for (var ix = 0; ix < stcCkpListBeforewithT.length; ix++) {
      stcCkpListThreewithT.push(stcCkpListBeforewithT[ix]);
    }
    console.log(stcCkpListThreewithT);
    return stcCkpListThreewithT;
  }
  /**
   * 稼働状況CKPエリアのデータに整理する
   */
  var getHumanReport = function(period, perCkpListThree) {
    let perHList = myVal.LIST_PLANT_PERFORM;
    let humHList = myVal.LIST_HUMAN_PERFORM;
    console.log(perHList);
    console.log(humHList);
    // 稼働状況は必ず対象３ヶ月分登録することを前提とする
    let recas = [];
    let recasLen = "";
    // 所定日数
    for (let ix = 0; ix < humHList.length; ix++) {
      recas[ix] = {
        date: humHList[ix].date,
        name: "所定日数",
        unit: "日",
        plworkDay: humHList[ix].plworkDay,
        psworkDay: humHList[ix].psworkDay,
        ppworkDay: humHList[ix].ppworkDay,
        pfworkDay: humHList[ix].pfworkDay
      };
    }
    recasLen = recas.length;
    // 所定勤務時間
    for (let ix = 0; ix < humHList.length; ix++) {
      recas[recasLen + ix] = {
        date: humHList[ix].date,
        name: "所定時間",
        unit: "h",
        plworkDay: humHList[ix].plworkHour,
        psworkDay: humHList[ix].psworkHour,
        ppworkDay: humHList[ix].ppworkHour,
        pfworkDay: humHList[ix].pfworkHour
      };
    }
    recasLen = recas.length;
    // 工場稼働日数
    for (let ix = 0; ix < humHList.length; ix++) {
      recas[recasLen + ix] = {
        date: humHList[ix].date,
        name: "工場稼働日数",
        unit: "日",
        plworkDay: humHList[ix].plplantDay,
        psworkDay: humHList[ix].psplantDay,
        ppworkDay: humHList[ix].ppplantDay,
        pfworkDay: humHList[ix].pfplantDay,
      };
    }
    recasLen = recas.length;
    // 所定工場稼働時間
    for (let ix = 0; ix < humHList.length; ix++) {
      recas[recasLen + ix] = {
        date: humHList[ix].date,
        name: "所定時間",
        unit: "h",
        plworkDay: humHList[ix].plplantHour,
        psworkDay: humHList[ix].psplantHour,
        ppworkDay: humHList[ix].ppplantHour,
        pfworkDay: humHList[ix].pfplantHour
      };
    }
    recasLen = recas.length;
    // 機器稼働時間
    // TODO 稼働・停止予定時間
    for (let ix = 0; ix < perHList.length; ix++) {
      recas[recasLen + ix] = {
        date: perHList[ix].date,
        name: "機器稼働時間",
        unit: "h",
        plworkDay: perHList[ix].prdhour,
        psworkDay: perHList[ix].prdhour,
        ppworkDay: perHList[ix].prdhour,
        pfworkDay: perHList[ix].prdhour
      };
    }
    recasLen = recas.length;
    // 機器稼働率
    for (let ix = 0; ix < perHList.length; ix++) {
      var sumprdHour = parseFloat(perHList[ix].prdhour) + parseFloat(perHList[ix].prdstop);
      var prdHourUnit = parseFloat(perHList[ix].prdhour) * 100 / sumprdHour;
      // 稼働率
      recas[recasLen + ix] = {
        date: perHList[ix].date,
        name: "稼働率",
        unit: "%",
        plworkDay: prdHourUnit,
        psworkDay: prdHourUnit,
        ppworkDay: prdHourUnit,
        pfworkDay: prdHourUnit
      };
    }
    recasLen = recas.length;
    // 総停止時間
    for (let ix = 0; ix < perHList.length; ix++) {
      recas[recasLen + ix] = {
        date: perHList[ix].date,
        name: "総停止時間",
        unit: "h",
        plworkDay: perHList[ix].prdstop,
        psworkDay: perHList[ix].prdstop,
        ppworkDay: perHList[ix].prdstop,
        pfworkDay: perHList[ix].prdstop
      };
    }
    recasLen = recas.length;
    // 合計時間
    for (let ix = 0; ix < perHList.length; ix++) {
      var sumprdHour = parseFloat(perHList[ix].prdhour) + parseFloat(perHList[ix].prdstop);
      recas[recasLen + ix] = {
        date: perHList[ix].date,
        name: "合計時間",
        unit: "h",
        plworkDay: sumprdHour,
        psworkDay: sumprdHour,
        ppworkDay: sumprdHour,
        pfworkDay: sumprdHour
      };
    }
    recasLen = recas.length;
    // 総ロール長
    for (let ix = 0; ix < perHList.length; ix++) {
      recas[recasLen + ix] = {
        date: perHList[ix].date,
        name: "総ロール長",
        unit: "m",
        plworkDay: perHList[ix].prdlength,
        psworkDay: perHList[ix].prdlength,
        ppworkDay: perHList[ix].prdlength,
        pfworkDay: perHList[ix].prdlength
      };
    }
    recasLen = recas.length;
    // ラインスピード（m/分）
    for (let ix = 0; ix < perHList.length; ix++) {
      var sumprdMinutes = (parseFloat(perHList[ix].prdhour) + parseFloat(perHList[ix].prdstop)) * 60;
      var perLength = parseFloat(perHList[ix].prdlength) / sumprdMinutes;
      recas[recasLen + ix] = {
        date: perHList[ix].date,
        name: "ﾗｲﾝｽﾋﾟｰﾄﾞ",
        unit: "m/分",
        plworkDay: perLength,
        psworkDay: perLength,
        ppworkDay: perLength,
        pfworkDay: perLength
      };
    }
    recasLen = recas.length;
    // １級生産量/h
    for (let ix = 0; ix < perHList.length; ix++) {
      var sumprdHour = parseFloat(perHList[ix].prdhour) + parseFloat(perHList[ix].prdstop);
      var perprdWeight = parseFloat(perHList[ix].prdweight) / sumprdHour;
      recas[recasLen + ix] = {
        date: perHList[ix].date,
        name: "1級生産量/h",
        unit: "kg/h",
        plworkDay: perprdWeight,
        psworkDay: perprdWeight,
        ppworkDay: perprdWeight,
        pfworkDay: perprdWeight
      };
    }
    console.log(recas);
    // 配列を1ヶ月単位に3ヶ月レイアウトに変更
    for (let ix = 0; ix < recas.length; ix = ix + 3) {
      let perrec = {};
      perrec.unit = recas[ix].unit;
      perrec.name = recas[ix].name;
      perrec.nbplHour = recas[ix].plworkDay;
      perrec.nbppHour = recas[ix].ppworkDay;
      perrec.nbpfHour = recas[ix].pfworkDay;
      perrec.ntplHour = recas[ix+1].plworkDay;
      perrec.ntpsHour = recas[ix+1].psworkDay;
      perrec.ntppHour = recas[ix+1].ppworkDay;
      perrec.naplHour = recas[ix+2].plworkDay;
      perrec.napsHour = recas[ix+2].psworkDay;
      perCkpListThree.push(perrec);
    }
    console.log(perCkpListThree);
    return perCkpListThree;
  }

  /**
   * 製品別時間当たり収益エリアのデータに整理する
   */
  var getPurhourReport = function(period, bugCkpListThreewithT) {
    let bugHList = myVal.SRC_LIST_PRODUCT_PERFORM;
    let perHList = myVal.SRC_LIST_SALES_PERFORM;
    let rec = [];
    let recas = [];
    let prcd = "";
    let slcd = "";
    // 生産実績の集計
    for (let ix = 0; ix < bugHList.length; ix++) {
      prcd = makeYearMonthSt(bugHList[ix]['生産日付'].value);
      recas[ix] = {
        date: prcd, // 生産日付
        code: bugHList[ix]['品番'].value, // 品番
        name: bugHList[ix]['規格'].value, // 規格
        size: bugHList[ix]['製品サイズ'].value, // 製品サイズ
        type: bugHList[ix]['品種コード'].value, // 品種コード
        rank: bugHList[ix]['等級コード'].value, // 等級コード
        mtrweight: bugHList[ix]['母材重量'].value, // 母材重量
        mtrprice: bugHList[ix]['母材金額'].value, // 母材金額
        prdweight: bugHList[ix]['製品重量'].value, // 製品重量
        prdnum: bugHList[ix]['本数'].value, // 本数
        prdlength: bugHList[ix]['総ロール長'].value, // 総ロール長
        losweight: bugHList[ix]['ロス重量'].value, // ロス重量
        losprice: bugHList[ix]['ロス金額'].value, // ロス金額
        drophour: bugHList[ix]['稼働時間'].value // 稼働時間
      };
    }
    // 同月同品番のものは集約する
    bugCkpListThreewithT = recas.reduce(function (result, current) {
      var element = result.find(function (p) {
        return p.date === current.date && p.code === current.code && p.rank === current.rank
      });
      if (element) {
        var ele1 = parseFloat(element.mtrweight);
        element.mtrweight = String(ele1 + parseFloat(current.mtrweight));
        var ele2 = parseFloat(element.mtrprice);
        element.mtrprice = String(ele2 + parseFloat(current.mtrprice));
        var ele3 = parseFloat(element.prdweight);
        element.prdweight = String(ele3 + parseFloat(current.prdweight));
        var ele4 = parseFloat(element.prdlength);
        element.prdlength = String(ele4 + parseFloat(current.prdlength));
        var ele5 = parseFloat(element.prdnum);
        element.prdnum = String(ele5 + parseFloat(current.prdnum));
        var ele6 = parseFloat(element.losweight);
        element.losweight = String(ele6 + parseFloat(current.losweight));
        var ele7 = parseFloat(element.losprice);
        element.losprice = String(ele7 + parseFloat(current.losprice));
        var ele8 = parseFloat(element.drophour);
        element.drophour = String(ele8 + parseFloat(current.drophour));
      } else {
        result.push({
          date: current.date,
          code: current.code,
          name: current.name,
          size: current.size,
          type: current.type,
          rank: current.rank,
          mtrweight: current.mtrweight,
          mtrprice: current.mtrprice,
          prdweight: current.prdweight,
          prdnum: current.prdnum,
          prdlength: current.prdlength,
          losweight: current.losweight,
          losprice: current.losprice,
          drophour: current.drophour
        });
      }
      return result;
    }, []);
    console.log(bugCkpListThreewithT);
    // 販売実績の集計
    rec = [];
    recas = [];
    for (let iv = 0; iv < perHList.length; iv++) {
      slcd = makeYearMonthSt(perHList[iv]['販売日付'].value);
      recas[iv] = {
        date: slcd, // 販売日付
        code: perHList[iv]['品番'].value, // 品番
        rank: perHList[iv]['等級コード'].value, // 等級コード
        salweight: perHList[iv]['販売重量'].value, // 販売重量
        salprice: perHList[iv]['販売価格'].value // 販売金額
      };
    }
    // 同月同品番のものは集約する
    var sumrecsal = recas.reduce(function (result, current) {
      var element = result.find(function (p) {
        return p.date === current.date && p.code === current.code && p.rank === current.rank
      });
      if (element) {
        var ele1 = parseFloat(element.salweight);
        element.salweight = String(ele1 + parseFloat(current.salweight));
        var ele2 = parseFloat(element.salprice);
        element.salprice = String(ele2 + parseFloat(current.salprice));
      } else {
        result.push({
          date: current.date,
          code: current.code,
          rank: current.rank,
          salweight: current.salweight,
          salprice: current.salprice
        });
      }
      return result;
    }, []);
    console.log(sumrecsal);
    // 生産実績と販売実績の連想配列をマージ
    for (let iz = 0; iz < sumrecsal.length; iz++) {
      for (let iu = 0; iu < bugCkpListThreewithT.length; iu ++) {
        if (sumrecsal[iz].date === bugCkpListThreewithT[iu].date && sumrecsal[iz].code === bugCkpListThreewithT[iu].code
           && sumrecsal[iz].rank === bugCkpListThreewithT[iu].rank) {
          bugCkpListThreewithT[iu]['salweight'] = sumrecsal[iz].salweight;
          bugCkpListThreewithT[iu]['salprice'] = sumrecsal[iz].salprice;
        }
      }
    }
    console.log(bugCkpListThreewithT);
    return bugCkpListThreewithT;
    // 合計行を求める
    // integrateTotal(bugCkpListThree, bugCkpListThreewithT);
    // console.log(bugCkpListThreewithT);
  }

  /**
   * 顧客別ABC分析エリアのデータに整理する
   */
  var getSctRunkReport = function(prdHList, dataListComp) {
    let cstHList = myVal.LIST_SALES_CUSTOMER; // 顧客別・品番別販売実績
    let recas = [];
    let prcd = "";
    let slcd = "";
    // 品番別のスプレッドから顧客別粗利金額を計算
    for (let ix = 0; ix < cstHList.length; ix++) {
      let cstPrdSale = {};
      cstPrdSale = cstHList[ix];
      for (let iy = 0; iy < prdHList.length; iy++) {
        if (cstHList[ix]['code'] === prdHList[iy]['code'] && cstHList[ix]['rank'] === prdHList[iy]['rank']) {
          cstPrdSale.salprofit = parseFloat(cstHList[ix]['salweight'] * prdHList[iy]['spreadPrice']); // 粗利金額
        }
      }
      // 計算したフィールドをリストへ追加
      recas.push(cstPrdSale);
    }
    console.log(recas);
    // 同月同得意先のものは集約する
    var sumrec = recas.reduce(function (result, current) {
      var element = result.find(function (p) {
        return p.date === current.date && p.cstcode === current.cstcode
      });
      if (element) {
        var ele1 = parseFloat(element.salPrice);
        element.salPrice = String(ele1 + parseFloat(current.salPrice));
        var ele2 = parseFloat(element.sallength);
        element.sallength = String(ele2 + parseFloat(current.sallength));
        var ele3 = parseFloat(element.salweight);
        element.salweight = String(ele3 + parseFloat(current.salweight));
        var ele4 = parseFloat(element.salprofit);
        element.salprofit = ele4 + parseFloat(current.salprofit);
      } else {
        result.push({
          date: current.date,
          cstcode: current.cstcode,
          cstname: current.cstname,
          salPrice: current.salPrice,
          sallength: current.sallength,
          salweight: current.salweight,
          salprofit: current.salprofit
        });
      }
      return result;
    }, []);
    console.log(sumrec);
    // 粗利金額の降順でソート
    sumrec.sort(function(a, b) {
      if (a.salprofit < b.salprofit) return 1;
      if (a.salprofit > b.salprofit) return -1;
      return 0;
    });
    console.log(sumrec);
    var totalProfit = sumrec.reduce((sum, i) => sum + i.salprofit, 0);
    var plusProfit = 0;
    var runk = "Ａ";
    for (let ix = 0; ix < sumrec.length; ix++) {
      let cstPerSale = {};
      var salunit= 0;
      cstPerSale = sumrec[ix];
      cstPerSale.perSalprice = parseFloat(sumrec[ix]['salPrice'] / sumrec[ix]['salweight']); // 販売単価
      cstPerSale.perProfit = parseFloat(sumrec[ix]['salprofit'] * 100 / sumrec[ix]['salPrice']).toFixed(2); // 粗利率
      cstPerSale.perPrfprice = parseFloat(sumrec[ix]['salprofit'] / sumrec[ix]['salweight']); // 粗利単価
      salunit = parseFloat(sumrec[ix]['salprofit'] * 100 / totalProfit).toFixed(2);
      cstPerSale.salUnit = salunit; // 構成比
      cstPerSale.plusUnit = parseFloat(salunit) + parseFloat(plusProfit); // 累計構成比
      plusProfit = parseFloat(salunit) + parseFloat(plusProfit);
      cstPerSale.runk = runk;
      if (plusProfit > 70) runk = "Ｂ";
      if (plusProfit > 90) runk = "Ｃ";
      // 計算したフィールドをリストへ追加
      dataListComp.push(cstPerSale);
    }
    console.log(dataListComp);
    // 合計行を求める
    // integrateTotal(bugCkpListThree, bugCkpListThreewithT);
    // console.log(bugCkpListThreewithT);
  }

  /*****************************************************************************************************/
  // ▼▼▼▼▼▼▼ スピナー関連 ▼▼▼▼▼▼▼

  // スピナーを動作させる関数
  var showSpinner = function() {
    // 要素作成等初期化処理
    if ($('.kintone-spinner').length === 0) {
      // スピナー設置用要素と背景要素の作成
      var spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
      var spin_div_add = $('<div align="center" id="kintone-spin-progress" class="kintone-spinner"><label id="kintone-spin-progress-label"></label></div>');
      var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');

      // スピナー用要素をbodyにappend
      $(document.body).append(spin_div, spin_bg_div);
      $(document.body).append(spin_div_add);

      // スピナー動作に伴うスタイル設定
      $(spin_div).css({
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'z-index': '510',
        // 'background-color': '#fff',
        'padding': '26px',
        '-moz-border-radius': '4px',
        '-webkit-border-radius': '4px',
        'border-radius': '4px'
      });
      $(spin_div_add).css({
        'position': 'fixed',
        'top': '60%',
        'left': '0%',
        'z-index': '510',
        'color': 'black',
        'width': '100%',
        // 'background-color': '#fff',
        // 'opacity': '0.2',
        '-moz-border-radius': '4px',
        '-webkit-border-radius': '4px',
        'border-radius': '4px',
        'margin': 'auto'
      });

      $(spin_bg_div).css({
        'position': 'fixed',
        'top': '0px',
        'left': '0px',
        'z-index': '500',
        'width': '100%',
        'height': '200%',
        'background-color': '#000',
        'opacity': '0.2',
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
  };

  // スピナーを停止させる関数
  var hideSpinner = function() {
    updateSpinnerLabel("");
    // スピナー停止（非表示）
    $('.kintone-spinner').hide();
  };

  var updateSpinnerLabel = function(message) {
    $("#kintone-spin-progress-label").text(message);
  };

  // ▲▲▲▲▲▲▲ スピナー関連 ▲▲▲▲▲▲▲
  /*****************************************************************************************************/

  var myVal = {};
  /** 全担当者一覧 */
  myVal.ALL_LIST_PERSON_OF_CHARGE;
  myVal.ALL_SRC_LIST_PERSON_OF_CHARGE;
  /** 仕入予算一覧 */
  myVal.ALL_LIST_PURCHASE_BUDGET;
  myVal.ALL_SRC_LIST_PURCHASE_BUDGET;
  /** 仕入予算一覧(期間指定) */
  myVal.LIST_PURCHASE_BUDGET;
  myVal.SRC_LIST_PURCHASE_BUDGET;
  /** 生産予算一覧 */
  myVal.ALL_LIST_PRODUCT_BUDGET;
  myVal.ALL_SRC_LIST_PRODUCT_BUDGET;
  /** 生産予算一覧(期間指定) */
  myVal.LIST_PRODUCT_BUDGET;
  myVal.SRC_LIST_PRODUCT_BUDGET;
  /** 製品在庫予算一覧 */
  myVal.ALL_LIST_PRDSTOCK_BUDGET;
  myVal.ALL_SRC_LIST_PRDSTOCK_BUDGET;
  /** 製品在庫予算一覧(期間指定) */
  myVal.LIST_PRDSTOCK_BUDGET;
  myVal.SRC_LIST_PRDSTOCK_BUDGET;
  /** 販売予算一覧 */
  myVal.ALL_LIST_SALES_BUDGET;
  myVal.ALL_SRC_LIST_SALES_BUDGET;
  /** 販売予算一覧(期間指定) */
  myVal.LIST_SALES_BUDGET;
  myVal.SRC_LIST_SALES_BUDGET;
  /** 仕入実績一覧 */
  myVal.ALL_LIST_PURCHASE_PERFORM;
  myVal.ALL_SRC_LIST_PURCHASE_PERFORM;
  /** 仕入実績一覧(期間指定) */
  myVal.LIST_PURCHASE_PERFORM;
  myVal.SRC_LIST_PURCHASE_PERFORM;
  /** 生産実績一覧 */
  myVal.ALL_LIST_PRODUCT_PERFORM;
  myVal.ALL_SRC_LIST_PRODUCT_PERFORM;
  /** 生産実績一覧(期間指定) */
  myVal.LIST_PRODUCT_PERFORM;
  myVal.SRC_LIST_PRODUCT_PERFORM;
  /** 生産実績一覧(稼働状況向け工場全体) */
  myVal.LIST_PLANT_PERFORM;
  myVal.ALL_LIST_PLANT_PERFORM;
  /** 販売実績一覧 */
  myVal.ALL_LIST_SALES_PERFORM;
  myVal.ALL_SRC_LIST_SALES_PERFORM;
  /** 販売実績一覧(期間指定) */
  myVal.LIST_SALES_PERFORM;
  myVal.SRC_LIST_SALES_PERFORM;
  /** 販売実績一覧(顧客別) */
  myVal.ALL_LIST_SALES_CUSTOMER;
  myVal.ALL_SRC_LIST_SALES_CUSTOMER;
  /** 販売実績一覧(期間指定・顧客別) */
  myVal.LIST_SALES_CUSTOMER;
  myVal.SRC_LIST_SALES_CUSTOMER;
  /** 製品在庫実績一覧 */
  myVal.ALL_LIST_PRDSTOCK_PERFORM;
  myVal.ALL_SRC_LIST_PRDSTOCK_PERFORM;
  /** 製品在庫実績一覧(期間指定) */
  myVal.LIST_PRDSTOCK_PERFORM;
  myVal.SRC_LIST_PRDSTOCK_PERFORM;
  /** 稼働状況実績一覧 */
  myVal.ALL_LIST_HUMAN_PERFORM;
  myVal.ALL_SRC_LIST_HUMAN_PERFORM;
  /** 稼働状況実績一覧(期間指定) */
  myVal.LIST_HUMAN_PERFORM;
  myVal.SRC_LIST_HUMAN_PERFORM;
  /** 顧客一覧 */
  myVal.ALL_LIST_CUSTOMER;
  myVal.ALL_SRC_LIST_CUSTOMER;
  /** 顧客一覧(期間指定) */
  myVal.LIST_CUSTOMER;
  myVal.SRC_LIST_CUSTOMER;
  /** 受注済み案件一覧 */
  myVal.ALL_LIST_MATTER;
  myVal.ALL_SRC_LIST_MATTER;
  /** 受注済み案件一覧(期間指定) */
  myVal.LIST_MATTER;
  myVal.SRC_LIST_MATTER;
  /** 担当者一覧(期間指定) */
  myVal.LIST_PERSON_OF_CHARGE;
  myVal.SRC_LIST_PERSON_OF_CHARGE;
  /** 業務一覧 */
  myVal.LIST_BUSINESS_CATEGORY;
  myVal.SRC_LIST_BUSINESS_CATEGORY;
  /** リストに存在しない文字列 */
  myVal.SYS_VALUE_NOT_EXIST_NAME = SYS_VALUE_NOT_EXIST_NAME;
  /** sessionStorageに保存する際の選択担当者IDのキー名 */
  myVal.SELECT_CHARGE_ID = 'SELECT_CHARGE_ID';
  /** sessionStorageに保存する際の選択年月のキー名 YYYY/MM-YYYY/MM */
  myVal.SELECT_PERIOD_YEARMONTH = 'SELECT_PERIOD_YEARMONTH';
  ////////////////////////////////////////////////////////////////////////////////////////////
  // 値
  window.myVal = window.myVal || myVal;

  // 関数
  window.func = window.func || {};
  window.func.getPurchaseBudgetList = getPurchaseBudgetList;
  window.func.getProductBudgetList = getProductBudgetList;
  window.func.getStockBudgetList = getStockBudgetList;
  window.func.getSalesBudgetList = getSalesBudgetList;
  window.func.getProductPerformList = getProductPerformList;
  window.func.getSalesPerformList = getSalesPerformList;
  window.func.getHumanPerformList = getHumanPerformList;
  window.func.makeSelectYearMonth = makeSelectYearMonth;
  window.func.getOneMonthDailyReport = getOneMonthDailyReport;
  window.func.getPersonOfChargeList = getPersonOfChargeList;
  window.func.getCustomerList = getCustomerList;
  window.func.getOrderedMatterList = getOrderedMatterList;
  window.func.integrateTotal = integrateTotal;
  window.func.integratePeriodData = integratePeriodData;
  window.func.makeStorageYearMonth = makeStorageYearMonth;
  // 生産性分析/損益分析用
  window.func.setGridVal = setGridVal;
  window.func.doMainDisplay = doMainDisplay;
  window.func.showPerformListGrid = showPerformListGrid;
  window.func.showPerhourListGrid = showPerhourListGrid;
  window.func.showCstSalesRunkGrid = showCstSalesRunkGrid;
  ////////////////////////////////////////////////////////////////////////////////////////////
  window.func.headZero = headZero;
  window.func.toManHourSt = toManHourSt;
  window.func.getPeriodFromTo = getPeriodFromTo;
  window.func.checkPeriod = checkPeriod;
  window.func.toNumber = toNumber;
  // 工数分析Viewで色指定を使用
  window.func.COLOR_LOSS = COLOR_LOSS;
  ////////////////////////////////////////////////////////////////////////////////////////////
  // レンダラー
  window.func.monetaryRenderer = monetaryRenderer;
  window.func.percentageRenderer = percentageRenderer;
  window.func.manHourRenderer = manHourRenderer;
  window.func.manHourGainLossColorRenderer = manHourGainLossColorRenderer;
  window.func.monetaryGainLossRenderer = monetaryGainLossRenderer;
  window.func.plusMinusRenderer = plusMinusRenderer;
  window.func.plusRenderer = plusRenderer;
  window.func.plusMinusProfitLossRenderer = plusMinusProfitLossRenderer;
  window.func.colorRenderer = colorRenderer;

  // スピナー
  window.spinner = window.spinner || {};
  window.spinner.showSpinner = showSpinner;
  window.spinner.updateSpinnerLabel = updateSpinnerLabel;
  window.spinner.hideSpinner = hideSpinner;

  console.log('--- func js ---');

})(jQuery);
