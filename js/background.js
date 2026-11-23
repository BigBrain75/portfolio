/* Живой фон: WebGL-аврора, молнии с искрами и подсветка за курсором. */
'use strict';

/* ---------- living WebGL background ---------- */
(function bg(){
  const c = $('#bg'); let gl = null;
  try { gl = c.getContext('webgl', {antialias:false, alpha:false, premultipliedAlpha:false, powerPreference:'low-power'}); } catch(e){}
  if (!gl) { c.remove(); return; }
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform float s;uniform float fl;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);
 for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.03+.17;a*=.5;}return v;}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
 float T=t*.05;
 vec2 q=vec2(fbm(p*1.3+vec2(0.,T)),fbm(p*1.3+vec2(5.2,1.3)-T));
 vec2 w=vec2(fbm(p*1.1+1.8*q+vec2(1.7,9.2)+.6*T),fbm(p*1.1+1.8*q+vec2(8.3,2.8)-.4*T));
 float f=fbm(p*.9+2.2*w);
 vec2 mp=(m-.5*r)/r.y;
 float md=exp(-2.4*length(p-mp));
 vec3 A1=vec3(.10,.30,.98),A2=vec3(.18,.80,1.0);
 vec3 B1=vec3(.34,.24,.98),B2=vec3(.25,.52,1.0);
 vec3 C1=vec3(.06,.36,.85),C2=vec3(.10,.85,.86);
 float k1=smoothstep(.05,.55,s),k2=smoothstep(.5,1.,s);
 vec3 c1=mix(mix(A1,B1,k1),C1,k2),c2=mix(mix(A2,B2,k1),C2,k2);
 vec3 col=vec3(.008,.012,.035);
 col+=vec3(.02,.06,.20)*smoothstep(.15,.85,f);
 col+=c1*pow(smoothstep(.3,1.05,f*length(q)*1.35),2.)*.62;
 col+=c2*pow(smoothstep(.5,1.,w.y*f*1.55),3.)*.5;
 col+=c1*md*.2;
 col+=(c2*.5+vec3(.04,.08,.25))*fl*(.25+.5*f);
 float vig=smoothstep(1.5,.1,length(p*vec2(.72,1.)));
 col*=.4+.6*vig;
 gl_FragColor=vec4(col,1.);
}`;
  function sh(type, src){ const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  let pr;
  try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw 0; }
  catch(e){ c.remove(); return; }
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr,'r'), uT = gl.getUniformLocation(pr,'t'), uM = gl.getUniformLocation(pr,'m'), uS = gl.getUniformLocation(pr,'s'), uFl = gl.getUniformLocation(pr,'fl');
  let W = 1, H = 1;
  function resize(){
    const d = Math.min(window.devicePixelRatio || 1, 2), k = innerWidth < 700 ? .55 : .45;
    W = Math.max(1, Math.round(innerWidth * d * k)); H = Math.max(1, Math.round(innerHeight * d * k));
    c.width = W; c.height = H; gl.viewport(0, 0, W, H);
  }
  resize(); addEventListener('resize', resize);
  let mx = .5, my = .55, tx = .5, ty = .55, sc = 0, running = true;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, {passive:true});
  const t0 = performance.now();
  function frame(now){
    const max = document.documentElement.scrollHeight - innerHeight;
    const target = max > 0 ? scrollY / max : 0;
    sc += (target - sc) * (RM ? 1 : .035); mx += (tx - mx) * .035; my += (ty - my) * .035;
    gl.uniform2f(uR, W, H); gl.uniform1f(uT, RM ? 30 : (now - t0) / 1000 + 20);
    gl.uniform2f(uM, mx * W, my * H); gl.uniform1f(uS, sc); gl.uniform1f(uFl, FLASH);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (running && !RM) requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { const was = running; running = !document.hidden; if (running && !was && !RM) requestAnimationFrame(frame); });
  requestAnimationFrame(t => { frame(t); c.classList.add('on'); });
  if (RM) addEventListener('scroll', () => requestAnimationFrame(frame), {passive:true});
})();

/* ---------- living lightning ---------- */
(function(){
  if (RM) return;
  const cv = $('#bolts'); if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  let W = 0, H = 0;
  function rs(){ const d = Math.min(window.devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0); }
  rs(); addEventListener('resize', rs);
  const bolts = [], sparks = [];
  const R = (a, b) => a + Math.random() * (b - a);
  function path(x1, y1, x2, y2, disp, steps){
    let p = [[x1, y1], [x2, y2]], off = disp;
    for (let k = 0; k < steps; k++){
      const n = [p[0]];
      for (let i = 0; i < p.length - 1; i++){
        const a = p[i], b = p[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, o = (Math.random() - .5) * off;
        n.push([(a[0] + b[0]) / 2 - dy / l * o, (a[1] + b[1]) / 2 + dx / l * o], b);
      }
      p = n; off *= .52;
    }
    return p;
  }
  function build(b){
    const len = Math.hypot(b.x2 - b.x1, b.y2 - b.y1);
    const main = path(b.x1, b.y1, b.x2, b.y2, len * .32, len > 300 ? 7 : 5);
    const segs = [{p: main, w: b.w}];
    const dir = Math.atan2(b.y2 - b.y1, b.x2 - b.x1);
    for (let i = 0; i < b.nb; i++){
      const j = (main.length * R(.15, .8)) | 0, sx = main[j][0], sy = main[j][1];
      const ang = dir + R(-1, 1) * .9, bl = len * R(.12, .35);
      segs.push({p: path(sx, sy, sx + Math.cos(ang) * bl, sy + Math.sin(ang) * bl, bl * .45, 5), w: b.w * .45});
    }
    b.segs = segs;
  }
  function strike(x1, y1, x2, y2, o){
    o = o || {};
    const b = {x1, y1, x2, y2, w: o.w || R(1.6, 2.6), nb: o.nb != null ? o.nb : (2 + Math.random() * 4 | 0), life: 0, max: o.max || R(420, 800), hue: R(198, 228), regen: 0};
    build(b); bolts.push(b);
    const n = o.sparks != null ? o.sparks : 22;
    for (let i = 0; i < n; i++){ const a = R(0, Math.PI * 2), s = R(1, 5.5); sparks.push({x: x2, y: y2, vx: Math.cos(a) * s, vy: Math.sin(a) * s - R(1, 3), life: 0, max: R(450, 1100), hue: b.hue}); }
    FLASH = Math.min(1.2, FLASH + (o.flash != null ? o.flash : .8));
  }
  function auto(){
    if (!document.hidden){
      const kind = Math.random();
      if (kind < .55){
        const x = R(.05, .95) * W;
        strike(x + R(-80, 80), -20, x + R(-W * .25, W * .25), R(.35, .8) * H);
        if (Math.random() < .35) setTimeout(() => { const x2 = R(.05, .95) * W; strike(x2, -20, x2 + R(-200, 200), R(.3, .7) * H, {flash: .5}); }, R(80, 240));
      } else if (kind < .8){
        const left = Math.random() < .5, y = R(.15, .85) * H;
        strike(left ? -20 : W + 20, y, left ? R(.25, .5) * W : R(.5, .75) * W, y + R(-150, 150), {flash: .5});
      } else {
        const x = R(.1, .9) * W, y = R(.15, .85) * H, a = R(0, 6.28), l = R(120, 280);
        strike(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, {w: 1.3, nb: 1, flash: .25, max: R(600, 1000), sparks: 12});
      }
    }
    setTimeout(auto, R(800, 2400));
  }
  setTimeout(auto, 900);
  addEventListener('pointerdown', e => {
    if (e.target.closest('a,button,input,textarea,select,label,.demo,.browser,.ov')) return;
    strike(e.clientX + R(-160, 160), -20, e.clientX, e.clientY, {w: 2.8, nb: 4, flash: 1, sparks: 40});
  });
  let lastC = 0;
  addEventListener('pointermove', e => {
    if (!FINE) return;
    const t = performance.now(); if (t - lastC < 140) return; lastC = t;
    if (Math.random() < .22){ const a = R(0, 6.28), l = R(25, 70); strike(e.clientX + Math.cos(a) * 10, e.clientY + Math.sin(a) * 10, e.clientX + Math.cos(a) * l, e.clientY + Math.sin(a) * l, {w: .8, nb: 0, flash: 0, max: R(160, 260), sparks: 5}); }
  }, {passive: true});
  function line(p){ ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.stroke(); }
  let last = performance.now(), dirty = false;
  function frame(t){
    const dt = Math.min(50, t - last); last = t;
    if (bolts.length || sparks.length || dirty){
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = bolts.length - 1; i >= 0; i--){
        const b = bolts[i]; b.life += dt; const k = b.life / b.max;
        if (k >= 1){ bolts.splice(i, 1); continue; }
        b.regen += dt; if (b.regen > 55){ b.regen = 0; build(b); }
        const a = Math.pow(1 - k, 1.3) * (Math.random() < .2 ? .35 : 1);
        for (const s of b.segs){
          ctx.strokeStyle = `hsla(${b.hue},100%,58%,${a * .1})`; ctx.lineWidth = s.w * 10; line(s.p);
          ctx.strokeStyle = `hsla(${b.hue},100%,64%,${a * .32})`; ctx.lineWidth = s.w * 3.4; line(s.p);
          ctx.strokeStyle = `hsla(${b.hue - 10},100%,93%,${a * .9})`; ctx.lineWidth = s.w; line(s.p);
        }
      }
      ctx.lineWidth = 1.4;
      for (let i = sparks.length - 1; i >= 0; i--){
        const p = sparks[i]; p.life += dt; const k = p.life / p.max;
        if (k >= 1){ sparks.splice(i, 1); continue; }
        const f = dt / 16; p.vy += .14 * f; p.vx *= Math.pow(.985, f); p.x += p.vx * f; p.y += p.vy * f;
        ctx.strokeStyle = `hsla(${p.hue},100%,${70 + 30 * (1 - k)}%,${1 - k})`;
        ctx.beginPath(); ctx.moveTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      dirty = bolts.length > 0 || sparks.length > 0;
    }
    FLASH *= Math.pow(.88, dt / 16);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ---------- cursor glow ---------- */
(function(){
  if (!FINE || RM) return;
  const g = $('.glow'); let x = -9999, y = 0, cx = x, cy = y, raf = 0;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (cx < -9000){ cx = x; cy = y; } if (!raf) raf = requestAnimationFrame(loop); }, {passive:true});
  function loop(){ cx += (x - cx) * .14; cy += (y - cy) * .14; g.style.transform = `translate3d(${cx}px,${cy}px,0)`; raf = (Math.abs(x-cx) + Math.abs(y-cy) > .5) ? requestAnimationFrame(loop) : 0; }
})();
