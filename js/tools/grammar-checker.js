(function () {
  "use strict";
  var EN_DICT = window.DS_EN_DICTIONARY || [];
  var EN_SET = Object.create(null);
  EN_DICT.forEach(function(w){ EN_SET[w] = true; });
  var DICT_BUCKETS = Object.create(null);
  EN_DICT.forEach(function(w){ var k=w.charAt(0)+w.length; (DICT_BUCKETS[k]||(DICT_BUCKETS[k]=[])).push(w); });
  function editDistance(a,b){
    if(a===b)return 0; if(Math.abs(a.length-b.length)>2)return 3;
    var prev=[],cur=[],i,j; for(j=0;j<=b.length;j++)prev[j]=j;
    for(i=1;i<=a.length;i++){ cur[0]=i; for(j=1;j<=b.length;j++){ var cost=a.charAt(i-1)===b.charAt(j-1)?0:1; cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+cost); } var tmp=prev;prev=cur;cur=tmp; }
    return prev[b.length];
  }
  function dictSuggestion(word){
    var w=word.toLowerCase(); if(w.length<3 || EN_SET[w]) return null;
    var pool=[]; for(var d=-1;d<=1;d++){ var b=DICT_BUCKETS[w.charAt(0)+(w.length+d)]; if(b) pool=pool.concat(b); }
    var best=null,bestD=3; pool.forEach(function(c){ if(Math.abs(c.length-w.length)>1)return; var d=editDistance(w,c); if(d<bestD){bestD=d;best=c;} });
    return bestD<=2?best:null;
  }
  var input = document.getElementById("grammarText");
  var highlight = document.getElementById("grammarHighlight");
  var out = document.getElementById("grammarResults");
  var check = document.getElementById("grammarCheck");
  var clear = document.getElementById("grammarClear");
  var copy = document.getElementById("grammarCopy");
  if (!input || !highlight || !out) return;

  function esc(s) { return String(s).replace(/[&<>\"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }
  function add(a, start, end, type, message, suggestion, severity) {
    if (start < 0 || end <= start) return;
    a.push({start:start,end:end,type:type,message:message,suggestion:suggestion,severity:severity || "warning"});
  }
  function allMatches(t, re, fn) { var m; re.lastIndex=0; while ((m=re.exec(t))) fn(m); }
  function addWordMatch(a,t,re,type,message,suggestion,severity) {
    allMatches(t,re,function(m){ add(a,m.index,m.index+m[0].length,type,message,suggestion,severity); });
  }

  var irregularBase = {
    went:"go", gone:"go", came:"come", come:"come", saw:"see", seen:"see", ate:"eat", eaten:"eat", took:"take", taken:"take", gave:"give", given:"give", made:"make", made:"make", did:"do", done:"do", was:"be", were:"be", been:"be", had:"have", got:"get", gotten:"get", wrote:"write", written:"write", read:"read", spoke:"speak", spoken:"speak", ran:"run", run:"run", drove:"drive", driven:"drive", broke:"break", broken:"break", chose:"choose", chosen:"choose", knew:"know", known:"know", began:"begin", begun:"begin", drank:"drink", drunk:"drink", sang:"sing", sung:"sing", swam:"swim", swum:"swim", flew:"fly", flown:"fly", bought:"buy", brought:"bring", thought:"think", taught:"teach", caught:"catch", kept:"keep", left:"leave", felt:"feel", found:"find", lost:"lose", built:"build", sent:"send", spent:"spend", paid:"pay", said:"say", told:"tell", understood:"understand", won:"win", read:"read"
  };
  var baseVerbs = "go come work play eat write read study watch watch make take give see do have get speak run walk live call use try carry study visit open close start finish clean help learn need want like love hate know think say tell find keep leave bring buy pay send build meet move turn show ask answer use".split(/\s+/);
  var commonSpellings = {
    goin:"going",
    comin:"coming",
    writting:"writing",
    useing:"using",
    studing:"studying",
    comming:"coming",
    runing:"running",
    makeing:"making",
    geting:"getting",
    begining:"beginning",
    recieve:"receive", seperate:"separate", definately:"definitely", occurrance:"occurrence", accomodate:"accommodate", adress:"address", goverment:"government", enviroment:"environment", embarass:"embarrass", responsibilty:"responsibility", recieveing:"receiving", untill:"until", tommorow:"tomorrow", occured:"occurred", begining:"beginning", sucess:"success", sucessful:"successful", independant:"independent", privilage:"privilege", calender:"calendar", wierd:"weird", beleive:"believe", acheive:"achieve", arguement:"argument", alot:"a lot", seperately:"separately", definately:"definitely", thier:"their", teh:"the", becuase:"because", becasue:"because", dont:"don't", cant:"can't", wont:"won't", isnt:"isn't", wasnt:"wasn't", didnt:"didn't", doesnt:"doesn't", couldnt:"couldn't", shouldnt:"shouldn't", wouldnt:"wouldn't"
  };

  /* Bundled high-frequency English misspelling dictionary. This is intentionally
     conservative: names, technical terms and uncommon words are not auto-flagged
     merely because they are absent from the dictionary. */
  var extendedSpellings = {
    gud:"good", becouse:"because", becuse:"because", beacuse:"because",
    wich:"which", whcih:"which", waht:"what", whta:"what", thsi:"this",
    tihs:"this", taht:"that", teh:"the", adn:"and", nad:"and",
    hte:"the", fom:"from", form:"from", freind:"friend", firend:"friend",
    wierd:"weird", weired:"weird", beleive:"believe", belive:"believe",
    recieve:"receive", receieve:"receive", recieive:"receive",
    seperate:"separate", seprate:"separate", definately:"definitely",
    definitly:"definitely", definatly:"definitely", occassion:"occasion",
    ocassion:"occasion", occured:"occurred", occuring:"occurring",
    occurence:"occurrence", occurances:"occurrences", accomodate:"accommodate",
    accomodation:"accommodation", acheive:"achieve", acheived:"achieved",
    acheivement:"achievement", adress:"address", addres:"address",
    adressing:"addressing", goverment:"government", governement:"government",
    enviroment:"environment", enviornment:"environment", developement:"development",
    independant:"independent", independance:"independence",
    responsability:"responsibility", responsibilty:"responsibility",
    sucess:"success", sucessful:"successful", sucessfully:"successfully",
    embarass:"embarrass", embarassed:"embarrassed", embarassing:"embarrassing",
    privilage:"privilege", priviledge:"privilege", calender:"calendar",
    tommorow:"tomorrow", tommorrow:"tomorrow", untill:"until",
    begining:"beginning", begining:"beginning", comming:"coming",
    writting:"writing", writtening:"writing", studing:"studying",
    runing:"running", makeing:"making", geting:"getting", useing:"using",
    lieing:"lying", tieing:"tying", dieing:"dying",
    finaly:"finally", usualy:"usually", realy:"really", actualy:"actually",
    basicly:"basically", completly:"completely", absolutly:"absolutely",
    especialy:"especially", particulary:"particularly",
    neccessary:"necessary", necesary:"necessary", neccessarily:"necessarily",
    aparently:"apparently", apparantly:"apparently", definately:"definitely",
    immediatly:"immediately", seperate:"separate", temprature:"temperature",
    governer:"governor", occured:"occurred", refered:"referred",
    prefered:"preferred", transfered:"transferred", controled:"controlled",
    commitee:"committee", comittee:"committee", reccomend:"recommend",
    recomend:"recommend", recomendation:"recommendation",
    arguement:"argument", buisness:"business", bussiness:"business",
    busines:"business", adress:"address", begining:"beginning",
    calender:"calendar", catagory:"category", categorie:"categories",
    cemetry:"cemetery", concious:"conscious", conscous:"conscious",
    consistant:"consistent", consistancy:"consistency",
    convinient:"convenient", conveniant:"convenient",
    curios:"curious", dissapear:"disappear", dissapoint:"disappoint",
    dissappoint:"disappoint", embaras:"embarrass", existance:"existence",
    experiance:"experience", experment:"experiment",
    familar:"familiar", febuary:"February", foriegn:"foreign",
    freindly:"friendly", gaurd:"guard", happend:"happened",
    happenned:"happened", heigth:"height", hieght:"height",
    immediatly:"immediately", knowlege:"knowledge", liason:"liaison",
    maintenence:"maintenance", managable:"manageable", millenium:"millennium",
    neccessary:"necessary", noticable:"noticeable", occassionally:"occasionally",
    persue:"pursue", possesion:"possession", possable:"possible",
    preferance:"preference", pronounciation:"pronunciation",
    publically:"publicly", questionaire:"questionnaire",
    quarantee:"guarantee", realy:"really", relevent:"relevant",
    religious:"religious", rythm:"rhythm", rythym:"rhythm",
    sacriligious:"sacrilegious", seperate:"separate",
    succesful:"successful", supercede:"supersede",
    thier:"their", truely:"truly", untill:"until",
    vaccum:"vacuum", vehical:"vehicle", visable:"visible",
    wether:"whether", wich:"which", withing:"within",
    woudl:"would", shoudl:"should", coudl:"could",
    shoud:"should", becuase:"because", becasue:"because",
    dont:"don't", cant:"can't", wont:"won't", isnt:"isn't",
    wasnt:"wasn't", werent:"weren't", didnt:"didn't", doesnt:"doesn't",
    couldnt:"couldn't", shouldnt:"shouldn't", wouldnt:"wouldn't",
    couldnt:"couldn't", youre:"you're", theyre:"they're", weve:"we've",
    ive:"I've", im:"I'm", lets:"let's"
  };
  Object.keys(extendedSpellings).forEach(function(k){ commonSpellings[k]=extendedSpellings[k]; });

  var commonPrepositions = [
    [/\b((?:am|is|are|was|were)\s+(?:going|goin)|go|goin|going|goes|went|come|comes|came|return|returns|returned|reach|reaches|reached)\s+(?:on|in|at|to)\s+home\b/gi,"The verb is normally used directly with “home”, without a preposition.","Use “go/going/come/return/reach home”, not “go/going to home”."],
    [/\b(discuss|discussed|discusses|discussing)\s+about\b/gi,"“Discuss” normally does not take “about” directly.","Use “discuss the issue”, not “discuss about the issue”."],
    [/\b(enter|entered|enters|entering)\s+into\s+(?:the|a|an)\b/gi,"“Enter” normally does not need “into” before a place.","Use “enter the room”. “Enter into” is used in different constructions."],
    [/\b(marry|married|marries|marrying)\s+(?:with|to)\b/gi,"“Marry” normally takes the person directly.","Use “marry someone” or “be married to someone”."],
    [/\b(depend|depends|depended|depending)\s+(?:of|from)\b/gi,"The usual preposition after “depend” is “on”.","Use “depend on”."],
    [/\b(different)\s+than\b/gi,"“Different from” is the standard formal choice.","Use “different from”; “different than” can be valid in some varieties."],
    [/\b(prefer)\s+([^.!?]{1,40}?)\s+than\b/gi,"“Prefer” normally takes “to”, not “than”.","Use “prefer X to Y”."],
    [/\b(listen|listened|listens|listening)\s+(?:music|the music|him|her|me|them)\b/gi,"“Listen” normally takes “to” before its object.","Use “listen to music”, “listen to him”, etc."],
    [/\b(wait|waited|waits|waiting)\s+(?:the bus|me|him|her|them)\b/gi,"“Wait” normally takes “for” before the object.","Use “wait for the bus / wait for me”."],
    [/\b(arrive|arrived|arrives|arriving)\s+(?:to)\b/gi,"“Arrive” normally takes “at” or “in”, not “to”.","Use “arrive at the station” or “arrive in Delhi”."],
    [/\b(explain|explained|explains|explaining)\s+(?:to\s+me\s+)?about\b/gi,"“Explain” normally takes the thing directly, or “explain something to someone”.","Use “explain the problem to me”, not “explain about the problem”."],
    [/\b(request|requested|requests|requesting)\s+to\s+him\b/gi,"“Request” does not normally take “to” before a person in this structure.","Use “request him to …” or “make a request to him”."],
    [/\b(comprise|comprises|comprised|comprising)\s+of\b/gi,"“Comprise” traditionally takes the parts directly.","Use “The team comprises five people” or “is composed of five people”."]
  ];

  function scan(t) {
    var a=[];
    addWordMatch(a,t,/ {2,}/g,"Spacing","Repeated spaces found.","Use a single space between words.","warning");
    addWordMatch(a,t,/\t+/g,"Spacing","Tab spacing appears inside the text.","Use normal word spacing unless the tab is intentional.","warning");
    addWordMatch(a,t,/\s+[,.!?;:]/g,"Punctuation","A space appears before punctuation.","Move the punctuation mark next to the preceding word.","error");
    addWordMatch(a,t,/[,;:]([A-Za-z])/g,"Punctuation","Punctuation is followed immediately by a word.","Usually add a space after the punctuation mark.","warning");
    allMatches(t,/(^|[.!?]\s+|\n\s*)[a-z]/g,function(m){var off=m[0].length-1;add(a,m.index+off,m.index+off+1,"Capitalization","A sentence appears to start with a lowercase letter.","Capitalize the first word of the sentence.","error");});
    addWordMatch(a,t,/\b([A-Za-z]+)\s+\1\b/gi,"Repeated word","Repeated word: “$&”.","Remove the accidental duplicate if it is not intentional.","error");

    Object.keys(commonSpellings).forEach(function(w){var re=new RegExp("\\b"+w+"\\b","gi");allMatches(t,re,function(m){add(a,m.index,m.index+m[0].length,"Spelling","Possible spelling error: “"+m[0]+"”.","Suggested spelling: “"+commonSpellings[w]+"”.","error");});});

    var confusions=[
      [/\b(your)\s+(welcome|right|going)\b/gi,"your/you're","Use “you're” when you mean “you are”."],
      [/\b(youre|youre)\b/gi,"Contraction","If you mean “you are”, use “you're”.","warning"],
      [/\b(their)\s+(is|are)\b/gi,"their/there","Use “there” for existence or a place; “their” shows possession."],
      [/\b(its)\s+(a|an|the)\b/gi,"its/it's","Use “it's” for “it is”; “its” is possessive."],
      [/\b(then)\s+(he|she|they|we|I|you)\b/gi,"then/than","Check whether “than” is intended for a comparison."],
      [/\b(affect)\s+(?:the|a|an|his|her|their|this|that)\b/gi,"affect/effect","“Affect” is usually a verb; “effect” is usually a noun. Check the intended meaning."],
      [/\b(could|would|should|might|must)\s+to\b/gi,"Modal verb","A modal is normally followed by the base verb without “to”."],
      [/\b(more|most)\s+(better|best|worse|worst)\b/gi,"Comparison","Avoid a double comparative/superlative.","warning"]
    ];
    confusions.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Word choice",r[1]+" may be incorrect here.",r[2],r[3]||"warning");});});

    var agreement=[
      [/\bI\s+is\b/gi,"Use “am” with “I”."],[/\b(he|she|it)\s+are\b/gi,"Use “is” with he, she or it."],[/\b(he|she|it)\s+have\b/gi,"Use “has” with he, she or it."],[/\b(they|we|you)\s+is\b/gi,"Use “are” with this subject."],[/\b(they|we|you)\s+was\b/gi,"Use “were” with this subject."],[/\b(I)\s+were\b/gi,"Use “was” with I in ordinary past statements."],[/\b(each|every|everyone|everybody|someone|somebody|nobody|neither|either)\s+(are|were|have)\b/gi,"Singular indefinite subjects normally take singular agreement."]
    ];
    agreement.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Subject–verb agreement",m[0]+" may have an agreement problem.",r[1],"error");});});
    allMatches(t,/\b(one of the\s+\w+)\s+(are|were|have)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Subject–verb agreement","The main subject after “one of the” is singular.","Use “one of the … is/was/has …” when the intended subject is one.","error");});

    /* Tense and verb-form engine: covers malformed forms and the characteristic structures of all 12 traditional tense forms. */
    var tenseRules=[
      [/\b(did|didn't)\s+(went|came|saw|ate|took|gave|got|had|was|were|done|gone|seen|eaten|written)\b/gi,"Past simple","After did/didn't, use the base verb.","Example: “did go”, not “did went”."],
      [/\b(has|have|had)\s+(went|came|saw|ate|took|gave|got|was|were|did|wrote|spoke)\b/gi,"Present/past perfect","Perfect forms need a past participle after has/have/had.","Example: “has gone”, “have eaten”, “had seen”."],
      [/\b(will|shall|can|could|may|might|must|should|would)\s+(went|goes|going|ate|eats|did|does|was|were)\b/gi,"Future/modal","A modal normally takes the base form.","Example: “will go”, “can eat”, “should do”."],
      [/\b(am|is|are|was|were)\s+(go|goes|eat|eats|write|writes|work|works|play|plays|study|studies)\b/gi,"Continuous","Continuous forms use be + verb-ing.","Example: “is going”, “were working”."],
      [/\b(has|have|had)\s+been\s+(go|goes|went|eat|eats|ate|work|works|worked|write|writes|wrote|study|studies|studied)\b/gi,"Perfect continuous","Perfect-continuous forms use has/have/had been + verb-ing.","Example: “has been working”, “had been studying”."],
      [/\b(was|were)\s+been\b/gi,"Auxiliary sequence","This auxiliary sequence is usually incorrect.","Use “was/were + -ing” for past continuous or “had been + -ing” for past perfect continuous."],
      [/\b(to)\s+(went|came|saw|ate|did|does|was|were|wrote|spoke)\b/gi,"Infinitive","An infinitive uses the base verb after “to”.","Example: “to go”, “to see”, “to do”."],
      [/\b(he|she|it)\s+(go|work|play|eat|write|read|watch|study|try|carry)\b/gi,"Present simple","Third-person singular normally needs -s/-es in the simple present.","Example: “she works”, “he goes”, “it studies”."],
      [/\b(yesterday|last\s+(night|week|month|year))\b[^.!?]{0,90}\b(is|are|has|have)\b/gi,"Past simple vs present/perfect","A completed past-time marker may conflict with the present/perfect form.","Review whether a past simple form is intended."],
      [/\b(since|for)\s+\d+\s+(year|years|month|months|day|days|hour|hours)\b[^.!?]{0,90}\b(was|were)\b/gi,"Perfect / perfect continuous","A duration continuing to the present often needs a perfect or perfect-continuous construction.","Consider “has/have been …” when the action continues now.","warning"],
      [/\b(will|shall)\s+have\s+(went|came|saw|ate|took|gave|wrote|spoke)\b/gi,"Future perfect","Future perfect needs will/shall have + past participle.","Example: “will have gone”, “will have written”."],
      [/\b(will|shall)\s+be\s+(go|goes|went|eat|eats|ate|work|works|worked|write|writes|wrote)\b/gi,"Future continuous","Future continuous uses will/shall be + verb-ing.","Example: “will be working”."],
      [/\b(will|shall)\s+have\s+been\s+(go|goes|went|eat|eats|ate|work|works|worked|write|writes|wrote)\b/gi,"Future perfect continuous","Future perfect continuous uses will/shall have been + verb-ing.","Example: “will have been working”."]
    ];
    tenseRules.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Tense / verb form",r[1]+": "+r[2],r[3],"error");});});

    /* 12-tense semantic cues: these are warnings, not automatic claims about intended meaning. */
    var cueRules=[
      [/\b(every|usually|often|always|sometimes|rarely|never)\b[^.!?]{0,70}\b(am|is|are)\s+(went|gone|working|going)\b/gi,"Simple present / present continuous","Check whether the habitual time marker matches the verb form.","warning"],
      [/\b(now|right now|at the moment)\b[^.!?]{0,60}\b(go|goes|went|eat|eats|work|works)\b/gi,"Present continuous","“Now/at the moment” commonly takes present continuous for an action happening now.","warning"],
      [/\b(yesterday|last\s+(night|week|month|year)|ago)\b[^.!?]{0,60}\b(has|have)\b/gi,"Past simple / present perfect","A finished past-time marker usually goes with past simple, not present perfect.","warning"],
      [/\b(already|yet|just|ever|never)\b[^.!?]{0,60}\b(went|saw|ate|did)\b/gi,"Present perfect","These adverbs often occur with present perfect when the time is connected to the present.","warning"],
      [/\b(by\s+(tomorrow|next\s+week|next\s+month|next\s+year))\b[^.!?]{0,60}\b(will\s+go|will\s+work|will\s+finish)\b/gi,"Future perfect","“By + future time” often calls for future perfect when completion before that time is intended.","warning"],
      [/\b(since|for)\b[^.!?]{0,70}\b(is|are|was|were)\s+\w+ing\b/gi,"Perfect continuous","A continuing duration from a starting point often uses perfect continuous.","warning"]
    ];
    cueRules.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Tense consistency",r[1]+" may need review.",r[2],r[3]);});});

    /* Passive voice: be + past participle, plus common malformed passive structures. */
    var passive=[
      [/\b(is|are|was|were|be|been|being)\s+(went|came|saw|ate|took|gave|wrote|spoke|did|made)\b/gi,"Possible passive-voice form is malformed.","Passive voice normally uses a form of “be” + past participle, e.g. “was written”."],
      [/\b(was|were|is|are)\s+(been)\s+\w+ed\b/gi,"Check passive auxiliary order.","Use “was/were + past participle” or “has/have been + past participle”, depending on the intended tense."],
      [/\b(has|have|had)\s+been\s+\w+ing\b/gi,"This is an active perfect-continuous pattern, not ordinary passive voice.","If passive meaning is intended, check whether “has/have/had been + past participle” is needed.","warning"]
    ];
    passive.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Passive voice",r[1],r[2],r[0].toString().indexOf("has|have|had")>=0?"warning":"error");});});

    /* Conditionals */
    var conditionals=[
      [/\bif\s+([^.!?]{0,100})\bwill\s+\w+/gi,"First conditional","In a normal first conditional, the if-clause usually uses present simple, not will.","Use “If it rains, we will stay home.”"],
      [/\bif\s+([^.!?]{0,100})\bwould\s+\w+/gi,"Second/first conditional","Check whether “would” belongs in the if-clause.","For a normal second conditional: “If I had time, I would help.”"],
      [/\bif\s+([^.!?]{0,100})\bhad\s+\w+ed\b[^.!?]{0,60}\bwill\s+have\b/gi,"Third conditional","Third conditional normally pairs past perfect in the if-clause with would have + past participle.","Example: “If I had known, I would have helped.”"],
      [/\bunless\s+([^.!?]{0,80})\bwill\s+/gi,"Conditional conjunction","“Unless” normally introduces a present/simple condition rather than a will-clause.","Example: “Unless it rains, we will go.”"]
    ];
    conditionals.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Conditionals",r[1]+": "+r[2],r[3],"warning");});});

    /* Articles and determiners */
    var articles=[
      [/\b(a)\s+(hour|honest|honor|heir|MBA|FBI|MRI)\b/gi,"Article before a vowel sound is missing “an”.","Use “an” before these vowel sounds."],
      [/\b(an)\s+(university|user|European|one|unique|useful)\b/gi,"Article before a consonant sound is “a”.","Use “a university”, “a user”, etc."],
      [/\b(a|an)\s+(the|my|your|his|her|our|their)\b/gi,"Two determiners appear together.","Usually choose one appropriate determiner."],
      [/\b(the)\s+(Mount|Lake)\s+[A-Z][a-z]+\b/gi,"Check whether the proper-name article is needed.","Some geographical names use no “the”; check the specific name.","warning"],
      [/\b(the)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi,"Article with a day name may be unnecessary.","Use the day name alone unless a special meaning requires “the”.","warning"]
    ];
    articles.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Articles / determiners",r[1],r[2],"warning");});});

    /* Gerunds / infinitives and verb-complement patterns */
    var gerunds=[
      [/\b(enjoy|avoid|finish|mind|suggest|consider|keep|practice|practise|admit|deny|recommend|risk)\s+to\s+\w+/gi,"Verb-complement pattern","This verb is normally followed by a gerund (-ing), not an infinitive.","Example: “enjoy reading”, “avoid making”, “suggest going”."],
      [/\b(want|wants|need|needs|hope|hopes|plan|plans|decide|decides|promise|promises|agree|agrees|refuse|refuses|learn|learns|offer|offers|expect|expects|manage|manages)\s+\w+ing\b/gi,"Verb-complement pattern","This verb commonly takes an infinitive in this meaning.","Example: “want to go”, “decide to leave”, “plan to study”."],
      [/\b(look\s+forward\s+to|be\s+used\s+to|object\s+to)\s+to\s+\w+/gi,"Gerund after fixed “to” expression","Here “to” is a preposition, so it is normally followed by a noun or gerund.","Example: “look forward to meeting you”."]
    ];
    gerunds.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Gerund / infinitive",r[1],r[2],"error");});});

    /* Core sentence-completeness and dangling-preposition checks */
    var completeness=[
      [/(^|[.!?]\s+|\n\s*)(?:[A-Z][a-z]+|I|you|he|she|it|we|they)\s+(?:going|goin|coming|comin|working|playing|eating|writing|reading|studying|watching|walking|living|calling|using|trying|carrying|visiting|opening|closing|starting|finishing|cleaning|helping|learning|waiting|running|driving|speaking|sleeping|talking)\b/gi,"Possible missing auxiliary verb.","A present/past continuous form normally needs a form of “be”. Example: “Ram is going home.”","error"],
      [/(^|[.!?]\s+)(?:[A-Za-z]+(?:\s+[A-Za-z]+){0,6}\s+)?(?:going|goin|coming|comin|working|playing|eating|writing|reading|studying|watching|walking|living|calling|using|trying|carrying|visiting|opening|closing|starting|finishing|cleaning|helping|learning|waiting|running|driving|speaking|sleeping|talking)\s+(?:home|there|here)\s+to\b/gi,"Dangling “to” at the end of the clause.","“To” needs a following destination/object in this construction. If the meaning is destination home, use “going home”; if another destination follows, keep “to” with that destination.","error"],

      [/\b(?:to|at|in|on|for|from|with|about|of|by|into|onto|under|over|between|through|during|without|before|after)\s*(?=[.!?]|$)/gi,"Dangling preposition.","A preposition normally needs an object or a complete construction. Check whether the preposition should be removed or followed by the missing object.","error"]
    ];
    completeness.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Sentence structure",r[1],r[2],r[3]||"warning");});});

    /* Common malformed identity/name constructions */
    var identityRules=[
      [/\bI\s+am\s+name\s+is\b/gi,"Incorrect identity/name structure.","Use “My name is …” or “I am …”. Example: “My name is Mohan.”","error"],
      [/\bmy\s+name\s+am\b/gi,"Incorrect verb in the name construction.","Use “My name is …”.","error"],
      [/\bI\s+name\s+is\b/gi,"Incorrect identity/name structure.","Use “My name is …” or “I am …”.","error"]
    ];
    identityRules.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Sentence structure / identity",r[1],r[2],r[3]||"error");});});

    /* Conjunctions, fragments and sentence structure */
    var structure=[
      [/\b(each|every|everyone|everybody|someone|somebody|nobody|neither|either)\s+(are|were|have)\b/gi,"Singular agreement is normally required.","Use “is/was/has” when the indefinite pronoun is the subject."],
      [/\b(less)\s+(people|cars|books|items|students|employees)\b/gi,"“Fewer” is normally used with countable plural nouns.","Use “fewer” when you mean a smaller number."],
      [/\b(much)\s+(people|students|books|cars|items)\b/gi,"“Many” is normally used with countable plural nouns.","Use “many people/books/items”."],
      [/\b(between)\s+\w+\s+and\s+\w+\s+to\b/gi,"Mixed range/comparison structure.","Use either “between X and Y” or “from X to Y”, not a mixture."],
      [/\b(because|although|while|when|if|unless)\s+[.!?]/gi,"A conjunction is followed by an incomplete clause.","Add the clause that completes the conjunction, or remove the conjunction."],
      [/(^|[.!?]\s+)because\s+[A-Za-z][^.!?]{0,80}[.!?]/gi,"Possible sentence fragment beginning with “because”.","Connect the because-clause to a main clause if it is not intentionally a fragment.","warning"],
      [/\b(and|but|or)\s+(and|but|or)\b/gi,"Repeated conjunction.","Check whether one of the conjunctions should be removed."],
      [/\balthough\s+but\b/gi,"Double conjunction.","Use either “although” or “but” for this contrast structure."],
      [/\bdespite\s+(?:of)\b/gi,"“Despite” does not normally take “of”.","Use “despite the rain” or “in spite of the rain”."],
      [/\b(unless)\s+(?:not)\b/gi,"Double negative conditional.","“Unless” already expresses a negative condition; check whether “not” is needed."],
      [/\b(one of the)\s+\w+\s+(is|are)\b/gi,"Check agreement after “one of the”.","The main subject is “one”, so singular agreement is normally used.","warning"]
    ];
    structure.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Sentence structure / conjunction",r[1],r[2],"warning");});});


    /* Advanced mechanics: punctuation, capitalization, syntax, vocabulary, clarity and style. */
    var mechanics = [
      [/\b(its)\s+(?:a|an|the)\b/gi,"Possessive determiner","“Its” is possessive; check that this is not the contraction “it’s”.","Use “its” for possession and “it’s” for “it is/it has”.","warning"],
      [/\b(your)\s+(?:a|an|the|going|doing|being|been)\b/gi,"Pronoun / contraction","Check whether “your” or “you’re” is intended.","Use “you’re” only when it means “you are”.","warning"],
      [/\b(their)\s+(?:is|are|was|were)\b/gi,"Pronoun / agreement","Check whether “their” is being used as a possessive determiner or whether “there/they’re” is intended.","Review the sentence context." ,"warning"]
    ];
    mechanics.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Pronouns / mechanics",r[1]+": "+r[2],r[3],r[4]);});});

    /* Comma splices: two likely independent clauses joined only by a comma. */
    allMatches(t,/\b([A-Za-z][^,;.!?]{1,70}\b(?:is|are|was|were|has|have|had|do|does|did|will|can|could|should|would|may|might|must|go|goes|went|work|works|worked|eat|eats|ate|study|studies|studied))\s*,\s*((?:[A-Z]|it|he|she|they|we|you|I)[^,;.!?]{1,70}\b(?:is|are|was|were|has|have|had|do|does|did|will|can|could|should|would|may|might|must|go|goes|went|work|works|worked|eat|eats|ate|study|studies|studied))\b/g,function(m){add(a,m.index,m.index+m[0].length,"Punctuation","Possible comma splice: two independent clauses appear to be joined with only a comma.","Use a full stop, semicolon, or a suitable conjunction.","warning");});

    /* Introductory phrase comma and common punctuation spacing. */
    allMatches(t,/(^|[.!?]\s+)(After|Before|However|Therefore|In addition|For example|For instance|In contrast|On the other hand|As a result|In fact|First|Second|Finally)\s+([A-Z][a-z]+)/g,function(m){var phrase=m[2],whole=m[0],start=m.index+(m[1]?m[1].length:0);if(whole.indexOf(",")<0)add(a,start,start+phrase.length,"Punctuation","An introductory word or phrase is not separated by a comma.","Consider “"+phrase+", …” when the phrase is introductory.","warning");});
    addWordMatch(a,t,/\s+[,.!?;:]/g,"Punctuation","There is a space before punctuation.","Remove the space before the punctuation mark.","error");
    addWordMatch(a,t,/[,.!?;:]{2,}/g,"Punctuation","Repeated punctuation marks may be accidental.","Keep the punctuation appropriate to the sentence.","warning");

    /* Oxford comma consistency: warn only when both patterns appear in the same text. */
    var hasOxford=/\b\w+\s*,\s*\w+\s*,\s*and\s+\w+/i.test(t), hasNoOxford=/\b\w+\s*,\s*\w+\s+and\s+\w+/i.test(t);
    if(hasOxford && hasNoOxford){var oi=t.search(/\b\w+\s*,\s*\w+\s*,\s*and\s+\w+/i);if(oi>=0)add(a,oi,Math.min(t.length,oi+Math.max(20,t.slice(oi).split(/[.!?]/)[0].length)),"Punctuation style","Oxford-comma usage is inconsistent within the text.","Choose either Oxford-comma or non-Oxford-comma style and use it consistently.","warning");}

    /* Capitalization of sentence starts, proper-name-like common forms and acronyms. */
    allMatches(t,/(^|[.!?]\s+|\n\s+)([a-z])/g,function(m){var off=m.index+(m[1]?m[1].length:0);add(a,off,off+1,"Capitalization","A sentence or paragraph starts with a lowercase letter.","Capitalize the first word.","error");});
    addWordMatch(a,t,/\bi\s+(am|have|was|will|can|could|should|would|do|did|like|want|need|think|know|went|go)\b/g,"Capitalization","The pronoun “I” must be capitalized.","Use “I”.","error");
    addWordMatch(a,t,/\b(i'm|i've|i'll|i'd|i'd)\b/g,"Capitalization","The pronoun “I” should be capitalized inside the contraction.","Use “I'm”, “I've”, “I'll” or “I'd”.","error");

    /* Run-ons, fragments and sentence length. */
    var sentenceRe=/[^.!?\n]+[.!?]+|[^.!?\n]+$/g, sm;
    while((sm=sentenceRe.exec(t))){var sentence=sm[0].trim(), lead=sm[0].search(/\S/), st=sm.index+Math.max(0,lead), words=sentence.split(/\s+/).filter(Boolean);if(words.length>40)add(a,st,st+sentence.length,"Readability / sentence structure","This sentence is unusually long and may be difficult to follow.","Consider splitting it into two or more sentences where the meaning changes.","warning");if(words.length<=8 && /^(Because|Although|While|When|If|Unless|Since|And|But)\b/i.test(sentence) && !/,|\b(is|are|was|were|has|have|had|will|can|could|should|would|do|does|did)\b/i.test(sentence))add(a,st,st+sentence.length,"Sentence fragment","This may be an incomplete sentence beginning with a conjunction/subordinator.","Add a main clause or join it to the preceding sentence.","warning");}

    /* Parallelism in common lists and comparisons. */
    allMatches(t,/,\s+(?:it|he|she|they|we|you)\s+(?:is|are|was|were|has|have|had|will|can|could|should|would|do|does|did)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Punctuation","Possible comma splice: a second independent clause follows a comma without a conjunction.","Use a full stop, semicolon, or add a suitable conjunction.","warning");});
    allMatches(t,/\b(?:to\s+\w+\s*,\s*to\s+\w+\s+and\s+\w+ing|\w+ing\s*,\s*to\s+\w+\s+and\s+\w+ing)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Parallelism","The items in this list may not use parallel grammatical forms.","Keep the list in the same form, such as “to read, to write and to edit” or “reading, writing and editing”.","warning");});
    allMatches(t,/\b\w+ing\s*,\s*\w+ing\s+and\s+to\s+\w+\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Parallelism","The final item uses a different grammatical form from the earlier list items.","Use matching forms, for example “reading, writing and editing”.","warning");});
    allMatches(t,/\b[A-Z][a-z]+\s+(?:told|asked|said to|reminded)\s+[A-Z][a-z]+\s+that\s+(?:he|she|they)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Pronoun reference","The pronoun may have more than one possible antecedent.","Repeat the person’s name or rewrite the sentence if the reference could be misunderstood.","warning");});
    allMatches(t,/\b(?:Walking|Running|Driving|Working|Sitting|Standing|After leaving|While walking|While driving)\b[^.!?,;]{0,50},\s+(?:the|a|an)\s+(?:rain|weather|car|bus|house|building|problem|meeting|report)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Modifier / sentence structure","The opening modifier may not clearly describe the noun that follows it.","Place the person or thing performing the action directly after the introductory phrase.","warning");});

    allMatches(t,/\b(?:more|less|as)\s+[^.!?,;]{1,30}\s+than\s+[^.!?,;]{1,30}\b/gi,function(m){if(/\bmore\s+\w+\s+than\s+\w+\b/i.test(m[0]))return;add(a,m.index,m.index+m[0].length,"Comparison / word order","Check that both sides of the comparison use a clear, parallel structure.","Make the compared elements grammatically parallel.","warning");});

    /* Word order and common redundancy. */
    var redundancy=[
      [/\brepeat\s+again\b/gi,"“Repeat” already contains the idea of doing something again.","Use “repeat” or “say again”, depending on the intended meaning."],
      [/\b(?:return|returned|returns|returning)\s+back\b/gi,"“Return” already means go/come back.","Use “return” or “go back”, not both."],
      [/\bfree\s+gift\b/gi,"“Free gift” is often redundant.","Use “gift” unless the contrast with a paid gift matters."],
      [/\badvance\s+planning\b/gi,"“Advance” and “planning” can be redundant in this phrase.","Use “planning” or a more specific phrase if needed."],
      [/\bvery\s+unique\b/gi,"“Unique” is normally absolute.","Use “unique” or describe the specific degree of difference."],
      [/\bcompletely\s+finished\b/gi,"“Finished” already expresses completion.","Use “finished” unless emphasis is intentional."]
    ];
    redundancy.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Clarity / redundancy",r[1],r[2],"warning");});});

    /* Homophones and commonly misused words. */
    var homophones=[
      [/\b(affect|effect)\b/gi,"Check affect/effect usage.","“Affect” is usually a verb for influence; “effect” is usually a noun for a result, with exceptions."],
      [/\b(accept|except)\b/gi,"Check accept/except usage.","“Accept” means receive/agree; “except” means excluding."],
      [/\b(loose|lose)\b/gi,"Check loose/lose usage.","“Loose” means not tight; “lose” means fail to keep or no longer have."],
      [/\b(than|then)\b/gi,"Check than/then usage.","“Than” is normally used for comparison; “then” refers to time or sequence."],
      [/\b(there|their|they're)\b/gi,"Check there/their/they’re usage.","“There” refers to place/existence, “their” shows possession, and “they’re” means “they are”."]
    ];
    homophones.forEach(function(r){allMatches(t,r[0],function(m){var w=m[0].toLowerCase();if((w==="affect"||w==="effect")&&/\b(affect|effect)\s+(?:of|on)\b/i.test(t.slice(Math.max(0,m.index-2),m.index+m[0].length+5)))add(a,m.index,m.index+m[0].length,"Word choice",r[1],r[2],"warning");});});
    allMatches(t,/\b(loose)\s+(?:weight|money|control|the\s+file|the\s+documents)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Word choice","“Loose” is unlikely to be intended in this context.","Use “lose” when you mean no longer have or fail to keep something.","error");});
    allMatches(t,/\b(more|less|better|worse|rather|other)\s+[^.!?]{0,30}\bthen\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Word choice","A comparison appears to use “then” instead of “than”.","Use “than” for comparison and “then” for time or sequence.","error");});
    allMatches(t,/\b(except)\s+(?:my|your|his|her|our|their)\s+(?:apology|permission|request|offer|invitation)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Word choice","“Except” means excluding; this context normally needs “accept”.","Use “accept” when the meaning is receive or agree.","error");});
    allMatches(t,/\b(there|their|they're)\s+(?:is|are|was|were)\b/gi,function(m){if(/^there\s+(?:is|are|was|were)$/i.test(m[0]))return;if(/^their\s+(?:is|are|was|were)$/i.test(m[0]))add(a,m.index,m.index+m[0].length,"Pronouns / word choice","Check whether “their” is being used where “there” or “they’re” is intended.","Use “there is/are” for existence or “they’re” for “they are”.","error");});

    /* US/UK spelling consistency. */
    var us=[/\bcolor\b/gi,/\bcenter\b/gi,/\brealize\b/gi,/\banalyze\b/gi,/\borganize\b/gi], uk=[/\bcolour\b/gi,/\bcentre\b/gi,/\brealise\b/gi,/\banalyse\b/gi,/\borganise\b/gi];
    var usCount=0,ukCount=0,usPos=-1,ukPos=-1;
    us.forEach(function(re){var ms=t.match(re)||[];if(ms.length){usCount+=ms.length;var m=re.exec(t);if(m&&usPos<0)usPos=m.index;}}); uk.forEach(function(re){var ms=t.match(re)||[];if(ms.length){ukCount+=ms.length;var m=re.exec(t);if(m&&ukPos<0)ukPos=m.index;}});
    if(usCount&&ukCount){var pos=usPos>=0?usPos:ukPos;add(a,pos,pos+Math.max(5,(t.slice(pos).split(/[.!?]/)[0]||"").length),"Spelling standardization","US and UK spelling variants are mixed in this text.","Choose one spelling convention for the document and keep it consistent.","warning");}
    else if(usCount>ukCount && ukCount){uk.forEach(function(re){allMatches(t,re,function(m){add(a,m.index,m.index+m[0].length,"Spelling standardization","This UK spelling differs from the dominant US spelling used in the text.","Use the US spelling consistently, for example “color”, “center” or “organize”.","warning");});});}
    else if(ukCount>usCount && usCount){us.forEach(function(re){allMatches(t,re,function(m){add(a,m.index,m.index+m[0].length,"Spelling standardization","This US spelling differs from the dominant UK spelling used in the text.","Use the UK spelling consistently, for example “colour”, “centre” or “organise”.","warning");});});}

    /* Passive voice can be grammatically correct; offer an active-voice readability suggestion rather than calling it an error. */
    allMatches(t,/(?:is|are|was|were|be|been|being|has been|have been|had been)\s+(?:being\s+)?(?:[a-z]+ed|[a-z]+en)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Active voice / readability","This passive construction may be less direct than an active sentence.","If the actor is known and important, consider rewriting in active voice. Do not change it when passive voice is intentional.","warning");});

    /* Transitions and readability: repeated transition at sentence starts. */
    var transitionRe=/(^|[.!?]\s+)(However|Therefore|Moreover|Furthermore|In addition|For example|For instance|In contrast|As a result|Finally|First|Second)\b/gi, transitions={},tm;
    while((tm=transitionRe.exec(t))){var key=tm[2].toLowerCase();transitions[key]=(transitions[key]||0)+1;}
    Object.keys(transitions).forEach(function(k){if(transitions[k]>=3){var re=new RegExp("(^|[.!?]\\s+)"+k.replace(/\s+/g,"\\s+")+"\\b","ig"), mm;while((mm=re.exec(t))){var st=mm.index+(mm[1]?mm[1].length:0);add(a,st,st+k.length,"Readability / transitions","The same transition is repeated several times.","Vary the transition or remove it where the relationship is already clear.","warning");}}});

    /* Tone detection: reported in the result summary; suggestions stay conservative. */
    function detectTone(text){
      var lower=text.toLowerCase(), scores={Academic:0,"Professional / Business":0,Casual:0,Creative:0};
      if(/\b(research|hypothesis|methodology|therefore|analysis|findings|citation|literature|evidence)\b/.test(lower))scores.Academic+=3;
      if(/\b(dear|regards|deadline|project|client|meeting|proposal|invoice|please|team|business|attached)\b/.test(lower))scores["Professional / Business"]+=3;
      if(/\b(hey|hi|lol|yeah|gonna|wanna|awesome|cool|btw|thanks)\b/.test(lower)||/[!?]{2,}/.test(text))scores.Casual+=3;
      if(/\b(once upon a time|whispered|moonlight|dream|magical|kingdom|forest|starlight|story)\b/.test(lower))scores.Creative+=3;
      var best="Professional / Business",max=-1;Object.keys(scores).forEach(function(k){if(scores[k]>max){max=scores[k];best=k;}});if(max===0)best="General / Neutral";return best;
    }
    commonPrepositions.forEach(function(r){allMatches(t,r[0],function(m){add(a,m.index,m.index+m[0].length,"Preposition / collocation",r[1],r[2],"error");});});

    if (t.trim() && !/[.!?]$/.test(t.trim())) { var st=t.trimEnd(); add(a,st.length-1,st.length,"Punctuation","The text does not end with sentence punctuation.","Add a full stop, question mark or exclamation mark if appropriate.","warning"); }

    a.sort(function(x,y){return x.start-y.start||x.end-y.end;});
    var seen={};
    a=a.filter(function(x){var k=x.start+":"+x.end+":"+x.type+":"+x.message;if(seen[k])return false;seen[k]=1;return true;});
    a._detectedTone=detectTone(t);
    if(a._detectedTone==="Academic"){
      allMatches(t,/\b(?:don't|doesn't|didn't|can't|couldn't|won't|wouldn't|isn't|aren't|wasn't|weren't|I've|you've|we've|they've|I'm|you're|we're|they're|I'll|you'll|we'll|they'll)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Tone / academic style","A contraction may be too informal for formal academic prose.","Consider expanding the contraction, for example “do not” instead of “don't”, unless the quoted voice requires the contraction.","warning");});
    }
    if(a._detectedTone==="Professional / Business"){
      allMatches(t,/\b(?:gonna|wanna|gotta|lol|btw|yeah|yep|awesome|cool)\b/gi,function(m){add(a,m.index,m.index+m[0].length,"Tone / professional style","This expression may sound too casual for professional/business writing.","Replace it with a neutral professional expression that preserves the intended meaning.","warning");});
    }
    a.forEach(function(x){if(x.type==="Active voice / readability"){if(a._detectedTone==="Academic")x.suggestion="For academic prose, use active voice when it improves clarity and identifies the actor; retain passive voice when the process or result is the focus.";else if(a._detectedTone==="Professional / Business")x.suggestion="Prefer direct active wording when it makes the message clearer and more concise; retain passive voice when the actor is unimportant.";else if(a._detectedTone==="Casual")x.suggestion="Consider a more direct active sentence if it sounds more natural; passive voice is still acceptable when intentional.";}});
    a.sort(function(x,y){return x.start-y.start||x.end-y.end;});
    /* Dictionary-backed spelling: only flag plausible misspellings, not every uncommon/proper word. */
    var seenWords=Object.create(null);
    allMatches(t,/\b[A-Za-z]{3,}\b/g,function(m){
      var raw=m[0], w=raw.toLowerCase();
      if(seenWords[m.index+'|'+w]) return; seenWords[m.index+'|'+w]=1;
      if(raw.charAt(0)===raw.charAt(0).toUpperCase() && raw!==raw.toLowerCase()) return;
      if(EN_SET[w]) return;
      var sug=dictSuggestion(w);
      if(sug && sug!==w){
        add(a,m.index,m.index+m[0].length,"Spelling","“"+raw+"” is not a standard dictionary spelling.","Did you mean “"+sug+"”?","error");
      }
    });

    /* Common question word order. */
    allMatches(t,/\bhow\s+you\s+(are|is|was|were|have|has|can|could|will|would|do|does|did)\b/gi,function(m){
      add(a,m.index,m.index+m[0].length,"Sentence structure / word order","Question word order is incorrect here.","Use “How are you …?”, “How do you …?”, etc. depending on the intended meaning.","error");
    });

    return a;
  }

  function renderHighlights(t,a){
    if(!a.length){highlight.innerHTML=esc(t).replace(/\n/g,"<br>");return;}
    var html="", pos=0;
    a.forEach(function(x,i){if(x.start<pos)return;html+=esc(t.slice(pos,x.start));var cls=x.severity==="error"?"grammar-mark grammar-mark--error":"grammar-mark";html+='<mark class="'+cls+'" data-grammar-index="'+i+'">'+esc(t.slice(x.start,x.end))+'</mark>';pos=x.end;});
    html+=esc(t.slice(pos)); highlight.innerHTML=html.replace(/\n/g,"<br>");
  }
  function sync(){highlight.scrollTop=input.scrollTop;highlight.scrollLeft=input.scrollLeft;}
  function render(t,a){
    renderHighlights(t,a);
    if(!a.length){out.innerHTML=t.trim()?'<p class="grammar-ok"><strong>No supported issues detected.</strong> Detected tone: '+esc(a._detectedTone||'General / Neutral')+'. This means the current rule set found no obvious problem; it is not proof that the text is perfect.</p>':'<p class="text-muted">Enter some English text and select “Check grammar”.</p>';return;}
    var html='<div class="grammar-summary"><strong>'+a.length+' issue'+(a.length===1?'':'s')+' found</strong><span>Red = likely error · Amber = review warning</span></div><ol class="grammar-issues">';
    a.forEach(function(x,i){html+='<li class="grammar-issue grammar-issue--'+x.severity+'"><button type="button" class="grammar-issue__jump" data-jump="'+i+'"><span class="grammar-issue__type">'+esc(x.type)+'</span><span class="grammar-issue__text">'+esc(t.slice(x.start,x.end))+'</span><span class="grammar-issue__message">'+esc(x.message)+'</span><span class="grammar-issue__suggestion">Suggestion: '+esc(x.suggestion)+'</span></button></li>';});
    html+='</ol>';out.innerHTML=html;
    out.querySelectorAll("[data-jump]").forEach(function(btn){btn.addEventListener("click",function(){var i=Number(btn.getAttribute("data-jump")),x=a[i];input.focus();input.setSelectionRange(x.start,x.end);var before=t.slice(0,x.start).split("\n").length-1;input.scrollTop=Math.max(0,before*24-80);sync();});});
  }
  function run(){var t=input.value||"",a=scan(t);render(t,a);}
  if(check)check.addEventListener("click",run);
  if(clear)clear.addEventListener("click",function(){input.value="";render("",[]);input.focus();});
  if(copy)copy.addEventListener("click",function(){if(navigator.clipboard){navigator.clipboard.writeText(input.value||"").then(function(){copy.textContent="Copied";setTimeout(function(){copy.textContent="Copy current text";},1200);});}});
  input.addEventListener("input",function(){renderHighlights(input.value||[],[]);sync();});
  input.addEventListener("scroll",sync);
  renderHighlights("",[]);
})();
