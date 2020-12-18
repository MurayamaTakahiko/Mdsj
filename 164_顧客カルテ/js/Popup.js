jQuery.noConflict();
(function($) {
  "use strict";
  //元の'overflow'値保持
  var overflow;

  //出力フィールド
  var SHOW_FIELDS = {
    "row1": [{
      "id": "taxCorporation",
      "label": "税理士法人名",
      "code": "税理士法人名"
    }],
    "row2": [{
        "id": "taxerName",
        "label": "代表税理士氏名",
        "code": "代表税理士氏名"
      },
      {
        "id": "taxerCode",
        "label": "担当者コード",
        "code": "担当者コード"
      },
    ],
    "row3": [{
        "id": "officePlace",
        "label": "事務所の所在地",
        "code": "事務所の所在地"
      },
      {
        "id": "officePhone",
        "label": "電話番号",
        "code": "電話番号"
      },
      {
        "id": "taxCorporationNo",
        "label": "登録番号又は税理士法人番号",
        "code": "登録番号又は税理士法人番号"
      },
    ],
    "row4": [{
        "id": "mainOfficeName",
        "label": "主たる事務所の名称",
        "code": "主たる事務所の名称"
      },
      {
        "id": "mainOfficePlace",
        "label": "主たる事務所の所在地",
        "code": "主たる事務所の所在地"
      },
      {
        "id": "mainOfficePhone",
        "label": "主たる事務所の電話番号",
        "code": "主たる事務所の電話番号"
      },
    ],
  };

  //ポップアップのhtml生成
  function createPopupContents() {
    //元の'overflow'値退避
    overflow = $('html, body').css('overflow');

    //モーダルダイアログ要素生成
    var source = '' +
      '<div class="emxas-popup-area">' +
      '<div class="emxas-popup-overlay">' +
      '<div class="emxas-popup-contents">' +
      '<div class="emxas-popup-head-button-area">' +
      '<button class="emxas-popup-head-button-close">' +
      '<i class="far fa-window-close fa-lg"></i>' +
      '</button>' +
      '</div>' +
      '<div class="emxas-popup-contents-field-area">' +
      '</div>' +
      '<div class="emxas-popup-contents-button-area">' +
      '<div>' +
      '<button class="emxas-popup-contents-button-output">出力</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    return source;
  }

  //モーダルダイアログを閉じる
  function closePopup() {
    $('html, body').css('overflow', overflow);
    $('.emxas-popup-area').hide();
  }

  //モーダルダイアログ内の各コンポーネントに対応するフィールドを設定
  function setTaxCorpInfo(records) {
    // if(records.length === 0) return;
    // var record = records[0];

    var source = '';
    for (var row in SHOW_FIELDS) {
      for (var i = 0; i < SHOW_FIELDS[row].length; i++) {
        var field = SHOW_FIELDS[row][i];
        var fieldValue = "";
        if (records.length > 0) {
          fieldValue = records[0][field["code"]]["value"];
        }
        source += '' +
          '<td>' +
          '<span>' + field["label"] + '</span>' +
          '</td>' +
          '<td>' +
          '<span class="emxas-popup-contents-field-' + field["id"] + '" style="display:none">' + field["label"] + '</span>' +
          '<input id="emxas-popup-contents-field-' + field["id"] + '" type=text value="' + fieldValue + '" >' +
          '</td>';
      }
      //1行に設定
      source = '<tr>' + source + '</tr>';
    }

    //テーブル全体に設定
    source = '<table >' + source + '</table>';
    $(".emxas-popup-contents-field-area").html(source);
  }

  window.createPopupContents = createPopupContents;
  window.closePopup = closePopup;
  window.setTaxCorpInfo = setTaxCorpInfo;

})(jQuery);
