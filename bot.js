var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var data = require('./data.json');
var sicler = require('./sicler.js');
var people = data.people;
var quotes = data.quotes;
const client = new Discord.Client();
client.login(auth.token);
'use strict';

// Channels
var ch_general, ch_polin, ch_bulgaria, ch_natania, ch_georgia, ch_gointg, ch_meandbois;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
	colorize: true
});

logger.level = "debug";

// Initialize Discord Bot
var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

var prefix = '~';
var ids = [];

client.on("ready", () => {
	logger.info("Connected");
	logger.info("Logged in as: ");
	logger.info(client.user.username + " - (" + client.user.id + ")");

	// Setting channels IDs
	ch_general   = client.channels.cache.get('369817614890958852');
	ch_polin     = client.channels.cache.get('410127563650760704');
	ch_bulgaria  = client.channels.cache.get('417774179237101580');
	ch_taibe     = client.channels.cache.get('767529428569554944');
	ch_natania   = client.channels.cache.get('466007520918634507');
	ch_georgia   = client.channels.cache.get('731917741891649627');
	ch_gointg    = client.channels.cache.get('369951844694228994');
	ch_meandbois = client.channels.cache.get('410128501358854174');
});

var curchannel;

var randomquote = function (channelID) {
	curchannel.send(quotes[Math.floor(Math.random() * quotes.length)]);
}

var allquote = function (channelID) {
	for (var i = 0; i < quotes.length; i++)
		curchannel.send(quotes[i]);
}


var shutup = false;
var intervaled = function(annoychannel, annoymessage, timesleft , interval) {
	if (timesleft > 0 && !shutup) {
		annoychannel.send(annoymessage);
		timesleft--;
		setTimeout(function() { intervaled(annoychannel, annoymessage, timesleft, interval); }, interval);
	}
}

var channel_warp = function(msg, ch_current, plus_mode) {
	var others = msg.guild.channels.cache.filter(c => (c.parentID === ch_current.parentID || plus_mode) && c.type === 'voice').array();
	
	for (var i = 0; i < others.length; i++) {
		var otherchannel = others[i];
		if (otherchannel.id == ch_current.id)
			continue;

		otherchannel.members.each(user => user.voice.setChannel(ch_current));
	}
}

client.on("message", msg => {
	var message   = msg.content;
	var user      = msg.author;
	var userID    = user.id;
	var channel   = msg.channel;
	var channelID = msg.channel.id;

    if (user.bot) {
        return;
        logger.info("what?");
    }

	if (message.indexOf("פולין") != -1 || message.indexOf("polin") != -1 || message.indexOf("poland") != -1 || message.indexOf("polski") != -1)
		msg.react("🇵🇱");

	if (message.indexOf("ישראל") != -1 || message.indexOf("israel") != -1)
		msg.react("🇮🇱");

	for (var i = 0; i < people.length; i++) {
		var found = false;
		for (var j = 0; j < people[i].names.length; j++) {
			if (message.indexOf(people[i].names[j]) != -1) {
				found = true;
				break;
			}
		}
		if (msg.guild && msg.guild.emojis && found) {
			const emoji = msg.guild.emojis.cache.get(people[i].emoji);
			if (emoji)
				msg.react(emoji);
		}
	}

	if (message.substring(0, prefix.length) == prefix) { // A direct call for gfiltefish
		curchannel = channel;
		var args = message.substring(prefix.length).split(" ");
		var cmd = args[0];
		args = args.splice(1);
		switch (cmd) {
			case "help": case "h": case "iamdumb": case "carmi":
				var message="";

				var documntation = [
					"ברוך הבא לגפילטאפיש גרסא 1.1.2",
					"מצורפת רשימה של כל הפקודות החוקיות:",
					"~help " + " קבל את ההודעה הזאת",
					"~ping " + " בדוק האם הבוט הזה חי",
					"~sourcecode " + " קבל את קוד המקור של הבוט הזה",
					"~shutup " + " אמור להשתיק אותו כן בטח",
					"~unshutup " + " יוציא אותו מהשתקה",
					"~randomquote " + " הדפס ציטוט אקראי",
					"~allquote " + " הדפס את כל הציטוטים",
					"~polin " + " לפולין userchannels העבר את כל האנשים שב ",
					"~load " + " ./data.json טען מחדש את  ",
					"~repeat " + " כדי לשלוט בכמה פעמים וכמה זמן הוא יחכה בין פעם לפעם" + " wait, times " + " חזור על אותה הודעה כמה פעמים ניתן להשתמש ב ",
					""
				];

				documntation[documntation.length - 1] = shutup ? '~repeat' + 'הבוט כרגע מושתק אז שום הודעה לא תקרה עם תשתמש ב' : 'בוט כרגע לא מושתק אז' + ' repeat~ ' + 'עובד לכולם';

				for (var i = 0; i < documntation.length; i++)
					message += documntation[i] + '\n';

				channel.send(message);
				break;

			case "ping":
				channel.send("פונג");
				break;

			case "hello":
				channel.send("אני חי כמו תמיד");
				break;
			case "secrethitler":
			case "sclr":
				sicler.main(msg,args);
				break;
			case "mute": case "shutup":
				shutup = true;
				channel.send("<@" + userID + "> טוב אני אשב לי לבד בחושך");
				break;

			case "unmute": case "unshutup":
				shutup = false;
				channel.send("<@" + userID + "> תודה לך צדיק");
				break;

			case "polin": case "poland": case "פולין": case "polski":
				channel_warp(msg, ch_polin, false);
				break;

			case "polin+": case "poland+": case "פולין+": case "polski+":
				channel_warp(msg, ch_polin, true);
				break;

			case "bulgaria": case "בולגריה":
				channel_warp(msg, ch_bulgaria, false);
				break;

			case "bulgaria+": case "בולגריה+":
				channel_warp(msg, ch_bulgaria, true);
				break;
				
			case "taibe": case "טייבה": case: "kanfe": case: "כנאפה":
				channel_warp(msg, ch_taibe, false);
				break;

			case "taibe+": case "טייבה+": case: "kanfe+": case: "כנאפה+":
				channel_warp(msg, ch_taibe, true);
				break;

			case "load": case "reload":
				var fs = require("fs");
				fs.readFile('./data.json', function (err, newdata) {
					if (err)
						throw err;

					logger.info(data);
					data = JSON.parse(newdata);
					people = data.people;
					quotes = data.quotes;
					channel.send("נטען בהצלחה!");
				});

				channel.send("טוען מחדש");
				break;

			case "hhbetza": case "חח בצה": case "חחבצה":
				channel.send("", {files: ["https://i.imgur.com/AVDMBal.png"]});
				break;

			case "sourcecode": case "github": case "source": case "src":
				channel.send('https://github.com/almozvald/gfiltefish');
				break;

			case "rickroll":
				var possible_responses = ["קבלו איפון 23 חינם','צפו בתמונות עירום של בניו",
					"זהו אינו קישור לשיר אינני הולך לוותר עליך על ידי ריק אסטלי",
					"קבלו את התפקיד חציל בתריק הפשוט הבא"];

				const embed = new Discord.MessageEmbed()
					.setTitle(possible_responses[Math.floor(Math.random() * possible_responses.length)])
					.setColor(0x0000ff)
					.setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

				channel.send(embed);
				break;

			case "repeat":
				logger.info(channel);
				var message = "";
				var timesleft = 10;
				var interval = 2000;
				for (var i = 0; i < args.length; i++) {
					if (args[i] == "times") {
						timesleft = Number(args[i + 1]);
						i++;
						continue;
						if (timesleft > 200) {
							channel.send("<@" + userID + "> " + "מגבלת כמות חזרות מקסימלית כרגע עומדת על 200");
							timesleft = 200;
							break;
						}
					}
					if (args[i] == "wait") {
						interval = 1000 * Number(args[i + 1]);
						i++;
						if (interval < 1000) {
							channel.send("<@" + userID + "> " + "מגבלה בין חזרה לחזרה עומדת על שנייה");
							interval = 1000;
							break;
						}
						continue;
					}
					if (args[i] == "channel") {
						channel= client.channels.cache.get(args[i + 1]);
						i++;
						continue;
					}
					if (args[i] == "~repeat") {
						channel.send("<@" + userID + "> " + "אין לך הרשאות לבצע פעולה זאת וגם לא לאף אחד אחר");
						timesleft = 0;
						break;
					}
					message += args[i] + " ";
				}
				intervaled(channel, message, timesleft, interval);
				break;

			case "randomquote": case "rndq":
				randomquote(channelID);
				break;

			case "allquote": case "allq":
				allquote(channelID);
				break;

			default :
				channel.send(":לא ממש הבנתי מה אתה מנסה להגיד הפקודות החוקיות הן" + "\n~help");
		}
	} else {

		if (message.indexOf(client.user.id) != -1 || message.indexOf(client.user.username) != -1) {
			logger.info("bot.id: " + message.indexOf(client.user.id));
			logger.info("bot.username: " + message.indexOf(client.user.username));
			var possible_responses = ["מי זה מדבר עלי?" ,"מה אתה רוצה ממני?" ,"הי מה אתה חושב שאתה אומר עלי?"];
			channel.send(possible_responses[Math.floor(Math.random() * possible_responses.length)] + "\n נסה ~help לעזרה בשביל להבין עלי יותר");
			return;
		}

		if (message.indexOf("כרמי") != -1 || message.indexOf("282820918298804224") != -1) {
			var possible_responses = ["1+e^i(pi)", "0", "אפס"];
			channel.send(possible_responses[Math.floor(Math.random() * possible_responses.length)]);
		}
		
		if (message.indexOf("שובל") != -1 || message.indexOf("386629792038125578") != -1) {
			var possible_responses = ["בכיינית", "סתומה"];
			channel.send(possible_responses[Math.floor(Math.random() * possible_responses.length)]);
		}
		
		if (message.indexOf("אביבי") != -1 || message.indexOf("451702771754729472") != -1)
			channel.send("מכוער");

		if (message.indexOf("חח בצה") != -1)
			channel.send("", {files: ["https://i.imgur.com/AVDMBal.png"]});

		if (message.indexOf("אמור") != -1)
			channel.send("אמור זה שם של דג");

		if (Math.random() < ((userID == "282820918298804224") ? 0.05 : 0.01)) {
			var possible_responses = ['שתוק'];
			channel.send("<@" + userID + "> " + possible_responses[Math.floor(Math.random() * possible_responses.length)]);
			logger.info("answering random message");
		}

	}
});
