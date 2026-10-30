export const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`

// Volumetric-style cumulus: layered fbm noise, lit by sampling the density
// gradient toward the sun, over a soft pearl cloud bank. uPart opens the cloud
// curtain from the centre outwards (one time), then leaves a cloud sea on the horizon.
export const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uPart;
float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){
  vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z);
}
float fbm(vec3 p){ float a=.5,s=0.; for(int i=0;i<5;i++){ s+=a*noise(p); p=p*2.02+vec3(1.7,9.2,3.1); a*=.5; } return s; }
float cum(vec3 q){ return fbm(q)*.86 + fbm(q*3.3+vec3(5.,1.,2.))*.24 - .02; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - .5) * vec2(asp, 1.);
  float ux = (uv.x - .5) * 2.;
  p.x -= clamp(ux*5., -1., 1.) * smoothstep(0., .5, abs(ux)) * uPart * .7;
  float t = uTime * .012;

  // back layer: pale, slow, soft
  float raw = fbm(vec3(p*1.1 + vec2(7.,3.) + vec2(uTime*.002, 0.), t)) * 1.15;
  float db = smoothstep(.35, .85, raw);
  vec3 backc = mix(vec3(.70,.77,.89), vec3(.97,.97,.99), db);
  float ba = smoothstep(.12, .5, raw) * .97;

  // front layer: lit cumulus billows
  vec3 q = vec3(p*1.5 + vec2(uTime*.004, 0.), t);
  float r0 = cum(q), r1 = cum(q + vec3(-.04,.07,0.));
  float d0 = smoothstep(.46, .66, r0);
  float dif = clamp((r0 - r1)*9. + .5, 0., 1.);
  vec3 col = mix(vec3(.56,.63,.79), vec3(1.,.985,.96), .12 + .88*dif);
  col *= 1. - .10*d0*d0;
  col += (1.-d0) * smoothstep(0., .3, d0) * .14 * vec3(1.,.9,.7);

  vec3 pre = col*d0 + backc*ba*(1.-d0);
  float a = d0 + ba*(1.-d0);

  float open = mix(-.5, 1.4, uPart);
  float n = fbm(vec3(p*2. + 3., t)) - .5;
  float gate = smoothstep(open, open+.45, abs(ux) + n*.4);
  float amb = (1. - smoothstep(0., .7, uv.y)) * .95;
  float m = max(gate, amb);
  gl_FragColor = vec4(pre*m, a*m);
}`
