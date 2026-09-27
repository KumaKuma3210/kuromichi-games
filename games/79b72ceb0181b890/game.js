(() => {
  'use strict';
  const $=id=>document.getElementById(id),root=$('game'),sound=new AshuraSound(),art=new AshuraArt($('canvas'));
  let paused=false,last=performance.now(),best=0,lastPhase='',buttons=[],resizePending=true,audioRequest=0;
  const engine=new AshuraCore.Engine(Math.random,event=>{
    sound.event(event);
    if(event.type==='phase'&&event.phase==='reveal'&&engine.correct)sound.success();
    if(event.type==='phase')sync();
  });
  const captions={enter:['いざ、勝負！',''],show:['この玉を、見失うな。','光る玉を持った手を覚えよう'],close:['ぎゅっ。','玉は同じ手の中'],windup:['よーく見てろよ？',''],shuffle:['どこへ行った!?','拳を目で追え！'],settle:['……',''],answer:['どの手？','玉が入っている拳をタップ！'],pick:['この手で……',''],reveal:['',''],charge:['決まった。',''],impact:['撃破!!',''],clear:['お見事！','次の阿修羅、出てこい！'],taunt:['空っぽでした。','玉は、開いたもう一方の手！'],punch:['手数が多すぎる！','残機 −1'],retry:['もういっちょ！','同じ腕数でもう一度'],over:['','']};
  function sync(){
    const p=engine.phase;root.dataset.phase=p;
    $('title').hidden=p!=='title';$('result').hidden=p!=='over';$('caption').hidden=p==='title'||p==='over';
    $('hearts').innerHTML='♥'.repeat(engine.lives)+'<span class="lost">'+'♥'.repeat(3-engine.lives)+'</span>';$('hearts').setAttribute('aria-label',`残機${engine.lives}`);
    $('score').querySelector('b').textContent=engine.score;
    if(engine.level){$('badge').textContent=`第${engine.score+1}戦 ／ ${engine.level.arms}本腕`+(engine.score%2===1?' ・ ちょい速':'');}
    const caption=captions[p]||['',''];$('message').textContent=p==='reveal'?(engine.correct?'あった！':'……ない。'):caption[0];$('submessage').textContent=caption[1];
    if(p==='over'){
      best=Math.max(best,engine.score);$('final-score').textContent=engine.score;$('final-arms').textContent=engine.maxArms;$('best').textContent=`このページでの最高記録：${best}体`;
      $('result-quip').textContent=engine.score>=10?'もはや千手観音。よく見えたな。':engine.score>=4?'その腕、何本まで増えるんだよ。':'手が多いって、ずるくない？';
    }
    updateTargets();lastPhase=p;
  }
  function updateTargets(){
    if(buttons.length!==engine.hands.length){
      $('targets').replaceChildren();buttons=engine.hands.map(hand=>{const b=document.createElement('button');b.type='button';b.className='hand-target';b.setAttribute('aria-label',`拳 ${hand.id+1}`);b.addEventListener('click',()=>choose(hand.id));$('targets').append(b);return b;});
    }
    const positions=engine.hands.length?engine.positions(art.h):[],r=engine.hands.length<=4?42:35;
    buttons.forEach((b,i)=>{const hand=positions[i];b.disabled=engine.phase!=='answer'||paused;b.hidden=engine.phase!=='answer';if(hand){b.style.left=(hand.x-r)/420*100+'%';b.style.top=(hand.y-r)/art.h*100+'%';b.style.width=r*2/420*100+'%';b.style.height=r*2/art.h*100+'%';}});
  }
  async function unlock(){const ticket=++audioRequest;const ok=await sound.unlock();if(ticket!==audioRequest)return ok;$('mute').title=ok?'音の切り替え':'音を再開するにはもう一度タップ';return ok;}
  function start(){paused=false;$('resume').hidden=true;unlock();sound.startMusic();engine.start();last=performance.now();}
  function choose(id){if(paused)return;unlock();engine.choose(id);}
  $('start').addEventListener('click',start);$('retry').addEventListener('click',start);
  $('mute').addEventListener('click',()=>{unlock();const muted=sound.mute();$('mute').setAttribute('aria-pressed',String(muted));$('mute').setAttribute('aria-label',muted?'音をオンにする':'音をミュートする');});
  // Every pointer gesture can resume an interrupted iOS audio context.
  root.addEventListener('pointerdown',()=>{if(engine.phase!=='title'&&!paused&&sound.ctx?.state!=='running')unlock();},{passive:true});
  function suspend(){if(engine.phase==='title'||paused)return;paused=true;audioRequest++;sound.pause();$('resume').hidden=false;updateTargets();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});
  window.addEventListener('pagehide',suspend);window.addEventListener('pageshow',event=>{if(event.persisted)suspend();});
  $('resume').addEventListener('click',()=>{unlock();paused=false;$('resume').hidden=true;last=performance.now();updateTargets();});
  new ResizeObserver(()=>{resizePending=true;}).observe(root);
  function loop(now){
    const dt=Math.min(50,Math.max(0,now-last));last=now;
    if(resizePending){const b=root.getBoundingClientRect();if(b.width&&b.height){art.resize(b.width,b.height);updateTargets();}resizePending=false;}
    if(!paused)engine.update(dt);
    if(engine.phase!==lastPhase)sync();
    if(engine.phase==='answer')updateTargets();
    if(!paused)art.draw(engine,now);
    requestAnimationFrame(loop);
  }
  sync();requestAnimationFrame(loop);
})();
