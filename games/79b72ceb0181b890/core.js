/* All difficulty and phase timing values live here. No storage or network needed. */
(() => {
  'use strict';
  const LEVELS = [
    {arms:2, speed:850, swaps:3, pairs:1},
    {arms:2, speed:690, swaps:4, pairs:1},
    {arms:4, speed:730, swaps:4, pairs:1},
    {arms:4, speed:620, swaps:5, pairs:1},
    {arms:6, speed:650, swaps:5, pairs:1},
    {arms:6, speed:565, swaps:6, pairs:2},
    {arms:8, speed:595, swaps:6, pairs:2},
    {arms:8, speed:520, swaps:7, pairs:2},
    {arms:10,speed:550, swaps:7, pairs:2},
    {arms:10,speed:495, swaps:8, pairs:3},
    {arms:12,speed:520, swaps:8, pairs:3},
    {arms:12,speed:470, swaps:9, pairs:3}
  ];
  const TIMES = Object.freeze({enter:600,show:1400,close:320,windup:460,settle:220,pick:270,reveal:510,charge:370,impact:710,clear:460,taunt:580,punch:840,retry:480,over:Infinity,answer:Infinity});
  function difficulty(score){if(score<LEVELS.length)return {...LEVELS[score]};return {arms:12,speed:Math.max(315,450-(score-12)*10),swaps:Math.min(13,9+Math.floor((score-12)/3)),pairs:3};}
  function slots(n,height=720){
    const top=120,bottom=height-132,cy=(top+bottom)/2,ry=(bottom-top)/2;
    if(n===2)return [{x:86,y:cy+35},{x:334,y:cy+35}];
    const offset=n===4?Math.PI/4:n===6?Math.PI/6:0;
    return Array.from({length:n},(_,i)=>{const a=i*Math.PI*2/n+offset;return {x:210+161*Math.cos(a),y:cy+ry*Math.sin(a)};});
  }
  const ease=t=>t*t*(3-2*t);
  function position(hand,move,progress,points){
    const from=points[hand.slot];if(!move||!move.moves.has(hand.id))return {...from};
    const m=move.moves.get(hand.id),to=points[m.to],p=ease(Math.max(0,Math.min(1,progress))),dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1;
    const arc=Math.sin(p*Math.PI)*m.arc;
    return {x:from.x+dx*p-dy/len*arc,y:from.y+dy*p+dx/len*arc};
  }
  class Engine {
    constructor(rng=Math.random,onEvent=()=>{}){this.rng=rng;this.onEvent=onEvent;this.phase='title';this.t=0;this.score=0;this.lives=3;this.maxArms=2;this.hands=[];this.round=0;this.fx=0;}
    event(type,detail={}){this.onEvent({type,...detail});}
    set(phase){this.phase=phase;this.t=0;this.event('phase',{phase});}
    start(){this.score=0;this.lives=3;this.maxArms=2;this.round=0;this.next();}
    next(){
      this.level=difficulty(this.score);this.maxArms=Math.max(this.maxArms,this.level.arms);this.round++;
      this.hands=Array.from({length:this.level.arms},(_,id)=>({id,slot:id}));
      // The ball belongs to this ID until the round ends, never to a screen slot.
      this.ballId=Math.floor(this.rng()*this.hands.length);this.selected=null;this.correct=null;this.steps=0;this.move=null;
      this.fx=this.score%3;this.set('enter');
    }
    prepareMove(){
      const pool=this.hands.map(h=>h.id),moves=new Map();
      // Include the ball often, but the same public path function moves every hand.
      if(this.steps===0||this.rng()<.7){pool.splice(pool.indexOf(this.ballId),1);pool.unshift(this.ballId);}
      else for(let i=pool.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
      for(let i=0;i<this.level.pairs&&pool.length>1;i++){
        const a=pool.shift(),j=Math.floor(this.rng()*pool.length),b=pool.splice(j,1)[0];
        // Same signed perpendicular arcs separate the opposite-moving pair.
        const arc=(this.steps%2?1:-1)*(this.level.arms===2?54:28+this.rng()*17);
        moves.set(a,{to:this.hands[b].slot,arc});moves.set(b,{to:this.hands[a].slot,arc});
      }
      this.move={moves};this.event('whoosh',{count:this.level.pairs});
    }
    choose(id){if(this.phase!=='answer'||!this.hands.some(h=>h.id===id))return false;this.selected=id;this.correct=id===this.ballId;this.set('pick');return true;}
    update(dt){
      if(this.phase==='title'||this.phase==='over'||this.phase==='answer')return;
      this.t+=dt;const duration=this.phase==='shuffle'?this.level.speed:TIMES[this.phase];if(this.t<duration)return;
      switch(this.phase){
        case 'enter':this.set('show');break;
        case 'show':this.set('close');break;
        case 'close':this.set('windup');break;
        case 'windup':this.set('shuffle');this.prepareMove();break;
        case 'shuffle':
          for(const h of this.hands){const m=this.move.moves.get(h.id);if(m)h.slot=m.to;}
          this.steps++;this.move=null;
          if(this.steps>=this.level.swaps)this.set('settle');else{this.t=0;this.prepareMove();}break;
        case 'settle':this.set('answer');break;
        case 'pick':this.set('reveal');break;
        case 'reveal':this.set(this.correct?'charge':'taunt');break;
        case 'charge':this.set('impact');break;
        case 'impact':this.score++;this.set('clear');break;
        case 'clear':this.next();break;
        case 'taunt':this.lives--;this.set('punch');break;
        case 'punch':this.set(this.lives<=0?'over':'retry');break;
        case 'retry':this.next();break;
      }
    }
    positions(height){const points=slots(this.hands.length,height);return this.hands.map(h=>({id:h.id,...position(h,this.move,this.t/this.level.speed,points)}));}
  }
  window.AshuraCore={LEVELS,TIMES,difficulty,slots,position,Engine};
})();
