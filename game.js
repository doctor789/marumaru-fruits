const board = document.querySelector('#board');
const guide = document.querySelector('#drop-guide');
const scoreEl = document.querySelector('#score');
const nextEl = document.querySelector('#next-fruit');
const overlay = document.querySelector('#game-over');
const finalScore = document.querySelector('#final-score');

const fruits = [
  { emoji:'🍒', color:'#ff7c87', r:18, points:1 }, { emoji:'🍓', color:'#ff91a2', r:25, points:3 },
  { emoji:'🍊', color:'#ffb34f', r:33, points:6 }, { emoji:'🍎', color:'#ff6672', r:42, points:10 },
  { emoji:'🍐', color:'#b5d957', r:51, points:15 }, { emoji:'🍑', color:'#ff9e95', r:61, points:21 },
  { emoji:'🍍', color:'#f1cf4b', r:72, points:28 }, { emoji:'🍈', color:'#a8d978', r:84, points:36 },
  { emoji:'🍉', color:'#69bd6e', r:98, points:50 }
];
let items = [], score = 0, next = randomStart(), canDrop = true, over = false, last = performance.now();
const gravity = 1050, damping = .7;
function randomStart() { return Math.floor(Math.random() * 4); }
function setFruitVisual(el, type) { const f=fruits[type]; el.dataset.emoji=f.emoji; el.style.setProperty('--size',`${f.r*2}px`); el.style.width=`${f.r*2}px`; el.style.height=`${f.r*2}px`; el.style.background=f.color; }
function updateNext() { setFruitVisual(nextEl,next); }
function addFruit(type,x,y=28) { const f=fruits[type], el=document.createElement('div'); el.className='fruit'; setFruitVisual(el,type); board.append(el); items.push({type,x,y,vx:0,vy:0,r:f.r,el,dangerTime:0}); }
function boardX(e) { const r=board.getBoundingClientRect(); return Math.max(20,Math.min(r.width-20,e.clientX-r.left)); }
function moveGuide(e) { if (!over) guide.style.left=`${boardX(e)}px`; }
function drop(e) { if(over || !canDrop) return; const x=boardX(e), type=next; addFruit(type,x); next=randomStart(); updateNext(); canDrop=false; setTimeout(()=>canDrop=true,550); }
function updateScore(n) { score+=n; scoreEl.textContent=String(score).padStart(4,'0'); }
function merge(a,b) { if(a.type!==b.type || a.type>=fruits.length-1) return; const t=a.type+1, x=(a.x+b.x)/2,y=(a.y+b.y)/2; a.el.remove();b.el.remove();items=items.filter(i=>i!==a&&i!==b); addFruit(t,x,y); const fresh=items.at(-1); fresh.vy=-180; fresh.el.classList.add('pop'); updateScore(fruits[t].points); }
function physics(dt) { const w=board.clientWidth,h=board.clientHeight;
  for(const a of items){ a.vy+=gravity*dt;a.x+=a.vx*dt;a.y+=a.vy*dt; if(a.x-a.r<0){a.x=a.r;a.vx*=-damping} if(a.x+a.r>w){a.x=w-a.r;a.vx*=-damping} if(a.y+a.r>h){a.y=h-a.r;a.vy*=-damping;a.vx*=.96} }
  let merged=false;
  for(let i=0;i<items.length&&!merged;i++) for(let j=i+1;j<items.length&&!merged;j++){ const a=items[i],b=items[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||.01,min=a.r+b.r;
    if(dist<min){ if(a.type===b.type && a.type<fruits.length-1 && Math.abs(a.vy-b.vy)<380){merge(a,b);merged=true;break} const nx=dx/dist,ny=dy/dist,overlap=min-dist; a.x-=nx*overlap/2;a.y-=ny*overlap/2;b.x+=nx*overlap/2;b.y+=ny*overlap/2; const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny; if(rv<0){const impulse=-(1+damping)*rv/2;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny} }
  }
  for(const a of items){
    a.el.style.transform=`translate(${a.x-a.r}px,${a.y-a.r}px)`;
    a.dangerTime = a.y-a.r < 108 && Math.abs(a.vy)<35 ? a.dangerTime+dt : 0;
    if(a.dangerTime>1.2 && items.length>3) endGame();
  }
}
function endGame(){ over=true; overlay.classList.remove('hidden'); finalScore.textContent=score; }
function loop(now){ const dt=Math.min(.025,(now-last)/1000);last=now;if(!over)physics(dt);requestAnimationFrame(loop); }
function restart(){ items.forEach(i=>i.el.remove());items=[];score=0;scoreEl.textContent='0000';next=randomStart();updateNext();over=false;overlay.classList.add('hidden'); }
board.addEventListener('pointermove',moveGuide);board.addEventListener('pointerdown',drop);document.querySelector('#restart').addEventListener('click',restart);document.querySelector('#retry').addEventListener('click',restart);
updateNext(); guide.style.left='50%'; requestAnimationFrame(loop);
