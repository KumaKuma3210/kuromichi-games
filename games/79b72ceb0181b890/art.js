/* Original, code-drawn manga artwork. Every visible fist uses its model hand ID. */
(() => {
  'use strict';
  const INK='#27212c',PAPER='#fff4d6',SKIN='#f6b982',LIGHT='#ffdb9e',RED='#f45446',GOLD='#ffd24a';
  const palettes=[['#ee6247','#953949'],['#1c929a','#12566d'],['#a874d3','#55366e'],['#f3b532','#ad533e'],['#ec6d9b','#813458'],['#647fca','#344271']];
  const clamp=t=>Math.max(0,Math.min(1,t));
  class Art {
    constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.w=420;this.h=740;this.time=0;this.trails=[];this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
    resize(width,height){this.w=420;this.h=height/width*420;this.scale=width/420;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(width*dpr);this.canvas.height=Math.round(height*dpr);this.pixel=width*dpr/420;this.trails=[];}
    path(points,fill,stroke=INK,lw=3){const c=this.c;c.beginPath();points(c);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
    ellipse(x,y,rx,ry,fill,stroke=INK,lw=3){this.path(c=>c.ellipse(x,y,rx,ry,0,0,Math.PI*2),fill,stroke,lw);}
    line(x,y,xx,yy,color=INK,lw=3){this.path(c=>{c.moveTo(x,y);c.lineTo(xx,yy);},null,color,lw);}
    text(str,x,y,size=30,color=INK,outline=0,rotate=0){const c=this.c;c.save();c.translate(x,y);c.rotate(rotate);c.textAlign='center';c.textBaseline='middle';c.font=`1000 ${size}px "Arial Black","Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif`;c.lineJoin='round';if(outline){c.strokeStyle=INK;c.lineWidth=outline;c.strokeText(str,0,0);}c.fillStyle=color;c.fillText(str,0,0);c.restore();}
    star(x,y,r,color=GOLD,rotation=0){this.path(c=>{for(let j=0;j<10;j++){const a=j*Math.PI/5-Math.PI/2+rotation,rr=j%2?r*.44:r;j?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();},color,INK,2);}
    burst(x,y,inner,outer,fill=GOLD,rays=15,angle=0){this.path(c=>{for(let i=0;i<rays*2;i++){const a=i*Math.PI/rays+angle,r=i%2?inner:outer*(.85+.15*Math.sin(i*21));i?c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();},fill,INK,3);}
    background(phase,time){
      const c=this.c,h=this.h;const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#ffe6a1');bg.addColorStop(.55,'#fff6dd');bg.addColorStop(1,'#efd59e');c.fillStyle=bg;c.fillRect(0,0,420,h);
      c.fillStyle='#b9763815';for(let y=8;y<h;y+=12)for(let x=8+(y%24?6:0);x<420;x+=12){c.beginPath();c.arc(x,y,1.2,0,7);c.fill();}
      const cy=h*.46;c.save();c.translate(210,cy);c.rotate(-.1);c.strokeStyle='#dba24d25';c.lineWidth=2;for(let r=98;r<300;r+=42){c.beginPath();c.arc(0,0,r,0,7);c.stroke();}c.restore();
      c.fillStyle='#b6846a19';c.beginPath();c.moveTo(0,h-158);c.lineTo(420,h-158);c.lineTo(420,h);c.lineTo(0,h);c.fill();for(let i=-4;i<8;i++)this.line(210+i*24,h-158,210+i*120,h,'#b6846a22',2);
      this.line(0,h-158,420,h-158,'#b6846a2a',2);
      c.save();c.globalAlpha=.13;this.text('阿',51,h*.34,84,'#b64d34',0,-.22);this.text('修',375,h*.54,75,'#b64d34',0,.17);this.text('羅',59,h*.71,72,'#b64d34',0,-.12);c.restore();
      if(phase==='shuffle'){c.save();c.globalAlpha=.36;for(let i=0;i<22;i++){const y=85+((i*63+time*.36)%(h-180)),side=i%2;this.line(side?420:0,y,side?350:70,y-12,'#937964',1+i%3);}c.restore();}
      // Ink panel corners keep the vertical video frame readable.
      this.line(8,64,8,97,INK,3);this.line(8,64,32,64,INK,3);this.line(412,64,412,97,INK,3);this.line(412,64,389,64,INK,3);
    }
    rays(x,y,strength=1,color=INK){const c=this.c;c.save();c.globalAlpha=.6*strength;for(let i=0;i<46;i++){const a=i*Math.PI*2/46,near=130+(i*37%130),far=850;c.beginPath();c.moveTo(x+Math.cos(a)*near,y+Math.sin(a)*near);c.lineTo(x+Math.cos(a-.006)*far,y+Math.sin(a-.006)*far);c.lineTo(x+Math.cos(a+.006)*far,y+Math.sin(a+.006)*far);c.closePath();c.fillStyle=color;c.fill();}c.restore();}
    face(x,y,scale,mood,variant=0){
      const c=this.c;c.save();c.translate(x,y);c.scale(scale,scale);c.lineCap='round';c.lineJoin='round';
      this.ellipse(-57,8,12,19,SKIN);this.ellipse(57,8,12,19,SKIN);
      this.path(c=>{c.moveTo(-51,-29);c.bezierCurveTo(-50,-72,51,-72,53,-27);c.lineTo(52,20);c.bezierCurveTo(47,70,-43,67,-52,21);c.closePath();},LIGHT,INK,4);
      this.path(c=>{c.moveTo(-50,-11);c.quadraticCurveTo(-56,-49,-35,-50);c.lineTo(-31,-65);c.lineTo(-12,-57);c.lineTo(1,-78);c.lineTo(12,-58);c.lineTo(33,-67);c.lineTo(37,-50);c.quadraticCurveTo(58,-47,50,-10);c.lineTo(40,-25);c.lineTo(30,-38);c.quadraticCurveTo(0,-24,-30,-39);c.closePath();},INK,INK,2);
      this.ellipse(0,-80,19,19,INK);this.path(c=>{c.moveTo(-19,-75);c.lineTo(18,-82);c.lineTo(20,-73);c.lineTo(-16,-68);c.closePath();},GOLD,INK,3);
      this.path(c=>{c.moveTo(-12,-29);c.lineTo(0,-11);c.lineTo(12,-29);c.closePath();},RED,null);
      const shock=['shock','hit'].includes(mood),smug=['smug','taunt'].includes(mood),busy=mood==='busy';
      if(shock){
        this.ellipse(-26,1,24,25,PAPER,INK,4);this.ellipse(26,1,24,25,PAPER,INK,4);
        this.ellipse(-22,2,5,6,INK,null);this.ellipse(22,2,5,6,INK,null);
        this.line(-45,-27,-12,-24,INK,6);this.line(12,-24,45,-30,INK,6);
        this.ellipse(0,38,20,19,'#602a37',INK,4);this.ellipse(0,47,12,6,'#fa8a8d',null);
        for(let i=0;i<3;i++){this.line(-51+i*7,23,-46+i*7,34,'#c2745b',2);this.line(34+i*7,23,39+i*7,34,'#c2745b',2);}
      }else{
        const slant=smug?6:busy?-10:-7;
        this.path(c=>{c.moveTo(-45,-6);c.quadraticCurveTo(-28,-18,-10,-6+slant);c.quadraticCurveTo(-22,18,-41,9);c.closePath();},PAPER,INK,3);
        this.path(c=>{c.moveTo(45,-6);c.quadraticCurveTo(28,-18,10,-6+slant);c.quadraticCurveTo(22,18,41,9);c.closePath();},PAPER,INK,3);
        this.ellipse(-23,1,5,8,INK,null);this.ellipse(23,1,5,8,INK,null);
        this.line(-45,-21,-12,-15+(smug?3:8),INK,7);this.line(45,-21,12,-15+(smug?3:8),INK,7);
        this.path(c=>{c.moveTo(-30,29);c.quadraticCurveTo(0,smug?47:44,33,24);c.quadraticCurveTo(21,61,-15,50);c.closePath();},PAPER,INK,3);
        this.line(-20,39,25,38,INK,2);for(let i=-12;i<25;i+=12)this.line(i,37,i+2,47,INK,1.5);
        if(busy){this.path(c=>{c.moveTo(55,-25);c.bezierCurveTo(77,-1,60,13,53,0);c.closePath();},'#9ce0e8',INK,2);this.line(-42,-35,-35,-31,RED,3);this.line(-39,-40,-38,-25,RED,3);}
      }
      this.path(c=>{c.moveTo(1,8);c.lineTo(-4,22);c.lineTo(6,22);},null,'#bc7257',2.5);
      this.ellipse(-39,22,10,5,'#ed926f',null);this.ellipse(39,22,10,5,'#ed926f',null);
      if(variant%3===1){this.path(c=>{c.moveTo(-7,28);c.quadraticCurveTo(-18,19,-25,29);c.quadraticCurveTo(-12,33,-7,28);c.moveTo(7,28);c.quadraticCurveTo(18,19,25,29);c.quadraticCurveTo(12,33,7,28);},INK,null);}
      if(variant%3===2){this.line(-47,-15,-11,-15,'#a91f46',3);this.line(11,-15,47,-15,'#a91f46',3);this.ellipse(0,-37,6,5,GOLD,INK,2);}
      c.restore();
    }
    body(cy,mood,variant,time){
      const c=this.c,[robe,dark]=palettes[variant%palettes.length],sway=(mood==='busy'?9:3)*Math.sin(time*.008);
      this.ellipse(210,cy+174,91,13,'#493c3f20',null);
      this.path(c=>{c.moveTo(170,cy+102);c.lineTo(157,cy+160);c.lineTo(190,cy+165);c.lineTo(214,cy+117);c.lineTo(237,cy+165);c.lineTo(266,cy+157);c.lineTo(247,cy+103);c.closePath();},dark,INK,4);
      this.ellipse(176,cy+164,27,11,INK);this.ellipse(251,cy+164,27,11,INK);
      this.path(c=>{c.moveTo(174,cy+16);c.quadraticCurveTo(141,cy+32,155,cy+98);c.lineTo(145,cy+124);c.quadraticCurveTo(211,cy+141,275,cy+121);c.lineTo(259,cy+92);c.quadraticCurveTo(274,cy+31,246,cy+16);c.closePath();},robe,INK,4);
      this.path(c=>{c.moveTo(179,cy+14);c.lineTo(209,cy+72);c.lineTo(244,cy+16);c.closePath();},SKIN,INK,3);
      this.path(c=>{c.moveTo(162,cy+24);c.lineTo(199,cy+93);c.lineTo(221,cy+87);c.lineTo(178,cy+18);c.closePath();},GOLD,INK,3);
      this.path(c=>{c.moveTo(244,cy+19);c.lineTo(205,cy+85);c.lineTo(221,cy+90);c.lineTo(257,cy+27);c.closePath();},GOLD,INK,3);
      this.path(c=>{c.moveTo(157,cy+94);c.quadraticCurveTo(204,cy+104,265,cy+93);c.lineTo(268,cy+108);c.quadraticCurveTo(206,cy+122,152,cy+108);c.closePath();},INK,INK,3);
      this.path(c=>{c.moveTo(220,cy+104);c.quadraticCurveTo(250,cy+113,287+sway,cy+91);c.lineTo(273+sway,cy+120);c.quadraticCurveTo(250,cy+129,220,cy+110);c.closePath();},dark,INK,3);
      this.ellipse(218,cy+106,13,13,GOLD,INK,3);this.text('掌',218,cy+106,16,INK);
      this.line(166,cy+60,180,cy+82,dark,3);this.line(251,cy+68,239,cy+88,dark,3);
      // Two side faces make the silly, three-faced Asura silhouette unmistakable.
      c.save();c.translate(162,cy-27);c.rotate(-.28);this.face(0,0,.60,mood==='shock'?'shock':'smug',variant+1);c.restore();
      c.save();c.translate(258,cy-27);c.rotate(.28);this.face(0,0,.60,mood==='shock'?'shock':'busy',variant+2);c.restore();
      this.face(210,cy-40,1.02,mood,variant);
      for(let i=0;i<7;i++){const a=Math.PI*.15+i*Math.PI*.7/6;this.ellipse(210+Math.cos(a)*44,cy+10+Math.sin(a)*23,6,6,GOLD,INK,1.7);}
    }
    arm(hand,cy,phase,time,index,total){
      const c=this.c,side=hand.id%2?-1:1,sx=210+side*40,sy=cy+22+(hand.id%3)*9,dx=hand.x-sx,dy=hand.y-sy;
      const curl=(phase==='shuffle'?24:8)*Math.sin(time*.012+hand.id),ex=sx+dx*.46+side*(28+curl),ey=sy+dy*.6+34;
      c.lineJoin='round';c.lineCap='round';
      const armPath=()=>{c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(sx+side*39,sy+11,ex,ey);c.quadraticCurveTo(ex+dx*.23,ey-8,hand.x,hand.y+9);};
      armPath();c.strokeStyle=INK;c.lineWidth=25;c.stroke();armPath();c.strokeStyle=SKIN;c.lineWidth=18;c.stroke();
      this.path(c=>{c.moveTo(sx+2,sy-2);c.quadraticCurveTo(sx+side*40,sy+5,ex,ey-3);c.quadraticCurveTo(ex+dx*.24,ey-13,hand.x,hand.y+6);},null,LIGHT,6);
      this.path(c=>{c.moveTo(ex-5,ey-2);c.quadraticCurveTo(ex,ey+4,ex+6,ey);},null,'#b57462',2);
    }
    fist(x,y,r=33,open=false,ball=false,angle=0){
      const c=this.c;c.save();c.translate(x,y);c.rotate(angle);c.scale(r/33,r/33);c.lineJoin='round';c.lineCap='round';
      this.path(c=>{c.moveTo(-19,18);c.lineTo(-18,39);c.lineTo(18,39);c.lineTo(19,18);c.closePath();},GOLD,INK,3);
      this.line(-15,31,15,31,'#d29837',3);
      if(open){
        this.path(c=>{c.moveTo(-24,14);c.lineTo(-35,-4);c.quadraticCurveTo(-38,-15,-30,-13);c.lineTo(-20,-3);c.lineTo(-25,-31);c.quadraticCurveTo(-25,-44,-17,-39);c.lineTo(-10,-16);c.lineTo(-12,-43);c.quadraticCurveTo(-10,-52,-3,-43);c.lineTo(1,-17);c.lineTo(4,-44);c.quadraticCurveTo(10,-51,14,-40);c.lineTo(13,-15);c.lineTo(19,-35);c.quadraticCurveTo(28,-40,27,-27);c.lineTo(25,8);c.quadraticCurveTo(22,30,0,28);c.quadraticCurveTo(-16,29,-24,14);c.closePath();},LIGHT,INK,3.5);
        this.path(c=>{c.moveTo(-16,4);c.quadraticCurveTo(-1,-5,15,3);c.moveTo(-8,15);c.quadraticCurveTo(0,6,10,13);},null,'#bd7d64',2);
      }else{
        this.path(c=>{c.moveTo(-28,10);c.lineTo(-31,-17);c.quadraticCurveTo(-30,-28,-19,-28);c.quadraticCurveTo(-10,-36,-2,-29);c.quadraticCurveTo(9,-34,17,-27);c.quadraticCurveTo(31,-29,32,-13);c.lineTo(28,13);c.quadraticCurveTo(20,30,-3,29);c.quadraticCurveTo(-23,27,-28,10);c.closePath();},LIGHT,INK,3.5);
        this.path(c=>{c.moveTo(-27,3);c.quadraticCurveTo(0,16,27,2);c.lineTo(26,17);c.quadraticCurveTo(7,35,-17,23);c.closePath();},SKIN,null);
        for(const x of [-17,-4,10])this.path(c=>{c.moveTo(x,-25);c.lineTo(x,-10);c.quadraticCurveTo(x+3,-5,x+8,-9);},null,INK,2);
        this.path(c=>{c.moveTo(-27,0);c.quadraticCurveTo(-13,-6,0,1);c.quadraticCurveTo(9,8,2,15);c.lineTo(-20,16);c.quadraticCurveTo(-30,15,-27,0);c.closePath();},SKIN,INK,3);
        this.line(-16,6,-4,7,LIGHT,3);this.line(15,11,21,9,'#b67860',2);
      }
      if(ball){
        c.save();const glow=c.createRadialGradient(0,-4,2,0,-4,42);glow.addColorStop(0,'#fff9b6');glow.addColorStop(.3,'#ffdc48b0');glow.addColorStop(1,'#ffdc4800');c.fillStyle=glow;c.fillRect(-45,-49,90,90);this.ellipse(0,-4,15,15,GOLD,INK,2.5);this.ellipse(-4,-9,5,4,'#fff',null);c.restore();
        this.star(27,-27,7,'#fffced',.3);this.star(-24,-14,5,'#fffced',0);
      }
      c.restore();
    }
    bubble(str,x,y,width=205){const c=this.c;c.save();c.translate(x,y);c.rotate(-.055);this.path(c=>{c.roundRect(-width/2,-23,width,46,12);},PAPER,INK,3);this.path(c=>{c.moveTo(-17,23);c.lineTo(-9,36);c.lineTo(5,23);},PAPER,INK,3);this.text(str,0,0,21,INK);c.restore();}
    defeat(e,cy){
      const c=this.c,p=clamp(e.t/710);this.rays(210,cy,.9);
      c.save();c.globalAlpha=1-p;this.ellipse(210,cy-30,45+p*260,25+p*170,null,RED,6*(1-p)+1);c.restore();
      if(e.fx===0){
        const s=1.4+Math.sin(Math.min(1,p*3)*Math.PI/2)*2.3;
        c.save();c.translate(210+(1-p)*45,cy+110-p*45);c.rotate(-.13);c.scale(s,s);this.fist(0,0,33,false,false);c.restore();
      }else if(e.fx===1){
        this.path(c=>{c.moveTo(215,-50);c.lineTo(165,cy-55);c.lineTo(217,cy-68);c.lineTo(190,cy+103);c.lineTo(290,cy-101);c.lineTo(235,cy-81);c.lineTo(285,-50);c.closePath();},'#fff783',INK,5);
        this.line(251,14,222,cy-63,'#fff',5);
      }else{
        c.save();c.translate(237,cy+20);c.rotate(-.6+p*.5);this.path(c=>{c.moveTo(-21,45);c.lineTo(-17,154);c.lineTo(15,154);c.lineTo(21,45);c.closePath();},'#cc8849',INK,5);
        this.path(c=>{c.moveTo(-110,-115);c.lineTo(104,-115);c.lineTo(47,62);c.lineTo(-46,62);c.closePath();},PAPER,INK,5);
        for(let i=0;i<9;i++)this.line(-96+i*24,-107,-40+i*10,52,i%2?'#cbbfaa':INK,3);this.text('喝',0,-48,68,RED,1);c.restore();
      }
      const burstScale=.7+Math.min(p*5,1)*.5;
      c.save();c.translate(210,cy-30);c.scale(burstScale,burstScale);this.burst(0,0,70,141,GOLD,17,p*.1);this.burst(0,0,47,95,PAPER,13);c.restore();
      for(let i=0;i<18;i++){const a=i*2.3999,d=35+p*(100+i%4*30),x=210+Math.cos(a)*d,y=cy-30+Math.sin(a)*d+p*p*90;if(i%3===0)this.ellipse(x,y,12+p*18,9+p*13,PAPER,INK,2);else this.star(x,y,7+i%4*2,i%2?RED:GOLD,p*3);}
      if(p>.12){c.save();const fly=clamp((p-.12)/.88),s=(1-fly)*.35+.03;c.translate(210+Math.sin(fly*7)*30,cy-110-fly*90);c.scale(s,s);c.rotate(fly*6);c.translate(-210,0);for(let i=0;i<4;i++){const hand={id:i,x:210+(i%2?105:-105),y:i<2?-80:100};this.arm(hand,0,'shuffle',e.t,i,4);this.fist(hand.x,hand.y,28);}this.body(0,'shock',e.score,e.t);c.restore();}
      this.text(e.fx===2?'スパァン!!':'ドッッカン!!',211,cy+130,39,PAPER,7,-.09);
      if(p>.1)this.text('撃破!!',213,cy-35,78,RED,9,-.1);
    }
    draw(e,time){
      this.time=time;const c=this.c,h=this.h,title=e.phase==='title',phase=e.phase;
      c.setTransform(this.pixel,0,0,this.pixel,0,0);c.lineJoin='round';c.lineCap='round';this.background(phase,time);
      const cy=(120+h-132)/2,variant=e.score||0;
      let hands=title?[{x:70,y:cy-87},{x:350,y:cy-87},{x:53,y:cy+24},{x:367,y:cy+24},{x:85,y:cy+137},{x:335,y:cy+137}].map((p,id)=>({id,...p})):e.positions(h);
      const r=hands.length<=4?37:hands.length<=6?33:30;
      let mood=['pick','reveal','charge'].includes(phase)&&e.correct?'shock':['taunt','punch'].includes(phase)?'taunt':phase==='shuffle'?'busy':'smug';
      c.save();
      if(phase==='impact'&&!this.reduced){const q=1-clamp(e.t/450);c.translate(Math.sin(e.t*.15)*10*q,Math.cos(e.t*.11)*8*q);}
      if(phase==='punch'&&!this.reduced)c.translate(Math.sin(e.t*.12)*6,Math.cos(e.t*.1)*5);
      if(['pick','reveal','charge'].includes(phase)){
        const selected=hands.find(h=>h.id===e.selected),zoom=1.14;c.translate(210-(selected.x*.22+210*.78)*zoom,cy-(selected.y*.22+cy*.78)*zoom);c.scale(zoom,zoom);
      }
      if(phase==='enter'){const p=clamp(e.t/600);c.translate(0,Math.pow(1-p,3)*35);c.globalAlpha=Math.min(1,p*4);}
      if(phase==='windup'){const p=e.t/460;hands=hands.map(hand=>({...hand,x:hand.x+(210-hand.x)*.1*Math.sin(Math.PI*p),y:hand.y+11*Math.sin(Math.PI*p)}));}
      if(phase==='clear'){
        for(let i=0;i<14;i++){const a=i*2.4;this.star(210+Math.cos(a)*(70+e.t*.12),cy+Math.sin(a)*90-e.t*.08,8+i%4,GOLD,e.t*.004);}
        this.text('お見事！',210,cy-10,53,RED,6,-.08);this.text(['拳で解決。','雷、落ちました。','いい音したな。'][e.fx],210,cy+49,20,INK);
      }else if(phase==='impact'){
        this.defeat(e,cy);
      }else{
        if(phase==='shuffle'&&!this.reduced){
          for(let k=0;k<this.trails.length;k+=2){c.save();c.globalAlpha=.04+k*.012;for(const old of this.trails[k])this.fist(old.x,old.y,r);c.restore();}
          if(this.trails.length>5)this.trails.shift();this.trails.push(hands.map(h=>({...h})));
        }else this.trails=[];
        if(phase!=='punch')hands.forEach((hand,i)=>this.arm(hand,cy,phase,time,i,hands.length));
        this.body(cy,mood,variant,time);
        for(const hand of phase==='punch'?[]:hands){
          let open=title&&hand.id===0||phase==='show'&&hand.id===e.ballId||['reveal','charge','taunt','retry'].includes(phase)&&(hand.id===e.selected||hand.id===e.ballId);
          const ball=open&&(title?hand.id===0:hand.id===e.ballId);
          if(phase==='show'&&ball){c.save();c.globalAlpha=.75;this.ellipse(hand.x,hand.y,51,51,null,'#df9b2c',2);c.restore();}
          if(phase==='answer'){c.save();c.globalAlpha=.8;this.ellipse(hand.x,hand.y,Math.max(r,32)+6,Math.max(r,32)+6,null,'#fffdf2',3);c.restore();}
          this.fist(hand.x,hand.y,r,open,ball,phase==='shuffle'?Math.sin(time*.015+hand.id)*.15:0);
        }
        if(phase==='show'){
          const b=hands.find(hand=>hand.id===e.ballId);this.text('ココ！',b.x,Math.max(96,b.y-67),24,RED,4,-.08);
        }
        if(phase==='shuffle'){this.text('シュシュシュッ',210,Math.max(89,cy-151),26,INK,0,-.09);}
        if(phase==='settle')this.text('ピタッ',210,cy-148,31,RED,4,.04);
        if(phase==='taunt')this.bubble(['そっちじゃな〜い！','残念、こっち〜！','手、多くてゴメン♪'][variant%3],210,cy-150,235);
        if(phase==='charge'){
          this.rays(210,cy,.5);this.text(['必殺・でかい拳！','天罰、入りまーす','ツッコミ一閃！'][e.fx],210,cy-156,26,PAPER,5,-.055);
          this.text('えっ',210,cy+46,23,RED,3,-.12);
        }
        if(phase==='punch'){
          const p=clamp(e.t/840);this.rays(210,cy,.6);
          for(let i=0;i<hands.length;i++){
            const wave=clamp((p-(i%3)*.09)/.64),a=i*Math.PI*2/hands.length,reach=Math.sin(wave*Math.PI*.7),x=210+Math.cos(a)*(80+reach*95),y=cy+Math.sin(a)*(75+reach*95);
            this.path(c=>{c.moveTo(210+Math.cos(a)*45,cy+40);c.quadraticCurveTo(x*.9,y+50,x,y);},null,INK,26+reach*23);
            this.path(c=>{c.moveTo(210+Math.cos(a)*45,cy+40);c.quadraticCurveTo(x*.9,y+50,x,y);},null,SKIN,19+reach*23);
            this.fist(x,y,33+reach*30);
          }
          this.text('ボコボコボコ!!',210,cy-120,40,PAPER,7,-.1);this.burst(210,cy+70,34,52,RED,12);this.text('−1',210,cy+70,36,PAPER,4);
        }
      }
      c.restore();
      if(!title&&['enter','show','close','answer'].includes(phase)){
        this.text(['余裕の阿修羅','せっかち阿修羅','見栄っ張り阿修羅','筋肉の阿修羅','ごきげん阿修羅','限界の阿修羅'][Math.floor(variant/2)%6],210,72,15,INK);
        if(hands.length<=4&&phase==='answer')this.bubble('見切ったつもりか？',210,cy-162,212);
      }
      if(title){
        c.save();c.translate(333,h*.69);c.rotate(.14);this.burst(0,0,34,46,GOLD,12);this.text('腕、',0,-10,17,INK);this.text('増えます',0,11,14,INK);c.restore();
      }
      // Fade under the caption without obscuring any answer targets.
      if(!title){const fade=c.createLinearGradient(0,h-114,0,h);fade.addColorStop(0,'#fff4d600');fade.addColorStop(.42,'#fff0cfec');fade.addColorStop(1,'#fff0cf');c.fillStyle=fade;c.fillRect(0,h-114,420,114);}
    }
  }
  window.AshuraArt=Art;
})();
