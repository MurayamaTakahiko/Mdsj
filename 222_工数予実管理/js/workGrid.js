jQuery.noConflict();
(function($) {
  var oneTimeFlg = true;
  "use strict";

  // ローディング画面を出す関数
  function setLoading() {
    var $body = $('body');
    $body.css('width', '100%');

    var $loading = $('<div>').attr('id', 'loading').attr('class', 'loading')
      .attr('style', 'width: 100%; height: 100%; position:absolute;' +
        ' top:0; left:0; text-align:center; background-color:#666666; opacity:0.6; z-index: 9;');
    var $div = $('<div>').attr('id', 'imgBox').attr('style', 'width: 100%; height: 100%;');
    var $img = $('<img>').attr('src', 'data:image/gif;base64,R0lGODlhZABkAPQAAAAAAP///' +
      '3BwcJaWlsjIyMLCwqKiouLi4uzs7NLS0qqqqrKysoCAgHh4eNra2v///4iIiLq6uvT09AAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+GkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BA' +
      'AHAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAZABkAAAF/yAgjmRpnmiqrmzrvnAsz3Rt33iu73zfMgoDw' +
      '0csAgSEh/JBEBifucRymYBaaYzpdHjtuhba5cJLXoHDj3HZBykkIpDWAP0YrHsDiV5faB3CB3c8EHuFdisN' +
      'DlMHTi4NEI2CJwWFewQuAwtBMAIKQZGSJAmVelVGEAaeXKEkEaQSpkUNngYNrCWEpIdGj6C3IpSFfb+CAwk' +
      'OCbvEy8zNzs/Q0dLT1NUrAgOf1kUMBwjfB8rbOQLe3+C24wxCNwPn7wrjEAv0qzMK7+eX2wb0mzXu8iGIty' +
      '1TPRvlBKazJgBVnBsN8okbRy6VgoUUM2rcyLGjx48gQ4ocSbKkyZMoJf8JMFCAwAJfKU0gOUDzgAOYHiE8X' +
      'DGAJoKaalAoObHERFESU0oMFbF06YikKQQsiKCJBYGaNR2ocPr0AQCuQ8F6Fdt1rNeuLSBQjRDB3qSfPm1u' +
      'PYvUbN2jTO2izQs171e6J9SuxXjCAFaaQYkC9ku2MWCnYR2rkDqV4IoEWG/O5fp3ceS7nuk2Db0YBQS3UVm' +
      '6xBmztevXsGPLnk27tu3buHOvQU3bgIPflscJ4C3D92/gFNUWgHPj2G+bmhkWWL78xvPjDog/azCdOmsXzr' +
      'F/dyYgAvUI7Y7bDF5N+QLCM4whM7BxvO77+PPr38+//w4GbhSw0xMQDKCdJAwkcIx2ggMSsQABENLHzALIL' +
      'DhMERAQ0BKE8IUSwYILPjEAhCQ2yMoCClaYmA8NQLhhh5I0oOCCB5rAQI0mGEDiRLfMQhWOI3CXgIYwotBA' +
      'A/aN09KQCVw4m4wEMElAkTEhIWUCSaL0IJPsySZVlC/5J+aYZJZppgghAAAh+QQABwABACwAAAAAZABkAAA' +
      'F/yAgjmRpnmiqrmzrvnAsz3Rt33iu73zfMhAIw0csAgQDhESCGAiM0NzgsawOolgaQ1ldIobZsAvS7ULE6B' +
      'W5vDynfUiFsyVgL58rwQLxOCzeKwwHCIQHYCsLbH95Dg+OjgeAKAKDhIUNLA2JVQt4KhGPoYuSJEmWlgYuS' +
      'BCYLRKhjwikJQqnlgpFsKGzJAa2hLhEuo6yvCKUv549BcOjxgOVhFdFdbAOysYNCgQK2HDMVAXexuTl5ufo' +
      '6err7O3kAgKs4+48AhEH+ATz9Dj2+P8EWvET0YDBPlX/Eh7i18CAgm42ICT8l2ogAAYPFSyU0WAiPjcDtSk' +
      'wIHCGAAITE/+UpCeg4EqTKPGptEikpQEGL2nq3Mmzp8+fQIMKHUq0qNGjSJO6E8DA4RyleQw4mOqgk1F4LR' +
      'o4OEDVwTQUjk48MjGWxC6zD0aEBbBWbdlJBhYsAJlC6lSuDiKoaOuWbdq+fMMG/us37eCsCuRaVWG3q94Uf' +
      'EUIJlz48GHJsND6VaFJ8UEAWrdS/SqWMubNgClP1nz67ebIJQTEnduicdWDZ92aXq17N+G1kV2nwEqnqYGn' +
      'UJMrX868ufPn0KNLn069Or+N0hksSFCArkWmORgkcJCgvHeWCiIYOB9jAfnx3D+fE5A+woKKNSLAh4+dXYM' +
      'I9gEonwoKlPeeON8ZAOCgfTc0UB5/OiERwQA5xaCJff3xM6B1HHbo4YcghigiNXFBhEVLGc5yEgEJEKBPFB' +
      'BEUEAE7M0yAIs44leTjDNGUKEkBrQopDM+NFDAjEf+CMiNQhJAWpE8zqjkG/8JGcGGIjCQIgoMyOhjOkwNM' +
      'MCWJTTkInJZNYAlPQYU4KKT0xnpopsFTKmUPW8ScOV0N7oJ53TxJAbBmiMWauihiIIYAgAh+QQABwACACwA' +
      'AAAAZABkAAAF/yAgjmRpnmiqrmzrvnAsz3Rt33iu73zv/8AZo4BAFBjBpI5xKBYPSKWURnA6CdNszGrVelt' +
      'c5zcoYDReiXDCBSkQCpDxShA52AuCFoQribMKEoGBA3IpdQh2B1h6TQgOfisDgpOQhSMNiYkIZy4CnC0Ek4' +
      'IFliVMmnYGQAmigWull5mJUT6srRGwJESZrz+SrZWwAgSJDp8/gJOkuaYKwUADCQ4JhMzW19jZ2tvc3d7f4' +
      'NoCCwgPCAs4AwQODqrhIgIOD/PzBzYDDgfsDgrvAAX0AqKjIW0fuzzhJASk56CGwXwOaH1bGLBGQX0H31Gc' +
      'h6CGgYf93gGkOJCGgYIh3/8JUBjQHg6J/gSMlBABob+bOHPq3Mmzp8+fQIMKHUq0qNEUAiBAOHZ0RYN10p4' +
      '1PZGg6jQHNk/M07q1BD2vX0l0BdB1rIiKKhgoMMD0BANpVqmpMHv2AVm7I7aa1Yu3bl6+YvuuUEDYXdq40q' +
      'qhoHu38d+wfvf2pRjYcYq1a0FNg5vVBGPAfy03lhwa8mjBJxqs7Yzi6WapgemaPh0b9diythnjSAqB9dTfw' +
      'IMLH068uPHjyJMrX84cnIABCwz4Hj4uAYEEeHIOMAAbhjrr1lO+g65gQXcX0a5fL/nOwIL3imlAUG/d8DsI' +
      '7xfAlEFH/SKcEAywHw3b9dbcgQgmqOByggw26KAIDAxwnnAGEGAhe0AIoEAE0mXzlBsWTojDhhFwmE0bFro' +
      'R3w8RLNAiLtg8ZaGFbfVgwIv2WaOOGzn+IIABCqx4TRk1pkXYgMQNUUAERyhnwJIFFNAjcTdGaWJydCxZ03' +
      'INBFjkg2CGKeaYCYYAACH5BAAHAAMALAAAAABkAGQAAAX/ICCOZGmeaKqubOu+cCzPdG3feK7vfO//wBnDU' +
      'CAMBMGkTkA4OA8EpHJKMzyfBqo2VkBcEYWtuNW8HsJjoIDReC2e3kPEJRgojulVPeFIGKQrEGYOgCoMBwiJ' +
      'Bwx5KQMOkJBZLQILkAuFKQ2IiYqZjQANfA4HkAltdKgtBp2tA6AlDJGzjD8KrZ0KsCSipJCltT63uAiTuyI' +
      'Gsw66asQHn6ACCpEKqj8DrQevxyVr0D4NCgTV3OXm5+jp6uvs7e7v6gIQEQkFEDgNCxELwfACBRICBtxGQ1' +
      'QCPgn6uRsgsOE9GgoQ8inwLV2ChgLRzKCHsI9Cdg4wBkxQw9LBPhTh/wG4KHIODQYnDz6Ex1DkTCEL6t189' +
      'w+jRhsf/Q04WACPyqNIkypdyrSp06dQo0qdSrWqVUcL+NER0MAa1AYOHoh9kKCiiEoE6nl1emDsWAIrcqYl' +
      'kDKF2BNjTeQl4bbEXRF//47oe8KABLdjg4qAOTcBAcWAH+iVLBjA3cqXJQ/WbDkzX84oFCAey+wEg8Zp136' +
      'e3Pnz3sitN28mDLsyiQWjxRo7EaFxXRS2W2OmDNqz7NrDY5swkPsB5FC91a6gHRm08OKvYWu3nd1EW8Rw9X' +
      'A1q1TAd7Flr76wo1W9+/fw48ufT7++/fv48+s/wXUABPLwCWAAAQRiolQD/+FDIKRdBOz0TjgKkGNDAwsSS' +
      'JBKEESowHOUEFjEY0lJEyGAegyw4G5HNcAAiS0g2ACL+8Uo44w01mjjjTi+wMCKMs5TQAQO+iCPAQme00AE' +
      'P/4IIw0DZLVAkLA0kGQBBajGQ5MLKIDiMUcmGYGVO0CQZXvnCIAkkFOsYQCH0XQVAwP+sRlgVvssadU8+6C' +
      'p3zz66JmfNBFE8EeMKrqZ46GIJqrooi6EAAAh+QQABwAEACwAAAAAZABkAAAF/yAgjmRpnmiqrmzrvnAsz3' +
      'Rt33iu73zv/0Baw2BoBI88g2N5MCCfNgZz6WBArzEl1dHEeluGw9Sh+JpTg+1y8GpABGdWQxFZWF0L7nLhE' +
      'hAOgBFwcScNCYcOCXctAwsRbC5/gIGEJwuIh3xADJOdg5UjEQmJowlBYZ2AEKAkeZgFQZypB0asIgyYCatB' +
      'CakEtiQMBQkFu0GGkwSfwGYQBovM0dLT1NXW19jZ2ts+AgYKA8s0As6Q3AADBwjrB9AzogkEytwN6uvs4jA' +
      'Q8fxO2wr3ApqTMYAfgQSatBEIeK8MjQEHIzrUBpAhgoEyIkSct62BxQP5YAhoZCDktQEB2/+d66ZAQZGVMG' +
      'PKnEmzps2bOHPq3Mmzp88v5Iz9ZLFAgtGLjCIU8IezqFGjDzCagCBPntQSDx6cyKoVa1avX0mEBRB2rAiuX' +
      'U00eMoWwQoF8grIW2H2rFazX/HeTUs2Lde+YvmegMCWrVATC+RWpSsYsN6/I/LyHYtWL+ATAwo/PVyCatWr' +
      'gU1IDm3Zst2+k/eiEKBZgtsVA5SGY1wXcmTVt2v77aq7cSvNoIeOcOo6uPARAhhwPs68ufPn0KNLn069uvX' +
      'rfQpklSAoRwOT1lhXdgC+BQSlEZZb0175QcJ3Sgt039Y+6+sZDQrI119LW/26MUQQ33zaSFDfATY0kFh2eu' +
      'ewV9l748AkwAGVITidAAA9gACE2HXo4YcghijiiN0YEIEC5e3QAAP9RWOiIxMd0xKK0zhSRwRPMNCSAepVY' +
      'oCNTMnoUopxNDLbEysSuVIDLVLXyALGMSfAAgsosICSP01J5ZXWQUBlj89hSeKYZJZpJoghAAAh+QQABwAF' +
      'ACwAAAAAZABkAAAF/yAgjmRpnmiqrmzrvnAsz3Rt33iu73zv/0Bag8FoBI+8RmKZMCKfNQbTkSAIoNgYZEl' +
      'NOBjZcGtLLUPE6JSg601cXQ3IO60SQAzyF9l7bgkMbQNzdCUCC1UJEWAuAgOCLwYOkpIDhCdbBIiVQFIOB5' +
      'IHVpYlBpmmC0EMk6t9oyIDplUGqZ+ek06uAAwEpqJBCqsOs7kjDAYLCoM/DQa1ycSEEBCL0NXW19jZ2tvc3' +
      'd7fPwJDAsoz4hC44AIFB+0R5TGwvAbw2Q0E7fnvNQIEBbwEqHVj0A5BvgPpYtzj9W+TNwUHDR4QqBAgr1bd' +
      'IBzMlzCGgX8EFtTD1sBTPgQFRv/6YTAgDzgAJfP5eslDAAMFDTrS3Mmzp8+fQIMKHUq0qNGjSJMisYNR6Yo' +
      'tCBAE9GPAgE6fEKJqnbiiQYQCYCmaePDgBNmyJc6mVUuC7Ai3AOC+ZWuipAStUQusGFDgawQFK+TOjYtWhF' +
      'vBhwsTnlsWseITDfDibVoCAtivgFUINtxY8VnHiwdz/ty2MwoBkrVSJtEAbNjAjxeDnu25cOLaoU2sSa236' +
      'wCrKglvpss5t/DHcuEO31z57laxTisniErganQSNldf3869u/fv4MOLH0++vHk/A5YQeISjQfBr6yTIl5/S' +
      'xp2/76sNmM9fuwsDESyAHzgJ8DdfbzN4JWCkBBFYd40DBsqXgA0DMIhMfsQUGGEENjRQIR4v7Rehfy9gWE1' +
      '8/DkEnh0RJELieTDGKOOMNAa1DlkS1Bceap894ICJUNjhCJAyFNAjWahAA8ECTKrow5FkIVDNMcgMAwSUzF' +
      'nCAJMLvHiDBFBKWQ1LLgERAZRJBpVTiQ70eMBQDSigAHSnLYCAj2kCJYCcBjwz3h98EnkUM1adJ2iNiCaq6' +
      'KKLhgAAIfkEAAcABgAsAAAAAGQAZAAABf8gII5kaZ5oqq5s675wLM90bd94ru987//AoHAYEywShIWAyKwt' +
      'CMjEokmFCaJQwrLKVTWy0UZ3jCqAC+SfoCF+NQrIQrvFWEQU87RpQOgbYg0MMAwJDoUEeXoiX2Z9iT0Lhgm' +
      'TU4okEH0EZgNCk4WFEZYkX5kEEEJwhoaVoiIGmklDEJOSgq0jDAOnRBBwBba3wcLDxMXGx8jJysvMzUJbzg' +
      'AGn7s2DQsFEdXLCg4HDt6cNhHZ2dDJAuDqhtbkBe+Pxgze4N8ON+Tu58jp6+A3DPJtU9aNnoM/OBrs4wYuA' +
      'cJoPYBBnEixosWLGDNq3Mixo8ePIEOKxGHEjIGFKBj/DLyY7oDLA1pYKIgQQcmKBw9O4MxZYmdPnyRwjhAK' +
      'gOhQoCcWvDyA4IC4FAHtaLvJM2hOo0WvVs3K9ehRrVZZeFsKc0UDmnZW/jQhFOtOt2C9ingLt+uJsU1dolm' +
      'hwI5NFVjnxhVsl2tdwkgNby0RgSyCpyogqGWbOOvitlvfriVc2LKKli9jjkRhRNPJ0ahTq17NurXr17Bjy5' +
      '5NG0UDBQpOvx6AoHdTiTQgGICsrIFv3wdQvoCwoC9xZAqO+34Ow0DfBQ+VEZDeW4GNOgsWTC4WnTv1QQaAJ' +
      '2vA9Hhy1wPaN42XWoD1Acpr69/Pv79/ZgN8ch5qBUhgoIF7BSMAfAT07TDAgRCON8ZtuDWYQwIQHpigKAzg' +
      'poCEOGCYoQQJKGidARaaYB12LhAwogShKMhAiqMc8JYDNELwIojJ2EjXAS0UCOGAywxA105EjgBBBAlMZdE' +
      'CR+LESmpQRjklagxE+YB6oyVwZImtCUDAW6K51mF6/6Wp5po2hAAAIfkEAAcABwAsAAAAAGQAZAAABf8gII' +
      '5kaZ5oqq5s675wLM90bd94ru987//AoHAYE0AWC4iAyKwNCFDCoEmFCSJRQmRZ7aoaBWi40PCaUc/o9OwTN' +
      'MqvhiE84LYYg4GSnWpEChEQMQ0MVlgJWnZ8I36AgHBAT4iIa4uMjo9CC5MECZWWAI2Oij4GnaefoEcFBYVC' +
      'AlCIBK6gIwwNpEACCgsGubXAwcLDxMXGx8jJysvMZ7/KDAsRC5A1DQO9z8YMCQ4J39UzBhHTCtrDAgXf3gk' +
      'KNg3S0hHhx9zs3hE3BvLmzOnd6xbcYDCuXzMI677RenfOGAR1CxY26yFxosWLGDNq3Mixo8ePIEOKHEmyZD' +
      'EBAwz/GGDQcISAlhMFLHBwwIEDXyyOZFvx4MGJnj5LABU6lETPEUcBJEVa9MQAm1Ad0CshE4mCqUaDZlWql' +
      'atXpl9FLB26NGyKCFBr3lyxCwk1nl3F+iwLlO7crmPr4r17NqpNAzkXKMCpoqxcs0ftItaaWLFhEk9p2jyA' +
      'lSrMukTjNs5qOO9hzipkRiVsMgXKwSxLq17NurXr17Bjy55Nu7ZtIoRWwizZIMGB3wR2f4FQuVjv38gLCD8' +
      'hR8HVg78RIEdQnAUD5woqHjMgPfpv7S92Oa8ujAHy8+TZ3prYgED331tkp0Mef7YbJctv69/Pv7//HOlI0J' +
      'NyQ+xCwHPACOCAmV4S5AfDAAhEKF0qfCyg14BANCChhAc4CAQCFz6mgwIbSggYKCGKmAOJJSLgDiggXiiBC' +
      '9cQ5wJ3LVJ4hoUX5rMCPBIEKcFbPx5QYofAHKAXkissIKSQArGgIYfgsaGAki62JMCTT8J0Wh0cQcClkIK8' +
      'JuaYEpTpGgMIjIlAlSYNMKaOq6HUpgQIgDkbAxBAAOd/gAYqKA0hAAAh+QQABwAIACwAAAAAZABkAAAF/yA' +
      'gjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcChrQAYNotImiBQKi+RyCjM4nwOqtmV4Og3bcIpRuDLEaBNDoT' +
      'jDGg1BWmVQGORDA2GfnZusCxFgQg17BAUEUn4jEYGNQwOHhhCLJFYREQpDEIZ7ipUCVgqfQAt7BYOVYkduq' +
      'q6vsLGys7S1tre4ubq7UwIDBn04DAOUuwJ7CQQReDUMC8/FuXrJydE0Bs92uwvUBAnBNM7P4LcK3ufkMxDA' +
      'vMfnBbw9oQsDzPH3+Pn6+/z9/v8AAwocSLCgwYO9IECwh9AEBAcJHCRq0aAOqRMPHmDMaCKjRhIeP47gKII' +
      'kyZEeU/8IgMiSABc2mlacRAlgJkebGnGizCmyZk8UAxIIHdoqRR02LGaW5AkyZFOfT5c6pamURFCWES+aCG' +
      'WgKIqqN3uGfapzqU+xTFEIiChUYo+pO0uM3fnzpMm6VUs8jDixoVoIDBj6HUy4sOHDiBMrXsy4sWMSTSRkL' +
      'CD4ltcZK0M+QFB5lgIHEFPNWKB5cq7PDg6AFh0DQem8sVaCBn0gQY3XsGExSD0bdI0DryXgks0bYg3SpeHh' +
      'Qj07HQzgIR10lmWAr/MYC1wjWDD9sffv4MOLR3j1m5J1l/0UkMCevXIgDRIcQHCAQHctENrrv55D/oH/B7y' +
      'nnn7t2fYDAwD+R59zVmEkQCB7BvqgQIIAphdGBA9K4JILcbzQAID0/cfgFvk9aE0KDyFA34kp+AdgBK4MQK' +
      'CAKEqg4o0sniBAAQBS9goEESQQQY4nJHDjjRGy0EBg/Rx55GFO3ngYAVFuWBiCRx4w4kENFKBiAVuOJ+aYZ' +
      'IoZAgAh+QQABwAJACwAAAAAZABkAAAF/yAgjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcChrMBoNotImUCwi' +
      'iuRyCoNErhEIdduCPJ9arhgleEYWgrHaxIBAGDFkep1iGBhzobUQkdJLDAtOYUENEXx8fn8iBguOBkMNiIm' +
      'LJF6CA0MCBYh9lSMCEAYQikAMnBFwn2MCRquvsLGys7S1tre4ubq7vDqtpL5HvAIGBMYDeTTECgrJtwwEBc' +
      'YEzjIMzKO7A9PGpUUGzN61EMbSBOIxoei0ZdOQvTuhAw3V8Pb3+Pn6+/z9/v8AAwocSBCQo0wFUwhI8KDhg' +
      'wPrerUSUK8EAYcOD/CTRCABGhUMMGJ8d6JhSZMlHP+mVEkCJQCULkVgVFggQUcCC1QoEOlQQYqYMh+8FDrC' +
      'ZEyjRIMWRdoyaZ2bNhOoOmGAZ8OcKIAO3bqUpdKjSXk25XqiQdSb60JaJWlCK9OlZLeChetVrtMSm85iTXF' +
      'RpMafdYfefRsUqEuYg7WWkGTTk4qFGB1EHEavIpuDCTNr3sy5s+fPoEOLHk063YCaCZD1mlpjk4TXrwtYjg' +
      'Wh5gLWMiDA3o3wFoQECRwExw2jwG7YCXDlFS58r4wEx187wMUgOHDgEWpEiC4h+a281h34pKE7em9b1YUDn' +
      '7xiwHHZugKdYc/CSoIss0vr38+/v//RTRAQhRIC4AHLAAcgoCCkAuf50IACDkTYzCcCJLiggvTRAKEDB0TI' +
      'Fh0GXLjgeD4wwGGEESaQIREKiKggiT2YiOKJxI0xgIsIfKgCPS+YFWGHwq2oiYULHpCfCFZE+FELBszoQIN' +
      '0NEDkATWaIACHB2TpwJEAEGOdaqsIMIACYLKwQJZoHuDcCkZweUsBaCKQJQGfEZBmlgV8ZkCCceqYWXVpUg' +
      'OamNEYIOR/iCaq6KIAhAAAIfkEAAcACgAsAAAAAGQAZAAABf8gII5kaZ5oqq5s675wLM90bd94ru987//Ao' +
      'HBIExCPOMhiAUE6ZYLl0vissqJSqnWLGiwUA64Y1WiMfwKGmSgwgM+otsKwFhoWkYgBbmIo/gxEeXgLfCUN' +
      'fwp1QQp4eoaHakdRelqQl5iZmpucnZ6foKGioz8LCA8IC5akOAcPr68Oq6CzMguwuAWjEBEFC4syDriwEqI' +
      'Cvcg2w7iiDQXPBRHAMKfLD8bR0RE2t8u6ogzPEU01AsK4ErWdAtMzxxKvBeqs9PX29/j5+vv8/f7/AAMKNA' +
      'EBwryBJAYgkMCwEMIUAxhKlOBQn4AB0cKsWDiRYTsRr07AMjGSBDOT10D/pgyJkmUXAjAJkEMBoaPEmSRTo' +
      'gTgkue1niGB6hwptAXMAgR8qahpU4JGkTpHBI06bGdRlSdV+lQRE6aCjU3n9dRatCzVoT/NqjCAFCbOExE7' +
      'VoQ6tqTUtC2jbtW6967eE2wjPFWhUOLchzQNIl7MuLHjx5AjS55MubJlGQ3cKDj4kMEBBKARDKZ1ZwDnFQI' +
      '+hwb9UZMAAglgb6uhcDXor6EUwN49GoYC26AJiFoQu3jvF7Vt4wZloDjstzBS2z7QWtPuBKpseA594LinAQ' +
      'YU37g45/Tl8+jTq19fmUF4yq8PfE5QPQeEAgkKBLpUQL7/BEJAkMCADiSwHx8NyIeAfH8IHOgDfgUm4MBhY' +
      '0Dg34V7ACEhgQnMxocACyoon4M9EBfhhJdEcOEBwrkwQAQLeHcCAwNKSEB9VRzjHwHmAbCAA0Ci6AIDeCji' +
      'GgQ4jjBAkAcAKSNCCgQZ5HKOGQBkk0Bm+BgDUjZJYmMGYOmAlpFlRgd7aKap5poyhAAAIfkEAAcACwAsAAA' +
      'AAGQAZAAABf8gII5kaZ5oqq5s675wLM90bd94ru987//AoHBIExCPOIHB0EA6ZUqFwmB8WlkCqbR69S0cD8' +
      'SCy2JMGd3f4cFmO8irRjPdW7TvEaEAYkDTTwh3bRJCEAoLC35/JIJ3QgaICwaLJYGND0IDkRCUJHaNBXoDA' +
      'xBwlGt3EqadRwIFEmwFq6y0tba3uLm6u7y9viYQEQkFpb8/AxLJybLGI7MwEMrSA81KEQNzNK/SyQnGWQsR' +
      'EZM1CdzJDsYN4RHh2TIR5xLev1nt4zbR59TqCuOcNVxxY1btXcABBBIkGPCsmcOHECNKnEixosWLGDNq3Mj' +
      'xCIRiHV0wIIAAQQKAIVX/MDhQsqQElBUFNFCAjUWBli0dGGSEyUQbn2xKOOI5IigAo0V/pmBQIEIBgigg4M' +
      'S5MynQoz1FBEWKtatVrVuzel2h4GlTflGntnzGFexYrErdckXaiGjbEv6aEltxc+qbFHfD2hUr+GvXuIfFm' +
      'mD6NEJVEg1Y4oQJtC3ixDwtZzWqWfGJBksajmhA0iTllCk+ikbNurXr17Bjy55Nu7bt20HkKGCwOiWDBAeC' +
      '63S4B1vvFAIIBF+e4DEuAQsISCdHI/Ly5ad1QZBeQLrzMssRLFdgDKF0AgUUybB+/YB6XiO7Sz9+QkAE8cE' +
      'REPh+y8B5hjbYtxxU6kDQAH3I7XEgnG4MNujggxBGCAVvt2XhwIUK8JfEIX3YYsCFB2CoRwEJJEQAgkM0AN' +
      'yFLL7HgwElxphdGhCwCKIDLu4QXYwEUEeJAAnc6EACOeowAI8n1TKAjQ74uIIAo9Bnn4kRoDgElEEmQIULN' +
      'WY54wkMjAKSLQq+IMCQQwZp5UVdZpnkbBC4OeSXqCXnJpG1qahQc7c1wAADGkoo6KCEFrpCCAA7AAAAAAAAAAAA');
    $loading.append($div.append($img));
    $body.append($loading);

    $('#imgBox').attr('style', 'margin-top: ' + Math.floor($('#loading').height() / 2) + 'px;');

    $body.css('position', 'fixed');
  }
  // ローディング画面を消す関数
  function removeLoading() {
    var $loading = $('.loading');
    $loading.remove();

    var $body = $('body');
    $body.css('position', '');
  }
  // 計画工数アプリを全レコード取得（担当者でのフィルターはkintone側で）
  function fetchRecords(appId, usr, opt_offset, opt_limit, opt_records) {
    setLoading();
    var app_plan = emxasConf.getConfig('APP_PLAN_WORK'); //計画工数アプリID
    var usr = usr || '';
    var thisM = moment().startOf('months').format("YYYY-MM-DD");
    var fromM = moment(thisM).add(-2, 'M').format("YYYY-MM-DD");
    thisM = moment().endOf('months').format("YYYY-MM-DD");
    var offset = opt_offset || 0;
    var limit = opt_limit || 100;
    var allRecords = opt_records || [];
    if (!usr || usr === "--") {
      var params = {
        app: app_plan,
        query: '対象月初日 >= "' + fromM + '" and 対象月初日 <= "' + thisM + '" order by 対象月初日 desc limit ' + limit + ' offset ' + offset
      };
    } else {
      var params = {
        app: app_plan,
        query: '対象月初日 >= "' + fromM + '" and 対象月初日 <= "' + thisM + '" and 検索用担当者 = "' + usr + '" order by 対象月初日 desc limit ' + limit + ' offset ' + offset
      };
    }
    return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then(function(resp) {
      allRecords = allRecords.concat(resp.records);
      if (resp.records.length === limit) {
        return fetchRecords(appId, usr, offset + limit, limit, allRecords);
      }
      return allRecords;
    });
  }
  //予実管理データのカスタマイズビュー用データの作成
  function makeYojitsuData(records, opt_data, opt_i, user_list) {
    var i = opt_i || 0; //レコードのカウント
    var allData = opt_data || []; //予実の集計結果
    var userLabels = user_list || []; //担当者リスト
    var appId = emxasConf.getConfig('APP_DAILY_REPORT'); //日報アプリID
    var key1, key2, key3, key4, key5, key6;
    key1 = records[i]['検索用担当者']['value'];
    key1 = key1.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // 担当者リストの作成
    if (userLabels.indexOf(key1) < 0) {
      userLabels.push(key1);
    }
    let key2List = [];
    let dataList = records[i]['Table']['value'];
    for (var x = 0; x < dataList.length; x++) {
      if (!key2List[dataList[x]['value']['_3コード']['value']]) {
        key2List[dataList[x]['value']['_3コード']['value']] = 0;
      }
    }
    for (var y = 0; y < dataList.length; y++) {
      key2List[dataList[y]['value']['_3コード']['value']] += parseFloat(dataList[y]['value']['投下時間']['value']);
    }
    key3 = records[i]['対象月初日']['value'];
    var key3Start = moment(key3).date(1);
    var key3End = moment(key3).date(moment(key3).daysInMonth());
    key3Start = key3Start.format('YYYY-MM-DD');
    key3End = key3End.format('YYYY-MM-DD');
    var params = {
      'app': appId,
      'query': '検索用担当者 = "' + key1 + '" and 日付 >= "' + key3Start + '" and 日付 <= "' + key3End + '"'
    };

    return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then(function(resp) {
      if (resp.records) {
        let key4List = [];
        let thcodeList = [];
        let thnameList = [];
        for (var x = 0; x < resp.records.length; x++) {
          // 1日分の日報データ
          dataList = resp.records[x]['Table']['value'];
          for (var y = 0; y < dataList.length; y++) {
            // ３コード・顧客の重複排除
            if (thcodeList.indexOf(dataList[y]['value']['３コード']['value']) < 0) {
              thcodeList.push(dataList[y]['value']['３コード']['value']);
              thnameList.push(dataList[y]['value']['顧客名']['value']);
            }
            if (!key4List[dataList[y]['value']['３コード']['value']]) {
              key4List[dataList[y]['value']['３コード']['value']] = 0;
            }
          }
          // 特定担当者の特定月の３コード単位での工数実績を集計
          for (var y = 0; y < dataList.length; y++) {
            key4List[dataList[y]['value']['３コード']['value']] += parseFloat(dataList[y]['value']['投下時間']['value']);
          }
        }
        for (var j = 0; j < thcodeList.length; j++) {
          if (!key2List[thcodeList[j]]) {
            key2List[thcodeList[j]] = 0;
          }
          key5 = key2List[thcodeList[j]] - key4List[thcodeList[j]];
          if (key2List[thcodeList[j]] === 0) {
            key6 = "-";
          } else {
            key6 = key4List[thcodeList[j]] / key2List[thcodeList[j]] * 100;
            key6 = key6.toFixed(2);
            key6 += "%";
          }
          allData.push({
            segment: key1,
            period: moment(key3).format('YYYY年MM月'),
            customer: thnameList[j],
            budget: key2List[thcodeList[j]],
            results: key4List[thcodeList[j]],
            Difference: key5,
            AchievementRate: key6
          });
        }
      } else {
        event.error = '日報情報が取得できません。';
      }
      i = i + 1;
      if (records.length !== i) {
        return makeYojitsuData(records, allData, i, userLabels);
      }

      if (oneTimeFlg) {
        // 担当者別絞込みリスト
        $('#userSelect').find('option').remove();
        $('#userSelect').append($('<option></option>')
          .attr('state', "--")
          .val("--")
          .text("--")
        );
        for (var x = 0; x < userLabels.length; x++) {
          $('#userSelect').append($('<option></option>')
            .attr('state', userLabels[x])
            .val(userLabels[x])
            .text(userLabels[x])
          );
        }
        // 担当者別絞込みリスト変更
        $("#userSelect").change(function() {
          changeUserList($(this).val());
        });
        oneTimeFlg = false;
      }

      return allData;
    });
  }
  //差異のマイナス値を赤色に変更
  function cellDesign() {
    $('#view tr td').each(function(index, elm) {
      if ($(this).hasClass('Difference_class')) {
        if ($(this).text().indexOf("-") > -1) {
          $(this).css('color', '#ff0000');
        }
      }
    });

  }
  //予実管理のカスタマイズビューを取得
  function dispYojitsuCustomizeView(records) {
    makeYojitsuData(records).then(function(data) {
      //列の設定
      var colModelSettings = [{
          name: "segment",
          index: "segment",
          width: 150,
          align: "left",
          classes: "segment_class"
        },
        {
          name: "period",
          index: "period",
          width: 150,
          align: "right",
          classes: "period_class"
        },
        {
          name: "customer",
          index: "customer",
          width: 250,
          align: "left",
          classes: "customer_class"
        },
        {
          name: "budget",
          index: "budget",
          width: 150,
          align: "right",
          classes: "budget_class",
          sorttype: "float"
        },
        {
          name: "results",
          index: "results",
          width: 150,
          align: "right",
          classes: "results_class",
          sorttype: "float"
        },
        {
          name: "Difference",
          index: "Difference",
          width: 150,
          align: "right",
          classes: "Difference_class",
          sorttype: "float"
        },
        {
          name: "AchievementRate",
          index: "AchievementRate",
          width: 150,
          align: "right",
          classes: "AchievementRate_class",
          sorttype: "float"
        }
      ];
      //列の表示名
      var colNames = ["担当者", "期間", "顧客名", "計画時間", "実績時間", "差異", "投下率"];
      $("#view").jqGrid({
        data: data,
        datatype: "local",
        colNames: colNames,
        colModel: colModelSettings,
        rowNum: 20,
        rowList: [20, 50, 100],
        caption: "工数予実管理",
        height: "auto",
        width: 1100,
        pager: 'pager',
        shrinkToFit: true,
        viewrecords: true,
        gridComplete: function() {
          cellDesign();
        }
      });
      removeLoading();
    });
  }
  //担当者絞込み処理
  function changeUserList(usr) {
    $.jgrid.gridUnload("#view");
    var appId = emxasConf.getConfig('APP_DAILY_REPORT'); //日報アプリID
    fetchRecords(appId, usr).then(function(records) {
      dispYojitsuCustomizeView(records);
    });
  }
  //イベント処理
  kintone.events.on(['app.record.index.show'], function(event) {
    if (event.viewName === "工数予実管理") {
      var appId = emxasConf.getConfig('APP_DAILY_REPORT'); //日報アプリID
      fetchRecords(appId).then(function(records) {
        dispYojitsuCustomizeView(records);
      });
    }
  });

})(jQuery);
