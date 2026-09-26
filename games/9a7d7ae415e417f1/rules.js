/* Game rules. No storage, network, adaptive odds, or production test switches. */
(() => {
  'use strict';
  const HANDS = Object.freeze(['グー','チョキ','パー']);
  const ENEMIES = Object.freeze([
    Object.freeze({name:'岩頭 ごり丸',title:'剛腕の大将',quote:'「拳ひとつで十分じゃ！」',favorite:0}),
    Object.freeze({name:'鋏月 きれ之助',title:'二枚刃の若武者',quote:'「二本の刃こそ、美しい。」',favorite:1}),
    Object.freeze({name:'紙白 おり姫',title:'包囲の姫大将',quote:'「ひらりと、包みますわ。」',favorite:2})
  ]);
  const ORDERS = Object.freeze([
    Object.freeze({line:'殿！ 包囲されました！',button:'岩で押し通す！',success:'包囲？ 岩には関係ない。',failure:'殿、それは無理です。'}),
    Object.freeze({line:'殿！ 刃が通りませぬ！',button:'岩ごと斬れ！',success:'岩ごと、真っ二つ。',failure:'折れたのは、こちらです。'}),
    Object.freeze({line:'殿！ 切り刻まれますぞ！',button:'もっとでかい紙で包め！',success:'敵軍、ひと包み。',failure:'普通に切られました。'})
  ]);
  function enemyHand(index,roll) {
    const favorite=ENEMIES[index].favorite;
    return roll<.5?favorite:roll<.75?(favorite+1)%3:(favorite+2)%3;
  }
  function outcome(player,enemy) {
    if(player===enemy)return 'tie';
    return (player+1)%3===enemy?'win':'lose';
  }
  class Match {
    constructor(){this.phase='title';this.playerHP=5;this.enemyHP=2;this.enemyIndex=0;this.morale=0;this.force=false;this.history=[];this.round=null;this.defeated=0;this.won=false;this.stats={rounds:0,reversals:0,orders:0,losses:0,ties:0,normalWins:0,forced:0};}
    start(){
      if(this.phase!=='title'&&this.phase!=='result')return false;
      this.playerHP=5;this.enemyHP=2;this.enemyIndex=0;this.morale=0;this.force=false;this.history=[];this.round=null;this.defeated=0;this.won=false;
      this.stats={rounds:0,reversals:0,orders:0,losses:0,ties:0,normalWins:0,forced:0};this.phase='intro';return true;
    }
    prepare(){
      if(!['intro','transition','between'].includes(this.phase))return false;
      // Commit the opponent's hand BEFORE input is enabled. Never look at the player hand.
      this.committedEnemy=enemyHand(this.enemyIndex,Math.random());
      this.round=null;this.force=false;this.phase='choose';return true;
    }
    activateForce(){
      if(this.phase!=='choose'||this.morale!==2||this.force)return false;
      this.morale-=2;this.force=true;this.stats.forced++;return true;
    }
    choose(hand){
      if(this.phase!=='choose'||!Number.isInteger(hand)||hand<0||hand>2)return false;
      this.phase='reveal';
      this.round={player:hand,enemy:this.committedEnemy,outcome:outcome(hand,this.committedEnemy),chance:this.force?.75:.35,forced:this.force,success:null};
      this.stats.rounds++;this.history.push(this.committedEnemy);this.history=this.history.slice(-3);return true;
    }
    reveal(){
      if(this.phase!=='reveal')return false;
      if(this.round.outcome==='lose'){this.phase='order';return 'order';}
      if(this.round.outcome==='win'){this.enemyHP--;this.stats.normalWins++;}
      else this.stats.ties++;
      this.phase='resolved';return this.round.outcome;
    }
    issueOrder(){
      if(this.phase!=='order')return false;
      // Lock synchronously before the single draw. Damage is applied once at impact.
      this.phase='ordering';this.stats.orders++;
      this.round.success=Math.random()<this.round.chance;return true;
    }
    impact(){
      if(this.phase!=='ordering')return false;
      if(this.round.success){this.enemyHP--;this.stats.reversals++;}
      else{this.playerHP--;this.morale=Math.min(2,this.morale+1);this.stats.losses++;}
      this.phase='resolved';return true;
    }
    finish(){
      if(this.phase!=='resolved')return false;
      this.force=false;
      if(this.playerHP===0){this.won=false;this.phase='result';return 'result';}
      if(this.enemyHP===0){
        this.defeated++;
        if(this.defeated===3){this.won=true;this.phase='result';return 'result';}
        this.enemyIndex++;this.enemyHP=2;this.history=[];this.phase='transition';return 'transition';
      }
      this.phase='between';return 'next';
    }
    title(){
      if(this.won){
        if(this.stats.reversals>=3)return 'じゃんけんには弱い名将';
        if(this.stats.reversals>=1)return '力技の天下人';
        return this.stats.losses===0?'正々堂々の天下人':'不屈の天下人';
      }
      if(this.stats.reversals>=2)return '無茶ぶりの達人';
      if(this.defeated>=2)return '天下まで、あと一歩';
      if(this.stats.orders>=4)return '懲りない名将';
      return '明日の天下人';
    }
  }
  const api=Object.freeze({HANDS,ENEMIES,ORDERS,enemyHand,outcome,Match});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else window.SengokuRules=api;
})();
