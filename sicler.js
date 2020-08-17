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
		if(players[i].userID == user.id || players[i].userID == user.userID){
			return i;
		}
	}
	return -1;
}
var normalforward=function(){
	current = next;
}
exports.main = function(msg,args){
	//logger.info("Connected");
	//
	var cmd = args[0];
	var channel   = msg.channel;
	var ispublic = (channel.type!= 'dm');
	//logger.info(channel.type);
	//logger.info(ispublic);
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
				documntation.push("select [@mention] " + "רק הפרסידנט הנוכחי " + get_name(current) + " יבחר את הקנסלור שהוא מציא " + "בלי חרתות!"  );
			}
			for (var i = 0; i < documntation.length; i++)
				message += documntation[i] + '\n';
			channel.send(message);
			break;
		case "select":
			if(getindex(msg.author)!=current){
				channel.send("לא הפרסידנט");
				break;
			}
			if(msg.mentions.members.array().length != 1){
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
				message += " הפרסידנט";
				message += get_name(current);
				message += " בחר את הקנסלור ";
				message += get_name(oth);
				message +=  '\n';
				message += "זמן להצביא!";
				channel.send(message);
				chosen=oth;
				mode = 2;
				break;
			}
			if(mode==6){ // question
				var message="";
				message += " הפרסידנט";
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
				mode = 1;
				
			}
			if(mode==7){ // question
				var message="";
				message += " הפרסידנט";
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
				mode = 1;
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
			players = randomize_array_order(msg.mentions.members.array());
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
