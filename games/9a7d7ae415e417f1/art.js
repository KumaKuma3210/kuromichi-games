/* Original vector artwork. All shapes, characters and effects are drawn locally. */
(() => {
  'use strict';
  const INK = '#29352e', PAPER = '#fcf0d3', GOLD = '#d5aa4d';
  const palettes = [
    {armor:'#507568', light:'#759180', dark:'#334f47', crest:'岩', accent:'#c4a058'},
    {armor:'#565681', light:'#8885a1', dark:'#373952', crest:'刃', accent:'#d4bd82'},
    {armor:'#c4a16d', light:'#e5c79b', dark:'#79745d', crest:'紙', accent:'#fcf1d5'},
    {armor:'#bd4934', light:'#d66c48', dark:'#783c2c', crest:'殿', accent:'#e4b64e'}
  ];
  const clamp = (v, a=0, b=1) => Math.max(a,Math.min(b,v));
  const ease = t => 1-Math.pow(1-clamp(t),3);
  const hash = n => {const k=Math.sin(n*127.1+311.7)*43758.5453;return k-Math.floor(k);};
  function handSVG(n) {
    const shapes = [
      '<path d="M16 31V18q0-7 6-7q4 0 5 4q1-8 7-7q5 0 5 6q2-5 7-3q4 1 4 8q8-3 8 6v16q0 14-14 16H28q-12-3-14-13L9 33q-2-6 3-7q5-1 9 9l12 2q6-1 5-6q-2-4-8-3l-5 1"/><path d="M27 16v12m12-13v11m11-7v9M27 44h15" fill="none"/>',
      '<path d="M21 32L13 10q-2-6 3-8q6-2 8 5l9 22L40 6q2-7 8-4q5 2 3 8l-7 24q10-5 14 1q4 5-1 13q-4 10-17 12H30q-14-3-16-15L9 36q-3-6 2-9q5-2 10 5Z"/><path d="M23 34l10 7q6 4 9-1q2-5-4-8l-5-3M43 47l7-7" fill="none"/>',
      '<path d="M18 34L13 14q-1-6 4-7q5-1 6 6l4 15L25 7q0-6 5-6q5 0 5 6l1 20l3-20q1-6 6-5q5 1 4 7l-3 20l5-14q2-5 6-3q5 1 3 7l-6 26q-3 14-18 15q-13 0-20-11L6 37q-4-5 0-8q4-4 8 1l9 11"/><path d="M28 39q11-6 19 0m-15 8q7-3 12-1" fill="none"/>'
    ];
    return '<svg viewBox="0 0 66 66" fill="#e5ba68" stroke="#30352c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+shapes[n]+'</svg>';
  }
  window.SengokuArt = Object.freeze({handSVG});

  class Battlefield {
    constructor(canvas) {
      this.canvas=canvas; this.c=canvas.getContext('2d',{alpha:false}); this.w=432;this.h=450;
      this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.resize=()=>{
        const r=canvas.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2);
        canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));
        this.scale=canvas.width/432; this.h=canvas.height/this.scale;
      };
      this.observer=new ResizeObserver(this.resize);this.observer.observe(canvas);this.resize();
    }
    path(points,fill,stroke=INK,lw=2) {
      const c=this.c;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke();}
    }
    line(points,color=INK,lw=2) {const c=this.c;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';c.stroke();}
    oval(x,y,rx,ry,fill,stroke=null,lw=2) {const c=this.c;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
    rect(x,y,w,h,color){this.c.fillStyle=color;this.c.fillRect(x,y,w,h);}
    text(t,x,y,size,color=INK,weight='700',family='"Yu Mincho",serif'){const c=this.c;c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font=weight+' '+size+'px '+family;c.fillText(t,x,y);}
    draw(s) {
      const c=this.c,h=this.h,t=s.time||0,title=s.screen==='title',result=s.screen==='result';
      c.setTransform(this.scale,0,0,this.scale,0,0);c.clearRect(0,0,432,h);
      this.background(h,t,title||result,s.enemyIndex||0);
      let shake=0;const v=s.visual||{},e=v.elapsed||0;
      if(!this.reduced&&v.kind==='order'&&e>1.3&&e<1.49)shake=Math.sin(e*100)*2*(1-(e-1.3)/.19);
      c.save();c.translate(shake,0);
      const pos=title||result?{py:h*.79,ey:h*.72,px:113,ex:320}:{py:h*.77,ey:h*.29,px:100,ex:320};
      if(title||result){
        this.banner(39,h*.69-42,3,t,1.05);this.banner(389,h*.65-45,s.enemyIndex||0,t+.6,.9);
        this.army(3,70,Math.min(h*.9,h-69),t,1,null,0,5);
        if(!result||!s.won)this.army(s.enemyIndex||0,276,Math.min(h*.85,h-69),t,-1,null,1,s.enemyHP??2);
        this.general(pos.px,pos.py,3,1.28,t,result?(s.won?'happy':'sad'):'stern',1);
        if(!result)this.general(pos.ex,pos.ey,0,1.03,t+.5,'stern',-1);
        if(title&&h>560){this.speech('押せば、なんとかなる。',133,pos.py-92,144);this.speech('…本気か？',318,pos.ey-80,98);}
        if(result&&s.won){this.floatingFan(330,h*.78,t);this.particles(0,Math.max(0,t%3.2),true,Math.max(280,h*.6),38);}
        if(result&&!s.won){this.speech('次は、理屈でいこう。',255,h*.76,166);}
      } else {
        this.banner(33,pos.py-34,3,t,.85);this.banner(391,pos.ey-21,s.enemyIndex,t+.7,.86);
        this.army(s.enemyIndex,269,pos.ey+54,t,-1,v,1,s.enemyHP);
        this.army(3,48,Math.min(pos.py+34,h-69),t,1,v,0,s.playerHP);
        const normal=v.kind==='normal',attack=normal?Math.sin(clamp(e/.85)*Math.PI)*35:0;
        let enemyX=pos.ex-attack*.45,playerX=pos.px+attack;
        let enemyY=pos.ey,playerY=pos.py;
        if(v.kind==='janken'){
          const wind=e<.69?Math.sin((e% .345)/.345*Math.PI):0;
          playerX-=8;enemyX+=8;
          if(!this.reduced){playerY-=wind*7;enemyY-=wind*7;}
        }
        if(v.kind==='order'&&v.success&&e>1.25){const q=clamp((e-1.25)/.9);enemyX+=q*95;enemyY-=Math.sin(q*Math.PI)*60;}
        if(v.kind==='normal'&&v.outcome==='win'&&e>.5)enemyX+=ease((e-.5)/.45)*27;
        if(v.kind==='normal'&&v.outcome==='tie'){enemyX-=attack*.2;playerX-=attack*.2;}
        if(!(v.kind==='order'&&v.hand===2&&v.success&&e>1.28))this.general(enemyX,enemyY,s.enemyIndex,.86,t+.3,v.kind==='order'&&v.success&&e>1.2?'shock':'stern',-1);
        this.general(playerX,playerY,3,v.kind==='janken'?1.04:.97,t,v.kind==='janken'&&v.released?'shout':v.kind==='order'?(e>1.4?(v.success?'happy':'sad'):'shout'):'stern',1);
        if(s.force){this.aura(pos.px,pos.py,t);}
        if(s.phase==='choose'){
          this.text('自 軍',89,pos.py+52,10,'#8d4e39');
          this.text('敵 軍',321,pos.ey+49,10,'#506d5a');
          this.dust(209,h*.57,t*.35,.3);
        }
        if(v.kind==='normal')this.normalEffect(v,h);
        if(v.kind==='janken')this.jankenEffect(v,h);
        if(v.kind==='order')this.orderEffect(v,h,t);
        if(s.phase==='transition'){
          this.ribbon('次の武将、出陣！',h*.48);
        }
        if(s.phase==='intro')this.ribbon('いざ、合戦！',h*.49);
      }
      c.restore();
      // Restrained paper fibres, fixed geometry: never consume gameplay randomness.
      c.globalAlpha=.065;for(let i=0;i<36;i++){const x=hash(i+200)*432,y=hash(i+950)*h;this.line([[x,y],[x+5+hash(i)*7,y+.7]],'#897047',.6);}c.globalAlpha=1;
    }
    background(h,t,title,enemy) {
      const c=this.c;c.fillStyle='#f3e8cb';c.fillRect(0,0,432,h);
      const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#f9efd8');sky.addColorStop(.65,'#efe1b8');sky.addColorStop(1,'#d8cf9f');c.fillStyle=sky;c.fillRect(0,0,432,h);
      this.oval(title?320:310,title?h*.26:h*.18,title?82:62,title?82:62,'#d1ad5d33');
      const horizon=title?h*.65:h*.47;
      this.path([[-20,horizon],[40,horizon-83],[98,horizon-41],[169,horizon-106],[227,horizon-49],[301,horizon-88],[390,horizon-38],[462,horizon-72],[455,h],[-20,h]],'#c7caa84d',null);
      this.path([[-20,horizon+13],[64,horizon-33],[123,horizon-11],[196,horizon-64],[237,horizon-35],[335,horizon-42],[465,horizon+10],[450,h],[-20,h]],'#a7b29455',null);
      this.castle(title?370:87,horizon-35,title?.65:.62);
      this.path([[-10,horizon+8],[70,horizon+17],[205,horizon-2],[335,horizon+16],[449,horizon+4],[450,h],[-10,h]],'#d8cfab',null);
      this.path([[-10,horizon+73],[103,horizon+26],[229,horizon+51],[440,horizon+14],[448,h],[-9,h]],'#e1d5af',null);
      this.path([[205,horizon],[241,horizon],[381,h],[144,h]],'#eee2bc9c',null);
      for(let i=0;i<21;i++){const x=hash(i+100)*432,y=horizon+hash(i+10)*(h-horizon);this.line([[x,y],[x+10+hash(i)*15,y-1]],'#b1ad8460',1);}
      // Wind trails pass slowly over distant mountains.
      for(let i=0;i<3;i++){const x=((t*(this.reduced?0:7)+i*166)%570)-80,y=horizon-62+i*23;this.line([[x,y],[x+31,y],[x+39,y-3]],'#fff4dd88',2);}
      this.grass(19,horizon+44);this.grass(410,horizon+82);this.grass(191,h-9);
    }
    castle(x,y,s){const c=this.c;c.save();c.translate(x,y);c.scale(s,s);this.path([[-29,22],[-24,-9],[24,-9],[31,22]],'#949d8466',null);this.rect(-22,-31,44,26,'#e6ddbd');this.rect(-14,-53,28,23,'#ded9b9');this.path([[-33,-27],[-7,-43],[9,-43],[33,-27]],'#697b6888',null);this.path([[-25,-50],[0,-68],[25,-50]],'#697b6888',null);this.rect(-4,-45,8,10,'#697b6888');this.rect(-4,-18,8,13,'#697b6888');this.line([[0,-68],[0,-80]],'#697b6888',2);c.restore();}
    grass(x,y){this.line([[x-7,y],[x-3,y-5],[x,y],[x+3,y-7],[x+4,y],[x+10,y-2]],'#9c9d79',1);}
    banner(x,y,id,t,s=1){const p=palettes[id]||palettes[0],c=this.c;c.save();c.translate(x,y);c.scale(s,s);const wind=Math.sin(t*2+x)*3;this.line([[0,65],[0,-58]],INK,2.5);this.path([[2,-55],[29,-53+wind],[28,6+wind],[16,1],[2,6]],p.armor,INK,1.5);this.line([[5,-49],[24,-47+wind]],p.accent,2);this.oval(15,-21,9,9,p.accent);this.text(p.crest,15,-20,12,p.dark);this.line([[5,0],[25,0+wind]],p.accent,2);c.restore();}
    general(x,y,id,s,t,emotion='stern',direction=1){
      const c=this.c,p=palettes[id]||palettes[0],b=this.reduced?0:Math.sin(t*3.1+id)*1.25;
      c.save();c.translate(x,y);c.scale(s,s);this.oval(0,31,35,8,'#5f604e25');c.translate(0,b);
      // Tiny feet and oversized layered armour.
      this.line([[-14,21],[-19,32],[-29,32]],p.dark,8);this.line([[14,21],[20,32],[29,32]],p.dark,8);
      this.path([[-25,-3],[25,-3],[31,24],[12,28],[0,21],[-12,28],[-31,24]],p.armor,INK,2.5);
      for(let i=0;i<3;i++)this.line([[-25,5+i*7],[25,5+i*7]],p.dark,1.8);
      this.line([[-9,0],[-12,23]],p.accent,2);this.line([[9,0],[12,23]],p.accent,2);
      this.rect(-23,-3,46,7,p.accent);this.oval(0,1,5,5,p.dark,INK,1);
      this.path([[-22,-7],[-37,-9],[-44,5],[-30,12],[-22,5]],p.armor,INK,2.5);
      this.path([[22,-7],[37,-9],[43,5],[30,12],[22,5]],p.armor,INK,2.5);
      this.line([[-36,-4],[-29,0]],p.accent,2);this.line([[30,0],[37,-4]],p.accent,2);
      this.oval(-36,9,7,7,'#ebbc86',INK,2);this.oval(36,9,7,7,'#ebbc86',INK,2);
      // Folded fan for the player's ridiculous orders, weapon for rivals.
      if(id===3){c.save();c.translate(39,6);c.rotate(emotion==='shout'?-.55:-.15);this.line([[0,6],[8,-24]],INK,3);this.path([[5,-8],[-8,-27],[4,-36],[18,-34],[24,-24]],PAPER,INK,1.8);this.oval(8,-25,6,6,'#ba4935');c.restore();}
      else if(id===1){this.line([[-40,5],[-53,-25]],'#d5d6bb',4);this.line([[-42,-1],[-33,-5]],GOLD,3);}
      else if(id===2){this.path([[31,6],[16,-18],[32,-30],[48,-21],[43,7]],PAPER,INK,2);this.line([[28,-18],[39,-21]],'#b09362',2);}
      else{this.oval(-39,4,12,11,'#829087',INK,2);}
      // Big round face, cheeks, side guards.
      this.oval(0,-28,30,29,'#f3c994',INK,2.5);this.oval(-20,-21,5,3,'#d8815c55');this.oval(20,-21,5,3,'#d8815c55');
      if(emotion==='shock'){this.oval(-11,-28,4,5,PAPER,INK,1.5);this.oval(12,-28,4,5,PAPER,INK,1.5);this.oval(0,-14,5,7,'#60372c');this.line([[27,-46],[34,-52]],'#a84a31',2);}
      else if(emotion==='sad'){this.line([[-16,-26],[-10,-29],[-5,-26]],INK,2);this.line([[5,-26],[11,-29],[16,-26]],INK,2);this.line([[-5,-12],[0,-15],[6,-12]],INK,2);this.oval(21,-18,2,5,'#89b5ab');}
      else if(emotion==='happy'){this.line([[-16,-27],[-11,-32],[-6,-27]],INK,2.5);this.line([[6,-27],[11,-32],[16,-27]],INK,2.5);this.path([[-9,-18],[9,-18],[4,-9],[-4,-9]],'#863d2b',INK,1.5);}
      else{this.oval(-11,-27,2.5,3.2,INK);this.oval(11,-27,2.5,3.2,INK);this.line([[-17,-36],[-6,-32]],INK,3);this.line([[6,-32],[17,-36]],INK,3);if(emotion==='shout')this.oval(0,-15,7,6,'#68372a',INK,1);else this.line([[-5,-13],[6,-13]],INK,2);}
      // Helmet silhouette changes for each rival.
      this.path([[-31,-28],[-36,-17],[-29,-7],[-25,-23]],p.dark,INK,2);this.path([[31,-28],[36,-17],[29,-7],[25,-23]],p.dark,INK,2);
      c.beginPath();c.moveTo(-32,-35);c.bezierCurveTo(-30,-75,28,-77,32,-35);c.closePath();c.fillStyle=p.dark;c.fill();c.strokeStyle=INK;c.lineWidth=2.5;c.stroke();
      this.path([[-37,-36],[-23,-45],[22,-45],[37,-36],[27,-30],[-27,-30]],p.armor,INK,2.5);
      this.line([[-24,-37],[24,-37]],p.accent,3);
      if(id===0){this.path([[-5,-48],[-24,-70],[-26,-84],[-14,-69],[0,-61],[14,-69],[27,-85],[24,-68],[5,-48]],p.accent,INK,2);this.oval(0,-52,6,6,p.accent,INK,1.5);}
      if(id===1){this.path([[0,-48],[-26,-71],[-30,-92],[-18,-78],[0,-59],[20,-78],[30,-92],[25,-69]],p.accent,INK,2);this.path([[-4,-55],[0,-69],[5,-55],[0,-46]],'#f4e5b9',INK,1.5);}
      if(id===2){this.path([[-22,-57],[-32,-73],[-22,-91],[-5,-81],[3,-96],[14,-82],[29,-85],[34,-66],[17,-55]],PAPER,INK,2);for(let i=0;i<4;i++)this.line([[1,-55],[-23+i*16,-80]],'#b39760',1.5);this.oval(0,-57,6,6,GOLD,INK,1.5);}
      if(id===3){this.path([[-5,-45],[-26,-61],[-31,-85],[-15,-68],[0,-61],[15,-68],[31,-85],[26,-60],[5,-45]],GOLD,INK,2.2);this.oval(0,-52,6,6,'#f7d77c',INK,1.5);}
      c.restore();
    }
    soldier(x,y,id,t,index,direction=1,flight=0,retreat=false){
      const c=this.c,p=palettes[id]||palettes[0],b=this.reduced?0:Math.sin(t*6+index)*1.5;
      c.save();c.translate(x,y+b);if(flight)c.rotate(flight*direction);c.scale(direction,1);
      this.oval(0,16,11,3,'#65704c20');this.line([[-4,9],[-5+Math.sin(t*9+index)*2,17]],p.dark,3);this.line([[4,9],[5-Math.sin(t*9+index)*2,17]],p.dark,3);
      this.path([[-7,-3],[7,-3],[9,11],[-9,11]],p.armor,INK,1.1);this.line([[-6,3],[6,3]],p.accent,1.2);this.line([[-6,7],[6,7]],p.dark,1);
      this.line([[6,1],[11,-3],[17,-30]],'#656249',1.3);this.path([[15,-28],[19,-34],[19,-27]],'#d9d4b9',INK,.8);
      this.oval(0,-9,8,8,'#e5be85',INK,1.1);this.oval(-3,-8,1,1.2,INK);this.oval(3,-8,1,1.2,INK);if(retreat)this.oval(0,-4,2,2,'#7b4930');
      this.path([[-11,-12],[-7,-20],[6,-20],[11,-12]],p.dark,INK,1.2);this.line([[-6,-14],[6,-14]],p.accent,1.5);this.rect(-1,-23,2,6,p.accent);c.restore();
    }
    army(id,x,y,t,dir,v,team,hp=2){
      const n=team?Math.max(3,(hp||0)*4+3):Math.max(3,(hp||0)*2+3),e=v?.elapsed||0;
      for(let i=0;i<n;i++){
        let sx=x+(i%5)*21,sy=y+Math.floor(i/5)*24,rot=0,escape=false;
        if(v?.kind==='normal'){
          const p=clamp(e/1.08);sx+=dir*Math.sin(p*Math.PI)*(team?15:37);
          if(team&&v.outcome==='win'&&e>.5){const q=clamp((e-.5)/.75);sx+=q*(36+i*2);sy-=Math.sin(q*Math.PI)*21;escape=true;}
          if(!team&&v.outcome==='lose')sx-=clamp(e)*8;
        }
        if(v?.kind==='order'){
          if(team&&v.success&&v.hand===2&&e>1.28)continue;
          if(team&&v.success&&v.hand!==2&&e>1.22){const p=clamp((e-1.22)/1.07);sx+=p*(185+hash(i)*80);sy-=Math.sin(p*Math.PI)*95;rot=p*(3+hash(i)*7);escape=true;}
          if(!team&&!v.success&&e>1.35){const p=clamp((e-1.35)/1.2);sx-=p*(27+hash(i)*40);sy+=Math.sin(p*Math.PI)*9;escape=true;}
          if(!team&&v.success)sx+=clamp((e-1.5)/1.3)*37;
        }
        this.soldier(sx,sy,id,t,i,escape?-dir:dir,rot,escape);
      }
    }
    speech(t,x,y,w){const c=this.c;this.path([[x-w/2,y-15],[x+w/2,y-15],[x+w/2,y+13],[x+14,y+13],[x+8,y+20],[x+5,y+13],[x-w/2,y+13]],'#fcf4df', '#9a8967',1.2);this.text(t,x,y,10.5,'#4a493a','700','"Yu Gothic",sans-serif');}
    ribbon(t,y){this.path([[77,y-26],[349,y-26],[337,y],[351,y+27],[84,y+27],[93,y]],'#f8efd8ec','#aa8e57',1);this.text(t,216,y,28,INK,'900');}
    aura(x,y,t){const c=this.c;c.save();c.globalAlpha=.3;for(let i=0;i<5;i++){const xx=x-40+i*19,yy=y-15-Math.sin(t*3+i)*9;this.line([[xx,yy+33],[xx-4,yy+18],[xx+2,yy]],'#bd8a28',2);}c.restore();}
    dust(x,y,t,power=1){const c=this.c;c.save();c.globalAlpha=.24*power;for(let i=0;i<7;i++){const p=(t*.8+i*.137)%1;this.oval(x+(i-3)*12+p*15,y-p*17,5+p*9,3+p*5,'#b39b68');}c.restore();}
    rock(x,y,r,angle=0){const c=this.c;c.save();c.translate(x,y);c.rotate(angle);this.path([[-r*.94,-r*.3],[-r*.65,-r*.85],[r*.05,-r],[r*.78,-r*.56],[r,.16*r],[r*.5,r*.84],[-r*.38,r],[-r*.93,r*.4]],'#7d8a7c',INK,3);this.path([[-r*.65,-r*.8],[-r*.12,-r*.77],[r*.38,-r*.31],[-r*.1,r*.12],[-r*.83,-r*.04]],'#abb29a',null);this.line([[r*.19,-r*.67],[-r*.03,-r*.28],[r*.23,-r*.04],[r*.09,r*.32]],'#586d60',2.5);this.line([[-r*.62,r*.35],[-r*.37,r*.61],[r*.1,r*.55]],'#566e61',3);c.restore();}
    paperWall(x,y,t){const c=this.c;c.save();c.translate(x,y);const wave=Math.sin(t*3)*3;this.path([[-43,-70],[-16,-65],[15,-74],[42,-65],[44,49],[14,57],[-14,49],[-44,55]],'#fbf1cd',INK,2);for(let i=0;i<3;i++){this.line([[-40+i*28,-65],[-39+i*28,50]],'#c0aa75',1.5);this.text('囲',-27+i*27,-12+wave,19,'#6a785f','900');}c.restore();}
    slash(x,y,angle,p,broken=false){const c=this.c;c.save();c.translate(x,y);c.rotate(angle);const len=150*Math.max(.06,p);this.path([[-len*.5,7],[len*.64,-4],[len*.75,-19],[-len*.52,-3]],PAPER,INK,2.5);this.line([[-len*.45,4],[len*.63,-7]],'#b9cbc0',3);this.rect(-len*.62,-8,14,22,GOLD);this.rect(-len*.9,-5,len*.29,14,'#784e3d');if(broken){this.line([[len*.05,-14],[len*.11,-5],[len*.02,4],[len*.09,15]],'#b9422d',3);}c.restore();}
    brokenBlade(x,y,angle,tip=false){const c=this.c;c.save();c.translate(x,y);c.rotate(angle);if(tip){this.path([[-22,3],[-17,-3],[-24,-7],[54,-17],[43,-3]],PAPER,INK,2.2);this.line([[-13,0],[42,-6]],'#b9cbc0',2);}else{this.rect(-67,-4,39,12,'#784e3d');this.rect(-33,-8,12,20,GOLD);this.path([[-23,-3],[18,-7],[11,-1],[21,2],[13,8],[-23,7]],PAPER,INK,2);this.line([[-18,3],[8,1]],'#b9cbc0',2);}c.restore();}
    particles(type,p,success,cy,count=26){const c=this.c;c.save();const q=clamp(p/1.1);c.globalAlpha=1-q;for(let i=0;i<count;i++){const a=hash(i+32)*Math.PI*2,dist=q*(50+hash(i+64)*170);const x=246+Math.cos(a)*dist,y=cy+Math.sin(a)*dist*.7+q*q*66;const size=2+hash(i)*5;c.save();c.translate(x,y);c.rotate(q*8+i);if(type===0||type===2)this.rect(-size,-2,size*2,4,i%3===0?GOLD:PAPER);else this.path([[-size,-size],[size,0],[0,size]],i%3?'#9b9d88':'#e4d9ae',null);c.restore();}c.restore();}
    normalEffect(v,h){
      const e=v.elapsed,p=clamp((e-.28)/.45),cy=h*.56,advance=ease((e-.06)/.48);
      if(e<.83){
        for(let i=0;i<3;i++){
          const ownX=119+(81-i*15)*advance+i*14,ownY=h*.78-(h*.22)*advance+i*12;
          const retreat=v.outcome==='win'?clamp((e-.46)/.33):0;
          const enemyX=303-(67+i*9)*advance+i*11+retreat*63,enemyY=h*.35+h*.2*advance+i*9-Math.sin(retreat*Math.PI)*29;
          this.soldier(ownX,ownY,3,e*2,i,1,0,false);
          this.soldier(enemyX,enemyY,v.enemyIndex||0,e*2,i+4,-1,retreat*3,retreat>0);
        }
      }
      if(p>0&&p<1){const c=this.c;c.save();c.globalAlpha=Math.sin(p*Math.PI)*.7;for(let i=0;i<5;i++){const a=i*Math.PI*.4;this.line([[216+Math.cos(a)*13,cy+Math.sin(a)*13],[216+Math.cos(a)*(24+25*p),cy+Math.sin(a)*(24+25*p)]],GOLD,3);}c.restore();}this.dust(189,h*.68,e,1);
    }
    jankenEffect(v,h){
      const c=this.c,e=v.elapsed,cy=h*.49;
      // A narrow ink frame and restrained radial lines concentrate attention on the two hands.
      c.save();
      const shade=c.createLinearGradient(0,0,432,0);shade.addColorStop(0,'#29352e36');shade.addColorStop(.25,'#29352e00');shade.addColorStop(.75,'#29352e00');shade.addColorStop(1,'#29352e36');
      this.rect(0,0,432,h,shade);
      this.path([[0,0],[432,0],[432,7],[342,11],[210,5],[98,10],[0,6]],INK,null);
      this.path([[0,h],[432,h],[432,h-7],[315,h-10],[130,h-4],[0,h-10]],INK,null);
      if(e<.69){this.dust(85,h*.84,e*2,.6);this.dust(329,h*.33,e*2,.6);}
      if(v.released){
        const p=clamp((e-.94)/.29);c.globalAlpha=(1-p)*.72;
        for(let i=0;i<14;i++){
          const a=i*Math.PI*2/14+.11,r=96+(this.reduced?0:p*32),length=28+hash(i)*33;
          this.line([[216+Math.cos(a)*r,cy+Math.sin(a)*r*.7],[216+Math.cos(a)*(r+length),cy+Math.sin(a)*(r+length)*.7]],i%3===0?GOLD:INK,i%3===0?4:2);
        }
        c.globalAlpha=(1-p)*.5;this.oval(216,cy,37+p*43,25+p*29,null,GOLD,3);
      }
      c.restore();
    }
    orderEffect(v,h,t){
      const e=v.elapsed,id=v.hand,yes=v.success,c=this.c,cy=h*.48,charge=clamp(e/.48),move=ease((e-.73)/.63),impact=clamp((e-1.22)/.85);
      // Charge, brief hold, violent travel, then the consequences remain on the field.
      if(e<.75){const q=this.reduced?0:Math.sin(e*30)*2;this.dust(104,h*.75,e*2,1.8);c.save();c.globalAlpha=.5;for(let i=0;i<5;i++){const a=-1.3+i*.45;this.line([[111+Math.cos(a)*55+q,cy+70+Math.sin(a)*55],[111+Math.cos(a)*78,cy+70+Math.sin(a)*78]],'#ae742d',2);}c.restore();}
      if(id===0){
        if(e<1.25)this.paperWall(286,cy,t);
        if(e>=1.25&&!yes)this.paperWall(286,cy,t);
        const x=e<.74?48+charge*14:62+move*(yes?355:157);
        const y=cy+36-Math.sin(move*Math.PI)*14;
        if(e<1.95)this.rock(yes?x:Math.min(x,219),y,48+charge*9,move*7+(e<.72?e*.3:0));
        if(yes&&e>1.18)this.particles(0,e-1.18,true,cy,33);
        if(!yes&&e>1.3){this.line([[195,cy-63],[205,cy-80]],'#934e35',3);this.line([[227,cy-68],[235,cy-85]],'#934e35',3);this.dust(229,cy+64,e*3,1.7);}
        if(e>.8&&e<1.35){for(let i=0;i<4;i++)this.line([[x-88-i*6,y-29+i*19],[x-67,y-30+i*19]],'#967954',2);}
      } else if(id===1){
        if(yes&&e>1.26){const q=ease((e-1.26)/.55);c.save();c.beginPath();c.rect(120-q*50,cy-74,120,155);c.clip();this.rock(251-q*50,cy,57,-q*.4);c.restore();c.save();c.beginPath();c.rect(242+q*50,cy-74,135,155);c.clip();this.rock(247+q*50,cy,57,q*.4);c.restore();}
        else this.rock(251,cy,57);
        if(e<1.7&&(yes||e<=1.29)){const x=93+move*133;const size=.55+.5*charge;this.slash(x,cy-22,-.6+move*.2,size);this.slash(x+12,cy+25,.6-move*.2,size);}
        if(yes&&e>1.16&&e<1.55){c.save();c.globalAlpha=1-clamp((e-1.16)/.39);this.path([[137,cy+107],[264,cy-67],[320,cy-109],[198,cy+91]],'#ffedb6',null);this.line([[174,cy+100],[292,cy-99]],'#fffbed',5);c.restore();}
        if(!yes&&e>1.29){const q=clamp((e-1.29)/.9);this.brokenBlade(180-q*22,cy-24+q*22,-.4-q*.15);this.brokenBlade(180-q*22,cy+26+q*15,.4+q*.15);this.brokenBlade(250+q*88,cy-48+q*100,-.3-q*5,true);this.brokenBlade(256+q*99,cy+29+q*93,.3+q*5,true);}
        if(e>1.26)this.particles(1,e-1.26,yes,cy,26);
      } else {
        if(e<1.32){const w=44+move*296,x=96+move*82,yy=cy+35-move*37;this.path([[x-w*.48,yy-33-move*72],[x+w*.55,yy-49-move*55],[x+w*.48,yy+33+move*67],[x-w*.49,yy+47+move*50]],PAPER,INK,2.5);for(let i=0;i<4;i++)this.line([[x-w*.35+i*w*.23,yy-29-move*67],[x-w*.35+i*w*.23,yy+31+move*60]],'#c4b07d',1);this.oval(x,yy,15+move*14,15+move*14,'#c58b4255');this.text('包',x,yy,25+move*22,'#a6683c','900');}
        else if(yes){const q=ease((e-1.32)/1.15),x=251+q*228,y=cy-Math.sin(q*Math.PI)*90; c.save();c.translate(x,y);c.rotate(q*4);this.path([[-43,-40],[15,-49],[49,-14],[43,39],[-14,52],[-49,17]],PAPER,INK,2.5);this.line([[-40,-37],[0,1],[42,37]],'#ad9870',2);this.line([[15,-46],[0,1],[-13,48]],'#ad9870',2);this.path([[-8,-8],[-14,-27],[0,-20],[17,-28],[9,-4]],GOLD,INK,1.5);this.oval(-20,11,10,7,'#e6bb82',INK,1.5);this.oval(18,18,10,7,'#e6bb82',INK,1.5);for(const xx of [-24,-17,14,21])this.oval(xx,xx<0?10:17,1.2,2,INK);this.text('!',27,-17,19,INK,'900');c.restore();}
        else {const q=clamp((e-1.32)/.8);for(let i=0;i<7;i++){c.save();c.translate(110+i*34+(i-3)*q*10,cy-20+q*(75+i*7));c.rotate((i-3)*q*.23);this.path([[-14,-85],[14,-73],[17,82],[-15,94]],PAPER,INK,1.5);c.restore();}if(e<1.65){this.slash(260,cy,-.8,1);this.slash(260,cy,.8,1);}}
        if(e>1.35)this.particles(2,e-1.35,yes,cy,22);
      }
      if(yes&&e>1.32&&e<1.72){c.save();c.globalAlpha=.65*(1-(e-1.32)/.4);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;this.line([[255+Math.cos(a)*68,cy+Math.sin(a)*65],[255+Math.cos(a)*98,cy+Math.sin(a)*93]],'#b78832',2.5);}c.restore();}
    }
    floatingFan(x,y,t){const c=this.c;c.save();c.translate(x,y+Math.sin(t*2)*4);c.rotate(.2);this.path([[-33,5],[-50,-18],[-32,-46],[0,-57],[32,-44],[50,-17],[33,5],[0,25]],PAPER,INK,2);for(let i=0;i<5;i++)this.line([[0,25],[-40+i*20,-30-Math.sin(i*.8)*18]],GOLD,1.5);this.oval(0,-18,13,13,'#b94a34');c.restore();}
  }
  window.Battlefield=Battlefield;
})();
