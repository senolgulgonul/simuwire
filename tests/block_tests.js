// Simuwire block test suite
// Each block is simulated in a small model whose answer is known analytically.
// How to run: open Simuwire in a browser, open the developer console (F12),
// paste this whole file and press Enter. A PASS/FAIL table is printed.
(()=>{
const out=[];
function mk(stop,ws,step){const m=emptyModel();m.settings.stop=String(stop);m.settings.ws=ws||'';m.settings.step=step||'auto';return m;}
function add(m,type,p,extra){const d=BLOCKS[type];const b={id:'b'+(m.blocks.length+1),type,name:type+(m.blocks.length+1),x:m.blocks.length*90,y:0,w:d.w,h:d.h,p:Object.assign({...d.def},p||{})};Object.assign(b,extra||{});m.blocks.push(b);return b;}
function wire(m,a,b,port){m.lines.push({id:'l'+m.lines.length,src:{b:a.id,port:0},dst:{b:b.id,port:port||0}});}
function sample(r,sc,k,t){const s=r.scopes[sc.id];let best=0;for(let i=0;i<s.t.length;i++)if(Math.abs(s.t[i]-t)<Math.abs(s.t[best]-t))best=i;return s.ys[k||0][best];}
function check(name,m,sc,cases,tol){
  let r;try{r=simulate(m);}catch(e){out.push([name,'FAIL','error: '+e.message]);return;}
  let worst=0,info='';
  for(const [t,exp,k] of cases){const v=sample(r,sc,k,t);const err=Math.abs(v-exp);if(err>worst){worst=err;info=`t=${t}: got ${v.toFixed(5)}, expected ${exp.toFixed(5)}`;}}
  out.push([name,worst<=(tol||1e-3)?'PASS':'FAIL',`max error ${worst.toExponential(2)}${worst>(tol||1e-3)?' ('+info+')':''}`]);
}
const T=[0,0.5,1.25,2,3.3,5];
// 1 Constant
{const m=mk(5);const c=add(m,'Constant',{Value:'2*K'});const s=add(m,'Scope');wire(m,c,s);m.settings.ws='K=1.5';check('Constant (2*K)',m,s,T.map(t=>[t,3]));}
// 2 Step
{const m=mk(5);const c=add(m,'Step',{Time:'2',Before:'1',After:'5'});const s=add(m,'Scope');wire(m,c,s);check('Step',m,s,[[0,1],[1.9,1],[2,5],[4,5]]);}
// 3 Sine
{const m=mk(5,'','0.001');const c=add(m,'Sine',{Amplitude:'2',Bias:'1',Frequency:'3',Phase:'0.5'});const s=add(m,'Scope');wire(m,c,s);check('Sine Wave',m,s,T.map(t=>[t,2*Math.sin(3*t+0.5)+1]));}
// 4 Ramp
{const m=mk(5);const c=add(m,'Ramp',{slope:'2',start:'1',InitialOutput:'0.5'});const s=add(m,'Scope');wire(m,c,s);check('Ramp',m,s,[[0,0.5],[0.9,0.5],[2,2.5],[5,8.5]]);}
// 5 Pulse
{const m=mk(6,'','0.01');const c=add(m,'Pulse',{Amplitude:'2',Period:'2',PulseWidth:'25',PhaseDelay:'0.5'});const s=add(m,'Scope');wire(m,c,s);check('Pulse Generator',m,s,[[0.2,0],[0.6,2],[0.9,2],[1.2,0],[2.6,2],[3.2,0],[4.7,2]]);}
// 6 Clock
{const m=mk(5);const c=add(m,'Clock');const s=add(m,'Scope');wire(m,c,s);check('Clock',m,s,T.map(t=>[t,t]));}
// 7 Integrator
{const m=mk(5);const c=add(m,'Constant',{Value:'2'});const i=add(m,'Integrator',{InitialCondition:'1'});const s=add(m,'Scope');wire(m,c,i);wire(m,i,s);check('Integrator',m,s,T.map(t=>[t,1+2*t]));}
// 8 Derivative of ramp slope 3 and of sine
{const m=mk(5);const c=add(m,'Ramp',{slope:'3',start:'0'});const d=add(m,'Derivative');const s=add(m,'Scope');wire(m,c,d);wire(m,d,s);check('Derivative (ramp)',m,s,[[1,3],[2.5,3],[5,3]]);}
{const m=mk(5,'','0.001');const c=add(m,'Sine');const d=add(m,'Derivative');const s=add(m,'Scope');wire(m,c,d);wire(m,d,s);check('Derivative (sine, backward difference)',m,s,[[1,Math.cos(1)],[2.5,Math.cos(2.5)],[4,Math.cos(4)]],2e-3);}
// 9 Transfer functions
{const m=mk(6,'','0.001');const c=add(m,'Step',{Time:'0'});const f=add(m,'TransferFcn',{Numerator:'[1]',Denominator:'[1 1]'});const s=add(m,'Scope');wire(m,c,f);wire(m,f,s);check('Transfer Fcn 1/(s+1)',m,s,T.map(t=>[t,1-Math.exp(-t)]));}
{const m=mk(6,'','0.001');const c=add(m,'Step',{Time:'0'});const f=add(m,'TransferFcn',{Numerator:'[1]',Denominator:'[1 2 1]'});const s=add(m,'Scope');wire(m,c,f);wire(m,f,s);check('Transfer Fcn 1/(s+1)^2',m,s,T.map(t=>[t,1-(1+t)*Math.exp(-t)]));}
{const m=mk(6,'','0.001');const c=add(m,'Step',{Time:'0'});const f=add(m,'TransferFcn',{Numerator:'[1 2]',Denominator:'[1 1]'});const s=add(m,'Scope');wire(m,c,f);wire(m,f,s);check('Transfer Fcn (s+2)/(s+1), direct feedthrough',m,s,T.map(t=>[t,2-Math.exp(-t)]));}
{const m=mk(6,'','0.001');const c=add(m,'Step',{Time:'0'});const f=add(m,'TransferFcn',{Numerator:'[2]',Denominator:'[4 2]'});const s=add(m,'Scope');wire(m,c,f);wire(m,f,s);check('Transfer Fcn 2/(4s+2), non-monic',m,s,T.map(t=>[t,1-Math.exp(-0.5*t)]));}
{const m=mk(10,'','0.001');const c=add(m,'Step',{Time:'0'});const f=add(m,'TransferFcn',{Numerator:'[1]',Denominator:'[1 0.4 1]'});const s=add(m,'Scope');wire(m,c,f);wire(m,f,s);
 const z=0.2,wd=Math.sqrt(1-z*z);check('Transfer Fcn 1/(s²+0.4s+1)',m,s,[1,3,5,8].map(t=>[t,1-Math.exp(-z*t)*(Math.cos(wd*t)+z/wd*Math.sin(wd*t))]));}
// 10 Transport delay
{const m=mk(6,'','0.01');const c=add(m,'Sine');const d=add(m,'TransportDelay',{DelayTime:'0.37',InitialOutput:'0.25'});const s=add(m,'Scope');wire(m,c,d);wire(m,d,s);check('Transport Delay (0.37 s, interpolated)',m,s,[[0.2,0.25],[1,Math.sin(0.63)],[3.3,Math.sin(2.93)],[5,Math.sin(4.63)]],1e-3);}
// 11 PID variants, open loop with unit error
function pid(name,p,f){const m=mk(4,'','0.0005');const c=add(m,'Step',{Time:'0'});const q=add(m,'PID',p);const s=add(m,'Scope');wire(m,c,q);wire(m,q,s);check(name,m,s,[0.5,1,2,4].map(t=>[t,f(t)]),2e-3);}
pid('PID: P',{Controller:'P',P:'3'},t=>3);
pid('PID: PI parallel',{Controller:'PI',P:'2',I:'0.5'},t=>2+0.5*t);
pid('PID: I only',{Controller:'I',I:'1.5'},t=>1.5*t);
pid('PID: PD with filter',{Controller:'PD',P:'1',D:'0.5',N:'4'},t=>1+0.5*4*Math.exp(-4*t));
pid('PID: PID parallel',{Controller:'PID',P:'1',I:'2',D:'0.1',N:'10'},t=>1+2*t+0.1*10*Math.exp(-10*t));
pid('PID: PID ideal form',{Controller:'PID',Form:'Ideal',P:'2',I:'0.5',D:'0.1',N:'10'},t=>2*(1+0.5*t+0.1*10*Math.exp(-10*t)));
// 12 Discrete
{const m=mk(3,'','0.01');const c=add(m,'Clock');const z=add(m,'ZOH',{SampleTime:'0.5'});const s=add(m,'Scope');wire(m,c,z);wire(m,z,s);check('Zero-Order Hold',m,s,[[0.2,0],[0.7,0.5],[1.49,1],[2.6,2.5]]);}
{const m=mk(3,'','0.01');const c=add(m,'Clock');const z=add(m,'UnitDelay',{SampleTime:'0.5',InitialCondition:'-1'});const s=add(m,'Scope');wire(m,c,z);wire(m,z,s);check('Unit Delay',m,s,[[0.2,-1],[0.7,0],[1.2,0.5],[2.6,2]]);}
{const m=mk(1,'','0.1');const c=add(m,'Clock');const z=add(m,'UnitDelay',{SampleTime:'-1'});const s=add(m,'Scope');wire(m,c,z);wire(m,z,s);check('Unit Delay (inherited sample time)',m,s,[[0,0],[0.5,0.4],[1,0.9]]);}
{const m=mk(4,'','0.01');const c=add(m,'Constant',{Value:'1'});const su=add(m,'Sum',{Inputs:'++'});const z=add(m,'UnitDelay',{SampleTime:'1'});const s=add(m,'Scope');
 wire(m,c,su,0);wire(m,z,su,1);wire(m,su,z);wire(m,su,s);check('Unit Delay in a feedback loop (accumulator)',m,s,[[0.5,1],[1.5,2],[2.5,3],[3.5,4]]);}
// 13 Math
{const m=mk(1);const a=add(m,'Constant',{Value:'1'}),b=add(m,'Constant',{Value:'2'}),c=add(m,'Constant',{Value:'4'});const su=add(m,'Sum',{Inputs:'+-+'});const s=add(m,'Scope');wire(m,a,su,0);wire(m,b,su,1);wire(m,c,su,2);wire(m,su,s);check('Sum (+-+)',m,s,[[0.5,3]]);}
{const m=mk(1);const a=add(m,'Constant',{Value:'1'}),b=add(m,'Constant',{Value:'2'});const su=add(m,'Sum',{Inputs:'|-+'});const s=add(m,'Scope');wire(m,a,su,0);wire(m,b,su,1);wire(m,su,s);check('Sum (|-+), bottom input',m,s,[[0.5,1]]);}
{const m=mk(1);const a=add(m,'Constant',{Value:'3'});const g=add(m,'Gain',{Gain:'-2.5'});const s=add(m,'Scope');wire(m,a,g);wire(m,g,s);check('Gain',m,s,[[0.5,-7.5]]);}
{const m=mk(1);const a=add(m,'Constant',{Value:'6'}),b=add(m,'Constant',{Value:'3'});const p=add(m,'Product',{Inputs:'*/'});const s=add(m,'Scope');wire(m,a,p,0);wire(m,b,p,1);wire(m,p,s);check('Product (*/)',m,s,[[0.5,2]]);}
{const m=mk(1);const a=add(m,'Constant',{Value:'6'}),b=add(m,'Constant',{Value:'3'});const p=add(m,'Product',{Inputs:'2'});const s=add(m,'Scope');wire(m,a,p,0);wire(m,b,p,1);wire(m,p,s);check('Product (2 inputs)',m,s,[[0.5,18]]);}
{const m=mk(1);const a=add(m,'Constant',{Value:'-3'});const g=add(m,'Abs');const s=add(m,'Scope');wire(m,a,g);wire(m,g,s);check('Abs',m,s,[[0.5,3]]);}
// 14 Discontinuities
{const m=mk(4);const c=add(m,'Ramp',{slope:'1',start:'0',InitialOutput:'-1'});const g=add(m,'Saturation',{UpperLimit:'1',LowerLimit:'-0.5'});const s=add(m,'Scope');wire(m,c,g);wire(m,g,s);check('Saturation',m,s,[[0,-0.5],[0.25,-0.5],[1.2,0.2],[3,1]]);}
{const m=mk(4);const c=add(m,'Ramp',{slope:'1',start:'0',InitialOutput:'-2'});const g=add(m,'DeadZone',{LowerValue:'-0.5',UpperValue:'0.5'});const s=add(m,'Scope');wire(m,c,g);wire(m,g,s);check('Dead Zone',m,s,[[0,-1.5],[1.8,0],[2.2,0],[3.5,1]]);}
// 14b Relay
// sin(t) with switch-on 0.5 / switch-off −0.5: starts off, on at t = π/6, stays on through the band, off at t = 7π/6, on again at 13π/6
{const m=mk(8,'','0.001');const c=add(m,'Sine');const r=add(m,'Relay',{OnSwitchValue:'0.5',OffSwitchValue:'-0.5',OnOutputValue:'1',OffOutputValue:'-1'});const s=add(m,'Scope');wire(m,c,r);wire(m,r,s);
 check('Relay (hysteresis)',m,s,[[0,-1],[0.3,-1],[0.6,1],[1.5,1],[3.4,1],[3.75,-1],[5,-1],[6.5,-1],[6.9,1]]);}
{const m=mk(2);const c=add(m,'Constant',{Value:'2'});const r=add(m,'Relay',{OnSwitchValue:'1',OffSwitchValue:'0',OnOutputValue:'5',OffOutputValue:'0'});const s=add(m,'Scope');wire(m,c,r);wire(m,r,s);check('Relay (starts on)',m,s,[[0,5],[1,5]]);}
{const m=mk(2);const c=add(m,'Constant',{Value:'0.5'});const r=add(m,'Relay',{OnSwitchValue:'1',OffSwitchValue:'0'});const s=add(m,'Scope');wire(m,c,r);wire(m,r,s);check('Relay (inside band, starts off)',m,s,[[0,0],[1,0]]);}
// On-off loop: the relay drives 1/s from the error, band ±0.1 around 1. The output rises at slope 1 to 1.1, then
// falls at slope −1 to 0.9, and so on: a triangle wave between 0.9 and 1.1. With a fixed step the relay switches at
// the first step past each switching point, so the phase drifts slightly; the test checks the first peak and the band.
{const m=mk(3,'','0.001');const sp=add(m,'Constant',{Value:'1'});const su=add(m,'Sum',{Inputs:'|+-'});const r=add(m,'Relay',{OnSwitchValue:'0.1',OffSwitchValue:'-0.1',OnOutputValue:'1',OffOutputValue:'-1'});const i=add(m,'Integrator');const s=add(m,'Scope');
 wire(m,sp,su,0);wire(m,su,r);wire(m,r,i);wire(m,i,su,1);wire(m,i,s);
 try{const res=simulate(m).scopes[s.id];let hi=-Infinity,lo=Infinity;res.t.forEach((t,k)=>{if(t>1.2){hi=Math.max(hi,res.ys[0][k]);lo=Math.min(lo,res.ys[0][k]);}});
  const v05=sample({scopes:{[s.id]:res}},s,0,0.5),err=Math.max(Math.abs(hi-1.1),Math.abs(lo-0.9),Math.abs(v05-0.5));
  out.push(['Relay on-off loop (limit cycle)',err<=3e-3?'PASS':'FAIL',`band ${lo.toFixed(4)}…${hi.toFixed(4)}, max error ${err.toExponential(2)}`]);}
 catch(e){out.push(['Relay on-off loop (limit cycle)','FAIL','error: '+e.message]);}}
{const m=mk(2);const c=add(m,'Constant');const r=add(m,'Relay',{OnSwitchValue:'-1',OffSwitchValue:'1'});const s=add(m,'Scope');wire(m,c,r);wire(m,r,s);try{simulate(m);out.push(['Relay bad switch points rejected','FAIL','no error']);}catch(e){out.push(['Relay bad switch points rejected',/switch-off point/.test(e.message)?'PASS':'FAIL',e.message]);}}
// Model variables: a ';' inside a comment must not split the line
{const m=mk(1);m.settings.ws='K = 3;   % gain (V); see notes\nB = K*2; C = 1';const c=add(m,'Constant',{Value:'B+C'});const s=add(m,'Scope');wire(m,c,s);check('Variables: ; in comment',m,s,[[0,7],[1,7]]);}
// 14c Sample and hold around a continuous PI (ZOH on the measurement and on the controller output) must match the
// Forward Euler difference equation built from a Unit Delay: I[k+1] = I[k] + Ki·Ts·e[k], u[k] = Kp·e[k] + I[k].
// The held error is integrated over one sample period, which adds exactly Ts·e[k] to the integral.
{const m=mk(20,'Ts = 0.5','0.02');
 const sp=add(m,'Constant',{Value:'1'});
 const s1=add(m,'Sum',{Inputs:'|+-'}),pi=add(m,'PID',{Controller:'PI',P:'2',I:'1'}),dac=add(m,'ZOH',{SampleTime:'Ts'}),g1=add(m,'TransferFcn',{Numerator:'[1]',Denominator:'[1 2 1]'}),adc=add(m,'ZOH',{SampleTime:'Ts'});
 wire(m,sp,s1,0);wire(m,s1,pi);wire(m,pi,dac);wire(m,dac,g1);wire(m,g1,adc);wire(m,adc,s1,1);
 const s2=add(m,'Sum',{Inputs:'|+-'}),z=add(m,'ZOH',{SampleTime:'Ts'}),kp=add(m,'Gain',{Gain:'2'}),ki=add(m,'Gain',{Gain:'1*Ts'}),acc=add(m,'Sum',{Inputs:'|++'}),ud=add(m,'UnitDelay',{SampleTime:'Ts'}),us=add(m,'Sum',{Inputs:'|++'}),g2=add(m,'TransferFcn',{Numerator:'[1]',Denominator:'[1 2 1]'});
 wire(m,sp,s2,0);wire(m,s2,z);wire(m,z,kp);wire(m,z,ki);wire(m,ki,acc,0);wire(m,ud,acc,1);wire(m,acc,ud);wire(m,kp,us,0);wire(m,ud,us,1);wire(m,us,g2);wire(m,g2,s2,1);
 const sc=add(m,'Scope',{NumInputPorts:'2'});wire(m,g1,sc,0);wire(m,g2,sc,1);
 try{const r=simulate(m).scopes[sc.id];let err=0;for(let i=0;i<r.t.length;i++)err=Math.max(err,Math.abs(r.ys[0][i]-r.ys[1][i]));
  out.push(['ZOH + PI + ZOH = difference equation',err<=1e-6?'PASS':'FAIL',`max difference ${err.toExponential(2)}`]);}
 catch(e){out.push(['ZOH + PI + ZOH = difference equation','FAIL','error: '+e.message]);}}
// 14d PID output limits and anti-windup. Error +1 until t = 3, then −1; I controller, I = 1, upper limit 1.
//  none:             z = t keeps growing to 3 while u is stuck at 1, so u stays at 1 until z falls below 1 at t = 5
//  clamping:         z stops at 1 at t = 1, so u leaves the limit as soon as the error turns: u = 1 − (t − 3)
{const aw=(mode)=>{const m=mk(6,'','0.001');const c=add(m,'Step',{Time:'3',Before:'1',After:'-1'});
   const g=add(m,'PID',{Controller:'I',I:'1',LimitOutput:'on',UpperSaturationLimit:'1',LowerSaturationLimit:'-inf',AntiWindupMode:mode});const s=add(m,'Scope');wire(m,c,g);wire(m,g,s);return[m,s];};
 {const[m,s]=aw('none');check('PID limit, no anti-windup',m,s,[[0.5,0.5],[2,1],[4,1],[4.9,1],[5.5,0.5],[6,0]],2e-3);}
 {const[m,s]=aw('clamping');check('PID anti-windup, clamping',m,s,[[0.5,0.5],[2,1],[3.5,0.5],[4,0],[5,-1]],2e-3);}
}
// Limits on a P controller: v = 10·e is cut to the limits
{const m=mk(1);const c=add(m,'Constant',{Value:'1'});const g=add(m,'PID',{Controller:'P',P:'10',LimitOutput:'on',UpperSaturationLimit:'2',LowerSaturationLimit:'-2'});const s=add(m,'Scope');wire(m,c,g);wire(m,g,s);check('PID output limit',m,s,[[0,2],[1,2]]);}
{const m=mk(1);const c=add(m,'Constant');const g=add(m,'PID',{LimitOutput:'on',UpperSaturationLimit:'-1',LowerSaturationLimit:'1'});const s=add(m,'Scope');wire(m,c,g);wire(m,g,s);
 try{simulate(m);out.push(['PID bad limits rejected','FAIL','no error']);}catch(e){out.push(['PID bad limits rejected',/lower limit/.test(e.message)?'PASS':'FAIL',e.message]);}}
// 15 Switch
for(const [cr,lab,f] of [['u2 >= Threshold','u2 ≥ threshold',t=>t>=2?1:-1],['u2 > Threshold','u2 > threshold',t=>t>2?1:-1],['u2 ~= 0','u2 ≠ 0',t=>t!==0?1:-1]]){
 const m=mk(4,'','0.5');const a=add(m,'Constant',{Value:'1'}),c=add(m,'Clock'),b=add(m,'Constant',{Value:'-1'});const sw=add(m,'Switch',{Criteria:cr,Threshold:'2'});const s=add(m,'Scope');
 wire(m,a,sw,0);wire(m,c,sw,1);wire(m,b,sw,2);wire(m,sw,s);check('Switch ('+lab+')',m,s,[0,1,2,3].map(t=>[t,f(t)]));}
// 16 Fcn
{const m=mk(4,'k=3','0.001');const a=add(m,'Constant',{Value:'2'});const f=add(m,'Fcn',{Expr:'u^2 + k*sin(t)'});const s=add(m,'Scope');wire(m,a,f);wire(m,f,s);check('Fcn (u^2 + k*sin(t))',m,s,[1,2.5,4].map(t=>[t,4+3*Math.sin(t)]));}
{const m=mk(4);const a=add(m,'Constant',{Value:'2'});const f=add(m,'Fcn',{Expr:'exp(-u(1))*abs(-u)'});const s=add(m,'Scope');wire(m,a,f);wire(m,f,s);check('Fcn (u(1) syntax)',m,s,[[1,2*Math.exp(-2)]]);}
// 17 Display and multi-input Scope
{const m=mk(3);const a=add(m,'Constant',{Value:'7'});const d=add(m,'Display');wire(m,a,d);try{const r=simulate(m);out.push(['Display',Math.abs(r.displays[d.id]-7)<1e-12?'PASS':'FAIL','shows '+r.displays[d.id]]);}catch(e){out.push(['Display','FAIL',e.message]);}}
{const m=mk(2);const a=add(m,'Constant',{Value:'1'}),b=add(m,'Constant',{Value:'2'}),c=add(m,'Constant',{Value:'3'});const s=add(m,'Scope',{NumInputPorts:'3'});wire(m,a,s,0);wire(m,b,s,1);wire(m,c,s,2);check('Scope with 3 inputs',m,s,[[1,1,0],[1,2,1],[1,3,2]]);}
// 18 Closed loop with Euler solver
{const m=mk(5,'','0.001');m.settings.solver='ode1';const c=add(m,'Step',{Time:'0'});const su=add(m,'Sum',{Inputs:'|+-'});const i=add(m,'Integrator');const s=add(m,'Scope');wire(m,c,su,0);wire(m,su,i);wire(m,i,su,1);wire(m,i,s);check('Closed loop 1/(s+1) with ode1 (Euler)',m,s,[1,2,4].map(t=>[t,1-Math.exp(-t)]),2e-3);}
// 19 Error handling
{const m=mk(2);const g=add(m,'Gain');const su=add(m,'Sum',{Inputs:'++'});const c=add(m,'Constant');wire(m,c,su,0);wire(m,su,g);wire(m,g,su,1);try{simulate(m);out.push(['Algebraic loop detection','FAIL','no error raised']);}catch(e){out.push(['Algebraic loop detection',/Algebraic loop/.test(e.message)?'PASS':'FAIL',e.message.slice(0,60)]);}}
{const m=mk(2);const g=add(m,'Gain');const s=add(m,'Scope');wire(m,g,s);const r=simulate(m);out.push(['Unconnected input warning',r.warns.length===1?'PASS':'FAIL',r.warns.map(w=>w.msg).join('; ')]);}
{const m=mk(2);const c=add(m,'Constant',{Value:'Kx'});const s=add(m,'Scope');wire(m,c,s);try{simulate(m);out.push(['Undefined variable error','FAIL','no error']);}catch(e){out.push(['Undefined variable error',/undefined variable/.test(e.message)?'PASS':'FAIL',e.message]);}}
{const m=mk(2);const c=add(m,'Step',{Time:'0'});const f=add(m,'TransferFcn',{Numerator:'[1 0 0]',Denominator:'[1 1]'});const s=add(m,'Scope');wire(m,c,f);wire(m,f,s);try{simulate(m);out.push(['Improper TF rejected','FAIL','no error']);}catch(e){out.push(['Improper TF rejected','PASS',e.message.slice(0,70)]);}}
console.table(out.map(([test,result,details])=>({test,result,details})));
const passed=out.filter(r=>r[1]==='PASS').length;
console.log(`${passed} of ${out.length} tests passed`);
return `${passed} of ${out.length} tests passed`;
})();
