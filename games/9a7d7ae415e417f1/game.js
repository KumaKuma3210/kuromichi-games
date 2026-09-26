(() => {
  'use strict';
  const {HANDS,ENEMIES,ORDERS,Match}=window.SengokuRules;
  const $=id=>document.getElementById(id), root=$('game');
  const scene=new Battlefield($('battle-canvas')), audio=new WarAudio(), match=new Match();
  const handButtons=[...document.querySelectorAll('[data-hand]')];
  const letters=['一','二','三'];
  let screen='title', time=0, last=0, visual=null, timeline=null, modalOpen=false, paused=false, keyboard=false;
  let toastUntil=0, testingSound=false;
  handButtons.forEach((button,i)=>button.querySelector('.hand-symbol').innerHTML=SengokuArt.handSVG(i));
  function say(text){$('announcer').textContent=text;}
  function show(id,value){$(id).hidden=!value;}
  function focusIfKeyboard(el){if(keyboard)el.focus({preventScroll:true});}
  function pips(id,count,max){$(id).innerHTML=Array.from({length:max},(_,i)=>'<i'+(i>=count?' class="empty"':'')+'></i>').join('');$(id).setAttribute('aria-label',count+' / '+max);}
  function toast(text,seconds=1.35){$('battle-toast').textContent=text;show('battle-toast',true);toastUntil=time+seconds;}
  function verdict(title,sub,kind=''){const el=$('verdict');el.className='verdict '+kind;$('verdict-title').textContent=title;$('verdict-sub').textContent=sub;show('verdict',true);say(title+'。'+sub);}
  function run(events){timeline={elapsed:0,events:events.map(([at,fn])=>({at,fn,done:false}))};}
  function clearDuel(){root.classList.remove('dueling','hand-impact');show('janken-call',false);$('hands').style.removeProperty('--lift');$('hands').style.removeProperty('--lean');$('hands').style.removeProperty('--punch');}
  function chant(text,beat){$('janken-call').textContent=text;show('janken-call',true);$('janken-call').dataset.beat=beat;}
  function status(){
    root.dataset.phase=match.phase;root.dataset.screen=screen;root.dataset.enemy=match.enemyIndex;root.classList.toggle('forced',match.force);
    $('player-hp').textContent=match.playerHP;$('enemy-hp').textContent=match.enemyHP;
    pips('player-pips',match.playerHP,5);pips('enemy-pips',match.enemyHP,2);
    $('morale-value').textContent=match.morale+'/2';
    document.querySelectorAll('.morale-meter i').forEach((el,i)=>el.classList.toggle('full',i<match.morale));
    const enemy=ENEMIES[match.enemyIndex];$('enemy-name').textContent=enemy.name;$('enemy-quote').textContent=enemy.quote;
    $('battle-number').textContent='第'+letters[match.enemyIndex]+'陣';
    $('campaign-steps').setAttribute('aria-label','倒した武将 '+match.defeated+' / 3');
    $('campaign-steps').querySelectorAll('i').forEach((el,i)=>{el.className=i<match.defeated?'done':i===match.enemyIndex?'current':'';el.textContent=i<match.defeated?'✓':letters[i];});
    const history=visual?.kind==='janken'&&!visual.released?visual.history:match.history;
    $('history-hands').innerHTML=Array.from({length:3},(_,i)=>{const j=history.length-3+i,value=j>=0?HANDS[history[j]]:'―';return '<span class="history-hand'+(i===2&&j>=0?' new':'')+'">'+value+'</span>';}).join('');
    const force=$('force');force.disabled=paused||match.phase!=='choose'||match.morale<2||match.force;
    force.classList.toggle('active',match.force);force.classList.toggle('ready',match.morale===2&&match.phase==='choose');force.textContent=match.force?'強行軍中':'強行軍';
    $('force-description').textContent=match.force?'この勝負だけ逆転75%。士気2は消費済み。':match.morale===2?'士気2で逆転75%。勝ち・あいこでも消費。':'兵力を失うと士気＋1。2で発動。';
    show('force-badge',match.force&&screen==='play');
    const choosing=match.phase==='choose',ordering=match.phase==='order';
    show('choice-controls',choosing);show('order-controls',ordering);show('waiting-controls',!choosing&&!ordering);
    handButtons.forEach(b=>b.disabled=!choosing||paused);$('order').disabled=!ordering||paused;
    if(ordering){const order=ORDERS[match.round.player];$('retainer-line').textContent=order.line;$('order-text').textContent=order.button;$('order-rate').textContent='逆転成功率 '+Math.round(match.round.chance*100)+'% · 一度だけ命令';}
    show('title-banner',screen==='title');show('title-controls',screen==='title');show('enemy-panel',screen==='play');show('play-controls',screen==='play');show('stage-label',screen==='play');show('result-banner',screen==='result');show('result-controls',screen==='result');
  }
  function ready(){
    if(!match.prepare())return;
    visual=null;timeline=null;clearDuel();show('hands',false);show('verdict',false);
    $('stage-label').textContent=match.stats.rounds===0?'その一手で、天下を。':'相手のクセを、読め。';
    $('choice-hint').textContent=match.stats.rounds===0?'まずは、この三つから一手！':match.morale===2?'士気満タン。強行軍を使うなら、手を出す前。':'グー・チョキ・パー、いざ勝負。';
    audio.focusMusic(1);audio.startMusic();status();focusIfKeyboard(handButtons[0]);
  }
  function begin(){
    if(paused||!match.start())return;
    // No timer is created on restart. Reuse the one RAF loop and audio context.
    timeline=null;visual=null;clearDuel();toastUntil=0;show('battle-toast',false);
    screen='play';audio.unlock();audio.stopAll();audio.startMusic();audio.effect('start');
    show('hands',false);show('verdict',false);$('stage-label').textContent='第一陣、出陣。';
    $('waiting-text').textContent='いざ、合戦！';$('waiting-note').textContent='三将を倒せば、天下統一。';
    status();say('第一陣。岩頭ごり丸。自軍兵力5、敵軍兵力2。');run([[.95,ready]]);
  }
  function afterRound(){
    const next=match.finish();visual=null;timeline=null;
    if(next==='result'){end();return;}
    if(next==='transition'){
      show('hands',false);show('verdict',false);show('battle-toast',false);toastUntil=0;
      $('stage-label').textContent=ENEMIES[match.enemyIndex].title;
      $('waiting-text').textContent=ENEMIES[match.enemyIndex].name+'、参上！';
      $('waiting-note').textContent='自軍の兵力・士気は、そのまま次の合戦へ。';
      audio.startMusic();audio.effect('start');status();say('敵将撃破。次は'+ENEMIES[match.enemyIndex].name+'。兵力と士気を持ち越します。');run([[1.25,ready]]);
    }else if(next==='next')ready();
  }
  function selectHand(hand){
    const history=match.history.slice();
    if(paused||!match.choose(hand))return;
    audio.unlock();audio.focusMusic(.28);audio.effect('janken-a');
    const round=match.round;visual={kind:'janken',elapsed:0,enemyIndex:match.enemyIndex,history,released:false};
    clearDuel();root.classList.add('dueling');
    // Both sides wind up with a fist. Neither the opponent nor its history reveals early.
    $('player-hand-icon').innerHTML=SengokuArt.handSVG(0);$('enemy-hand-icon').innerHTML=SengokuArt.handSVG(0);
    $('player-hand-name').textContent='構え';$('enemy-hand-name').textContent='構え';
    $('hands').setAttribute('aria-label','両軍、構え。まだ手は公開されていません。');show('hands',true);show('verdict',false);
    $('waiting-text').textContent='じゃん、けん……';$('waiting-note').textContent=HANDS[hand]+'で勝負。両軍、同時に手を出す！';
    $('stage-label').textContent='いざ、尋常に！';chant('じゃん','first');status();say('じゃん、けん。'+HANDS[hand]+'で勝負。');
    run([
      [.34,()=>{chant('けん','second');audio.effect('janken-b');}],
      [.69,()=>{chant('……','hold');audio.focusMusic(.04);}],
      [.94,()=>{
        visual.released=true;root.classList.add('hand-impact');chant('ぽん！','pon');
        $('player-hand-icon').innerHTML=SengokuArt.handSVG(round.player);$('enemy-hand-icon').innerHTML=SengokuArt.handSVG(round.enemy);
        $('player-hand-name').textContent=HANDS[round.player];$('enemy-hand-name').textContent=HANDS[round.enemy];
        $('hands').setAttribute('aria-label','自軍 '+HANDS[round.player]+'、敵軍 '+HANDS[round.enemy]);
        $('waiting-text').textContent='ぽん！';$('waiting-note').textContent='自軍 '+HANDS[round.player]+' 対 敵軍 '+HANDS[round.enemy];
        audio.effect('reveal');audio.effect('pon');status();say('ぽん！ 自軍'+HANDS[round.player]+'、敵軍'+HANDS[round.enemy]+'。');
      }],
      [1.23,()=>{clearDuel();visual={kind:'normal',elapsed:0,outcome:round.outcome,enemyIndex:match.enemyIndex};audio.focusMusic(1);}],
      [1.51,()=>{
        const result=match.reveal();
        if(result==='order'){
          timeline=null;visual=null;$('stage-label').textContent='殿、ご命令を！';
          verdict('じゃんけんは負け','まだ兵力は減らない。命令で逆転！','loss');status();
          say('自軍'+HANDS[round.player]+'、敵軍'+HANDS[round.enemy]+'。じゃんけんは負け。'+ORDERS[round.player].line+' 逆転成功率'+Math.round(round.chance*100)+'パーセント。');focusIfKeyboard($('order'));
        }else{
          status();if(result==='win')audio.effect('damage');audio.effect(result==='win'?'win':'tie');
          if(result==='win'){verdict('正々堂々！','敵の兵力 −1');$('waiting-text').textContent='よし、押し込め！';}
          else{verdict('あいこ！','互いに、譲らず。');$('waiting-text').textContent='もう一手！';}
          $('waiting-note').textContent=result==='tie'&&round.forced?'強行軍の士気2は消費しました。':'次の勝負へ。';
        }
      }],
      [2.26,afterRound]
    ]);
  }
  function order(){
    if(paused||!match.issueOrder())return;
    const r=match.round;visual={kind:'order',elapsed:0,hand:r.player,success:r.success};
    const before=match.morale;
    audio.unlock();audio.effect('horn');show('verdict',false);show('battle-toast',false);toastUntil=0;
    $('stage-label').textContent=ORDERS[r.player].button;$('waiting-text').textContent=ORDERS[r.player].button;$('waiting-note').textContent='殿の命令、実行中。';status();
    run([
      [.22,()=>show('hands',false)],
      [.73,()=>audio.effect(['charge','slash','paper'][r.player])],
      // Effects above decay by 1.02 s. Leave a short silence before the 1.38 s impact.
      [1.38,()=>{
        if(!match.impact())return;
        audio.effect('damage');audio.effect(r.success?'success':'failure');
        if(r.success){verdict('下剋上！',ORDERS[r.player].success,'success');$('waiting-text').textContent='理屈を覆す大勝利';$('waiting-note').textContent='敵の兵力 −1 ／ 自軍の兵力はそのまま';}
        else{verdict('普通に負けました',ORDERS[r.player].failure,'failed');$('waiting-text').textContent='殿、それは無理です';$('waiting-note').textContent='自軍の兵力 −1 ／ 士気 ＋1';}
        status();
      }],
      [2.05,()=>{if(!r.success&&match.morale===2&&before<2){audio.effect('morale');toast('士気満タン！ 次の一手で強行軍。',1.8);}}],
      [2.75,afterRound]
    ]);
  }
  function force(){
    if(paused||!match.activateForce())return;
    audio.unlock();audio.effect('force');toast('士気2消費。この一手だけ、逆転75%。',1.6);
    $('choice-hint').textContent='強行軍、発動！ 手を選べ。';status();say('強行軍。士気2消費。この勝負の逆転成功率75パーセント。通常勝利やあいこでも消費します。');
  }
  function end(){
    screen='result';timeline=null;visual=null;clearDuel();toastUntil=0;show('hands',false);show('verdict',false);show('battle-toast',false);
    $('result-eyebrow').textContent=match.won?'三将、すべて撃破。':'家臣一同、撤退します。';
    $('result-title').textContent=match.won?'天下統一':'敗 北';
    $('result-comment').textContent=match.won?(match.stats.reversals?'理屈より、殿のひと声。':'今日は、ちゃんと強かった。'):'殿！ 次の戦なら、きっと！';
    $('result-award').textContent=match.title();$('result-defeated').textContent=match.defeated;$('result-reversals').textContent=match.stats.reversals;
    audio.stopAll();audio.effect(match.won?'unify':'defeat');status();focusIfKeyboard($('retry'));
    say((match.won?'天下統一':'敗北')+'。倒した武将'+match.defeated+'人。逆転成功'+match.stats.reversals+'回。称号、'+match.title());
  }
  function syncPause(){
    const shouldPause=document.hidden||modalOpen;show('pause-cover',document.hidden);
    if(shouldPause===paused)return;
    paused=shouldPause;last=0;
    // The AudioContext clock freezes too, preserving queued notes and the silence before impact.
    if(paused)audio.suspend();else audio.resume();status();
  }
  function settings(open){
    modalOpen=open;show('settings',open);$('settings-open').setAttribute('aria-expanded',String(open));syncPause();
    if(open)$('settings-close').focus({preventScroll:true});else $('settings-open').focus({preventScroll:true});
  }
  function mute(value){
    audio.setMute(value);$('mute').setAttribute('aria-pressed',String(value));$('mute').setAttribute('aria-label',value?'音のミュートを解除':'音をミュート');$('mute-text').textContent=value?'消音':'音あり';
  }
  function testSound(){
    if(!modalOpen||testingSound)return;
    testingSound=true;mute(false);
    // The button explicitly restores muted/zero-volume sound, keeping other chosen levels.
    if(audio.bgmVolume===0)audio.setBGM(.55);if(audio.fxVolume===0)audio.setFX(.85);
    $('bgm-volume').value=Math.round(audio.bgmVolume*100);$('bgm-output').value=$('bgm-volume').value+'%';
    $('sfx-volume').value=Math.round(audio.fxVolume*100);$('sfx-output').value=$('sfx-volume').value+'%';
    settings(false);
    audio.unlock().then(running=>{
      if(paused)return;
      if(running){audio.effect('start');toast('確認音。聞こえなければ本体の音量・消音を確認。',3);}
      else toast('音を開始できません。画面をもう一度タップ。',3);
    }).finally(()=>{testingSound=false;});
  }
  $('start').addEventListener('click',begin);$('retry').addEventListener('click',begin);
  handButtons.forEach((button,i)=>button.addEventListener('click',()=>selectHand(i)));
  $('order').addEventListener('click',order);$('force').addEventListener('click',force);
  $('mute').addEventListener('click',()=>{
    mute(!audio.muted);if(screen!=='title')audio.unlock();
  });
  $('sound-test').addEventListener('click',testSound);
  $('settings-open').addEventListener('click',()=>settings(!modalOpen));$('settings-close').addEventListener('click',()=>settings(false));$('settings-done').addEventListener('click',()=>settings(false));
  $('settings').addEventListener('click',event=>{if(event.target===$('settings'))settings(false);});
  $('bgm-volume').addEventListener('input',event=>{audio.setBGM(Number(event.target.value)/100);$('bgm-output').value=event.target.value+'%';});
  $('sfx-volume').addEventListener('input',event=>{audio.setFX(Number(event.target.value)/100);$('sfx-output').value=event.target.value+'%';});
  document.addEventListener('visibilitychange',syncPause);
  window.addEventListener('pagehide',()=>{paused=true;audio.suspend();last=0;});
  window.addEventListener('pageshow',()=>{syncPause();last=0;});
  document.addEventListener('pointerdown',()=>{keyboard=false;if(screen!=='title'&&!paused)audio.unlock();},{passive:true});
  document.addEventListener('keydown',event=>{
    keyboard=true;
    if(modalOpen){
      if(event.key==='Escape'){event.preventDefault();settings(false);}
      if(event.key==='Tab'){
        const els=[$('settings-close'),$('bgm-volume'),$('sfx-volume'),$('sound-test'),$('settings-done')],first=els[0],end=els[els.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();end.focus();}
        else if(!event.shiftKey&&document.activeElement===end){event.preventDefault();first.focus();}
      }
      return;
    }
    if(!event.repeat&&['1','2','3'].includes(event.key)&&match.phase==='choose'){event.preventDefault();selectHand(Number(event.key)-1);}
  });
  function frame(now){
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!paused){
      time+=dt;if(visual)visual.elapsed+=dt;
      const active=timeline;
      if(active){active.elapsed+=dt;for(const event of active.events){if(active!==timeline)break;if(!event.done&&active.elapsed>=event.at){event.done=true;event.fn();}}}
      if(visual?.kind==='janken'){
        const e=visual.elapsed,beat=e<.34?e/.34:e<.69?(e-.34)/.35:1;
        const lift=scene.reduced?0:Math.sin(beat*Math.PI)*19;
        const punch=scene.reduced?0:visual.released?Math.sin(Math.min(1,(e-.94)/.29)*Math.PI)*16:0;
        $('hands').style.setProperty('--lift',lift.toFixed(2)+'px');$('hands').style.setProperty('--lean',(lift*.45).toFixed(2)+'deg');$('hands').style.setProperty('--punch',punch.toFixed(2)+'px');
      }
      if(toastUntil&&time>=toastUntil){show('battle-toast',false);toastUntil=0;}
      audio.tick();scene.draw({screen,phase:match.phase,enemyIndex:match.enemyIndex,enemyHP:match.enemyHP,playerHP:match.playerHP,force:match.force,won:match.won,time,visual});
    }
    requestAnimationFrame(frame);
  }
  status();syncPause();requestAnimationFrame(frame);
})();
