(() => {
  'use strict';
  class Sound {
    constructor(){this.ctx=null;this.muted=false;this.playing=false;this.voices=new Set();this.step=0;this.nextBeat=0;this.quietUntil=0;this.musicLevel=.095;}
    async unlock(){
      try{
        if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;this.ctx=new AC();
          this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:.62;
          const limit=this.ctx.createDynamicsCompressor();limit.threshold.value=-14;limit.knee.value=12;limit.ratio.value=7;limit.attack.value=.004;limit.release.value=.14;
          this.master.connect(limit);limit.connect(this.ctx.destination);
          this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate*.8,this.ctx.sampleRate);const a=this.noise.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
          this.timer=setInterval(()=>this.pump(),75);
        }
        if(this.ctx.state!=='running')await this.ctx.resume();this.nextBeat=this.ctx.currentTime+.04;return this.ctx.state==='running';
      }catch{return false;}
    }
    track(source){this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();};}
    tone(freq,duration=.1,volume=.15,type='sine',delay=0,endFreq){
      if(!this.ctx||this.muted||this.ctx.state!=='running'||this.voices.size>40)return;
      const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+duration);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);this.track(o);o.start(t);o.stop(t+duration+.015);o.addEventListener('ended',()=>g.disconnect());
    }
    hiss(duration=.15,volume=.2,freq=1400,delay=0){
      if(!this.ctx||this.muted||this.ctx.state!=='running'||this.voices.size>40)return;
      const t=this.ctx.currentTime+delay,s=this.ctx.createBufferSource(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();s.buffer=this.noise;f.type='bandpass';f.Q.value=.65;f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(Math.max(80,freq*.2),t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume,t+duration*.12);g.gain.exponentialRampToValueAtTime(.0001,t+duration);s.connect(f);f.connect(g);g.connect(this.master);this.track(s);s.start(t);s.stop(t+duration+.01);s.addEventListener('ended',()=>{f.disconnect();g.disconnect();});
    }
    silence(seconds){if(this.ctx)this.quietUntil=this.ctx.currentTime+seconds;}
    startMusic(){this.playing=true;this.step=0;if(this.ctx)this.nextBeat=this.ctx.currentTime+.08;}
    pump(){
      if(!this.ctx||!this.playing||this.muted||this.ctx.state!=='running')return;
      const now=this.ctx.currentTime;if(this.nextBeat<now)this.nextBeat=now+.025;
      while(this.nextBeat<now+.14){const s=this.step%32,delay=this.nextBeat-now;
        if(this.nextBeat>=this.quietUntil){
          // A jaunty original pentatonic battle loop: plucked lead, walking bass and woodblocks.
          const melody=[74,0,77,79,81,79,77,0,74,77,72,0,69,72,74,0,81,0,84,81,79,77,79,0,77,74,72,69,72,0,74,0];
          const note=melody[s];if(note)this.tone(440*Math.pow(2,(note-69)/12),.12,this.musicLevel,'triangle',delay);
          if(s%4===0)this.tone([146.83,130.81,110,130.81][Math.floor(s/8)],.23,this.musicLevel*.9,'triangle',delay);
          if(s%4===2)this.tone(700,.025,this.musicLevel*.42,'sine',delay,370);
          if(s%8===0)this.tone(110,.1,this.musicLevel*.7,'sine',delay,45);
        }
        this.step++;this.nextBeat+=.145;
      }
    }
    event(event){
      if(event.type==='whoosh'){this.hiss(.18,.17,2300);if(event.count>1)this.hiss(.16,.12,3200,.09);return;}
      if(event.type!=='phase')return;
      switch(event.phase){
        case 'enter':this.tone(147,.18,.15,'triangle');this.tone(220,.16,.12,'triangle',.09);break;
        case 'show':this.tone(880,.15,.12);this.tone(1320,.22,.11,'sine',.09);break;
        case 'close':this.tone(230,.075,.2,'triangle',0,90);break;
        case 'windup':this.hiss(.3,.07,700);break;
        case 'settle':this.silence(.42);this.tone(600,.065,.21,'square',0,110);break;
        case 'pick':this.silence(.34);this.tone(740,.07,.2,'triangle');break;
        case 'charge':this.silence(.4);this.tone(110,.35,.25,'sawtooth',0,360);break;
        case 'impact':this.silence(.25);this.tone(125,.4,.65,'sine',0,32);this.hiss(.48,.5,900);this.tone(60,.25,.32,'triangle',.08);break;
        case 'clear':[74,77,81,86].forEach((n,i)=>this.tone(440*2**((n-69)/12),.16,.14,'triangle',i*.075));break;
        case 'taunt':this.tone(310,.26,.2,'triangle',0,155);this.tone(180,.14,.13,'square',.22,120);break;
        case 'punch':for(let i=0;i<6;i++){this.tone(150+i*20,.075,.25,'sine',i*.105,50);this.hiss(.065,.18,900+i*170,i*.105);}break;
        case 'over':this.playing=false;[74,72,69,62].forEach((n,i)=>this.tone(440*2**((n-69)/12),.25,.18,'triangle',i*.16));break;
      }
    }
    success(){[660,880,1100].forEach((f,i)=>this.tone(f,.16,.14,'triangle',i*.055));}
    mute(){this.muted=!this.muted;if(this.ctx){this.master.gain.setTargetAtTime(this.muted?0:.62,this.ctx.currentTime,.015);this.nextBeat=this.ctx.currentTime+.04;}return this.muted;}
    async pause(){if(!this.ctx)return;for(const v of this.voices){try{v.stop();}catch{}}this.voices.clear();try{await this.ctx.suspend();}catch{}}
  }
  window.AshuraSound=Sound;
})();
