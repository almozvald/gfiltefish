var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var data = require('./data.json');
var people = data.people;
var quotes= data.quotes;
const client = new Discord.Client();
client.login(auth.token);
'use strict';

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
	colorize: true
});

logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

var prefix = '~';
var ids = [];

client.on('ready', () => {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(client.user.username + ' - (' + client.user.id + ')');;
});

var curchannel;



var randomquote = function (channelID) {
	curchannel.send(quotes[Math.floor(Math.random() * quotes.length)]);
}

var allquote = function (channelID) {
	for (var i = 0; i < quotes.length; i++)
		curchannel.send(quotes[i]);
}


var shutup =false;
var intervaled = function(annoychannel, annoymessage, timesleft , interval){
	if (timesleft > 0 && !shutup){
		annoychannel.send(annoymessage);
		timesleft--;
		setTimeout(function(){intervaled(annoychannel,annoymessage,timesleft,interval);}, interval);
	}
}

client.on('message', msg => {//(user, userID, channelID, message, evt) 
	var message = msg.content;
	var user = msg.author;
	var userID = user.id;
	var channel = msg.channel;
	var channelID = msg.channel.id;
	if (message.substring(0, prefix.length) == prefix) {// a direct call for gfiltafish
		curchannel = channel;
		var args = message.substring(prefix.length).split(' ');
		var cmd = args[0];
		args = args.splice(1);
		switch (cmd) {
			case 'help':
			case 'h':
			case 'iamdumb':
			case 'carmi':
				var message='';

				var documntation=["ברוך הבא לגפילטאפיש גרסא 1.0.3",
					"מצורפת רשימה של כל הפקודות החוקיות:",
					"~help " + " קבל את ההודעה הזאת",
					"~ping " + "בדוק האם הבוט הזה חי",
					"~sourcecode " + "קבל את קוד המקור של הבוט הזה",
					"~shutup " + " אמור להשתיק אותו כן בטח ",
					"~unshutup " + " יוציא אותו מהשתקה ",
					"~randomquote ' +' הדפס ציטוט אקראי ",
					"~allquote " + " הדפס את כל הציטוטים ",
					"~load " + " ./data.json טען מחדש את  ",
					"~repeat " + "כדי לשלוט בכמה פעמים וכמה זמן הוא יחכה בין פעם לפעם" + " wait, times " + " חזור על אותה הודעה כמה פעמים ניתן להשתמש ב ",
					""
				];

				documntation[documntation.length - 1] = shutup ? '~repeat'+'הבוט כרגע מושתק אז שום הודעה לא תקרה עם תשתמש ב' : 'בוט כרגע לא מושתק אז'+' repeat~ '+'עובד לכולם';
			
				for (var i = 0; i < documntation.length; i++)
					message += documntation[i] + '\n';
				
				channel.send(message);
				break;
			case 'ping':
				channel.send('פונג');
				break;
			case 'hello':
				channel.send('אני חי כמו תמיד');
				break;
			case 'mute':
			case 'shutup':
				shutup = true;
				channel.send('<@' +userID+'> טוב אני אשב לי לבד בחושך');
				break;
			case 'unmute':
			case 'unshutup':
				shutup = false;
				channel.send('<@' +userID+'> תודה לך צדיק');
				break;
			case 'load':
			case 'reload':
				var fs = require('fs');
				fs.readFile('./data.json', function (err, newdata) {
					if (err) {
						throw err; 
					}
					logger.info(data);
					data = JSON.parse(newdata);
					people = data.people;
					quotes= data.quotes;
					channel.send('נטען בהצלחה!');
				});
				//people = require('./peoples.json');
				channel.send('טוען מחדש');
				break;
			case 'hhbetza':
				channel.send('https://i.imgur.com/AVDMBal.png');
				break;
			case 'sourcecode':
			case 'github':
			case 'source':
			case 'src':
				channel.send('https://github.com/almozvald/gfiltafish');
				break;
			case 'rickroll':
				var possibleresponses=['קבלו איפון 23 חינם','צפו בתמונות עירום של בניו','זהו אינו קישור לשיר אינני הולך לותר עליך על ידי ריק אסטלי','קבלו את התפקיד חציל בתריק הפשוט הבא'];
				const embed = new Discord.MessageEmbed()
				.setTitle(possibleresponses[Math.floor(Math.random() * possibleresponses.length)])
				.setColor(0x0000ff)
				.setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
				channel.send(embed);
				break;
			case 'repeat':
				logger.info(channel);
				var message = '';
				var timesleft = 10;
				var interval = 2000;
				for (var i = 0; i < args.length; i++) {
					if (args[i] == 'times') {
						timesleft=Number(args[i + 1]);
						i++;
						continue;
						if (timesleft > 200) {
							channel.send('<@' +userID+'> '+'מגבלת כמות חזרות מקסימלית כרגע עומדת על 200');
							timesleft = 200;
							break;
						}
					}
					if (args[i] == 'wait') {
						interval = 1000 * Number(args[i + 1]);
						i++;
						if (interval < 1000) {
							channel.send('<@' +userID+'> '+'מגבלה בין חזרה לחזרה עומדת על שנייה');
							interval = 1000;
							break;
						}
						continue;
					}
					if (args[i] == 'channel') {
						channel= client.channels.cache.get(args[i + 1]);
						i++;
						continue;
					}
					if (args[i] == '~repeat') {
						channel.send('<@' +userID+'> '+'אין לך הרשאות לבצע פעולה זאת וגם לא לאף אחד אחר');
						timesleft = 0;
					break;
					}
					message += args[i]+' ';
				}
				intervaled(channel,message,timesleft,interval);
				break;
			case 'randomquote':
				randomquote(channelID);
				break;
			case 'allquote':
				allquote(channelID);
				break;
			default :
				channel.send(':לא ממש הבנתי מה אתה מנסה להגיד הפקודות החוקיות הן' + '\n~help');
		}
	} else {
		if (user.bot) {
			//logger.info('meesage by bot');
			return;
			logger.info('what?');
		}
		
		if (message.indexOf(client.user.id) != -1 || message.indexOf(client.user.username) != -1) {
			logger.info('bot.id: '+message.indexOf(client.user.id));
			logger.info('bot.username: '+message.indexOf(client.user.username));
			var possibleresponses=['מי זה מדבר עלי?', 'מה אתה רוצה ממני?','הי מה אתה חושב שאתה אומר עלי?'];
			channel.send(possibleresponses[Math.floor(Math.random() * possibleresponses.length)] + '\n נסה ~help לעזרה בשביל להבין עלי יותר');
			return;
		}
		
		if (message.indexOf("כרמי")!=-1||message.indexOf("282820918298804224")!=-1) {
			var possibleresponses=['1+e^i(pi)', '0','אפס'];
			channel.send(possibleresponses[Math.floor(Math.random() * possibleresponses.length)]);
		}
		for(var i = 0; i < people.length; i++){
			var found = false;
			for(var j = 0; j < people[i].names.length; j++){
				if (message.indexOf( people[i].names[j])!=-1){
					found = true;
					break;
				}
			}
			if(msg.guild && msg.guild.emojis && found){
				const emoji = msg.guild.emojis.cache.get(people[i].emoji);
				if (emoji)
					msg.react(emoji);
			}
		}
		if (message.indexOf("חח בצה")!=-1){
			channel.send('https://i.imgur.com/AVDMBal.png');
		}
		if(Math.random()<0.01){
			var possibleresponses=['שתוק'];
			channel.send('<@' +userID+'> '+possibleresponses[Math.floor(Math.random()*possibleresponses.length)]);
			logger.info('answering random message');
		}

	}
});
