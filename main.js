const http = require("http");
http
  .createServer(function(request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Discord bot is active now \n");
  })
  .listen(3000);

// Discord bot implements
const discord = require("discord.js");
const client = new discord.Client();

client.on("ready", message => {
    console.log("botが起動しました");
});

client.on("message", message => {
  if (message.author.bot) return
  if (message.channel.type == "dm") return

  var msg = message;

  // botへのリプライは無視
  if (msg.isMemberMentioned(client.user)) {
    return;
  } else {
    sendGAS(msg);
    return;
  }
//json shaping
  function sendGAS(msg) {
    var jsonData = {
      events: [
        {
          type: "discord",
          name: message.author.username,
          message: message.content
        }
      ]
    };
    //GASURLにjsonDataをPOST
    post(process.env.GAS_URL, jsonData);
    console.log("gasにpostしました");
  }

  function post(url, data) {
    var request = require("request");
    var options = {
      uri: url,
      headers: { "Content-type": "application/json" },
      json: data,
      followAllRedirects: true
    };
    // postする
    request.post(options, function(error, response, body) {
      if (error != null) {
        msg.reply("更新に失敗しました");
        return;
      }

      var userid = response.body.userid;
      var channelid = response.body.channelid;
      var message = response.body.message;
      if (
        userid != undefined &&
        channelid != undefined &&
        message != undefined
      ) {
        var channel = client.channels.get(channelid);
        if (channel != null) {
          channel.send(message);
        }
      }
    });
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("please set ENV: DISCORD_BOT_TOKEN");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);
