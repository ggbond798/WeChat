# > 网易云音乐
# hostname = interface.music.163.com, interface?.music.163.com, ipv4.music.163.com
https?:\/\/(ipv4|interface\d?)\.music\.163.com\/e?api\/ad url reject-dict
https?:\/\/interface\d?\.music\.163\.com\/w?e?api\/(side-bar\/mini-program\/music-service\/account|delivery\/(batch-deliver|deliver)|moment\/tab\/info\/get|yunbei\/account\/entrance\/get) url reject-dict
https?:\/\/interface\d?\.music\.163\.com\/eapi\/(resource\/comments?\/musiciansaid|community\/friends\/fans-group\/artist\/group\/get|user\/sub\/artist|music\/songshare\/text\/recommend\/get|mine\/applet\/redpoint|resniche\/position\/play\/new\/get) url reject-dict
https?:\/\/interface\d?\.music\.163.com\/w?e?api\/(search\/(chart|default|rcmd\/keyword|specialkeyword)|resource-exposure\/|activity\/bonus\/playpage\/time\/query) url reject-dict
https?:\/\/interface\d?\.music\.163.com\/eapi\/(mlivestream\/entrance\/playpage|link\/(position\/show\/strategy|scene\/show)|ios\/version|v\d\/content\/exposure\/comment\/banner) url reject-dict
https?:\/\/(ipv4|interface\d?)\.music\.163\.com\/e?api\/(batch|v\d\/resource\/comment\/floor\/get) url script-response-body https://raw.githubusercontent.com/Keywos/rule/main/script/wy/js/wyres.js
https?:\/\/(ipv4|interface\d?)\.music\.163\.com\/e?api\/link\/home\/framework\/tab url script-response-body https://raw.githubusercontent.com/Keywos/rule/main/script/wy/js/wyres.js
https?:\/\/(ipv4|interface\d?)\.music\.163\.com\/e?api\/(homepage\/block\/page|link\/page\/rcmd\/(resource\/show|block\/resource\/multi\/refresh)) url script-response-body https://raw.githubusercontent.com/Keywos/rule/main/script/wy/js/wyres.js
https?:\/\/(ipv4|interface\d?)\.music\.163\.com\/e?api\/link\/page\/discovery\/resource\/show url script-response-body https://raw.githubusercontent.com/Keywos/rule/main/script/wy/js/wyres.js
https?:\/\/(ipv4|interface\d?)\.music\.163\.com\/e?api\/song\/play\/more\/list\/v\d url script-response-body https://raw.githubusercontent.com/Keywos/rule/main/script/wy/js/wyres.js
https?:\/\/(ipv4|interface\d?)\.music\.163\.com\/e?api\/link\/position\/show\/resource url script-response-body https://raw.githubusercontent.com/Keywos/rule/main/script/wy/js/wyres.js
https?:\/\/(ipv4|interface\d?)\.music\.163\.com\/e?api\/user\/follow\/users\/mixed\/get url script-response-body https://raw.githubusercontent.com/Keywos/rule/main/script/wy/js/wyres.js
