var logger = require('winston');
/** game states
 * 0 = no game
 * 1 = vote
 * 2 = vote
 * 3 = throw1, 4 = throw2, 5 = veto
 * 6 = question, 7 = chose nekt president, 8 = murder
 */
var mode=0; //start at no game
/** facist rules action
 * 0 = none
 * 1 = show3
 * 2 = question
 * 3 = chose nekt president
 * 4 = murder
 * 5 = game end
 */
var actions = [0,0,1,4,4,5];
var facistcards = 11;
var liberalcards = 6;
var numfacists = 1;
var doeshitlerknow = false;
var iscustom = false;
var defualt_actions = [[0,0,1,4,4,5],[0,0,1,4,4,5],[0,2,3,4,4,5],[0,2,3,4,4,5],[2,2,3,4,4,5],[2,2,3,4,4,5]];
var defualt_numfacists = [1,1,2,2,2,3];
var defualt_doeshitlerknow = [false,true,false,false,true,false];
var defualt_facistcards = 11;
var defualt_liberalcards = 6;
var randomize_array_order = function(sort){
	var rsort = new Array(sort.length);
	for(var idx = 0; idx < sort.length; idx++){
		rsort[idx] = sort[idx];
	}
	for(var idx = 0; idx < rsort.length; idx++){
		var swpIdx = idx + Math.floor(Math.random() * (rsort.length - idx));
		var tmp = rsort[idx];
		rsort[idx] = rsort[swpIdx];
		rsort[swpIdx] = tmp;
	}
	return rsort;
}
var publicchannel;
var players= [];
var roles = [];//0 libtard 1 facist 2 hitler
var dead = [];
var cards = [];
var discardpile = [];
var current = 0;
var next = 1;
var mention = function(index){
	return "<@" + players[index].userID + ">";
}
var get_name = function(index){
	return players[index].displayName;
	
}
var chosen = -1;
var numfailed = 0;
var num_facist_passed = 0;
var num_liberal_passed = 0;
var facists_in_hand = 0;
var liberals_in_hand = 0;
var init=function(numplayers){
	if(!iscustom){
		actions = defualt_actions[numplayers-5];
		doeshitlerknow = defualt_doeshitlerknow[numplayers-5];
		numfacists = defualt_numfacists[numplayers-5];
		facistcards = defualt_facistcards;
		liberalcards = defualt_liberalcards;
	}
	chosen = -1;
	numfailed = 0;
	discardpile = [];
	dead = [];
	mode = 1;
	current = 0;
	next = 1;
	roles = [2];
	num_facist_passed = 0;
	num_liberal_passed = 0;
	facists_in_hand = 0;
	liberals_in_hand = 0;
	for(var i = 0; i < numfacists; i++){
		roles.push(1);
	}
	while(roles.length < numplayers){
		roles.push(0);
	}
	roles=randomize_array_order(roles);
	while(dead.length < numplayers){
		dead.push(0);
	}
	cards= [];
	for(var i = 0; i < facistcards; i++){
		cards.push(1);
	}
	for(var i = 0; i < liberalcards; i++){
		cards.push(0);
	}
	logger.info(cards);
	cards = randomize_array_order(cards);
	logger.info(cards);
}
var getindex=function(user){
	for (var i = 0; i < players.length; i++){
		
		if((user.id && players[i].user.id == user.id) || (user.userID && players[i].userID == user.userID)){
			return i;
		}
	}
	return -1;
}
var normalforward=function(){
	current = next;
	var num=0;
	while(dead[current]&& num<10){
		current= (current+1)%players.length;
		num++;
	}
	next=(current+1)%players.length;
	publicchannel.send("הנשיא הנוכחי הוא");
	publicchannel.send(get_name(current));
	mode = 1;
}
var votes=[];
var numvoted=0;
var numalive = function(){
	var num=0;
	for (var i = 0; i < players.length; i++){
		num+= 1- dead[i];
	}
	return num;
}
var reshuffle = function(leng){
	if(cards.length<leng){
		cards = randomize_array_order(cards.concat(discardpile));
		discardpile = [];
	}
}
var handinfo = function(){
	var msg="כמות הקלפים הלילברלים היא";
	msg += liberals_in_hand;
	msg += "\n";
	msg +="כמות הקלפים הפאשיסטים היא";
	msg += facists_in_hand;
	return msg;
}
var gameend = function(secanrio){
	mode=0;
	var info= "הפשיסטים היו:"
	for (var i = 0; i < players.length; i++){
		if(roles[i]==1)
			info += ' ' + get_name(i);
	}
	info += "\n";
	info += "היטלר היה:"
	for (var i = 0; i < players.length; i++){
		if(roles[i]==2)
			info += ' ' + get_name(i);
	}
	if(secanrio == 0){
		var msg="הליברלים העבירו את החוק הליברלי החמישי"
		msg += "\n";
		msg += "חיילים מעכשיו רשאים לסרב לכל פקודה שאינה חוקית מבחינתם";
		msg += "\n"
		msg += info;
		msg += "\n";
		msg += "תחי רפובליקת ווינמאר!";
		publicchannel.send(msg);
	}
	
	if(secanrio == 1){
		var msg="הליברלים רצחו את היטלר"
		msg += "\n";
		msg += "הפאשיסטים הנותרים עברו ל4chan";
		msg += "\n";
		msg += info;
		msg += "\n";
		msg += "תחי הרפובלקיה הגרמנית הראשונה!";
		publicchannel.send(msg);
	}
	if(secanrio == 2){
		var msg="הפאשיסטים העבירו את החוק השישי"
		msg += "\n";
		msg += "מעכשיו הממשלה מחליטה בשבילך הכל כוול מתי אתה יכול ללכת לשירותים";
		msg += "\n";
		msg += info;
		msg += "\n";
		msg += "תחי האימפריה הגרמנית!";
		publicchannel.send(msg);
	}
	if(secanrio == 3){
		var msg="היטלר נבחר בתור קנסלור"
		msg += "\n";
		msg += "מעכשיו הוא גם הפרסידנט גם הקנסלור וגם המודרטור של גרמניה כולה!";
		msg += "\n";
		msg += info;
		msg += "\n";
		msg += "תחי הרייך השלישי!";
		publicchannel.send(msg);
	}
}
var endvote = function(){
	publicchannel.send("ההצבעה הסתיימה");
	var num=0;
	var msg = "הצביעו בעד:";
	for (var i = 0; i < players.length; i++){
		if(votes[i] == 1 && dead[i] == 0){
			msg += ' ' + get_name(i);
			num++;
		}
	}
	msg += "\n";
	msg += "הצביעו נגד:";
	for (var i = 0; i < players.length; i++){
		if(votes[i] == 0 && dead[i] == 0){
			msg += ' ' + get_name(i);
		}
	}
	msg += "\n";
	msg += "נמנעו:";
	for (var i = 0; i < players.length; i++){
		if(votes[i] == -1 && dead[i] == 0){
			msg += ' ' + get_name(i);
		}
	}
	publicchannel.send(msg);
	if(numalive()< num*2){
		publicchannel.send("הממשלה התקבלה");
		if(num_facist_passed>=3){
			if(roles[chosen]==2){
				gameend(3);
				return;
			}
			publicchannel.send("הקנסלור אינו היטלר");
		}
		mode = 3;
		reshuffle(3);
		numfailed=0;
		for(var i=0; i< 3 ;i++){
			var card =cards.pop();
			facists_in_hand += card;
			liberals_in_hand += 1-card;
		}
		players[current].send(handinfo());
	}else{
		numfailed++;
		publicchannel.send(numfailed+"הממשלה נדחתה בפעם ה");
		normalforward();
		if(numfailed==3){
			publicchannel.send("חוק רנדומלי יוצא");
			reshuffle(1);
			var card =cards.pop();
			if(card==1){
				publicchannel.send("עבר פאשיסט");
				num_facist_passed++;
				if(num_facist_passed==6){
					gameend(2);
					return;
				}
			}else{
				publicchannel.send("עבר ליברל");
				num_liberal_passed++;
				if(num_liberal_passed==5){
					gameend(0);
					return;
				}
			}
		}
	}
}
exports.main = function(msg,args){
	//logger.info("Connected");
	//
	var cmd = args[0];
	var channel   = msg.channel;
	var ispublic = (channel.type!= 'dm');
	//logger.info(channel.type);
	//logger.info(ispublic);
	//logger.info(publicchannel);
	if(ispublic){
		//logger.info(msg.mentions.members.array());
		publicchannel = channel;
	}
	args = args.splice(1);
	switch (cmd) {
		case "help": case "h": case "iamdumb": case "carmi":
			var message="";
			var documntation = [
				"ברוך הבא למשחק הסיקלר",
				"מצורפת רשימה של כל הפקודות החוקיות:",
				"help " + " קבל את ההודעה הזאת",
				"startgame [@mention list] " + " פתח משחק עם השחקנים הנתונים",
				"endgame " + " סגור משחק קיים עם יש"
			];
			if(mode==1){
				documntation.push("select [@mention] " + "רק הפרסידנט הנוכחי " + get_name(current) + " יבחר את הקנסלור שהוא מציא " + "בלי חרתות!");
			}
			if(mode==2){
				documntation.push("vote [y/n] " + "הצביאו האם אתם תומכים בהצבעה (ניתן גם בפרטי)");
				documntation.push("endvote " + "סיים את שלב ההצבעה ברגע זה");
			}
			if(mode==3){
				documntation.push("throw [f/l] " + "רק הפרסידנט הנוכחי " + get_name(current) + " יבחר את הקלף שהוא מוציא " + "בלי חרתות!");
			}
			if(mode==4){
				documntation.push("throw [f/l] " + "רק הקנסלר הנוכחי " + get_name(chosen) + " יבחר את הקלף שהוא מוציא " + "בלי חרתות!");
				if(num_facist_passed >= 5){
					documntation.push("veto [f/l] " + "רק הקנסלר הנוכחי " + get_name(chosen) + " בוחר להציע veto " + "בלי חרתות!");
				}
			}
			if(mode==5){
				documntation.push("throw [f/l] " + "רק הקנסלר הנוכחי " + get_name(current) + " יבחר את הקלף שהוא מוציא " + "בלי חרתות!");
				if(num_facist_passed >= 5){
					documntation.push("veto [f/l] " + "רק הקנסלר הנוכחי " + get_name(current) + " בוחר להציע veto " + "בלי חרתות!");
				}
			}
			if(mode==6){
				documntation.push("select [@mention] " + "רק הפרסידנט הנוכחי " + get_name(current) + " יבחר את מי לחקור " + "בלי חרתות!");
			}
			if(mode==7){
				documntation.push("select [@mention] " + "רק הפרסידנט הנוכחי " + get_name(current) + " יבחר את הפרסידנט הבא " + "בלי חרתות!");
			}
			if(mode==8){
				documntation.push("select [@mention] " + "רק הפרסידנט הנוכחי " + get_name(current) + " יבחר את מי לרצוח " + "בלי חרתות!");
			}
			for (var i = 0; i < documntation.length; i++)
				message += documntation[i] + '\n';
			channel.send(message);
			break;
		case "veto":
			if(ispublic){
				channel.send("אסור לעשות פעולה זאת בפומבי");
				break;
			}
			if(mode <= 3 || mode >= 6){
				channel.send("לא בזמן נכון");
				break;
			}
			if(num_facist_passed < 5){
				channel.send("EA: you havent unlocked this yet for 29.99$");
				break;
			}
			var ind = getindex(msg.author);
			if(ind != chosen && mode == 4){
				channel.send("לא האדם הנכון!");
				break;
			}
			if(ind != current && mode == 5){
				channel.send("לא האדם הנכון!");
				break;
			}
			if(mode==4){
				mode = 5;
				players[current].send("מציעים לך veto");
				players[current].send(handinfo());
			}else{
				publicchannel.send("היה veto");
				normalforward();
			}
			break;
		case "throw":
			if(ispublic){
				channel.send("אסור לעשות פעולה זאת בפומבי");
				break;
			}
			if(mode <= 2 || mode >= 6){
				channel.send("לא בזמן מעבר חוק");
				break;
			}
			if(args.length == 0){
				channel.send("ציין איזה קלף אתה רוצה לזרוק");
				break;
			}
			var ind = getindex(msg.author);
			var throww=-1;
			if(args[0]=="f" || args[0]=="facist"){
				throww=1;
			}
			if(args[0]=="l" || args[0]=="liberal"){
				throww=0;
			}
			if(throww==-1 || (throww==0 && liberals_in_hand == 0) || (throww==1 && facists_in_hand == 0)){
				channel.send("לא זריקה חוקית");
				break;
			}	
			if(mode == 3){
				if(ind != current){
					channel.send("לא האדם הנכון!");
					break;
				}
				discardpile.push(throww);
				if(throww==1){
					facists_in_hand--;
				}else{
					liberals_in_hand--;
				}
				players[chosen].send(handinfo());
				mode = 4;
				break;
			}
			if(mode == 4 || mode == 5){
				if(ind != chosen && mode == 4){
					channel.send("לא האדם הנכון!");
					break;
				}
				if(ind != current && mode == 5){
					channel.send("לא האדם הנכון!");
					break;
				}
				discardpile.push(throww);
				if(throww==1){
					facists_in_hand--;
				}else{
					liberals_in_hand--;
				}
				if(facists_in_hand==1){
					var curaction= actions[num_facist_passed];
					publicchannel.send("עבר פאשיסט");
					num_facist_passed++;
					if(num_facist_passed==6){
						gameend(2);
						break;
					}
					logger.info(actions);
					logger.info(num_facist_passed);
					logger.info(curaction);
					switch (curaction) {
						case 1:
							reshuffle(3);
							for(var i = 1; i <= 3 ;i++){
								var card =cards[cards.length - i];
								facists_in_hand += card;
								liberals_in_hand += 1-card;
							}
							publicchannel.send("הפרסידנט מקבל את השלושה קלפים הבאים לראות");
							players[chosen].send(handinfo());
							facists_in_hand = 0;
							liberals_in_hand = 0;
						case 0:
							normalforward();
							break;
						case 2:
							publicchannel.send("הפרסידנט מקבל חקירה");
							mode = 6;
							break;
						case 3:
							publicchannel.send("הפרסידנט מקבל לבחור את הפרסידנט הבא");
							mode = 7;
							break;
						case 4:
							publicchannel.send("הפרסידנט מקבל לרצוח מישהו לבחירתו");
							mode = 8;
							break;
					}
					break;
				}else{
					publicchannel.send("עבר ליברל");
					num_liberal_passed++;
					if(num_liberal_passed==5){
						gameend(0);
						return;
					}
					normalforward();
					break;
				}
			}
			break;
		case "vote":
			if(mode!=2){
				channel.send("לא מצביעים עכשיו");
				break;
			}
			if(args.length == 0){
				channel.send("לא הצבעה חוקית");
				break;
			}
			var ok = false;
			var ind = getindex(msg.author);
			if(dead[ind]){
				channel.send("אתה אצה(מת) אצות לא מצביעות");
				break;
			}
			if(args[0] == "n" || args[0] == "nein"){
				ok = true;
				if(votes[ind]==-1){
					numvoted++;
				}
				votes[ind]=0;
			}
			if(args[0] == "y" || args[0] == "ya"){
				ok = true;
				if(votes[ind]==-1){
					numvoted++;
				}
				votes[ind]=1;
			}
			if(!ok){
				channel.send("לא הצבעה חוקית");
				break;
			}
			if(numalive()==numvoted){
				endvote();
			}
			break;
		case "endvote":
			if(numalive()<2*numvoted){
				endvote();
			}else{
				channel.send("לא מספיק הצביעו עדיין");
			}
			break;
		case "select":
			if(getindex(msg.author)!=current){
				channel.send("לא הפרסידנט");
				break;
			}
			if(!ispublic || msg.mentions.members.array().length != 1){
				channel.send("לא כמות נכונה של אנשים");
				break;
			}
			var oth=getindex(msg.mentions.members.array()[0]);
			if(oth == -1 || oth == current || dead[oth]) {
				channel.send("לא בן אדם חוקי לבחירה");
				break;
			}
			if(mode==1){ //choose
				var message="";
				message += " הפרסידנט ";
				message += get_name(current);
				message += " בחר את הקנסלור ";
				message += get_name(oth);
				message +=  '\n';
				message += "זמן להצביא!";
				channel.send(message);
				chosen=oth;
				mode = 2;
				votes=[];
				numvoted=0;
				for (var i = 0; i < players.length; i++){
					votes.push(-1);
				}
				break;
			}
			if(mode==6){ // question
				var message="";
				message += " הפרסידנט ";
				message += get_name(current);
				message += " בחר לחקור את ";
				message += get_name(oth);
				message +=  '\n';
				channel.send(message);
				message="";
				if(roles[i] == 0){
					message="ליברל";
				}else{
					message="פאשיסט";
				}
				players[current].send(message);
				normalforward();
				break;
			}
			if(mode==7){ // choose nekt
				var message="";
				message += " הפרסידנט ";
				message += get_name(current);
				message += " בחר את ";
				message += get_name(oth);
				message += "בתור הנשיא הבא ";
				message +=  '\n';
				channel.send(message);
				message="";
				current = oth;
				mode = 1;
				break;
			}
			if(mode==8){ // kill
				var message="";
				message += " הפרסידנט ";
				message += get_name(current);
				message += " בחר להרוג את ";
				message += get_name(oth);
				message +=  '\n';
				channel.send(message);
				message="";
				dead[oth]=1;
				normalforward();
				if(roles[oth]==2){
					gameend(1);
				}
				break;
			}
			break;
		case "endgame":
			if(mode!= 0){
				channel.send("נסגר משחק");
			}else{
				channel.send("אין משחק לסגירה");
			}
			mode = 0;
			chosen = oth;
			break;
		case "startgame":
			if(mode!=0){
				channel.send("יש משחק רץ כרגע אי אפשר להתחיל חדש מבלי לגמור את הישן");
				break;
			}
			if(!ispublic || msg.mentions.members.array().length==0){
				channel.send("לא צוינו אנשים");
				break;
			}
			players = randomize_array_order(randomize_array_order(msg.mentions.members.array()));
			init(Math.max(players.length,5));
			var message="סדר הישיבה יהיה:\n";
			for (var i = 0; i < players.length; i++)
				message += get_name(i) + '\n';
			message += "מתחיל מ" + '\n';
			message += get_name(current);
			channel.send(message);
			var info= "הפשיסטים הם:"
			for (var i = 0; i < players.length; i++){
				if(roles[i]==1)
					info += ' ' + get_name(i);
			}
			info += "\n";
			info += "היטלר הוא:"
			for (var i = 0; i < players.length; i++){
				if(roles[i]==2)
					info += ' ' + get_name(i);
			}
			for(var i = 0; i < players.length; i++){
				if(roles[i] == 0){
					message="אתה ליברל";
				}
				if(roles[i] == 1){
					message="אתה פאשיסט";
					message += "\n";
					message += info;
				}
				if(roles[i] == 2){
					message="אתה היטלר";
					if(doeshitlerknow){
						message += "\n";
						message += info;
					}
				}
				players[i].send(message);
			}
			break;
		default :
				channel.send(":לא ממש הבנתי מה אתה מנסה להגיד הפקודות החוקיות הן" + "\n help");
	}
}
