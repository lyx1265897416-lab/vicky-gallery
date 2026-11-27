"""Deterministic covers: real catalog artwork + the documented skill mechanism.
No generated scenery or fabricated evaluation scores. SVG remains editable.
"""
import base64, html, json, pathlib, re
R=pathlib.Path(__file__).resolve().parents[2]
C=json.loads((R/'content/catalog.json').read_text())
OUT=R/'content/covers/workshop';OUT.mkdir(exist_ok=True)
E=html.escape
INK='#243c37'; MUT='#677972'; ACC='#517969'; PAPER='#f3f0e7'
parts=[]
def text(x,y,s,size=20,color=INK,family='Arial',weight='400',anchor='start',spacing=0):
 parts.append(f'<text x="{x}" y="{y}" fill="{color}" font-family="{family}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" letter-spacing="{spacing}">{E(s)}</text>')
def rect(x,y,w,h,fill='#fffcf6',r=15,stroke='none'):
 parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>')
def line(x,y,xx,yy,color=ACC,width=2,dash=''):
 parts.append(f'<path d="M{x},{y} L{xx},{yy}" fill="none" stroke="{color}" stroke-width="{width}" stroke-dasharray="{dash}"/>')
def arrow(x,y,xx,yy,color=ACC):
 line(x,y,xx,yy,color,2);parts.append(f'<path d="M{xx-5},{yy-8} L{xx},{yy} L{xx+5},{yy-8}" fill="none" stroke="{color}" stroke-width="2"/>')
def dot(x,y,n,fill=ACC):
 parts.append(f'<circle cx="{x}" cy="{y}" r="23" fill="{fill}"/>');text(x,y+7,str(n),18,'#ffffff',anchor='middle')
def tag(x,y,s,fill='#dce6dd',w=170):
 rect(x,y,w,34,fill,17);text(x+w/2,y+23,s,12,INK,anchor='middle',spacing=1)
def asset(id):
 item=next(x for k in ['waku','dramas'] for x in C[k] if x['id']==id);p=R/item['cover']
 if p.suffix=='.svg':return re.findall(r'(?:href|xlink:href)="([^"]+)"',p.read_text())[0]
 return 'data:image/jpeg;base64,'+base64.b64encode(p.read_bytes()).decode()
def photo(id,x,y,w,h):
 uri=asset(id);clip='clip'+str(len(parts));parts.append(f'<defs><clipPath id="{clip}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="15"/></clipPath></defs><image href="{uri}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMin slice" clip-path="url(#{clip})"/>')
def box(x,y,w,h,title,sub='',fill='#ffffff'):
 rect(x,y,w,h,fill,15,'#d1d9d0');text(x+22,y+33,title,22,INK,weight='500');
 if sub:text(x+22,y+61,sub,15,MUT)
def smallrow(y,num,title,sub):
 dot(81,y+22,num);text(122,y+18,title,26);text(122,y+49,sub,17,MUT)
def begin(i,title,subtitle,bg):
 global parts
 parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200"><rect width="800" height="1200" fill="{bg}"/>']
 text(48,56,'VICKY / CREATIVE PRACTICE',14,INK,spacing=3);text(752,56,f'{i+1:02}',16,INK,anchor='end');line(48,80,752,80,'#aebdb1',1)
 yy=143
 for t in title:text(48,yy,t,53,INK,'Georgia');yy+=59
 text(50,yy+3,subtitle,18,MUT)
def end(id,footer):
 line(48,1085,752,1085,'#aebdb1',1);text(48,1121,footer,17,MUT);text(48,1161,id.upper(),12,MUT,spacing=2)
 parts.append('</svg>');(OUT/(id+'-v2.svg')).write_text(''.join(parts))
S=[
('vicky-create',['Vicky Create'],'From a meaningful action to a personal result.','#eef0e6'),
('vicky-drama',['Vicky Drama'],'Choices change behavior, not just dialogue.','#f0e4e1'),
('vicky-video',['Vicky Video'],'Story nodes. Natural performance. Native sound.','#e9ece4'),
('vicky-realtime',['Realtime Direction'],'Your input becomes the next moving scene.','#e6e9ef'),
('vicky-drama-intro',['Story Openings'],'Make the viewer know why it is their turn.','#f1e9d9'),
('vicky-drama-momentum',['Narrative','Momentum'],'Characters act. Choices leave consequences.','#e4ebe2'),
('ai-drama-character-design',['Character Design'],'One identity, across wardrobe and story states.','#e8e6ed'),
('ai-acting-direction',['Acting Direction'],'Turn intention into a visible response.','#eee3df'),
('bianju',['Story Development'],'Desire and cost drive cause and effect.','#ece8dc'),
('daoyan',['Screen Direction'],'Translate the script into executable shots.','#e2e9e8'),
('video-harness',['Video Harness'],'Only reviewed output advances the state.','#e1e8e0'),
('response-agent',['Response Director'],'Understand the whole sentence, not a keyword.','#eee5df'),
('video-pe',['Prompt as Direction'],'Describe the shot, not an aesthetic adjective.','#e7e8ee'),
('creative-qa',['Creative QA'],'Every conclusion needs the right evidence.','#e9eadf'),
('realtime-video-evaluation',['Realtime Video','Evaluation'],'Watch the result. Inspect each generation.','#e3e8eb')]
for i,(id,title,sub,bg) in enumerate(S):
 begin(i,title,sub,bg)
 if i==0:
  rect(258,267,285,490,'#627b6a',30);photo('roomlet',268,279,265,466)
  tag(300,715,'ROOMLET',w=200)
  box(48,320,182,89,'Input','Touch / drag');line(230,365,258,365)
  box(563,428,189,89,'Feedback','Space changes');line(543,472,563,472)
  box(48,570,182,89,'State','Keep choices');line(230,615,258,615)
  arrow(400,770,400,815)
  box(48,833,704,148,'Hook → Action → Feedback','A meaningful state change → a result to keep','#d8e3d6')
  text(70,946,'Visuals + sound + bilingual delivery + QA',18,MUT)
  end(id,'CASE / Roomlet · a touch-driven, changing miniature room')
 elif i==1:
  photo('sunset-island',215,260,370,400);tag(261,612,'SUNSET ISLAND',w=278)
  line(400,660,400,706);line(200,706,600,706);arrow(200,706,200,744);arrow(600,706,600,744)
  box(48,755,326,114,'Choice A','Visible response A','#e2e8dc');box(426,755,326,114,'Choice B','Visible response B','#e7d6d2')
  arrow(211,869,211,915);arrow(589,869,589,915)
  box(48,929,704,97,'Carry the consequence forward','Identity · location · props · knowledge · relationship')
  end(id,'METHOD / choice → performance → changed story state')
 elif i==2:
  photo('sunset-island',48,263,342,405);photo('cat-who-inherited',410,263,342,405)
  tag(70,613,'SUNSET ISLAND',w=298);tag(433,613,'THE CAT WHO INHERITED',w=296)
  text(48,717,'ONE STORY NODE, CONTINUOUS PERFORMANCE',15,ACC,spacing=1)
  for j,t in enumerate(['Receive','Act','React']):
   box(48+j*238,747,220,90,t,'Shot '+str(j+1),'#fffaf0')
  line(48,875,752,875,ACC,3)
  for j in range(64):
   h=[8,18,31,15,40,22,11,26][j%8];line(57+j*10.8,875-h/2,57+j*10.8,875+h/2,ACC,3)
  text(48,937,'Native dialogue + ambience',27);text(48,975,'Reference locks → dynamic review → original-quality player',18,MUT)
  end(id,'BASIS / Sunset Island + The Cat Who Inherited Everything')
 elif i==3:
  box(48,268,704,85,'Viewer input + character + scene state','A choice or free text, with the story so far')
  arrow(400,353,400,386);box(130,395,540,85,'Writer / Director → validated plan','Reply to meaning, stage an action, offer a hook','#d8e2e7')
  arrow(400,480,400,509);text(400,538,'PARALLEL VIDEO GENERATION',15,ACC,anchor='middle',spacing=2)
  line(400,556,400,572);line(218,572,582,572);arrow(218,572,218,600);arrow(582,572,582,600)
  box(48,612,340,103,'Clip 01','Response','#f9f2e5');box(412,612,340,103,'Clip 02','Action + next hook','#e1e8dd')
  line(218,715,218,752);line(582,715,582,752);line(218,752,582,752);arrow(400,752,400,783)
  box(95,794,610,91,'Play both clips continuously','Review the end frame before the next turn')
  arrow(400,885,400,926);tag(205,943,'NEXT TURN / INHERITED STATE',w=390)
  end(id,'CHAIN / input → plan → parallel clips → review → continuation')
 elif i==4:
  photo('meet-again',48,265,704,403);tag(65,616,'PROJECT REFERENCE / MEET ME, AGAIN',w=480)
  for j,(a,b) in enumerate([('Identity','Who am I?'),('Situation','Where am I?'),('Action','What can I do?')]):
   box(48+j*238,700,220,102,a,b)
  box(48,826,704,101,'Why do I care? Why now?','The opening must supply a reason to participate.','#e2dfc8')
  arrow(400,927,400,968);text(400,1018,'Hand the first action to the viewer.',25,anchor='middle',family='Georgia')
  end(id,'CHECK / identity · situation · action · motivation · timing')
 elif i==5:
  line(81,329,81,950,'#8ba38e',3)
  for y,n,a,b in [(330,1,'A character wants something.','Goal + strategy + knowledge boundary'),(470,2,'They take the initiative.','A concrete action, even with little user input'),(610,3,'The viewer can intervene.','Accept, refuse, redirect — each is understood'),(750,4,'Something actually changes.','A promise kept, a revealed fact, a new relationship'),(890,5,'The next turn remembers.','No reset. No repeated misunderstanding.')]:smallrow(y,n,a,b)
  end(id,'ENGINE / goal → action → consequence → inherited state')
 elif i==6:
  photo('meet-again',48,270,405,635)
  tag(66,852,'EXISTING CHARACTER REFERENCE',w=368)
  box(475,300,277,127,'Identity','Face / silhouette','#dbe2e5');text(497,400,'Keep recognizable',16,MUT)
  box(475,465,277,127,'Wardrobe','Cut / material','#e6ddcf');text(497,565,'Change deliberately',16,MUT)
  box(475,630,277,127,'Story state','Expression / action','#e8d9d8');text(497,730,'Track across shots',16,MUT)
  line(453,364,475,364);line(453,529,475,529);line(453,694,475,694)
  text(48,967,'Test identity in motion.',35,family='Georgia');text(48,1005,'Profile · expression · speech · ordinary indoor light',19,MUT)
  end(id,'DELIVERABLE / identity master + look rules + continuity checks')
 elif i==7:
  photo('meet-again',48,267,704,452)
  rect(63,624,393,75,'#fffaf0',10);text(84,654,'Intention is visible in behavior.',20);text(84,684,'Gaze · hands · pause · distance',18,MUT)
  for j,(a,b) in enumerate([('Receive','Notice the stimulus'),('Respond','A small readable change'),('Act','Pursue the objective')]):
   box(48+j*238,758,220,105,a,'','#fffaf0');text(67+j*238,831,b,14,MUT)
  box(48,901,704,106,'Preserve the actual end state','Eyeline, props, body position, light and sound carry forward.','#dfd7cd')
  end(id,'METHOD / stimulus → reception → response → action → aftermath')
 elif i==8:
  box(48,273,330,148,'World','Rules + boundaries','#f9f5e9');text(70,379,'What does a choice cost?',18,MUT)
  box(422,273,330,148,'Character','Desire + weakness','#e2e6d8');text(444,379,'What do they need?',18,MUT)
  line(213,421,213,458);line(587,421,587,458);line(213,458,587,458);arrow(400,458,400,493)
  rect(144,504,512,291,'#fffcf4',5,'#b6b8a7');text(178,550,'THE STORY ENGINE',15,ACC,spacing=2)
  for j,t in enumerate(['Action','Consequence','New decision']):dot(184,594+j*69,j+1);text(230,604+j*69,t,29,family='Georgia')
  arrow(400,795,400,833);box(48,848,704,143,'Episodes → dialogue → revision','Pay off the hook. Preserve established facts.','#dedfcf');text(70,960,'Handoff: decisions, open questions, next draft',18,MUT)
  end(id,'OUTPUT / a causal story and a traceable creative handoff')
 elif i==9:
  photo('sunset-island',48,267,704,352)
  # Framing overlays describe craft without pretending to be new generated shots.
  for x,y,sx,sy in [(75,294,1,1),(725,294,-1,1),(75,592,1,-1),(725,592,-1,-1)]:
   line(x,y,x+sx*38,y,'#f5f4e7',3);line(x,y,x,y+sy*38,'#f5f4e7',3)
  rect(65,554,263,45,'#f9f6ea',5);text(84,584,'SHOT / NARRATIVE PURPOSE',13,spacing=1)
  for j,(a,b) in enumerate([('Frame','What we reveal'),('Blocking','Where bodies move'),('Sound','Who we hear')]):box(48+j*238,656,220,94,a,b)
  rect(48,786,704,226,'#f9f8ef',16)
  dot(133,880,'A');dot(475,880,'B');line(157,880,450,880,ACC,2,'7 6');text(304,850,'EYELINE',13,ACC,anchor='middle',spacing=2)
  parts.append('<path d="M260 976 L300 936 L340 976 Z" fill="#668479"/>');line(300,938,301,893,ACC,2);text(371,970,'Camera + focus + movement',19)
  end(id,'HANDOFF / script → shot plan → assets → model-specific prompt')
 elif i==10:
  for j,(a,b) in enumerate([('01  Interpret','Event + current scene state'),('02  Plan','A proposal, not an accepted result'),('03  Validate','Schema + allowed actions + revision'),('04  Submit / Collect','One execution, recorded evidence'),('05  Review actual output','Inspect what really happened'),('06  Accept end state','Only accepted output moves the story')]):
   y=261+j*125;box(81,y,638,93,a,b,'#f8faf2' if j!=5 else '#d2e0cf')
   if j<5:arrow(400,y+93,400,y+119)
  end(id,'TRACE / session ID · event ID · state revision · actual output')
 elif i==11:
  text(48,292,'EXAMPLE INPUT',14,ACC,spacing=2)
  rect(48,319,704,152,'#fffcf5',18)
  text(78,375,'“No hand-holding.',40,family='Georgia');text(78,425,'You can stay.”',40,family='Georgia')
  line(400,471,400,520);line(220,520,580,520);arrow(220,520,220,554);arrow(580,520,580,554)
  box(48,566,334,126,'Touch: refused','Do not route to touch.','#ead4cc');box(418,566,334,126,'Stay: allowed','Stay and listen.','#d8e4d5')
  arrow(585,692,585,738)
  rect(48,751,704,237,'#29463f',16)
  for j,t in enumerate(['decision: route','action_id: stay_and_listen','evidence: "You can stay."','state_revision: 0']):text(76,797+j*46,t,21,'#f3f4df','Menlo')
  end(id,'INTERPRETATION / negation · permission · conditions · clarification')
 elif i==12:
  photo('sunset-island',48,267,704,302);tag(69,511,'REFERENCE / ACTUAL START STATE',w=440)
  for j,(a,b) in enumerate([('References','Identity / wardrobe / place'),('Performance','Receive → respond → act'),('Camera + sound','Path / focus / dialogue / pauses'),('End + protect','Hands / props / distance / continuity')]):
   y=602+j*100;rect(48,y,704,85,'#faf9f2',10);text(69,y+32,a,22);text(69,y+63,b,18,MUT)
  end(id,'OUTPUT / specific, executable and checkable shot instructions')
 elif i==13:
  for j,(a,b,c,d) in enumerate([('Build','Can it produce an artifact?','STRUCTURE','#f8f6eb'),('Dynamic review','Do performance and cuts work?','PICTURE + SOUND','#e4e9dd'),('Full experience','Do choices lead to outcomes?','INTERACTION','#e8dcd7'),('Real device','Does it work on target hardware?','DEVICE','#dde5e8')]):
   x=48+(j%2)*362;y=271+(j//2)*208;rect(x,y,342,181,d,15);text(x+22,y+32,c,12,ACC,spacing=1);text(x+22,y+89,a,27,family='Georgia');text(x+22,y+137,b,15,MUT)
  text(48,744,'EVIDENCE STATES',14,ACC,spacing=2)
  for j,(t,col) in enumerate([('PASS','#d7e5d1'),('FAIL','#e8c9bd'),('UNVERIFIED','#ece0bc'),('N/A','#dde1df')]):tag(48+j*178,774,t,col,164)
  box(48,855,704,157,'Issue → repair → targeted regression','Version + object + observation + evidence','#fffdf2');text(70,979,'A build pass is not a real-device pass.',22,family='Georgia')
  end(id,'RULE / verified, failed and untested must remain distinguishable')
 elif i==14:
  photo('magnus',48,324,335,380);photo('mii',417,324,335,380)
  tag(65,651,'MAGNUS',w=301);tag(434,651,'MII',w=301)
  text(48,294,'EXISTING REALTIME TEST PROJECTS',14,ACC,spacing=1)
  for j,t in enumerate(['Input intent','Performance','Continuity','Generation wait']):
   x=48+(j%2)*362;y=742+(j//2)*88;rect(x,y,342,70,'#f8f8f0',12);dot(x+35,y+35,j+1);text(x+70,y+43,t,20)
  line(48,956,752,956,ACC,2);text(48,1008,'Input → generated clip → review record',28,family='Georgia')
  end(id,'REVIEW / full playback + per-turn evidence + comparable conditions')
print('Built 15 content-grounded SVG covers')
