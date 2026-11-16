import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';
export class AssetManager {
 constructor(){this.loader=new GLTFLoader();this.cache=new Map();this.status='idle'}
 async get(url){if(!this.cache.has(url)){this.cache.set(url,this.loader.loadAsync(url).catch(e=>{this.cache.delete(url);throw e}))}return this.cache.get(url)}
 async instance(url){const g=await this.get(url);return {model:g.scene.clone(true),clips:g.animations}}
}
export function configureGraphics(renderer,sun,scene,mode){
 const presets={high:{ratio:1.75,shadow:2048,fog:95},balanced:{ratio:1.25,shadow:1024,fog:78},low:{ratio:1,shadow:512,fog:55}};
 const p=presets[mode]||presets.balanced;
 renderer.setPixelRatio(Math.min(devicePixelRatio,p.ratio));
 renderer.shadowMap.enabled=mode!=='low';
 sun.shadow.mapSize.set(p.shadow,p.shadow);sun.shadow.map?.dispose();sun.shadow.map=null;
 if(scene.fog)scene.fog.far=p.fog;
 return p;
}
export function materialTexture(kind){
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 const base=kind==='marble'?'#bdb4a5':kind==='wood'?'#765038':kind==='concrete'?'#777d7b':'#40484a';
 g.fillStyle=base;g.fillRect(0,0,256,256);
 let seed=17;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<2100;i++){const v=rand()*255;g.fillStyle=rand()>.5?'#ffffff':'#171717';g.globalAlpha=.012+rand()*.038;g.fillRect(rand()*256,rand()*256,1+rand()*8,1+rand()*4)}
 g.globalAlpha=kind==='marble'?.16:.12;
 for(let i=0;i<19;i++){g.strokeStyle=kind==='marble'?'#5d514a':'#261e1b';g.lineWidth=.5+rand()*1.7;g.beginPath();let x=rand()*256,y=rand()*256;g.moveTo(x,y);for(let j=0;j<9;j++){x+=rand()*40-20;y+=rand()*24-12;g.lineTo(x,y)}g.stroke()}
 g.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
export class AnimationState{
 constructor(model,clips){this.mixer=new THREE.AnimationMixer(model);this.actions={};for(const clip of clips)this.actions[clip.name.toLowerCase()]=this.mixer.clipAction(clip);this.current=null}
 play(name,fade=.18){const a=this.actions[name.toLowerCase()];if(!a||this.current===a)return false;a.reset().fadeIn(fade).play();if(this.current)this.current.fadeOut(fade);this.current=a;return true}
 update(dt){this.mixer.update(dt)}
}
