var channel_access_token = "APIのアクセストークン"
var group_ID = "取得したGID";

function doPost(e) {
  //ここで場合分けする(GlitchからもDiscordのメッセをPostするので)
  var events = JSON.parse(e.postData.contents).events;
  events.forEach(function(event) {
    if(event.type == "message") {
      sendToDiscord(event); // D-bot
    } else if(event.type == "follow") {
      follow(event);
    } else if(event.type == "unfollow") {
      unFollow(event);
    }else if(event.type == "discord") {
      sendToLine(event); // L-bot
    }
 });
   var json = JSON.parse(e.postData.contents);
  if (json.event[0].message.type !== 'image'　&& json.event[0].message.type !== 'video' && json.event[0].message.type !== 'audio')
        return;

    var url = 'https://api.line.me/v2/bot/message/' + json.events[0].message.id + '/content/';
    var content = getContent(url);
    var dir = DriveApp.getFileById("1uKwgt949VaqNJqqgeRYednpfV6On8xg3");
    var today = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    var fileBlob = response.getBlob().setName(today);
    dir.createFile(fileBlob);
}

function getContent(url) {
    return UrlFetchApp.fetch(url, {
        "method": "get",
        'headers': {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + channel_access_token
        }
    });
}

// Discord bot(Visible)
function sendToDiscord(e) {
  // LINEからユーザ名を取得するためのリクエストヘッダー
  var requestHeader = {
    "headers" : {
      "Authorization" : "Bearer " + channel_access_token
    }
  };
  var userID = e.source.userId;
  var groupid_tmp = e.source.groupId;
  // LINEにユーザープロフィールリクエストを送信(返り値はJSON形式)
  var response = UrlFetchApp.fetch("https://api.line.me/v2/bot/group/"+groupid_tmp+"/member/"+userID, requestHeader);

var message = e.message.text;
  // レスポンスからユーザーのディスプレイネームを抽出
  var name = JSON.parse(response.getContentText()).displayName;
  sendDiscordMessage(name, message);
  // LINEにステータスコード200を返す(これがないと動かない)
  return response.getResponseCode();
}

// LINEAPI
function sendToLine(e) {
  // メッセージの内容(送信先と内容)
  var message = {
    "to" : group_ID,
    "messages" : [
      {
        "type" : "text",
        "text" : e.message
      }
    ]
  };
  // LINEにpostするメッセージデータ
  var replyData = {
    "method" : "post",
    "headers" : {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer " + channel_access_token
    },
    "payload" : JSON.stringify(message)
  };
  // LINEにデータを投げる
  var response = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", replyData);
  // LINEにステータスコード200を返す
  return response.getResponseCode();
}

