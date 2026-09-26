/* Original pentatonic music and synthesized effects. One context, one scheduler. */
(() => {
  'use strict';
  class WarAudio {
    constructor(){this.ctx=null;this.master=null;this.bgm=null;this.fx=null;this.muted=false;this.bgmVolume=.55;this.fxVolume=.85;this.musicFocus=1;this.music=false;this.paused=false;this.nodes=new Set();this.step=0;this.nextBeat=0;this.available=true;this.bgmNodes=new Set();}
    unlock(){
      // Safari otherwise treats Web Audio as ambient sound, silenced by the iPhone switch.
      // Keep this optional: older Safari and sandboxed browsers may not expose the API.
      try{if(navigator.audioSession&&navigator.audioSession.type!=='playback')navigator.audioSession.type='playback';}catch(_){}
      try{
        if(!this.ctx){
          const AC=window.AudioContext||window.webkitAudioContext;if(!AC){this.available=false;return Promise.resolve(false);}
          this.ctx=new AC();this.master=this.ctx.createGain();this.bgm=this.ctx.createGain();this.fx=this.ctx.createGain();
          // Conservative bus gain followed by a compressor prevents overlapping transients from clipping.
          this.compressor=this.ctx.createDynamicsCompressor();this.compressor.threshold.value=-16;this.compressor.knee.value=14;this.compressor.ratio.value=5;this.compressor.attack.value=.003;this.compressor.release.value=.15;
          this.master.gain.value=this.muted?0:.55;this.bgm.gain.value=this.bgmVolume*.46*this.musicFocus;this.fx.gain.value=this.fxVolume*.95;
          // Leave ordinary samples untouched; round off only unusually large overlapping impacts.
          this.output=this.ctx.createWaveShaper();const curve=new Float32Array(2049);
          for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1,a=Math.abs(x);curve[i]=Math.sign(x)*(a<=.72?a:.72+.23*(1-Math.exp(-(a-.72)/.23)));}
          this.output.curve=curve;this.output.oversample='2x';
          this.bgm.connect(this.master);this.fx.connect(this.master);this.master.connect(this.compressor);this.compressor.connect(this.output);this.output.connect(this.ctx.destination);
          this.noiseBuffer=this.ctx.createBuffer(1,this.ctx.sampleRate*.3,this.ctx.sampleRate);const d=this.noiseBuffer.getChannelData(0);let seed=4517;
          for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=(seed/4294967296*2-1);}
        }
        if(this.paused)return Promise.resolve(false);
        if(this.ctx.state!=='running')return Promise.resolve(this.ctx.resume()).then(()=>this.ctx.state==='running',()=>false);
        return Promise.resolve(true);
      }catch(_){this.available=false;return Promise.resolve(false);}
    }
    ramp(node,value){if(!node||!this.ctx)return;const now=this.ctx.currentTime;node.gain.cancelScheduledValues(now);node.gain.setTargetAtTime(value,now,.018);}
    setMute(v){this.muted=v;this.ramp(this.master,v?0:.55);}
    setBGM(v){this.bgmVolume=v;this.ramp(this.bgm,v*.46*this.musicFocus);}
    focusMusic(v){this.musicFocus=v;this.ramp(this.bgm,this.bgmVolume*.46*v);}
    setFX(v){this.fxVolume=v;this.ramp(this.fx,v*.95);}
    track(source,bus){this.nodes.add(source);if(bus===this.bgm)this.bgmNodes.add(source);source.onended=()=>{this.nodes.delete(source);this.bgmNodes.delete(source);try{source.disconnect();}catch(_){}};}
    tone(freq,duration=.16,gain=.2,type='sine',delay=0,bus=null,endFreq=null){
      if(!this.ctx||this.paused)return;bus=bus||this.fx;const at=this.ctx.currentTime+delay,osc=this.ctx.createOscillator(),amp=this.ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,at);if(endFreq)osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),at+duration);
      amp.gain.setValueAtTime(0,at);amp.gain.linearRampToValueAtTime(gain,at+.008);amp.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(amp);amp.connect(bus);this.track(osc,bus);osc.onended=()=>{this.nodes.delete(osc);this.bgmNodes.delete(osc);osc.disconnect();amp.disconnect();};osc.start(at);osc.stop(at+duration+.025);
    }
    noise(duration=.1,gain=.12,delay=0,cutoff=2400,bus=null){
      if(!this.ctx||this.paused)return;bus=bus||this.fx;const at=this.ctx.currentTime+delay,src=this.ctx.createBufferSource(),amp=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();src.buffer=this.noiseBuffer;filter.type='lowpass';filter.frequency.value=cutoff;amp.gain.setValueAtTime(0,at);amp.gain.linearRampToValueAtTime(gain,at+.005);amp.gain.exponentialRampToValueAtTime(.0001,at+duration);src.connect(filter);filter.connect(amp);amp.connect(bus);this.track(src,bus);src.onended=()=>{this.nodes.delete(src);this.bgmNodes.delete(src);src.disconnect();amp.disconnect();filter.disconnect();};src.start(at);src.stop(at+duration+.01);
    }
    drum(delay=0,big=false,bus=null){bus=bus||this.fx;this.tone(big?140:175,big?.28:.13,big?.55:.28,'sine',delay,bus,big?42:65);this.noise(.045,big?.18:.085,delay,1200,bus);}
    pluck(freq,delay=0,bus=null){bus=bus||this.bgm;this.tone(freq,.21,.16,'triangle',delay,bus);this.tone(freq*2,.075,.025,'sine',delay,bus);}
    shamisen(freq,delay=0){this.pluck(freq,delay,this.bgm);this.tone(freq,.065,.055,'sawtooth',delay,this.bgm);this.noise(.025,.035,delay,3200,this.bgm);}
    flute(freq,duration=.28,delay=0){this.tone(freq,duration,.14,'sine',delay,this.bgm);this.tone(freq*2,duration*.7,.035,'triangle',delay,this.bgm);}
    rim(delay=0,gain=.08){this.tone(1220,.045,gain,'triangle',delay,this.bgm,760);this.noise(.025,gain*.55,delay,4400,this.bgm);}
    impact(delay=0,power=1){
      this.tone(230,.24,.62*power,'sine',delay,null,62);
      this.tone(460,.16,.25*power,'triangle',delay,null,145);
      this.noise(.11,.32*power,delay,2700);this.tone(1460,.035,.13*power,'triangle',delay);
    }
    sparkle(freq,delay=0,power=1){
      this.tone(freq,.3,.2*power,'triangle',delay);this.tone(freq*2,.18,.07*power,'sine',delay+.025);
      this.tone(freq,.16,.06*power,'sine',delay+.12);
    }
    brass(freq,duration=.3,delay=0,power=1){
      this.tone(freq,duration,.22*power,'triangle',delay);this.tone(freq*2,duration*.75,.075*power,'sawtooth',delay);
      this.tone(freq*.5,duration,.12*power,'sine',delay);
    }
    startMusic(){if(this.music)return;this.focusMusic(1);this.music=true;this.step=0;this.nextBeat=this.ctx?this.ctx.currentTime+.07:0;}
    stopMusic(){this.music=false;for(const n of this.bgmNodes){try{n.stop();}catch(_){}}this.bgmNodes.clear();}
    stopAll(){this.stopMusic();for(const n of this.nodes){try{n.stop();}catch(_){}}this.nodes.clear();}
    tick(){
      if(!this.ctx||!this.music||this.paused||this.ctx.state!=='running')return;
      const now=this.ctx.currentTime;if(this.nextBeat<now-.2)this.nextBeat=now+.02;
      // Eight short bars: a bright flute lead, shamisen answers, moving bass and taiko fills.
      const melody=[587,0,784,880,0,784,587,0, 784,880,1047,0,880,784,587,0,
        523,0,587,784,0,587,523,0, 440,523,587,0,784,587,523,440,
        587,784,880,0,1175,0,1047,880, 784,0,880,1047,0,880,784,0,
        523,587,784,0,880,784,587,523, 587,0,784,880,1175,880,784,587];
      const roots=[147,147,131,110,147,196,131,147];
      while(this.nextBeat<now+.075){const delay=Math.max(0,this.nextBeat-now),step=this.step%64,beat=step%8,bar=Math.floor(step/8),bass=roots[bar];
        if(beat===0||beat===4)this.drum(delay,true,this.bgm);
        if(beat===2||beat===6){this.drum(delay,false,this.bgm);this.rim(delay,.085);}
        if(beat%2===1)this.rim(delay,.05);
        if(step%16===15){this.drum(delay,false,this.bgm);this.drum(delay+.085,false,this.bgm);}
        if(beat%2===0)this.tone(bass*(beat===6?1.5:1),.3,.19,'triangle',delay,this.bgm);
        if(melody[step])this.flute(melody[step],beat===0?.33:.24,delay);
        if(beat%2===1)this.shamisen(bass*[2,3,4,3][(beat-1)/2],delay);
        if(step===0||step===32)this.noise(.18,.07,delay,6200,this.bgm);
        this.step++;this.nextBeat+=.19;
      }
    }
    suspend(){if(this.paused)return;this.paused=true;if(this.ctx){const p=this.ctx.suspend();if(p)p.catch(()=>{});}}
    resume(){this.paused=false;if(this.ctx)return this.unlock();return Promise.resolve(false);}
    effect(name){
      if(!this.ctx||this.paused)return;
      switch(name){
        case 'tap':this.tone(880,.065,.19,'triangle');this.tone(1320,.065,.08,'sine',.025);break;
        case 'janken-a':this.impact(0,.62);this.tone(430,.08,.2,'triangle',.015,null,180);break;
        case 'janken-b':this.impact(0,.65);this.tone(660,.08,.22,'triangle',.015,null,260);this.drum(.085,false);break;
        case 'pon':this.impact(0,1.12);this.noise(.18,.28,.008,5800);this.sparkle(784,.035,.95);this.sparkle(1175,.09,.65);break;
        case 'start':this.impact(0,.9);[392,523,784].forEach((f,i)=>this.brass(f,.22,.09+i*.09,.85));this.sparkle(1175,.32,.8);break;
        case 'reveal':this.noise(.045,.19,0,6500);this.tone(1568,.085,.12,'triangle',0,null,784);break;
        case 'charge':this.impact(0,.9);this.tone(100,.22,.29,'sawtooth',.02,null,520);this.noise(.22,.29,0,1900);break;
        case 'slash':this.noise(.16,.5,0,6500);this.tone(1800,.16,.23,'sawtooth',0,null,190);this.noise(.12,.29,.09,4300);this.tone(2400,.13,.12,'triangle',.06,null,650);break;
        case 'paper':this.noise(.19,.42,0,4300);this.noise(.15,.33,.085,1900);this.tone(180,.23,.24,'triangle',0,null,1100);break;
        case 'damage':this.impact(0,.73);this.tone(520,.11,.21,'sawtooth',.012,null,105);break;
        case 'tie':this.tone(494,.11,.25,'triangle');this.tone(392,.15,.23,'triangle',.13);this.drum(.015,false);break;
        case 'win':this.impact(0,.72);[523,659,784].forEach((f,i)=>this.brass(f,.23,.055+i*.09,.95));this.sparkle(1568,.31,.7);break;
        case 'morale':[523,784,1047,1568].forEach((f,i)=>this.sparkle(f,i*.075,1));this.brass(392,.25,.22,.75);break;
        case 'force':this.impact(0,.95);this.tone(196,.35,.25,'sawtooth',.03,null,784);this.brass(392,.3,.17,1);this.sparkle(1175,.3,.8);break;
        case 'horn':this.stopMusic();this.brass(147,.48,0,1.05);this.tone(220,.48,.24,'sawtooth',.025,null,294);this.drum(.07,true);this.drum(.31,true);this.impact(.42,.5);break;
        case 'success':this.impact(0,1.05);[392,523,659,784,1047].forEach((f,i)=>this.brass(f,.31,.04+i*.085,1.12));[1047,1319,1568,2093].forEach((f,i)=>this.sparkle(f,.36+i*.075,.8));this.impact(.38,.55);break;
        case 'failure':this.tone(392,.15,.3,'triangle',0,null,294);this.brass(196,.23,.14,.9);this.tone(147,.24,.3,'sawtooth',.3,null,73);this.tone(82,.15,.25,'triangle',.47,null,124);break;
        case 'unify':this.stopMusic();this.impact(0,1.05);[392,523,659,784,1047,784,1047].forEach((f,i)=>{this.brass(f,.38,i*.12,1.1);if(i%2===0)this.drum(i*.12,true);});[1568,2093,1568,2093].forEach((f,i)=>this.sparkle(f,.52+i*.13,.85));break;
        case 'defeat':this.stopMusic();this.impact(0,.65);[392,294,220,147].forEach((f,i)=>this.brass(f,.3,i*.16,.9));this.tone(82,.3,.25,'triangle',.65,null,55);break;
      }
    }
  }
  window.WarAudio=WarAudio;
})();
