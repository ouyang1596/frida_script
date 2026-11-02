/**
 * 打印并改写本应用 HTTP 接口返回值。
 *
 * 挂钩点：com.vpb.popo.aaspring.base.http.functions.FaceCastBaseResponseFunc
 * 适用未混淆的 debug 包（applicationId: com.vpb.popo）。
 *
 * 用法：
 *   frida -U -f com.vpb.popo -l script/frida_hook_api_response.js
 *   frida -U com.vpb.popo -l script/frida_hook_api_response.js
 *
 * 改返回值：编辑下面的 RULES。
 * body 必须是服务端原始包：{"code":1,"msg":"...","result":...}
 * 加密接口的原始 body 是密文，要改结果就整包换成上面这种明文。
 */

var ONLY_URL = "friend/list/v2/hotList"; // 非空时只处理 URL 包含该字符串的请求，例如 "findPageWallpaper"

var RULES = [
     {
         urlContains: "friend/list/v2/hotList",
         body: `{
                  "code": 1,
                  "msg": "ok",
                  "result": {
                    "richSelfTopList": [],
                    "friendRingList": [
                      {
                        "userId": 300000355,
                        "userNickName": "Ffff396",
                        "userImg": "https://popotestupload.gchao.com/group1/M00/04/29/K_nfRGrVxTaAZlDNAAMzdM7SN9k038_jpg.webp",
                        "userAge": 32,
                        "userSex": 0,
                        "userSignature": "",
                        "userCountryFlag": "https://file.gchao.com/storage1/M00/00/14/rFfAFF_a8yiAVIZVAAAS5auPaL4667.png",
                        "userAttentStatus": "1",
                        "avatar": null,
                        "liveState": 0,
                        "groupId": null,
                        "levelId": 2,
                        "userType": 0,
                        "liveType": null,
                        "liveImg": null,
                        "liveId": null,
                        "isVip": null,
                        "userSignIn": null,
                        "livePullUrl": null,
                        "preferentialLang": "zh",
                        "userVipMsg": {
                          "isVip": 0,
                          "isCoupon": 0
                        },
                        "richClub": {
                          "level": null,
                          "expireTime": null
                        },
                        "startLiveType": null,
                        "isOnline": null,
                        "isInRoom": 0,
                        "nobilityInfo": {
                          "nobilityType": 0,
                          "isPeriod": 2
                        },
                        "likeUserImgList": [
                          ""
                        ],
                        "likeUserImgList2": [
                          {
                            "300014119": ""
                          }
                        ],
                        "isLike": 0,
                        "distance": "",
                        "friendId": 483783,
                        "content": "人转切xxxxxxxxxxxxxx转切也",
                        "address": "ChinaGuangdongShenzhen",
                        "isPublic": 1,
                        "img": null,
                        "fileList": [],
                        "likeNum": 1,
                        "commentNum": 2,
                        "createTime": "2026-10-19 08:14:56",
                        "createTimeStamp": 1792397696000,
                        "isCheck": 1,
                        "checkTime": null,
                        "checkMan": null,
                        "type": 3,
                        "sync": 1,
                        "videoId": null,
                        "shield": 0,
                        "invisibleList": null,
                        "seatFrom": 2,
                        "longitude": "114.0683",
                        "latitude": "22.5455",
                        "coordinate": {
                          "lat": 22.5455,
                          "lon": 114.0683
                        },
                        "isShowSeat": 1,
                        "province": "Guangdong",
                        "city": "Shenzhen",
                        "county": null,
                        "country": "China",
                        "isNearbySeat": 0,
                        "isComment": 0,
                        "isTop": 1,
                        "hotValue": 0,
                        "isDelete": 0,
                        "deleteTime": null,
                        "ringFrom": 0,
                        "infoId": null,
                        "musicId": null,
                        "musicName": null,
                        "friendTopicList": [],
                        "violatorImgNum": 0,
                        "checked": false,
                        "richLevel": 0,
                        "richTopExpireTime": "1970-01-01 00:00:00",
                        "richBorderLevel": 0,
                        "richBorderUrl": null,
                        "friendIdStr": "483783"
                      },
                      {
                        "userId": 300010539,
                        "userNickName": "🇮🇶SRR🦅وكيل محمد",
                        "userImg": "https://popotestupload.gchao.com/group1/M00/02/FD/K_nfRGjV9LGALOR8AAKOhjgtbx8163_jpg.webp",
                        "userAge": 27,
                        "userSex": 0,
                        "userSignature": "Hello everyone, I'm from Arabiaand I'm a live-streamer.",
                        "userCountryFlag": "https://file.gchao.com/storage1/M00/00/15/rFfAFF_a90eABijqAAAOEguf11E626.png",
                        "userAttentStatus": "1",
                        "avatar": null,
                        "liveState": 0,
                        "groupId": null,
                        "levelId": 159,
                        "userType": 0,
                        "liveType": null,
                        "liveImg": null,
                        "liveId": null,
                        "isVip": null,
                        "userSignIn": null,
                        "livePullUrl": null,
                        "preferentialLang": "zh",
                        "userVipMsg": {
                          "isVip": 0,
                          "vipExpireTime": 1793614200246,
                          "vipSign": "vvip1_1",
                          "vipPlatform": 2,
                          "isCoupon": 0,
                          "rankLabels": [
                            {
                              "type": 1,
                              "rangeType": 3,
                              "no": 1,
                              "userTitle": null
                            }
                          ],
                          "nicknameBorder": "https://popotestupload.gchao.com/group1/M00/02/69/K_nfRGd3V6SAD1ZbAADYm8h6fvM544.png"
                        },
                        "richClub": {
                          "level": 9,
                          "expireTime": 1800496168000
                        },
                        "startLiveType": null,
                        "isOnline": 0,
                        "isInRoom": 0,
                        "nobilityInfo": {
                          "nobilityType": 0,
                          "isPeriod": 2
                        },
                        "likeUserImgList": [],
                        "likeUserImgList2": [],
                        "isLike": 0,
                        "distance": "",
                        "friendId": 483836,
                        "content": "11234",
                        "address": "null",
                        "isPublic": 1,
                        "img": null,
                        "fileList": null,
                        "likeNum": 0,
                        "commentNum": 0,
                        "createTime": "2026-10-27 07:45:08",
                        "createTimeStamp": 1793087108000,
                        "isCheck": 1,
                        "checkTime": null,
                        "checkMan": null,
                        "type": 3,
                        "sync": 1,
                        "videoId": null,
                        "shield": 0,
                        "invisibleList": null,
                        "seatFrom": 0,
                        "longitude": "113.93843078613281",
                        "latitude": "22.552019119262695",
                        "coordinate": {
                          "lat": 22.552019119262695,
                          "lon": 113.93843078613281
                        },
                        "isShowSeat": 1,
                        "province": "Guangdong",
                        "city": "Shenzhen",
                        "county": null,
                        "country": "China",
                        "isNearbySeat": 0,
                        "isComment": 0,
                        "isTop": 0,
                        "hotValue": 0,
                        "isDelete": 0,
                        "deleteTime": null,
                        "ringFrom": 0,
                        "infoId": null,
                        "musicId": null,
                        "musicName": null,
                        "friendTopicList": null,
                        "violatorImgNum": 0,
                        "checked": false,
                        "richLevel": 9,
                        "richTopExpireTime": "2026-10-27 08:45:08",
                        "richBorderLevel": 9,
                        "richBorderUrl": "https://popotestupload.gchao.com/group1/M00/02/67/K_nfRGd2NCeAQPEMAABCs3CFtKM774.png",
                        "friendIdStr": "483836"
                      },
                      {
                        "userId": 300014119,
                        "userNickName": "Garfield10271518",
                        "userImg": "",
                        "userAge": 27,
                        "userSex": 0,
                        "userSignature": "",
                        "userCountryFlag": "https://file.gchao.com/storage1/M00/00/14/rFfAFF_a8i-ASF-OAAAY4on1p-Q759.png",
                        "userAttentStatus": "1",
                        "avatar": null,
                        "liveState": 0,
                        "groupId": null,
                        "levelId": 1,
                        "userType": 0,
                        "liveType": null,
                        "liveImg": null,
                        "liveId": null,
                        "isVip": null,
                        "userSignIn": null,
                        "livePullUrl": null,
                        "preferentialLang": "en",
                        "userVipMsg": {
                          "isVip": 0,
                          "isCoupon": 0
                        },
                        "richClub": {
                          "level": null,
                          "expireTime": null
                        },
                        "startLiveType": null,
                        "isOnline": 0,
                        "isInRoom": 0,
                        "nobilityInfo": {
                          "nobilityType": 0,
                          "isPeriod": 2
                        },
                        "likeUserImgList": [],
                        "likeUserImgList2": [],
                        "isLike": 0,
                        "distance": "",
                        "friendId": 483835,
                        "content": "123",
                        "address": "ChinaGuangdongShenzhen",
                        "isPublic": 1,
                        "img": null,
                        "fileList": [
                          {
                            "fileId": 647445,
                            "friendId": 483835,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU6eAdSymABYmpd4dOUc227_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:33:19",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU6eAdSymABYmpd4dOUc227_png_small.webp",
                            "height": "2778",
                            "width": "1284",
                            "isViolator": 0
                          },
                          {
                            "fileId": 647446,
                            "friendId": 483835,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU6mAbaVoAB0ZcCrAU4g780_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:33:19",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU6mAbaVoAB0ZcCrAU4g780_png_small.webp",
                            "height": "1080",
                            "width": "1080",
                            "isViolator": 0
                          },
                          {
                            "fileId": 647447,
                            "friendId": 483835,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU6uAAcvYAEh57FriJXw068_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:33:19",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU6uAAcvYAEh57FriJXw068_png_small.webp",
                            "height": "2778",
                            "width": "1284",
                            "isViolator": 0
                          },
                          {
                            "fileId": 647448,
                            "friendId": 483835,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7SAQwHoABYmpd4dOUc092_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:33:19",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7SAQwHoABYmpd4dOUc092_png_small.webp",
                            "height": "2778",
                            "width": "1284",
                            "isViolator": 0
                          },
                          {
                            "fileId": 647449,
                            "friendId": 483835,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7WAB7_oABHXKGIRnRk010_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:33:19",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7WAB7_oABHXKGIRnRk010_png_small.webp",
                            "height": "1080",
                            "width": "1080",
                            "isViolator": 0
                          },
                          {
                            "fileId": 647450,
                            "friendId": 483835,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7eANzc1AB0ZcCrAU4g020_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:33:19",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7eANzc1AB0ZcCrAU4g020_png_small.webp",
                            "height": "1080",
                            "width": "1080",
                            "isViolator": 0
                          },
                          {
                            "fileId": 647451,
                            "friendId": 483835,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7iAe-LIACWUDPZ0q3U543_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:33:19",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7iAe-LIACWUDPZ0q3U543_png_small.webp",
                            "height": "1712",
                            "width": "1284",
                            "isViolator": 0
                          },
                          {
                            "fileId": 647452,
                            "friendId": 483835,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7yAKtZnACOIEh-5hSE617_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:33:19",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU7yAKtZnACOIEh-5hSE617_png_small.webp",
                            "height": "1712",
                            "width": "1284",
                            "isViolator": 0
                          },
                          {
                            "fileId": 647453,
                            "friendId": 483835,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU72AXx11ABMxV2M1unw169_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:33:19",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgU72AXx11ABMxV2M1unw169_png_small.webp",
                            "height": "2778",
                            "width": "1284",
                            "isViolator": 0
                          }
                        ],
                        "likeNum": 0,
                        "commentNum": 1,
                        "createTime": "2026-10-27 07:33:19",
                        "createTimeStamp": 1793086399000,
                        "isCheck": 1,
                        "checkTime": null,
                        "checkMan": null,
                        "type": 1,
                        "sync": 1,
                        "videoId": null,
                        "shield": 0,
                        "invisibleList": null,
                        "seatFrom": 2,
                        "longitude": "114.0683",
                        "latitude": "22.5455",
                        "coordinate": {
                          "lat": 22.5455,
                          "lon": 114.0683
                        },
                        "isShowSeat": 1,
                        "province": "Guangdong",
                        "city": "Shenzhen",
                        "county": null,
                        "country": "China",
                        "isNearbySeat": 0,
                        "isComment": 0,
                        "isTop": 0,
                        "hotValue": 0,
                        "isDelete": 0,
                        "deleteTime": null,
                        "ringFrom": 0,
                        "infoId": null,
                        "musicId": null,
                        "musicName": null,
                        "friendTopicList": [],
                        "violatorImgNum": 0,
                        "checked": false,
                        "richLevel": 0,
                        "richTopExpireTime": null,
                        "richBorderLevel": 0,
                        "richBorderUrl": null,
                        "friendIdStr": "483835"
                      },
                      {
                        "userId": 300010118,
                        "userNickName": "☠️Ⓜ️͢ᮓ𝐑𝐊𝐇GTFGUHH⭕𝐑乛♥.",
                        "userImg": "https://file.wormholechat.live/storage1/M00/30/05/rFfAFWqwxtuAfLOFAAIs-mVbhIc555_png.webp",
                        "userAge": 23,
                        "userSex": 1,
                        "userSignature": "",
                        "userCountryFlag": "https://file.gchao.com/storage1/M00/00/14/rFfAFF_a8x2ADhf7AAAQ-_-kNos218.png",
                        "userAttentStatus": "1",
                        "avatar": null,
                        "liveState": 0,
                        "groupId": null,
                        "levelId": 170,
                        "userType": 0,
                        "liveType": null,
                        "liveImg": null,
                        "liveId": null,
                        "isVip": null,
                        "userSignIn": null,
                        "livePullUrl": null,
                        "preferentialLang": "zh",
                        "userVipMsg": {
                          "isVip": 1,
                          "dressHead": "https://popotestupload.gchao.com/group1/M00/00/C7/K_nfRGM2kVKABV7LAA2-KvJgK_o530.gif",
                          "dressHeadLottie": "",
                          "dressHeadId": 1025,
                          "dressHeadType": -1,
                          "vipExpireTime": 1798664400000,
                          "vipSign": "vip1_1",
                          "isCoupon": 0,
                          "popoAccountVipMsg": {
                            "typeLevel": 1,
                            "popoAccount": "741852963"
                          },
                          "rankLabels": [
                            {
                              "type": 0,
                              "rangeType": 2,
                              "no": 4,
                              "userTitle": null
                            },
                            {
                              "type": 1,
                              "rangeType": 2,
                              "no": 5,
                              "userTitle": null
                            }
                          ],
                          "nicknameBorder": "https://popotestupload.gchao.com/group1/M00/02/69/K_nfRGd3WaeAS1AgAAEEd_zcBFA082.png"
                        },
                        "richClub": {
                          "level": 8,
                          "expireTime": 1795571415000
                        },
                        "startLiveType": null,
                        "isOnline": 0,
                        "isInRoom": 0,
                        "nobilityInfo": {
                          "nobilityType": 0,
                          "isPeriod": 2
                        },
                        "likeUserImgList": [],
                        "likeUserImgList2": [],
                        "isLike": 0,
                        "distance": "",
                        "friendId": 483833,
                        "content": "🐒🐵",
                        "address": "ChinaGuangdongShenzhen",
                        "isPublic": 1,
                        "img": null,
                        "fileList": [
                          {
                            "fileId": 647443,
                            "friendId": 483833,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgTYuASlZ0ACOIEh-5hSE806_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:06:53",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgTYuASlZ0ACOIEh-5hSE806_png_small.webp",
                            "height": "1712",
                            "width": "1284",
                            "isViolator": 0
                          },
                          {
                            "fileId": 647444,
                            "friendId": 483833,
                            "fileUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgTYyAbXbAABHXKGIRnRk483_png.webp",
                            "type": 1,
                            "createTime": "2026-10-27 07:06:53",
                            "fileSmallUrl": "https://popotestupload.gchao.com/group1/M00/04/32/K_nfRGrgTYyAbXbAABHXKGIRnRk483_png_small.webp",
                            "height": "1080",
                            "width": "1080",
                            "isViolator": 0
                          }
                        ],
                        "likeNum": 0,
                        "commentNum": 1,
                        "createTime": "2026-10-27 07:06:53",
                        "createTimeStamp": 1793084813000,
                        "isCheck": 1,
                        "checkTime": null,
                        "checkMan": null,
                        "type": 1,
                        "sync": 1,
                        "videoId": null,
                        "shield": 0,
                        "invisibleList": null,
                        "seatFrom": 2,
                        "longitude": "114.0683",
                        "latitude": "22.5455",
                        "coordinate": {
                          "lat": 22.5455,
                          "lon": 114.0683
                        },
                        "isShowSeat": 1,
                        "province": "Guangdong",
                        "city": "Shenzhen",
                        "county": null,
                        "country": "China",
                        "isNearbySeat": 0,
                        "isComment": 0,
                        "isTop": 0,
                        "hotValue": 0,
                        "isDelete": 0,
                        "deleteTime": null,
                        "ringFrom": 0,
                        "infoId": null,
                        "musicId": null,
                        "musicName": null,
                        "friendTopicList": [],
                        "violatorImgNum": 0,
                        "checked": false,
                        "richLevel": 8,
                        "richTopExpireTime": "1970-01-01 00:00:00",
                        "richBorderLevel": 8,
                        "richBorderUrl": "https://popotestupload.gchao.com/group1/M00/02/61/K_nfRGdmeyKAVHjUAACcDHA3_T0339.png",
                        "friendIdStr": "483833"
                      }
                    ]
                  }
                }
`
     }
];

/**
 * 可选：按 URL 微调明文 JSON。返回新字符串；返回原串表示不改。
 * 加密接口拿到的是密文，这里改不动字段，请用 RULES.body 整包替换。
 */
function rewrite(url, json) {
    return json;
}

var urlByHash = {};

function matchRule(url) {
    for (var i = 0; i < RULES.length; i++) {
        var rule = RULES[i];
        if (rule && rule.urlContains && url.indexOf(rule.urlContains) >= 0) {
            return rule;
        }
    }
    return null;
}

function shouldHandle(url) {
    if (!ONLY_URL) {
        return true;
    }
    return url.indexOf(ONLY_URL) >= 0;
}

function createBody(ResponseBody, mediaType, content) {
    var overloads = ResponseBody.create.overloads;
    for (var i = 0; i < overloads.length; i++) {
        var args = overloads[i].argumentTypes;
        if (args.length === 2 && args[0].className === "okhttp3.MediaType" && args[1].className === "java.lang.String") {
            return overloads[i].call(ResponseBody, mediaType, content);
        }
    }
    for (var j = 0; j < overloads.length; j++) {
        var types = overloads[j].argumentTypes;
        if (types.length === 2 && types[0].className === "java.lang.String" && types[1].className === "okhttp3.MediaType") {
            return overloads[j].call(ResponseBody, content, mediaType);
        }
    }
    throw new Error("找不到 ResponseBody.create(MediaType, String)");
}

function dumpParsed(GsonUtils, response) {
    if (response === null) {
        console.log("[parsed] null");
        return;
    }
    try {
        var code = response.getCode();
        var msg = response.getMsg();
        var result = response.getResult();
        var resultJson = result === null ? "null" : GsonUtils.toJson.overload("java.lang.Object").call(GsonUtils, result);
        console.log("[parsed] code=" + code + " msg=" + msg);
        console.log("[parsed] result=" + resultJson);
    } catch (e) {
        console.log("[parsed] " + response);
        console.log("[parsed] dump failed: " + e);
    }
}

Java.perform(function () {
    var ResponseBody = Java.use("okhttp3.ResponseBody");
    var Func = Java.use("com.vpb.popo.aaspring.base.http.functions.FaceCastBaseResponseFunc");
    var GsonUtils = Java.use("com.vpb.popo.utils.GsonUtils");

    Func.$init.overload(
        "java.lang.String",
        "androidx.lifecycle.LifecycleOwner",
        "java.lang.reflect.Type"
    ).implementation = function (url, owner, type) {
        urlByHash[this.hashCode()] = url === null ? "" : String(url);
        return this.$init(url, owner, type);
    };

    var applyResp = Func.apply.overload("okhttp3.ResponseBody");
    applyResp.implementation = function (responseBody) {
        var key = this.hashCode();
        var url = urlByHash[key] || "";
        delete urlByHash[key];

        if (!shouldHandle(url)) {
            return applyResp.call(this, responseBody);
        }

        var json = "";
        var mediaType = null;
        try {
            mediaType = responseBody.contentType();
        } catch (e) {
            mediaType = null;
        }
        try {
            json = String(responseBody.string());
        } catch (e) {
            console.log("[api] read body failed url=" + url + " err=" + e);
            return applyResp.call(this, responseBody);
        }

        console.log("\n========== API ==========");
        console.log("[url] " + url);
        console.log("[raw] " + json);

        var next = json;
        var rule = matchRule(url);
        if (rule && rule.body) {
            next = String(rule.body);
            console.log("[rewrite] replaced by RULES.body");
        } else {
            try {
                var edited = rewrite(url, json);
                if (edited !== null && edited !== undefined && String(edited) !== json) {
                    next = String(edited);
                    console.log("[rewrite] replaced by rewrite()");
                }
            } catch (e) {
                console.log("[rewrite] failed: " + e);
            }
        }
        if (next !== json) {
            console.log("[new] " + next);
        }

        var newBody = createBody(ResponseBody, mediaType, next);
        var parsed = applyResp.call(this, newBody);
        dumpParsed(GsonUtils, parsed);
        console.log("========== END ==========\n");
        return parsed;
    };

    console.log("[*] FaceCastBaseResponseFunc hooked");
});
