/*
 * 契約顧客請求日更新プログラム
 * 20210628 MDSJ takahara
 * 20210712 MDSJ takahara Update
 */
jQuery.noConflict();
(function($) {
  "use strict";

  /**
   * kintone REST APIで一括更新するrecordsデータを作成する関数
   * @param records kintone REST APIで一括取得したrecordsデータ
   * @param billDay 一括更新する請求日データ
   * @param billDay 一括更新する請求番号データ
   * @returns {Array} kintone REST APIで一括更新するrecordsデータ
   */
  function createPutRecords(records, billDay, billNum) {
    var putRecords = [];
    for (var i = 0, l = records.length; i < l; i++) {
      var record = records[i];
      putRecords[i] = {
        id: record.$id.value,
        record: {
          前回請求日: {
            value: billDay
          },
          前回請求番号: {
            value: billNum
          }
        }
      };
    }
    return putRecords;
  }

  // 新規保存成功後イベント
  kintone.events.on(['app.record.create.submit.success'], function(event) {
    var record = event.record;
    var clientRecordId = event.recordId;
    var relatedAppId = kintone.app.getRelatedRecordsTargetAppId('顧客契約一覧');
    var billDay = record['請求日'].value;
    var custCd = record['所属・会社名１'].value;;
    var custName = record['顧客名'].value;
    var query;
    if (record['所属・会社名１'].value) {
      query = '所属・会社名１ = "' + custCd + '"';
    } else {
      query = '顧客名 = "' + custName + '"';
    }
    var paramGet = {
        'app': relatedAppId,
        'query': query
    };
    // 入金管理アプリID
    //var APP_CONSTLIST = 79;
    var APP_CONSTLIST = 448;
    var billNum = record['請求番号'].value;
    var billCD = custCd;
    var billCstName = custName;
    var billCstCd = record['顧客番号'].value;
    var billDay = record['請求日'].value;
    var billPrice = record['請求総額'].value;
    var params = {
        'app': APP_CONSTLIST,
        "record": {
          "請求番号": {
            "value": billNum
          },
          "請求先所属・会社名": {
            "value": billCD
          },
          "請求先名": {
            "value": billCstName
          },
          "請求日": {
            "value": billDay
          },
          "請求額": {
            "value": billPrice
          },
          "請求先区分": {
            "value": "法人"
          }
        }
      };
      // 売上管理アプリID
      //var APP_OTHERBILL = 82;
      var APP_OTHERBILL = 446;
      var paramList = [];
      var virtualFlg = false;
      // 請求明細分をそれぞれ別レコードで
      for (var i = 0; i < record['請求明細']['value'].length; i++) {
        var billList = record['請求明細'].value[i].value;
        // バーチャルプランのみ6ヶ月を月ごとに分割
        if (billList['種別']['value'] === "バーチャル") {
          virtualFlg = true;
          for (var j = 0; j < 6; j++) {
            var paramOne = {
              "対象顧客": {
                "value": billCstName
              },
              "請求番号": {
                "value": billNum
              },
              "種別": {
                "value": "system（月額請求）"
              },
              "売上明細": {
                "value": [
                  {
                    "value": {
                      "請求対象月": {
                        "value": moment(billDay).add(j, 'month').endOf('month').format("YYYY-MM-DD")
                      },
                      "項目": {
                        "value": billList['プラン・オプション']['value']
                      },
                      "金額": {
                        "value": Math.round(billList['小計']['value'] / 6)
                      }
                    }
                  }
                ]
              }
            };
            paramList.push(paramOne);
          }
        } else if (billList['プラン・オプション']['value'] === "通話料") {
          if (virtualFlg) {
            for (var j = 0; j < 6; j++) {
              var paramOne = {
                "対象顧客": {
                  "value": billCstName
                },
                "請求番号": {
                  "value": billNum
                },
                "種別": {
                  "value": "system（月額請求）"
                },
                "売上明細": {
                  "value": [
                    {
                      "value": {
                        "請求対象月": {
                          "value": moment(billDay).add(j, 'month').endOf('month').format("YYYY-MM-DD")
                        },
                        "項目": {
                          "value": billList['プラン・オプション']['value']
                        },
                        "金額": {
                          "value": Math.round(billList['小計']['value'] / 6)
                        }
                      }
                    }
                  ]
                }
              };
              paramList.push(paramOne);
            }
          } else {
            for (var k = 0; k < 2; k++) {
              var paramOne = {
                "対象顧客": {
                  "value": billCstName
                },
                "請求番号": {
                  "value": billNum
                },
                "種別": {
                  "value": "system（月額請求）"
                },
                "売上明細": {
                  "value": [
                    {
                      "value": {
                        "請求対象月": {
                          "value": moment(billDay).add(k - 2, 'month').endOf('month').format("YYYY-MM-DD")
                        },
                        "項目": {
                          "value": billList['プラン・オプション']['value']
                        },
                        "金額": {
                          "value": Math.round(billList['小計']['value'] / 2)
                        }
                      }
                    }
                  ]
                }
              };
              paramList.push(paramOne);
            }
          }
        } else {
          console.log(virtualFlg);
          console.log(billList['種別']['value']);
          if (virtualFlg && billList['種別']['value'] === "オプション") {
            console.log("virOp");
            for (var l = 0; l < 6; l++) {
              var paramOne = {
                "対象顧客": {
                  "value": billCstName
                },
                "請求番号": {
                  "value": billNum
                },
                "種別": {
                  "value": "system（月額請求）"
                },
                "売上明細": {
                  "value": [
                    {
                      "value": {
                        "請求対象月": {
                          "value": moment(billDay).add(l, 'month').endOf('month').format("YYYY-MM-DD")
                        },
                        "項目": {
                          "value": billList['プラン・オプション']['value']
                        },
                        "金額": {
                          "value": Math.round(billList['小計']['value'] / 6)
                        }
                      }
                    }
                  ]
                }
              };
              paramList.push(paramOne);
            }
          } else {
            var paramOne = {
              "対象顧客": {
                "value": billCstName
              },
              "請求番号": {
                "value": billNum
              },
              "種別": {
                "value": "system（月額請求）"
              },
              "売上明細": {
                "value": [
                  {
                    "value": {
                      "請求対象月": {
                        "value": billDay
                      },
                      "項目": {
                        "value": billList['プラン・オプション']['value']
                      },
                      "金額": {
                        "value": billList['小計']['value']
                      }
                    }
                  }
                ]
              }
            };
            paramList.push(paramOne);
          }
        }
        console.log(paramList);
      }
      var paramBulk = {
        'app': APP_OTHERBILL,
        'records': paramList
      };
    // 契約顧客請求日・請求番号更新
    return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', paramGet).then(function(resp) {
      var records = resp.records;
      var paramPut = {
        'app': relatedAppId,
        'records': createPutRecords(records, billDay, billNum)
      };
      return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', paramPut).then(function(resp) {
        // 売上アプリ登録処理
        kintone.api(kintone.api.url('/k/v1/records', true), 'POST', paramBulk, function(resp) {
          // success
          console.log(resp);
        }, function(error) {
          // error
          console.log(error);
        });
        // 入金管理アプリ登録処理
        return kintone.api(kintone.api.url('/k/v1/record', true), 'POST', params).then(function(resp) {
          console.log(resp);
        });
      });
    });
  });
})(jQuery);
