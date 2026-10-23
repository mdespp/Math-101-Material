const $ = id => document.getElementById(id);
const randint = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = a => a[randint(0,a.length-1)];
const nonzero = (a,b) => { let n=0; while(!n) n=randint(a,b); return n; };
const gcd = (a,b) => b ? gcd(b,a%b) : Math.abs(a);
const shuffle = arr => { const a=[...arr]; for(let i=a.length-1;i;i--){const j=randint(0,i);[a[i],a[j]]=[a[j],a[i]];} return a; };
const sign = n => n<0 ? `- ${Math.abs(n)}` : n>0 ? `+ ${n}` : "";
const coeff = (n,v="x") => n===0?'0':n===1?v:n===-1?`-${v}`:`${n}${v}`;
const term = (n,v='') => n===0?'':`${n<0?'-':'+'}${v&&Math.abs(n)===1?'':Math.abs(n)}${v}`;
const polynomial = terms => {
  const text=terms.map(([n,v=''])=>term(n,v)).join('');
  return text.replace(/^\+/,'')||'0';
};
const reverseIneq = s => ({'<':'>','>':'<','\\le':'\\ge','\\ge':'\\le'}[s]);
const intervalFor = (s,k) => s==='<'||s==='\\le'?`(-\\infty,${k}${s==='\\le'?']':')'}`:`${s==='\\ge'?'[':'('}${k},\\infty)`;
const frac = (n,d) => `\\frac{${n}}{${d}}`;
const reducePair = (n,d) => { const g=gcd(n,d); n/=g; d/=g; if(d<0){n=-n;d=-d;} return [n,d]; };
const ratTex = (n,d=1) => { [n,d]=reducePair(n,d); if(d===1)return `${n}`; return n<0?`-${frac(Math.abs(n),d)}`:frac(n,d); };
// Match the original practice site's coefficient notation.
const ratVarTex = (n,d=1,v='x') => {
  [n,d]=reducePair(n,d);
  if(n===0)return '0';
  if(d===1)return coeff(n,v);
  return `${ratTex(n,d)}${v}`;
};
const ratTimesTex = (n,d=1,expr='x') => {
  [n,d]=reducePair(n,d);
  const factor = d===1 ? (n===1?'':n===-1?'-':`${n}`) : ratTex(n,d);
  return `${factor}\\left(${expr}\\right)`;
};
const linTex = (a,b,v='x') => polynomial([[a,v],[b]]);
const diffTex = (v,variable) => v>0 ? `${variable}-${v}` : v<0 ? `${variable}+${Math.abs(v)}` : variable;
const cleanTex = s => String(s)
  // TeX commands must be separated from adjacent variable letters.
  .replace(/\\(le|ge|lt|gt)(?=[xyhw](?:[^A-Za-z]|$))/g,'\\$1 ')
  .replace(/([+\-])\s*0(?![\d.])(?=\s*(?:[+\-=<>|)]|$))/g,'');
const math = s => `<div class="math">\\[${cleanTex(s)}\\]</div>`;
const inlineMath = s => `\\(${cleanTex(s)}\\)`;
const answer = s => `<div class="answer"><div class="answer-label">Answer</div>${math(s)}</div>`;
const steps = (...items) => `<ol>${items.map(x=>`<li>${x}</li>`).join("")}</ol>`;
const answerRows = rows => `<div class="answer answer-rows">${rows.map(([label,tex])=>`<div class="answer-row"><strong>${label}</strong>${math(tex)}</div>`).join("")}</div>`;
// SVG math keeps fraction bars, symbols, and baselines in one drawing.
let typesetQueue = Promise.resolve();
const typeset = el => {
  typesetQueue = typesetQueue.then(async () => {
    await MathJax.startup.promise;
    MathJax.typesetClear([el]);
    await MathJax.typesetPromise([el]);
  }).catch(error => console.error('Math rendering failed:', error));
  return typesetQueue;
};

function blankNumberLine(min=-6,max=6){
  const W=620,H=105,pad=42,X=x=>pad+(x-min)*(W-2*pad)/(max-min);
  let ticks="";
  for(let x=min;x<=max;x++) ticks+=`<line class="number-tick" x1="${X(x)}" y1="43" x2="${X(x)}" y2="59"/><text class="graph-label" x="${X(x)}" y="80" text-anchor="middle">${x}</text>`;
  return `<div class="number-line-wrap"><svg viewBox="0 0 ${W} ${H}"><line class="number-axis" x1="${pad}" y1="51" x2="${W-pad}" y2="51"/>${ticks}</svg></div>`;
}
function intervalNumberLine(left,right,leftClosed,rightClosed,leftInf=false,rightInf=false,min=-6,max=6){
  const W=620,H=105,pad=42,X=x=>pad+(x-min)*(W-2*pad)/(max-min);
  let ticks=""; for(let x=min;x<=max;x++) ticks+=`<line class="number-tick" x1="${X(x)}" y1="43" x2="${X(x)}" y2="59"/><text class="graph-label" x="${X(x)}" y="80" text-anchor="middle">${x}</text>`;
  const a=leftInf?pad:X(left), b=rightInf?W-pad:X(right);
  let marks=`<line class="number-shade" x1="${a}" y1="51" x2="${b}" y2="51"/>`;
  if(!leftInf) marks+=`<circle class="number-point ${leftClosed?'closed':'open'}" cx="${X(left)}" cy="51" r="7"/>`;
  if(!rightInf) marks+=`<circle class="number-point ${rightClosed?'closed':'open'}" cx="${X(right)}" cy="51" r="7"/>`;
  if(leftInf) marks+=`<polygon class="number-arrow" points="${pad},51 ${pad+14},43 ${pad+14},59"/>`;
  if(rightInf) marks+=`<polygon class="number-arrow" points="${W-pad},51 ${W-pad-14},43 ${W-pad-14},59"/>`;
  return `<div class="number-line-wrap"><svg viewBox="0 0 ${W} ${H}"><line class="number-axis" x1="${pad}" y1="51" x2="${W-pad}" y2="51"/>${ticks}${marks}</svg></div>`;
}
function gridBase(min=-6,max=6,W=480,H=360){
  const pad=35,X=x=>pad+(x-min)*(W-2*pad)/(max-min),Y=y=>H-pad-(y-min)*(H-2*pad)/(max-min);
  let g=""; for(let n=min;n<=max;n++){
    g+=`<line class="graph-grid" x1="${X(n)}" y1="${pad}" x2="${X(n)}" y2="${H-pad}"/><line class="graph-grid" x1="${pad}" y1="${Y(n)}" x2="${W-pad}" y2="${Y(n)}"/>`;
    if(n!==0) g+=`<text class="graph-label" x="${X(n)}" y="${Y(0)+17}" text-anchor="middle">${n}</text><text class="graph-label" x="${X(0)-7}" y="${Y(n)+4}" text-anchor="end">${n}</text>`;
  }
  g+=`<line class="graph-axis" x1="${X(0)}" y1="${pad}" x2="${X(0)}" y2="${H-pad}"/><line class="graph-axis" x1="${pad}" y1="${Y(0)}" x2="${W-pad}" y2="${Y(0)}"/>`;
  return {W,H,pad,X,Y,g,min,max};
}
function blankGrid(){ const b=gridBase(); return `<div class="graph-wrap"><svg viewBox="0 0 ${b.W} ${b.H}">${b.g}</svg></div>`; }
function lineGraph(m,b,dashed=false){
  const z=gridBase(), pts=[]; for(let x=z.min;x<=z.max;x+=.1){const y=m*x+b;if(y>=z.min-.2&&y<=z.max+.2)pts.push([x,y]);}
  const path=pts.map((p,i)=>`${i?'L':'M'}${z.X(p[0]).toFixed(1)},${z.Y(p[1]).toFixed(1)}`).join(' ');
  return `<div class="graph-wrap"><svg viewBox="0 0 ${z.W} ${z.H}">${z.g}<path class="graph-boundary ${dashed?'dashed':''}" d="${path}"/></svg></div>`;
}
function quadraticGraph(a,b,c,points){
  const z=gridBase(-6,6,480,360), pts=[]; for(let x=-4;x<=4;x+=.08){const y=a*x*x+b*x+c;if(y>=-6.2&&y<=6.2)pts.push([x,y]);}
  const path=pts.map((p,i)=>`${i?'L':'M'}${z.X(p[0]).toFixed(1)},${z.Y(p[1]).toFixed(1)}`).join(' ');
  const dots=points.filter(p=>p[1]>=-6&&p[1]<=6).map(([x,y])=>`<circle class="graph-point" cx="${z.X(x)}" cy="${z.Y(y)}" r="5"/>`).join('');
  return `<div class="graph-wrap"><svg viewBox="0 0 ${z.W} ${z.H}">${z.g}<path class="graph-curve" d="${path}"/>${dots}</svg></div>`;
}
function domainGraph(l,r,cl,cr){
  const z=gridBase(-6,6,480,300), pts=[]; for(let x=l;x<=r;x+=(r-l)/80){const t=(x-l)/(r-l),y=1.5*Math.sin(Math.PI*t)-1+t;pts.push([x,y]);}
  const path=pts.map((p,i)=>`${i?'L':'M'}${z.X(p[0]).toFixed(1)},${z.Y(p[1]).toFixed(1)}`).join(' ');
  const end=(x,y,c)=>`<circle class="graph-point ${c?'':'open-endpoint'}" cx="${z.X(x)}" cy="${z.Y(y)}" r="6"/>`;
  return `<div class="graph-wrap"><svg viewBox="0 0 ${z.W} ${z.H}">${z.g}<path class="graph-curve" d="${path}"/>${end(l,-1,cl)}${end(r,0,cr)}</svg></div>`;
}

// ---------------- EXAM 1 ----------------
function e1Linear(){
  const x=randint(-6,6), a=pick([3,4,5,6,7]), b=randint(-12,12), c=pick([-5,-3,2,4]), d=a*x+b-c*x;
  const A=a-c, B=d-b;
  if(A===0)return e1Linear();
  const moveX = c>=0 ? `-${c}x` : `+${Math.abs(c)}x`;
  const moveB = b>=0 ? `-${b}` : `+${Math.abs(b)}`;
  return {key:`e1lin${x}${a}${b}${c}`,label:"Solve a linear equation",q:`Solve for ${inlineMath('x')}: ${math(`${a}x ${sign(b)} = ${c}x ${sign(d)}`)}`,s:steps(
    `Move the ${inlineMath('x')}-terms to the left: ${math(`${a}x ${sign(b)} ${moveX}=${c}x ${sign(d)} ${moveX}`)}${math(`${A}x ${sign(b)}=${d}`)}`,
    `Move the constant term to the right: ${math(`${A}x=${B}`)}`,
    `Divide both sides by ${inlineMath(A)}: ${math(`x=${frac(B,A)}=${x}`)}`
  )+answer(`x=${x}`)};
}
function e1Fraction(){
  const pairs=[[2,7],[3,5],[3,7],[4,5]];
  let den1,den2,lcd,x,a,c,b,r,k,m1,m2,leftCoef,leftConst,rightCoef,rightConst,finalCoef,finalConst,tries=0;
  do{
    [den1,den2]=pick(pairs); lcd=den1*den2/gcd(den1,den2);
    x=pick([-6,-4,-3,-2,2,3,4,5,6]); a=nonzero(-5,5); c=pick([2,3,4,5]); b=nonzero(-6,6); r=pick([-2,-1,1,2]);
    k=(x+a)/den1-(c*x+b)/den2-r*x;
    m1=lcd/den1; m2=lcd/den2;
    leftCoef=m1-m2*c; leftConst=m1*a-m2*b; rightCoef=lcd*r; rightConst=lcd*k;
    finalCoef=leftCoef-rightCoef; finalConst=rightConst-leftConst; tries++;
  }while((!Number.isInteger(k)||Math.abs(k)>18||finalCoef===0||a%den1===0||c%den2===0||finalConst/finalCoef!==x)&&tries<500);
  const rhs=`${coeff(r)}${sign(k)}`;
  return {key:`e1f${den1}${den2}${a}${b}${c}${r}${k}`,label:"Equation with fractions",q:`Solve: ${math(`${frac(`x${sign(a)}`,den1)}\\; - \\;${frac(`${coeff(c)}${sign(b)}`,den2)}=${rhs}`)}`,s:steps(
    `The LCD is ${inlineMath(lcd)}. Multiply the entire equation by ${inlineMath(lcd)}: ${math(`${lcd}\\bigg(${frac(`x${sign(a)}`,den1)}-${frac(`${coeff(c)}${sign(b)}`,den2)}\\bigg)=${lcd}(${rhs})`)}`,
    `Cancel the denominators: ${math(`${m1}(x${sign(a)})-${m2}(${coeff(c)}${sign(b)})=${rightCoef}x${sign(rightConst)}`)}`,
    `Distribute: ${math(`${coeff(m1)}${sign(m1*a)}-${coeff(m2*c)}${sign(m2*b)}=${rightCoef}x${sign(rightConst)}`)}`,
    `Combine like terms: ${math(`${coeff(leftCoef)}${sign(leftConst)}=${rightCoef}x${sign(rightConst)}`)}`,
    `Move the ${inlineMath('x')}-terms to one side and constants to the other: ${math(`${coeff(finalCoef)}=${finalConst}`)}`,
    `Divide by ${inlineMath(finalCoef)}: ${math(`x=${frac(finalConst,finalCoef)}=${x}`)}`
  )+answer(`x=${x}`)};
}
function e1System(){
  const x=randint(-4,5),y=randint(-4,5),a=pick([2,3,4]),b=pick([1,2,3]),c=pick([-3,-2,2,3]),d=pick([1,2,4]);
  const e=a*x+b*y,f=c*x+d*y;
  if(a*d-b*c===0) return e1System();
  // Eliminate y using multipliers d and -b.
  const A1=a*d, E1=e*d, A2=-c*b, E2=-f*b, xcoef=A1+A2, rhs=E1+E2;
  return {key:`e1sys${x}${y}${a}${b}${c}${d}`,label:"Solve a system",q:`Solve the system: ${math(`\\begin{cases}${a}x+${b}y=${e}\\\\${c}x${d>=0?'+':''}${d}y=${f}\\end{cases}`)}`,s:steps(
    `Eliminate ${inlineMath('y')}. Multiply the first equation by ${inlineMath(d)} and the second by ${inlineMath(-b)}: ${math(`\\begin{aligned}${A1}x+${b*d}y&=${E1}\\\\${A2}x-${b*d}y&=${E2}\\end{aligned}`)}`,
    `Add the equations: ${math(`${xcoef}x=${rhs}`)}`,
    `Solve for ${inlineMath('x')}: ${math(`x=${x}`)}`,
    `Substitute ${inlineMath(`x=${x}`)} into the first original equation: ${math(`${a}(${x})+${b}y=${e}`)}${math(`${b}y=${e-a*x}\\qquad y=${y}`)}`
  )+answer(`(${x},${y})`)};
}
function e1PairedLines(){
  const m=pick([-4,-3,-2,2,3,4]), b=randint(-10,10),x0=randint(-4,4),y0=randint(-6,6),pb=y0-m*x0;
  let [n,d]=reducePair(-1,m);
  const perpBNum=y0*d-n*x0, perpB=ratTex(perpBNum,d);
  const par=`y=${m}x${sign(pb)}`;
  const perpSlope=ratTex(n,d);
  const perp=`y=${ratVarTex(n,d,'x')}${perpBNum===0?'':perpBNum>0?`+${perpB}`:`-${ratTex(Math.abs(perpBNum),d)}`}`;
  const parConst=-m*x0;
  const perpConstNum=-n*x0;
  const pointSlopeX = x0===0 ? 'x' : `\\left(${diffTex(x0,"x")}\\right)`;
  return {key:`e1pair${m}${b}${x0}${y0}`,label:"Parallel & perpendicular lines",q:`Line 1 is ${inlineMath(`y=${m}x${sign(b)}`)}. Find the equations of the parallel and perpendicular lines through ${inlineMath(`(${x0},${y0})`)}.`,s:
    `<h4>(a) Parallel line</h4>`+steps(
      `Parallel lines have the same slope, so ${inlineMath(`m=${m}`)}.`,
      `Use point-slope form and substitute the point: ${math(`${diffTex(y0,"y")}=${m}${pointSlopeX}`)}`,
      `Distribute: ${math(`${diffTex(y0,"y")}=${m}x${sign(parConst)}`)}`,
      `Add ${inlineMath(y0)} to both sides and simplify: ${math(par)}`
    )+answer(par)+
    `<h4>(b) Perpendicular line</h4>`+steps(
      `Take the negative reciprocal of ${inlineMath(m)}: ${math(`m_{\\perp}=${perpSlope}`)}`,
      `Use the same point in point-slope form: ${math(`${diffTex(y0,"y")}=${ratTimesTex(n,d,diffTex(x0,"x"))}`)}`,
      `Distribute: ${math(`${diffTex(y0,"y")}=${ratVarTex(n,d,'x')}${perpConstNum===0?'':perpConstNum>0?`+${ratTex(perpConstNum,d)}`:`-${ratTex(Math.abs(perpConstNum),d)}`}`)}`,
      `Add ${inlineMath(y0)} to both sides and combine the constants: ${math(perp)}`
    )+answer(perp)};
}
function e1LinePoints(){
  const m=pick([-5,-3,-2,2,3,4]),b=randint(-9,9),x1=randint(-4,0),x2=x1+pick([2,3,4]),y1=m*x1+b,y2=m*x2+b;
  const dy=y2-y1, dx=x2-x1;
  return {key:`e1pts${m}${b}${x1}`,label:"Line through two points",q:`Find the equation of the line through ${inlineMath(`(${x1},${y1})`)} and ${inlineMath(`(${x2},${y2})`)} in slope-intercept form.`,s:steps(
    `Find the slope: ${math(`m=${frac(`${y2}-(${y1})`,`${x2}-(${x1})`)}=${frac(dy,dx)}=${m}`)}`,
    `Use ${inlineMath('y=mx+b')} with ${inlineMath(`(${x1},${y1})`)}: ${math(`${y1}=${m}(${x1})+b`)}`,
    `Solve for ${inlineMath('b')}: ${math(`b=${b}`)}`,
    `Write the equation in slope-intercept form: ${math(`y=${m}x${sign(b)}`)}`
  )+answer(`y=${m}x${sign(b)}`)};
}
function e1GraphLine(){
  const m=pick([-3,-2,-1,1,2,3]),b=randint(-5,5);
  const x2=1,y2=m+b;
  return {key:`e1gl${m}${b}`,label:"Graph a line",q:`Graph ${inlineMath(`y=${m}x${sign(b)}`)}.${blankGrid()}`,s:steps(
    `The y-intercept is ${inlineMath(`(0,${b})`)}. Plot it first.`,
    `The slope is ${inlineMath(m)}. From the intercept, use the slope to get another point, such as ${inlineMath(`(${x2},${y2})`)}.`,
    `Draw a straight line through the points and extend it in both directions.`
  )+lineGraph(m,b)};
}
function e1Quadratic(){
  const a=pick([-1,1]),b=pick([-2,-1,1,2]),c=pick([-2,-1,1,2]),pts=[-2,-1,0,1,2].map(x=>[x,a*x*x+b*x+c]);
  const f=`${a===-1?'-':''}x^2${b>=0?'+':''}${b}x${sign(c)}`;
  return {key:`e1q${a}${b}${c}`,label:"Graph a quadratic from a table",q:`Sketch ${inlineMath(`y=${f}`)} using ${inlineMath('x=-2,-1,0,1,2')}.`,s:steps(
    `Substitute each given ${inlineMath('x')}-value into ${inlineMath(`y=${f}`)}.`,
    math(`\\begin{array}{c|ccccc}x&-2&-1&0&1&2\\\\\\hline y&${pts.map(p=>p[1]).join('&')}\\end{array}`),
    `Plot the five ordered pairs.`,
    `Connect them with a smooth curve.`
  )+quadraticGraph(a,b,c,pts)};
}
function e1Domain(){
  const l=randint(-5,-2),r=randint(1,5),cl=Math.random()>.5,cr=Math.random()>.5;
  return {key:`e1dom${l}${r}${cl}${cr}`,label:"Domain from a graph",q:`Write the domain in interval notation.${domainGraph(l,r,cl,cr)}`,s:steps(
    `Read the ${inlineMath('x')}-values covered by the graph from left to right: from ${inlineMath(l)} to ${inlineMath(r)}.`,
    `${cl?'The left endpoint is filled, so include it with a bracket.':'The left endpoint is open, so use a parenthesis.'}`,
    `${cr?'The right endpoint is filled, so include it with a bracket.':'The right endpoint is open, so use a parenthesis.'}`
  )+answer(`${cl?'[':'('}${l},${r}${cr?']':')'}`)};
}
function e1NumberIneq(){
  const k=randint(-5,5),less=Math.random()>.5,equal=Math.random()>.5,sym=less?(equal?'\\le':'<'):(equal?'\\ge':'>');
  const int=less?`(-\\infty,${k}${equal?']':')'}`:`${equal?'[':'('}${k},\\infty)`;
  return {key:`e1ni${k}${sym}`,label:"Graph a one-variable inequality",q:`Graph ${inlineMath(`x${sym}${k}`)} and write the solution in interval notation.${blankNumberLine()}`,s:steps(
    `${equal?'Use a closed point because the endpoint is included.':'Use an open point because the endpoint is not included.'}`,
    `Place the point at ${inlineMath(k)} and shade ${less?'left':'right'}.`,
    `Write the graph in interval notation.`
  )+intervalNumberLine(k,k,equal,equal,less,!less)+answer(int)};
}
function e1Evaluate(){
  const x=pick([-3,-2,2,3]),a=pick([2,3,4]),b=pick([-3,-1,2]),c=pick([-5,1,4]),d=randint(-5,5),v=a*x**3+b*x**2+c*x+d;
  const t1=a*x**3,t2=b*x**2,t3=c*x;
  const sub=`${a}(${x})^3${b>=0?'+':''}${b}(${x})^2${c>=0?'+':''}${c}(${x})${sign(d)}`;
  return {key:`e1ev${x}${a}${b}${c}${d}`,label:"Evaluate a function",q:`Let ${inlineMath(`f(x)=${a}x^3${b>=0?'+':''}${b}x^2${c>=0?'+':''}${c}x${sign(d)}`)}. Find ${inlineMath(`f(${x})`)}.`,s:steps(
    `Substitute ${inlineMath(`x=${x}`)}. Use parentheses around the input: ${math(`f(${x})=${sub}`)}`,
    `Evaluate the powers and multiplication: ${math(`f(${x})=${t1}${sign(t2)}${sign(t3)}${sign(d)}`)}`,
    `Combine the terms: ${math(`f(${x})=${v}`)}`
  )+answer(`f(${x})=${v}`)};
}
function e1Exponent(){
  const a=pick([3,4,5]),b=pick([1,2]),c=pick([4,5]),d=pick([1,2]),ox=a+b,oy=c+d;
  return {key:`e1exp${a}${b}${c}${d}`,label:"Simplify exponents",q:`Simplify completely: ${math(frac(`x^{${a}}y^{-${d}}`,`x^{-${b}}y^{${c}}`))}`,s:steps(
    `Subtract exponents when dividing like bases: ${math(`x^{${a}-(-${b})}y^{-${d}-${c}}`)}`,
    `Simplify the exponents: ${math(`x^{${ox}}y^{-${oy}}`)}`,
    `Move the factor with the negative exponent to the denominator: ${math(frac(`x^{${ox}}`,`y^{${oy}}`))}`
  )+answer(frac(`x^{${ox}}`,`y^{${oy}}`))};
}
function e1Scientific(){
  const n=(randint(121,989)/100).toFixed(2),e=pick([3,4,5,6]),v=Number(n)*10**e;
  return {key:`e1sci${n}${e}`,label:"Scientific notation",q:`Rewrite as a whole number or decimal: ${math(`${n}\\times10^{${e}}`)}`,s:steps(
    `The exponent ${inlineMath(e)} is positive, so move the decimal ${e} places to the right.`,
    `Add zeros if needed: ${math(`${n}\\times10^{${e}}=${v}`)}`
  )+answer(String(v))};
}
function e1Absolute(){
  const n=randint(-40,-2);
  return {key:`e1abs${n}`,label:"Absolute value",q:`Evaluate ${inlineMath(`-|${n}|`)}.`,s:steps(
    `Evaluate inside the absolute-value bars first: ${math(`|${n}|=${Math.abs(n)}`)}`,
    `Now apply the negative sign outside: ${math(`-${Math.abs(n)}`)}`
  )+answer(`-${Math.abs(n)}`)};
}
function e1App(kind){
  kind=kind||pick(['average','salary','mixture','bills','marbles']);
  if(kind==='average'){
    const scores=[randint(64,78),randint(72,84),randint(72,84),randint(72,84)],w=pick([2,3,4]),target=80,sum=scores.reduce((a,b)=>a+b,0),num=target*(4+w)-sum;
    return {key:`e1avg${scores.join('')}${w}`,label:"Application · weighted average",q:`A student has test scores ${scores.join(', ')}. The final is worth ${w} test grades. What final-exam score gives an 80% average?`,s:steps(
      `Add the current scores: ${math(`${scores.join('+')}=${sum}`)}`,
      `The final counts ${w} times, so write ${math(frac(`${sum}+${w}x`,4+w)+`=80`)}`,
      `Multiply by ${inlineMath(4+w)}: ${math(`${sum}+${w}x=${target*(4+w)}`)}`,
      `Subtract ${inlineMath(sum)} and divide by ${inlineMath(w)}: ${math(`x=${ratTex(num,w)}`)}`
    )+answer(`x=${ratTex(num,w)}`)};
  }
  if(kind==='salary'){
    const monthly=pick([5250,5875,6425]),bonus=pick([4800,6000,7200]),total=12*monthly+bonus;
    return {key:`e1sal${monthly}${bonus}`,label:"Application · salary",q:`An employee earns $${total.toLocaleString()} per year including a $${bonus.toLocaleString()} bonus. Find the monthly salary.`,s:steps(
      `Subtract the one-time bonus: ${math(`${total}-${bonus}=${12*monthly}`)}`,
      `The remaining amount is 12 months of salary: ${math(`12x=${12*monthly}`)}`,
      `Divide by 12: ${math(`x=${monthly}`)}`
    )+answer(`\\$${monthly.toLocaleString()}`)};
  }
  if(kind==='mixture'){
    const low=20,high=40,total=100,x=30,y=70,target=(low*x+high*y)/total;
    return {key:`e1mix${randint(1,999)}`,label:"Application · mixture",q:`How many mL of 20% solution and 40% solution make 100 mL of a ${target}% solution?`,s:steps(
      `Let ${inlineMath('x')} be the 20% solution and ${inlineMath('y')} be the 40% solution.`,
      `Total amount: ${math(`x+y=100`)}`,
      `Pure solution: ${math(`0.20x+0.40y=${target}`)}`,
      `From ${inlineMath('x+y=100')}, use ${inlineMath('x=100-y')}. Substitute: ${math(`0.20(100-y)+0.40y=${target}`)}`,
      `Solve: ${math(`20+0.20y=${target}\\qquad y=70\\qquad x=30`)}`
    )+answerRows([["20% solution",`30\\text{ mL}`],["40% solution",`70\\text{ mL}`]])};
  }
  if(kind==='bills'){
    const t=pick([25,30,35]),f=2*t,total=10*t+5*f;
    return {key:`e1bill${t}`,label:"Application · money",q:`A register has twice as many $5 bills as $10 bills and $${total} total. How many $10 bills are there?`,s:steps(
      `Let ${inlineMath('t')} be the number of $10 bills. Then there are ${inlineMath('2t')} five-dollar bills.`,
      `Use the value of the bills: ${math(`10t+5(2t)=${total}`)}`,
      `Combine like terms: ${math(`20t=${total}`)}`,
      `Divide by 20: ${math(`t=${t}`)}`
    )+answer(`${t}\\text{ ten-dollar bills}`)};
  }
  const blue=pick([24,30,36]),diff=pick([7,9,11]),green=blue+diff,total=blue+green;
  return {key:`e1mar${blue}${diff}`,label:"Application · quantities",q:`A bag has ${total} blue and green marbles. There are ${diff} more green than blue. Find each amount.`,s:steps(
    `Let ${inlineMath('b')} be blue marbles. Then green marbles are ${inlineMath(`b+${diff}`)}.`,
    `Use the total: ${math(`b+(b+${diff})=${total}`)}`,
    `Combine like terms: ${math(`2b+${diff}=${total}`)}`,
    `Subtract ${inlineMath(diff)} and divide by 2: ${math(`2b=${total-diff}\\qquad b=${blue}`)}`,
    `Green: ${math(`${blue}+${diff}=${green}`)}`
  )+answerRows([["Blue",`${blue}`],["Green",`${green}`]])};
}

// ---------------- EXAM 2 ----------------
function e2DiffSquares(){
  let a,b,v; do { a=pick([2,3,4,5,6,7,8]); b=pick([3,4,5,7,9]); v=Math.random()>.45?'y':''; } while((a===3&&b===5&&v==='y')||(a===8&&b===7&&v==='')||(a===2&&b===9&&v==='')||(a===4&&b===7&&v===''));
  const common=gcd(a*a,b*b),aa=a/Math.sqrt(common),bb=b/Math.sqrt(common);
  // The GCF of two squares is itself a square.
  const factors=`(${aa}x-${bb}${v})(${aa}x+${bb}${v})`;
  return {key:`e2ds${a}${b}${v}`,label:"1 · Difference of squares",q:`Factor completely: ${math(`${a*a}x^2-${b*b}${v?`${v}^2`:''}`)}`,s:steps(
    common>1?`First factor out the GCF ${inlineMath(common)}: ${math(`${common}(${aa*aa}x^2-${bb*bb}${v?`${v}^2`:''})`)}`:`The terms have no common factor other than 1.`,
    `Identify the two squares: ${math(`(${aa}x)^2-(${bb}${v})^2`)}`,
    `Use ${inlineMath('A^2-B^2=(A-B)(A+B)')}: one factor has a minus sign and the other has a plus sign.`,
    `Substitute the square roots into the factors: ${math(factors)}`
  )+answer(`${common>1?common:''}${factors}`)};
}
function e2ThreePart(){
  const x1=randint(-4,0),x2=randint(1,5),a=pick([2,3,4]),b=randint(-5,5),L=a*x1+b,R=a*x2+b,strictL=Math.random()>.5,strictR=Math.random()>.5;
  const ls=strictL?'<':'\\le',rs=strictR?'<':'\\le';
  return {key:`e2tp${L}${a}${b}${R}${ls}${rs}`,label:"2 · Three-part inequality",q:`Solve, write the answer in interval notation, and graph it: ${math(`${L}${ls}${a}x${sign(b)}${rs}${R}`)}${blankNumberLine()}`,s:steps(
    b?`Subtract ${inlineMath(b)} from all three parts: ${math(`${L}-(${b})${ls}${a}x${rs}${R}-(${b})`)}`:`There is no constant to remove.`,
    `Simplify: ${math(`${L-b}${ls}${a}x${rs}${R-b}`)}`,
    `Divide all three parts by ${inlineMath(a)}. It is positive, so keep both inequality directions: ${math(`${frac(L-b,a)}${ls}x${rs}${frac(R-b,a)}`)}`,
    `Simplify the endpoints: ${math(`${x1}${ls}x${rs}${x2}`)}`,
    `Use ${strictL?'a parenthesis':'a bracket'} at ${x1} and ${strictR?'a parenthesis':'a bracket'} at ${x2}. Shade between the endpoints.`
  )+intervalNumberLine(x1,x2,!strictL,!strictR)+answer(`${strictL?'(':'['}${x1},${x2}${strictR?')':']'}`)};
}
function e2LinearIneq(){
  const sol=randint(-4,4),a=pick([-6,-5,-4,4,5,6]),c=pick([-3,-2,2,3]),d=randint(-8,8),b=(c-a)*sol+d; // ax+b <= c(x)+d equality boundary
  const sym=pick(['<','\\le','>','\\ge']);
  const coef=a-c, rhs=d-b, flips=coef<0; const outSym=flips?({'<':'>','\\le':'\\ge','>':'<','\\ge':'\\le'}[sym]):sym;
  const int=(outSym==='<'||outSym==='\\le')?`(-\\infty,${sol}${outSym==='\\le'?']':')'}`:`${outSym==='\\ge'?'[':'('}${sol},\\infty)`;
  return {key:`e2li${a}${b}${c}${d}${sym}`,label:"3 · Linear inequality",q:`Solve and write the solution in interval notation: ${math(`${a}x${sign(b)}${sym}${c}(x)${sign(d)}`)}`,s:steps(
    `Write the product ${inlineMath(`${c}(x)`)} as ${inlineMath(coeff(c))}: ${math(`${coeff(a)}${sign(b)}${sym}${coeff(c)}${sign(d)}`)}`,
    `Subtract ${inlineMath(coeff(c))} from both sides and combine the variable terms: ${math(`${coeff(coef)}${sign(b)}${sym}${d}`)}`,
    b?`Subtract ${inlineMath(b)} from both sides: ${math(`${coeff(coef)}${sym}${d}-(${b})`)}`:`There is no constant to subtract.`,
    `Simplify: ${math(`${coeff(coef)}${sym}${rhs}`)}`,
    `Divide by ${inlineMath(coef)}${flips?', reversing the inequality because it is negative':', keeping the inequality direction because it is positive'}: ${math(`x${outSym}${frac(rhs,coef)}`)}${math(`x${outSym}${sol}`)}`,
    `In interval notation, use ${outSym==='\\le'||outSym==='\\ge'?'a bracket at the included endpoint':'a parenthesis at the excluded endpoint'}. Infinity always takes a parenthesis.`
  )+answer(int)};
}
function e2Multiply(){
  if(Math.random()>.3){
    const k=pick([-6,-5,-4,3,4,5]),p=pick([-4,-3,2,3,4]),q=pick([-5,-2,2,5]);
    const B=p+k,C=q+k*p,D=k*q,inner=polynomial([[1,'x^2'],[p,'x'],[q]]),out=polynomial([[1,'x^3'],[B,'x^2'],[C,'x'],[D]]);
    return {key:`e2mul${k}${p}${q}`,label:'4 · Multiply polynomials',q:`Multiply and simplify: ${math(`(x${sign(k)})(${inner})`)}`,s:steps(
      `Distribute each term in the first factor to the entire second factor: ${math(`x(${inner})${sign(k)}(${inner})`)}`,
      `Write all six products before combining anything: ${math(`x(x^2)+x(${p}x)+x(${q})+(${k})(x^2)+(${k})(${p}x)+(${k})(${q})`)}`,
      `Multiply coefficients and add exponents for the same variable: ${math(`x^3${term(p,'x^2')}${term(q,'x')}${term(k,'x^2')}${term(k*p,'x')}${sign(D)}`)}`,
      `Combine the square terms: ${inlineMath(`${p}+(${k})=${B}`)}. Combine the linear terms: ${inlineMath(`${q}+(${k*p})=${C}`)}. Omit any term whose coefficient becomes zero.`
    )+answer(out)};
  }
  const a=pick([-3,-2,2,3]),c=pick([-5,-3,3,5]),out=polynomial([[a*a,'h^4'],[2*a*c,'h^2'],[c*c]]);
  return {key:`e2sq${a}${c}`,label:'4 · Multiply polynomials',q:`Multiply and simplify: ${math(`(${a}h^2${sign(c)})^2`)}`,s:steps(
    `Use ${inlineMath('(A+B)^2=A^2+2AB+B^2')}, with ${inlineMath(`A=${a}h^2`)} and ${inlineMath(`B=${c}`)}.`,
    `Substitute: ${math(`(${a}h^2)^2+2(${a}h^2)(${c})+(${c})^2`)}`,
    `Square both coefficients, multiply exponents in the first term, and evaluate the middle product: ${math(out)}`
  )+answer(out)};
}
function e2AbsIneq(){
  const center=randint(-5,5),r=pick([2,3,4,5]),a=pick([1,2,3]),c=randint(0,5),rhs=a*r+c,strict=Math.random()>.5,sym=strict?'<':'\\le',expr=diffTex(center,'x');
  return {key:`e2ai${center}${r}${a}${c}${sym}`,label:'5 · Absolute-value inequality',q:`Solve and give the answer as an interval: ${math(`${a===1?'':a}|${expr}|${sign(c)}${sym}${rhs}`)}`,s:steps(
    c?`Subtract ${c} from both sides: ${math(`${a===1?'':a}|${expr}|${sym}${rhs-c}`)}`:`The absolute-value term has no outside constant.`,
    `Divide by ${a} to isolate the absolute value: ${math(`|${expr}|${sym}${r}`)}`,
    `An absolute value is a distance. A distance ${strict?'less than':'at most'} ${r} means the expression lies between ${-r} and ${r}: ${math(`${-r}${sym}${expr}${sym}${r}`)}`,
    center?`Add ${inlineMath(center)} to all three parts: ${math(`${center-r}${sym}x${sym}${center+r}`)}`:`The expression inside the absolute value is already x.`,
    `Write the interval using ${strict?'parentheses because the endpoints are excluded':'brackets because the endpoints are included'}.`
  )+intervalNumberLine(center-r,center+r,!strict,!strict,false,false,Math.min(-6,center-r-1),Math.max(6,center+r+1))+answer(`${strict?'(':'['}${center-r},${center+r}${strict?')':']'}`)};
}
function e2Cubes(){
  const g=pick([1,2,3,4,5]),k=pick([2,3,4,5]),v=pick(['x','w']),c=g*k**3;
  return {key:`e2cube${g}${k}${v}`,label:'6 · Factor a sum of cubes',q:`Factor completely: ${math(`${g===1?'':g}${v}^3+${c}`)}`,s:steps(
    g>1?`Factor out the GCF ${g}: ${math(`${g}(${v}^3+${k**3})`)}`:`There is no common numerical factor other than 1.`,
    `Identify the cubes: ${math(`${v}^3+${k}^3`)}`,
    `Use ${inlineMath('A^3+B^3=(A+B)(A^2-AB+B^2)')}.`,
    `Substitute ${inlineMath(`A=${v}`)} and ${inlineMath(`B=${k}`)}: ${math(`(${v}+${k})(${v}^2-(${v})(${k})+${k}^2)`)}`,
    `Evaluate the product and square, and retain the GCF outside.`
  )+answer(`${g>1?g:''}(${v}+${k})(${v}^2-${k}${v}+${k*k})`)};
}
function e2Grouping(){
  const a=pick([3,4,5,6,8,10]),b=pick([3,5,7,9]),v=pick(['y','w']);
  return {key:`e2grp${a}${b}${v}`,label:'7 · Factoring by grouping',q:`Factor by grouping: ${math(`x^2${v}+${b}${v}+${a}x^2+${a*b}`)}`,s:steps(
    `Group the first two terms and the last two terms: ${math(`(x^2${v}+${b}${v})+(${a}x^2+${a*b})`)}`,
    `Factor ${inlineMath(v)} from the first group and ${a} from the second: ${math(`${v}(x^2+${b})+${a}(x^2+${b})`)}`,
    `Both terms share the binomial ${inlineMath(`x^2+${b}`)}. Factor it out: ${math(`(x^2+${b})(${v}+${a})`)}`,
    `Check by distributing the two factors to recover all four original terms.`
  )+answer(`(x^2+${b})(${v}+${a})`)};
}
function e2FractionIneq(){
  if(Math.random()>.5){
    const den=pick([-5,-4,-3,3,4,5]),boundary=pick([-4,-3,-2,-1,1,2,3,4]),b=randint(-4,4),rhs=pick([2,3,4]),num=den*rhs,a=(num-b)/boundary;
    if(Number.isInteger(a)&&a!==0){
      const sym=pick(['<','>','\\le','\\ge']),after=den<0?reverseIneq(sym):sym,final=a<0?reverseIneq(after):after,k=(num-b)/a;
      return {key:`e2fi${den}${boundary}${b}${rhs}${sym}`,label:'8 · Inequality with fractions',q:`Solve and write the answer in interval notation: ${math(`${frac(linTex(a,b),den)}${sym}${rhs}`)}`,s:steps(
        `Multiply both sides by ${den}${den<0?' and reverse the inequality because the multiplier is negative':''}: ${math(`${linTex(a,b)}${after}${den}(${rhs})`)}`,
        `Evaluate the product: ${math(`${linTex(a,b)}${after}${num}`)}`,
        b?`Subtract ${inlineMath(b)} from both sides: ${math(`${coeff(a)}${after}${num-b}`)}`:`There is no constant to subtract.`,
        `Divide by ${a}${a<0?' and reverse the inequality again because the divisor is negative':''}: ${math(`x${final}${frac(num-b,a)}`)}`,
        `Simplify: ${math(`x${final}${k}`)}`
      )+answer(intervalFor(final,k))};
    }
  }
  const k=pick([3,4,5,6]),d=pick([3,4,6]),r=pick([7,11,13,17]),bound=ratTex(r-k,d);
  // Both fractions have denominator d, so subtract their numerators.
  return {key:`e2fi2${k}${d}${r}`,label:'8 · Inequality with fractions',q:`Solve and write the answer in interval notation: ${math(`${frac(k,d)}+x<${frac(r,d)}`)}`,s:steps(
    `Subtract ${inlineMath(frac(k,d))} from both sides: ${math(`x<${frac(r,d)}-${frac(k,d)}`)}`,
    `The denominators match, so subtract the numerators and keep the denominator: ${math(`x<${frac(`${r}-${k}`,d)}`)}`,
    `Simplify the fraction: ${math(`x<${bound}`)}`,
    `The endpoint is excluded because the inequality is strict.`
  )+answer(`(-\\infty,${bound})`)};
}
const graphSteps = (m,b,sym) => {
  const dashed=sym==='<'||sym==='>',above=sym==='>'||sym==='\\ge',test=b!==0?[0,0]:[0,1],left=test[1],right=m*test[0]+b;
  const pass=sym==='<'?left<right:sym==='>'?left>right:sym==='\\le'?left<=right:left>=right;
  return steps(
    `Replace the inequality with an equals sign to obtain the boundary: ${math(`y=${linTex(m,b)}`)}`,
    `Plot the y-intercept ${inlineMath(`(0,${b})`)}. Using the slope ${inlineMath(m)}, a second point is ${inlineMath(`(1,${m+b})`)}.`,
    `Draw a ${dashed?'dashed line because equality is excluded':'solid line because equality is included'}.`,
    `Test a point off the boundary, ${inlineMath(`(${test})`)}: ${math(`${left}${sym}${right}`)} This is ${pass?'true, so shade the side containing the test point':'false, so shade the other side'}.`,
    `Equivalently, shade ${above?'above':'below'} the line.`
  );
};
function e2SystemGraph(){
  const m1=pick([-2,-1,1,2]),b1=pick([-3,-2,1,2,3]),m2=pick([-2,-1,1,2]),b2=pick([-3,-1,2,4]);
  if(m1===m2)return e2SystemGraph();
  const s1=pick(['\\le','\\ge','<','>']),s2=pick(['\\le','\\ge','<','>']);
  return {key:`e2sg${m1}${b1}${m2}${b2}${s1}${s2}`,label:'9 · System of linear inequalities',q:`Graph the system: ${math(`\\begin{cases}y${s1}${linTex(m1,b1)}\\\\y${s2}${linTex(m2,b2)}\\end{cases}`)}${blankGrid()}`,s:`<h4>First inequality</h4>${graphSteps(m1,b1,s1)}${lineGraph(m1,b1,s1==='<'||s1==='>')}<h4>Second inequality</h4>${graphSteps(m2,b2,s2)}${lineGraph(m2,b2,s2==='<'||s2==='>')}<p>Place both boundaries and both shaded regions on the same grid. The solution is the overlap: every point there satisfies both inequalities.</p>`};
}
function e2OrIneq(){
  const a=randint(-5,-1),b=randint(1,5),leftSym=pick(['<','\\le']),rightSym=pick(['>','\\ge']),p=pick([2,3,4]),q=randint(-5,5),r=p*a+q,s=pick([2,3,4]),t=randint(-5,5),u=s*b+t;
  return {key:`e2or${a}${b}${p}${q}${s}${t}${leftSym}${rightSym}`,label:'10 · Compound inequality with OR',q:`Solve, write the answer in interval notation, and graph it: ${math(`${linTex(p,q)}${leftSym}${r}\\quad\\text{OR}\\quad${linTex(s,t)}${rightSym}${u}`)}${blankNumberLine()}`,s:steps(
    `Solve the left inequality. Subtract ${inlineMath(q)} and simplify: ${math(`${coeff(p)}${leftSym}${r-q}`)}`,
    `Divide by ${p}: ${math(`x${leftSym}${a}`)}`,
    `Solve the right inequality. Subtract ${inlineMath(t)} and simplify: ${math(`${coeff(s)}${rightSym}${u-t}`)}`,
    `Divide by ${s}: ${math(`x${rightSym}${b}`)}`,
    `OR means either inequality is sufficient. Shade the left ray and the right ray; use a union symbol to join the intervals.`
  )+intervalNumberLine(a,a,leftSym==='\\le',leftSym==='\\le',true,false)+intervalNumberLine(b,b,rightSym==='\\ge',rightSym==='\\ge',false,true)+answer(`(-\\infty,${a}${leftSym==='\\le'?']':')'}\\cup${rightSym==='\\ge'?'[':'('}${b},\\infty)`)};
}
function e2QuadraticEq(){
  const r1=randint(-8,-1),r2=randint(2,9);
  if(Math.random()>.5){
    const B=-(r1+r2),C=r1*r2;
    return {key:`e2qe${r1}${r2}`,label:'11 · Solve a quadratic equation',q:`Solve: ${math(`${polynomial([[1,'x^2'],[B,'x'],[C]])}=0`)}`,s:steps(
      `Find two numbers whose product is ${C} and whose sum is ${B}: ${math(`(${-r1})(${-r2})=${C}\\qquad ${-r1}+(${-r2})=${B}`)}`,
      `Factor: ${math(`(x${sign(-r1)})(x${sign(-r2)})=0`)}`,
      `A product is zero when at least one factor is zero: ${math(`x${sign(-r1)}=0\\quad\\text{or}\\quad x${sign(-r2)}=0`)}`,
      `Solve the two linear equations: ${math(`x=${r1}\\quad\\text{or}\\quad x=${r2}`)}`
    )+answer(`x=${r1},\\ ${r2}`)};
  }
  const A=pick([3,5,7]),B=pick([2,4,6]),rhs=(A+r1)*(B+r1),other=-(A+B)-r1,C=A*B-rhs;
  return {key:`e2qep${A}${B}${rhs}`,label:'11 · Solve a quadratic equation',q:`Solve: ${math(`(x+${A})(x+${B})=${rhs}`)}`,s:steps(
    `Distribute: ${math(`x^2+${B}x+${A}x+${A*B}=${rhs}`)}`,
    `Combine like terms: ${math(`x^2+${A+B}x+${A*B}=${rhs}`)}`,
    `Subtract ${rhs} to make one side zero: ${math(`${polynomial([[1,'x^2'],[A+B,'x'],[C]])}=0`)}`,
    `The numbers ${-r1} and ${-other} multiply to ${C} and add to ${A+B}. Factor: ${math(`(x${sign(-r1)})(x${sign(-other)})=0`)}`,
    `Set each factor equal to zero and solve: ${math(`x${sign(-r1)}=0\\quad\\text{or}\\quad x${sign(-other)}=0`)}`
  )+answer(r1===other?`x=${r1}`:`x=${r1},\\ ${other}`)};
}
function e2AbsEq(){
  const a=pick([2,3,4,5,6]),b=randint(-8,8),r=pick([3,4,5,6,7]),mult=pick([1,2,3]),outside=randint(-5,8),rhs=mult*r+outside,x1=ratTex(r-b,a),x2=ratTex(-r-b,a);
  return {key:`e2ae${a}${b}${r}${mult}${outside}`,label:'12 · Absolute-value equation',q:`Solve: ${math(`${mult===1?'':mult}|${linTex(a,b)}|${sign(outside)}=${rhs}`)}`,s:steps(
    outside?`Subtract ${inlineMath(outside)} from both sides: ${math(`${mult===1?'':mult}|${linTex(a,b)}|=${mult*r}`)}`:`There is no outside constant to remove.`,
    `Divide by ${mult}: ${math(`|${linTex(a,b)}|=${r}`)}`,
    `An expression with absolute value ${r} can equal ${r} or ${-r}: ${math(`${linTex(a,b)}=${r}\\quad\\text{or}\\quad ${linTex(a,b)}=${-r}`)}`,
    `Subtract ${inlineMath(b)} in both equations: ${math(`${coeff(a)}=${r-b}\\quad\\text{or}\\quad ${coeff(a)}=${-r-b}`)}`,
    `Divide each equation by ${a}: ${math(`x=${x1}\\quad\\text{or}\\quad x=${x2}`)}`,
    `Check each value in the original equation. In both cases the absolute value becomes ${r}, giving ${mult}(${r})${sign(outside)}=${rhs}.`
  )+answer(`x=${x1},\\ ${x2}`)};
}
function e2Trinomial(){
  const g=pick([1,2,4,5]),a=pick([1,2,3,4]),c=pick([1,2,3,4]),p=pick([-5,-3,2,4]),q=pick([-4,-2,3,5]),AA=g*a*c,BB=g*(a*q+c*p),CC=g*p*q;
  const G=gcd(gcd(AA,BB),CC),A=AA/G,B=BB/G,C=CC/G,M=a*q,N=c*p,scale=g/G;
  const splitM=M*scale,splitN=N*scale,firstGcf=gcd(A,splitM),u=A/firstGcf,v=splitM/firstGcf,secondGcf=splitN/u;
  const factor1=linTex(a,p),factor2=linTex(c,q),out1=linTex(a/gcd(a,p),p/gcd(a,p)),out2=linTex(c/gcd(c,q),q/gcd(c,q));
  return {key:`e2tri${g}${a}${c}${p}${q}`,label:'13 · Factor a trinomial',q:`Factor completely: ${math(polynomial([[AA,'x^2'],[BB,'x'],[CC]]))}`,s:steps(
    `Find the GCF of ${AA}, ${BB}, and ${CC}: it is ${G}. ${math(`${G===1?'':G+'('}${polynomial([[A,'x^2'],[B,'x'],[C]])}${G===1?'':')'}`)}`,
    `For the remaining trinomial, multiply the leading coefficient and constant: ${math(`${A}(${C})=${A*C}`)}`,
    `Find two numbers with product ${A*C} and sum ${B}: ${inlineMath(M*scale)} and ${inlineMath(N*scale)}.`,
    `Split the middle term: ${math(polynomial([[A,'x^2'],[M*scale,'x'],[N*scale,'x'],[C]]))}`,
    `Group the first two terms and the last two terms: ${math(`(${polynomial([[A,'x^2'],[splitM,'x']])})+(${polynomial([[splitN,'x'],[C]])})`)}`,
    `Factor the GCF from each group: ${math(`${coeff(firstGcf)}(${linTex(u,v)})${term(secondGcf)}(${linTex(u,v)})`)}`,
    `Factor the shared binomial ${inlineMath(linTex(u,v))}: ${math(`(${linTex(firstGcf,secondGcf)})(${linTex(u,v)})`)}`,
    `Keep the GCF outside. Check by multiplying the final factors: ${math(`${G===1?'':G}(${out1})(${out2})=${polynomial([[AA,'x^2'],[BB,'x'],[CC]])}`)}`
  )+answer(`${G===1?'':G}(${out1})(${out2})`)};
}
function e2GcfFactor(){
  const g=pick([1,2,3,4]),pow=pick([3,4,5]),r=pick([1,2,3,4]),s=pick([2,3,4,5]),B=r+s,C=r*s;
  return {key:`e2gcf${g}${pow}${r}${s}`,label:'14 · GCF then factor',q:`Factor completely: ${math(polynomial([[g,`x^{${pow+2}}`],[g*B,`x^{${pow+1}}`],[g*C,`x^{${pow}}`]]))}`,s:steps(
    `The coefficient GCF is ${g}. The smallest power of x is ${inlineMath(`x^{${pow}}`)}, so the GCF is ${inlineMath(coeff(g,`x^{${pow}}`))}.`,
    `Divide each term by the GCF: ${math(`${coeff(g,`x^{${pow}}`)}(x^2+${B}x+${C})`)}`,
    `Find two numbers whose product is ${C} and sum is ${B}: ${math(`${r}(${s})=${C}\\qquad ${r}+${s}=${B}`)}`,
    `Factor the trinomial and keep the GCF outside.`
  )+answer(`${coeff(g,`x^{${pow}}`)}(x+${r})(x+${s})`)};
}
function e2Subtract(){
  const a=pick([4,6,8,10]),b=pick([-5,-3,2,4]),c=pick([-6,-2,3,5]),d=pick([2,3,5]),e=pick([-4,-2,3,6]);
  return {key:`e2sub${a}${b}${c}${d}${e}`,label:'15 · Subtract polynomials',q:`Subtract and simplify: ${math(`(${polynomial([[a,'x^3'],[b,'x'],[c]])})-(${polynomial([[d,'x^4'],[e,'x^3'],[2,'x^2']])})`)}`,s:steps(
    `Distribute the minus sign to every term in the second polynomial: ${math(`${polynomial([[a,'x^3'],[b,'x'],[c]])}${term(-d,'x^4')}${term(-e,'x^3')}-2x^2`)}`,
    `Put like powers together: ${math(`${-d}x^4+(${a}-(${e}))x^3-2x^2${term(b,'x')}${sign(c)}`)}`,
    `Combine the cubic coefficients: ${math(`${a}-(${e})=${a-e}`)} Keep the other terms and omit zero terms.`
  )+answer(polynomial([[-d,'x^4'],[a-e,'x^3'],[-2,'x^2'],[b,'x'],[c]]))};
}
function e2GraphIneq(){
  const m=pick([-2,-1,1,2]),b=randint(-4,4),sym=pick(['<','>','\\le','\\ge']);
  return {key:`e2gi${m}${b}${sym}`,label:'16 · Graph a linear inequality',q:`Graph: ${inlineMath(`y${sym}${linTex(m,b)}`)}${blankGrid()}`,s:graphSteps(m,b,sym)+lineGraph(m,b,sym==='<'||sym==='>')};
}
function e2Pages(){
  const n=pick([12,16,17,18,19,20,21,22,23,24]),prod=n*(n+1);
  return {key:`e2pg${n}`,label:'17 · Consecutive page numbers',q:`The product of two consecutive page numbers is ${prod}. Find the page numbers.`,s:steps(
    `Let the first page be ${inlineMath('x')}. The next page is ${inlineMath('x+1')}.`,
    `Translate the product: ${math(`x(x+1)=${prod}`)}`,
    `Distribute: ${math(`x^2+x=${prod}`)}`,
    `Move the product to the left: ${math(`x^2+x-${prod}=0`)}`,
    `Find numbers with product ${-prod} and sum 1: ${inlineMath(n+1)} and ${inlineMath(-n)}. Factor: ${math(`(x+${n+1})(x-${n})=0`)}`,
    `Set each factor equal to zero: ${math(`x=${-(n+1)}\\quad\\text{or}\\quad x=${n}`)}`,
    `Page numbers must be positive, so reject ${-(n+1)}. The two pages are ${n} and ${n+1}. Check: ${inlineMath(`${n}(${n+1})=${prod}`)}.`
  )+answer(`${n}\\text{ and }${n+1}`)};
}

// Exam 3: seventeen independent, randomized exam-style question generators.
const e3Q=(id,label,tex,lines,result)=>({key:`e3-${id}-${tex}`,label,q:math(tex),s:steps(...lines)+answer(result)});
const e3Int=(a,b)=>randint(a,b);
const e3NZ=()=>pick([-6,-5,-4,-3,-2,2,3,4,5,6]);
function e3Simplify(){const a=e3Int(1,6),b=e3Int(1,6),c=e3Int(7,11);return e3Q(1,'Simplify rational expressions',`\\frac{(x+${a})(x+${b})}{(x+${a})(x+${c})}`,[`Factor the numerator and denominator.`, `Cancel the common factor ${inlineMath(`x+${a}`)} only after recording restrictions.`,`The original denominator is zero when ${inlineMath(`x=-${a}`)} or ${inlineMath(`x=-${c}`)}.`],`\\frac{x+${b}}{x+${c}},\\quad x\\ne-${a},-${c}`)}
function e3Exponents(){const a=e3Int(2,5),b=e3Int(2,5),n=e3Int(2,4);return e3Q(2,'Exponent rules',`\\frac{${a}x^{${n+2}}y^{${b+1}}}{${a}x^{${n}}y^{${b-1}}}`,[`Cancel the common coefficient ${a}.`,`Subtract exponents of matching bases: ${inlineMath(`x^{${n+2}-${n}}y^{${b+1}-(${b-1})}`)}.`,`Simplify both exponents.`],`x^2y^2`)}
function e3Rationalize(){const a=e3Int(2,7),b=pick([2,3,5,6,7]);return e3Q(3,'Rationalize a denominator',`\\frac{${a}}{\\sqrt{${b}}}`,[`Multiply top and bottom by ${inlineMath(`\\sqrt{${b}}`)}.`,`The denominator becomes ${inlineMath(b)}.`,`Simplify the coefficient if it shares a factor with ${b}.`],`\\frac{${a}\\sqrt{${b}}}{${b}}`)}
function e3ComplexSub(){const a=e3Int(3,9),b=e3Int(2,8),c=e3Int(1,5),d=e3Int(1,7);return e3Q(4,'Subtract complex numbers',`(${a}+${b}i)-(${c}+${d}i)`,[`Distribute the negative sign across the second parentheses.`,`Combine real parts: ${a}-${c}=${a-c}.`,`Combine imaginary coefficients: ${b}-${d}=${b-d}.`],`${a-c}${b-d<0?'': '+'}${b-d}i`)}
function e3Domain(){const a=e3Int(2,7);return e3Q(5,'Domain in interval notation',`f(x)=\\frac{x+${e3Int(1,6)}}{x-${a}}`,[`The denominator of a rational function cannot equal zero.`,`Solve ${inlineMath(`x-${a}=0`)} to find the excluded input.`,`Write every real number except ${a} as two intervals.`],`(-\\infty,${a})\\cup(${a},\\infty)`)}
function e3Subtract(){const a=e3Int(2,7),b=e3Int(2,7),c=e3Int(2,6);return e3Q(6,'Subtract rational expressions',`\\frac{${a}}{x}-\\frac{${b}}{x+${c}}`,[`Use the common denominator ${inlineMath(`x(x+${c})`)}.`,`Combine the numerators: ${inlineMath(`${a}(x+${c})-${b}x`)}.`,`Distribute and collect like terms; exclude values that zero the original denominators.`],`\\frac{${a-b}x+${a*c}}{x(x+${c})},\\quad x\\ne0,-${c}`)}
function e3DivideRat(){const a=e3Int(2,7),b=e3Int(8,12);return e3Q(7,'Divide rational expressions',`\\frac{(x-${a})(x+${b})}{x+1}\\div\\frac{x-${a}}{x+1}`,[`Keep the first fraction and multiply by the reciprocal of the second.`,`Cancel matching factors after noting original restrictions.`,`The divisor must not equal zero, so ${inlineMath(`x\\ne${a}`)}; also ${inlineMath('x\\ne-1')}.`],`x+${b},\\quad x\\ne${a},-1`)}
function e3PolyDiv(){const r=e3Int(2,5),a=e3Int(1,4),b=e3Int(1,5),c=e3Int(1,7),rem=e3Int(1,8),B=b-a*r,C=c-b*r,D=rem-c*r;return e3Q(8,'Polynomial long division',`(${polynomial([[a,'x^3'],[B,'x^2'],[C,'x'],[D]])})\\div(x-${r})`,[`Divide the leading terms: ${inlineMath(`${a}x^3/x=${a}x^2`)}.`,`Multiply by ${inlineMath(`x-${r}`)}, subtract, and repeat for the next terms.`,`The resulting quotient is ${inlineMath(`${a}x^2+${b}x+${c}`)}; the final constant left is the remainder.`],`Q(x)=${a}x^2+${b}x+${c},\\quad R=${rem}`)}
function e3Root(){const a=e3Int(2,5),n=pick([3,5]);return e3Q(9,'Simplify nth roots',`\\sqrt[${n}]{${a**n}x^{${n}}}`,[`Write the radicand as ${inlineMath(`(${a}x)^{${n}}`)}.`,`The root index is odd, so no absolute value is needed.`,`Apply the nth root to the perfect nth power.`],`${a}x`)}
function e3RadEq(){const a=e3Int(2,7),r=e3Int(3,7),x=r*r-a;return e3Q(10,'Solve radical equations',`\\sqrt{x+${a}}=${r}`,[`Square both sides: ${inlineMath(`x+${a}=${r*r}`)}.`,`Subtract ${a} to isolate x.`,`Substitute your solution into the original radical equation to check.`],`x=${x}`)}
function e3ComplexFrac(){const a=e3Int(2,7),b=e3Int(2,7);return e3Q(11,'Simplify complex fractions',`\\frac{\\frac{1}{x}+\\frac{1}{${a}}}{\\frac{1}{x}}`,[`Multiply the numerator and denominator of the entire expression by ${inlineMath(`${a}x`)}.`,`The numerator becomes ${inlineMath(`${a}+x`)} and denominator becomes ${a}.`,`The original expression requires ${inlineMath('x\\ne0')}.`],`\\frac{x+${a}}{${a}},\\quad x\\ne0`)}
function e3ComplexDiv(){const a=e3Int(2,7),b=e3Int(1,5),c=e3Int(1,4);return e3Q(12,'Divide complex numbers',`\\frac{${a}+${b}i}{${c}+i}`,[`Multiply numerator and denominator by the conjugate ${inlineMath(`${c}-i`)}.`,`The denominator is ${inlineMath(`${c*c}+1=${c*c+1}`)}.`,`Expand the numerator using ${inlineMath('i^2=-1')} and combine real and imaginary parts.`],`\\frac{${a*c+b}}{${c*c+1}}+\\frac{${b*c-a}}{${c*c+1}}i`)}
function e3Radicals(){const a=e3Int(2,5),b=e3Int(2,5),k=pick([2,3,5,7]);return e3Q(13,'Combine radical expressions',`${a}\\sqrt{${4*k}}+${b}\\sqrt{${9*k}}`,[`Factor perfect squares from each radicand: ${inlineMath(`\\sqrt{4(${k})}=2\\sqrt{${k}}`)} and ${inlineMath(`\\sqrt{9(${k})}=3\\sqrt{${k}}`)}.`,`Multiply the outside coefficients.`,`Add like radicals.`],`${2*a+3*b}\\sqrt{${k}}`)}
function e3Work(){const a=pick([6,8,10,12]),b=a*2,t=a*b/(a+b);return {key:`e3work${a}`,label:'Work-rate application',q:`One person finishes a task in ${a} hours. Working together with a second person, they finish in ${t} hours. How many hours would the second person take alone?`,s:steps(`Let the second person's time be ${inlineMath('x')} hours.`,`Add rates: ${math(`\\frac1{${a}}+\\frac1x=\\frac1{${t}}`)}`,`Subtract ${inlineMath(`1/${a}`)} from both sides: ${math(`\\frac1x=\\frac1{${b}}`)}`,`Take reciprocals and check the combined rate.`)+answer(`${b}\\text{ hours}`)}}
function e3Inverse(){const x=e3Int(2,6),y=e3Int(4,9),m=pick([2,3]);return {key:`e3inv${x}${y}${m}`,label:'Inverse variation',q:`y varies inversely with x. If y=${y} when x=${x}, find y when x=${x*m}.`,s:steps(`Inverse variation means ${inlineMath('y=k/x')}.`,`Find k: ${math(`k=(${x})(${y})=${x*y}`)}`,`Substitute ${inlineMath(`x=${x*m}`)}: ${math(`y=\\frac{${x*y}}{${x*m}}`)}`)+answer(`${ratTex(y,m)}`)}}
function e3Direct(){const w=e3Int(3,7)*25,d=w*pick([4,6,8]),newW=w+25;return {key:`e3direct${w}${d}`,label:'Direct variation dosage',q:`A dosage is directly proportional to weight. A ${w}-lb patient receives ${d} mg. What dosage corresponds to ${newW} lb?`,s:steps(`Use direct variation: ${inlineMath('d=kw')}.`,`Find the constant: ${math(`k=\\frac{${d}}{${w}}=${d/w}`)}`,`Multiply the new weight by the constant: ${math(`d=(${d/w})(${newW})`)}`)+answer(`${d/w*newW}\\text{ mg}`)}}
function e3Speed(){const v=e3Int(3,8),diff=e3Int(3,7),time=e3Int(2,4),slow=v*time,fast=(v+diff)*time;return {key:`e3speed${v}${diff}${time}`,label:'Motion and speed application',q:`A cyclist rides ${fast} miles while a walker travels ${slow} miles in the same time. The cyclist is ${diff} mph faster. Find both speeds.`,s:steps(`Let the walker's speed be ${inlineMath('x')} mph; the cyclist's is ${inlineMath(`x+${diff}`)}.`,`Equal times imply ${math(`\\frac{${slow}}x=\\frac{${fast}}{x+${diff}}`)}`,`Cross multiply: ${math(`${slow}(x+${diff})=${fast}x`)}`,`Solve for x and add ${diff} to find the cyclist's speed.`)+answer(`${v}\\text{ mph and }${v+diff}\\text{ mph}`)}}
const exam3Types=[
['rational-simplify','Simplify rational expressions',e3Simplify],['exp3','Exponent rules',e3Exponents],['rationalize3','Rationalize a denominator',e3Rationalize],['complex-sub3','Subtract complex numbers',e3ComplexSub],['domain3','Domain in interval notation',e3Domain],['rat-sub3','Subtract rational expressions',e3Subtract],['rat-div3','Divide rational expressions',e3DivideRat],['poly-div3','Polynomial long division',e3PolyDiv],['roots3','Simplify nth roots',e3Root],['rad-eq3','Solve radical equations',e3RadEq],['complex-frac3','Simplify complex fractions',e3ComplexFrac],['complex-div3','Divide complex numbers',e3ComplexDiv],['radicals3','Combine radical expressions',e3Radicals],['work3','Work-rate application',e3Work],['inverse3','Inverse variation',e3Inverse],['direct3','Direct variation dosage',e3Direct],['speed3','Motion and speed application',e3Speed]];

const exam1Types = [
  ['line-paired','Parallel & perpendicular lines',e1PairedLines],
  ['evaluate','Evaluate a function',e1Evaluate],
  ['domain','Domain from a graph',e1Domain],
  ['scientific','Scientific notation',e1Scientific],
  ['systems','Solve a system',e1System],
  ['equations','Solve a linear equation',e1Linear],
  ['exponents','Simplify exponents',e1Exponent],
  ['fractions','Equation with fractions',e1Fraction],
  ['absolute','Absolute value',e1Absolute],
  ['line-graph','Graph a line',e1GraphLine],
  ['line-points','Line through two points',e1LinePoints],
  ['quadratic','Graph a quadratic from a table',e1Quadratic],
  ['inequality','Graph a one-variable inequality',e1NumberIneq],
  ['average','Weighted-average application',()=>e1App('average')],
  ['salary-quantity','Salary / quantity application',()=>e1App(pick(['salary','marbles']))],
  ['money','Money / count application',()=>e1App('bills')],
  ['mixture','Mixture application',()=>e1App('mixture')]
];
const exam2Types = [
  ['difference-squares','Difference of squares',e2DiffSquares],
  ['three-part','Three-part inequality',e2ThreePart],
  ['linear-ineq','Linear inequality',e2LinearIneq],
  ['poly-multiply','Multiply polynomials',e2Multiply],
  ['abs-ineq','Absolute-value inequality',e2AbsIneq],
  ['cubes','Sum of cubes',e2Cubes],
  ['grouping','Factor by grouping',e2Grouping],
  ['fraction-ineq','Inequality with fractions',e2FractionIneq],
  ['system-ineq','System of linear inequalities',e2SystemGraph],
  ['or-ineq','Compound inequality (OR)',e2OrIneq],
  ['quadratic-eq','Quadratic equation',e2QuadraticEq],
  ['abs-eq','Absolute-value equation',e2AbsEq],
  ['trinomial','Factor a trinomial',e2Trinomial],
  ['gcf-factor','GCF + factor completely',e2GcfFactor],
  ['poly-subtract','Subtract polynomials',e2Subtract],
  ['graph-ineq','Graph a linear inequality',e2GraphIneq],
  ['pages','Consecutive page numbers',e2Pages]
];

// Exam 4 and final practice: original parallel exercises, not instructor exam questions.
const practiceInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const practicePick=a=>a[practiceInt(0,a.length-1)];
const P=(key,label,expr,work,result)=>({key:key+Math.random(),label,q:`<div class="math-display">\\[${expr}\\]</div>`,s:`<p>${work}</p><p><strong>Answer:</strong> \\(${result}\\)</p>`});
const W=(key,label,question,work,result)=>({key:key+Math.random(),label,q:`<p>${question}</p>`,s:`<p>${work}</p><p><strong>Answer:</strong> \\(${result}\\)</p>`});
const mathLine=(x)=>`\\(${x}\\)`;
const shiftX=h=>h<0?`x+${-h}`:h>0?`x-${h}`:'x';
const exam4Generators=[
()=>{let b=practicePick([2,3,4,5]);return P('log','Evaluate logarithms',`\\log_${b}\\left(\\frac1{${b*b*b}}\\right)`,`Rewrite the fraction as ${mathLine(`${b}^{-3}`)}. A logarithm asks for the exponent on the base.`, '-3')},
()=>{let h=practiceInt(-3,3),k=practiceInt(1,4);return P('quadgraph','Graph a quadratic',`f(x)=-(${shiftX(h)})^2+${k}`,`The vertex form ${mathLine('a(x-h)^2+k')} gives vertex ${mathLine(`(${h},${k})`)} and axis ${mathLine(`x=${h}`)}. Since ${mathLine('a=-1')}, the parabola opens downward. Plot the vertex and symmetric points one unit left and right, both one unit lower.`,`\\text{Vertex }(${h},${k}),\\quad x=${h}`)},
()=>{let a=practicePick([2,3,4]),b=practicePick([1,3,5]),c=-practicePick([1,2,3]);return P('qformula','Quadratic formula',`${a}x^2+${b}x${c}=0`,`Identify ${mathLine(`a=${a}, b=${b}, c=${c}`)}. Substitute into ${mathLine('x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}')}; calculate the discriminant ${mathLine(`${b*b-4*a*c}`)}, then simplify.`,`\\frac{${-b}\\pm\\sqrt{${b*b-4*a*c}}}{${2*a}}`)},
()=>{let h=practiceInt(2,8),r=practicePick([6,10,15,20]);return P('square','Square root property',`(x-${h})^2=${r}`,`Take both positive and negative square roots: ${mathLine(`x-${h}=\\pm\\sqrt{${r}}`)}. Then add ${h} to both sides.`,`${h}\\pm\\sqrt{${r}}`)},
()=>{let a=practicePick([2,3,4]),c=practicePick([1,4,9]);return P('imag','Solve with imaginary roots',`${a*a}x^2+${c}=0`,`Isolate the square: ${mathLine(`x^2=-\\frac{${c}}{${a*a}}`)}. Use ${mathLine('\\sqrt{-1}=i')} and include both signs.`,`\\pm\\frac{\\sqrt{${c}}}{${a}}i`)},
()=>{let t=practiceInt(2,6);return W('comp','Function composition',`Let ${mathLine(`f(x)=\\sqrt{x+${t*t+3}}`)} and ${mathLine('g(x)=x-3')}. Find ${mathLine('f(g(x))')} and its domain.`,`Replace the input of f with g(x): ${mathLine(`f(g(x))=\\sqrt{(x-3)+${t*t+3}}=\\sqrt{x+${t*t}}`)}. Require the radicand to be nonnegative.`,`f(g(x))=\\sqrt{x+${t*t}},\\quad x\\ge-${t*t}`)},
()=>{let b=practicePick([2,3,4]),h=practiceInt(1,4);return P('loggraph','Graph a logarithmic function',`f(x)=\\log_${b}(x+${h})`,`Start with ${mathLine(`y=\\log_${b}x`)} and shift left ${h}. The vertical asymptote is ${mathLine(`x=-${h}`)}. Plot the x-intercept at ${mathLine(`x=${1-h}`)} and another point where the input is ${b}.`,`x=-${h}\\text{ (asymptote)}`)},
()=>{let x=practiceInt(-4,3),y=practiceInt(-3,3);return W('mid','Midpoint',`Find the midpoint of ${mathLine(`(${x-3},${y+4})`)} and ${mathLine(`(${x+3},${y-4})`)}.`,`Average x-coordinates and y-coordinates separately: ${mathLine('M=(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2})')}.`,`(${x},${y})`)},
()=>{let a=practiceInt(-4,-2),b=practiceInt(2,4);return P('piece','Graph a piecewise function',`f(x)=\\begin{cases}-2&x\\le ${a}\\\\x+1&${a}<x<${b}\\\\3&x\\ge ${b}\\end{cases}`,`Draw the horizontal ray at y=-2 with a filled endpoint at x=${a}. Draw y=x+1 only between the two boundaries with open endpoints. Draw the ray y=3 from x=${b} with a filled endpoint.`,`\\text{Three correctly restricted pieces}`)},
()=>{let a=practicePick([3,4,5]),b=practicePick([2,3,4]);return W('distance','Distance formula',`Find the exact distance between ${mathLine('(1,-2)')} and ${mathLine(`(${a+1},${b-2})`)}.`,`Compute ${mathLine(`\\sqrt{(${a+1}-1)^2+(${b-2}+2)^2}`)} and simplify the radical.`,`\\sqrt{${a*a+b*b}}`)},
()=>{let t=practicePick([3,4,5]),a=practicePick([2,3,4]),h=practiceInt(10,30);return W('height','Maximum height application',`A ball's height is ${mathLine(`h(t)=-${a}t^2+${2*a*t}t+${h}`)}. Find the time and maximum height.`,`For a quadratic, the maximum occurs at ${mathLine('t=-b/(2a)')}. Here ${mathLine(`t=${t}`)}; substitute this value into the height formula.`,`t=${t},\\quad h_{\\max}=${a*t*t+h}`)},
()=>{let b=practicePick([2,3,4,5]),n=practicePick([2,3]);return P('logconvert','Convert exponential to logarithmic form',`${b}^{-${n}}=\\frac1{${b**n}}`,`Use ${mathLine('a^b=c\\iff\\log_a(c)=b')}. Keep the negative exponent.`,`\\log_${b}\\left(\\frac1{${b**n}}\\right)=-${n}`)},
()=>{let h=practicePick([2,4,6]),c=practicePick([3,5,7]);return P('complete','Complete the square',`x^2+${h}x-${c}=0`,`Move the constant to the right. Add ${mathLine(`(${h}/2)^2=${h*h/4}`)} to both sides, factor the perfect square, and take both square roots.`,`x=-${h/2}\\pm\\sqrt{${c+h*h/4}}`)},
()=>{let h=practiceInt(-2,2),k=practiceInt(-3,0);return P('absgraph','Graph an absolute-value function',`y=2|${shiftX(h)}|${k<0?k:'+'+k}`,`The vertex is ${mathLine(`(${h},${k})`)}. Plot one point to each side of the vertex: the graph rises by 2 for each horizontal unit.`,`\\text{Vertex }(${h},${k})`)},
()=>{let principal=practicePick([2000,4000,6000]),rate=practicePick([4,5,6]),years=practicePick([3,4,5]);return W('interest','Continuous compounding',`An account starts with $${principal.toLocaleString()} and earns ${rate}% annual interest compounded continuously for ${years} years. Find the balance, rounded to cents.`,`Use ${mathLine('A=Pe^{rt}')}, where ${mathLine(`P=${principal},r=${rate}/100,t=${years}`)}. Evaluate using a scientific calculator.`,`A\\approx\\$${(principal*Math.exp(rate/100*years)).toFixed(2)}`)},
()=>{let b=practicePick([2,3]);return P('expgraph','Graph an exponential function',`f(x)=-${b}^x`,`The negative sign reflects ${mathLine(`${b}^x`)} across the x-axis. Plot ${mathLine('(0,-1)')}, ${mathLine(`(1,-${b})`)} and ${mathLine(`(-1,-1/${b})`)}. The horizontal asymptote is y=0.`,`y=0\\text{ (asymptote)}`)},
()=>{let h=practiceInt(-3,3),k=practiceInt(-2,3);return P('vertex','Graph from vertex form',`f(x)=-(${shiftX(h)})^2+${k}`,`Read the vertex ${mathLine(`(${h},${k})`)} and axis ${mathLine(`x=${h}`)}. Plot symmetric points and draw a downward-opening parabola.`,`(${h},${k}),\\quad x=${h}`)}
];
const finalGenerators=[
()=>{let a=practicePick([2,3]),h=practiceInt(-2,2);return P('fgraph','Graph an exponential function',`y=${a}^{${shiftX(h)}}`,`Start from ${mathLine(`y=${a}^x`)} and shift horizontally by ${h}. Plot two points using integer x-values. The horizontal asymptote stays y=0.`,`y=0\\text{ (asymptote)}`)},
()=>{let a=practiceInt(2,4);return W('fops','Operations on functions',`Let ${mathLine(`f(x)=2x+${a}`)} and ${mathLine('g(x)=x^2-1')}. Find ${mathLine('(f+g)(x)')} and ${mathLine('(fg)(x)')}.`,`Add the expressions for the sum. For the product, distribute ${mathLine(`(2x+${a})(x^2-1)`)} carefully.`,`(f+g)(x)=x^2+2x+${a-1},\\quad (fg)(x)=2x^3+${a}x^2-2x-${a}`)},
()=>{let a=practicePick([2,3,4]);return P('flog','Evaluate logarithms',`\\log_${a}(${a**3})`,`Find the exponent that turns the base ${a} into ${a**3}.`,`3`)},
()=>{let a=practicePick([-3,-2]),b=practicePick([2,3]);return P('fpiece','Graph a piecewise function',`f(x)=\\begin{cases}x+1&x<${a}\\\\2&${a}\\le x<${b}\\\\-x+3&x\\ge${b}\\end{cases}`,`Graph each formula only on its stated interval. Use open circles for strict inequalities and closed circles where equality is included.`,`\\text{Three pieces with correct endpoints}`)},
()=>{let a=practicePick([2,3]),b=practicePick([3,4]);return P('fmultiply','Multiply complex numbers',`(${a}+2i)(${b}-i)`,`Use FOIL, substitute ${mathLine('i^2=-1')}, then combine the real and imaginary parts.`,`${a*b+2}+${2*b-a}i`)},
()=>{let m=practicePick([2,3]),x=practiceInt(-3,3),y=practiceInt(-3,3);return W('fperp','Perpendicular lines',`Find an equation of the line perpendicular to ${mathLine(`y=${m}x+1`)} passing through ${mathLine(`(${x},${y})`)}.`,`The perpendicular slope is the negative reciprocal, ${mathLine(`-1/${m}`)}. Substitute into point-slope form ${mathLine('y-y_1=m(x-x_1)')}.`,`y-${y}=-\\frac1{${m}}(x-${x})`)},
()=>{let a=practicePick([2,3,4]);return P('frationalize','Rationalize the denominator',`\\frac{${a}}{\\sqrt{5}}`,`Multiply numerator and denominator by ${mathLine('\\sqrt5')}. The denominator becomes 5.`,`\\frac{${a}\\sqrt5}{5}`)},
()=>{let a=practicePick([2,3]),b=practicePick([2,3]);return P('fexponent','Exponent rules (three variables)',`\\left(\\frac{x^{-2}y^${a}z^{-1}}{x^${b}y^{-1}z^2}\\right)^{-2}`,`First subtract exponents inside the fraction: ${mathLine(`x^{-${b+2}}y^{${a+1}}z^{-3}`)}. Multiply each exponent by -2, then move any negative powers to the denominator.`,`\\frac{x^{${2*(b+2)}}z^6}{y^{${2*(a+1)}}}`)},
()=>{let a=practicePick([2,3]);return P('fradsolve','Solve a radical equation',`\\sqrt{x+${a+5}}=x-${a}`,`Require ${mathLine(`x\\ge${a}`)}. Square both sides, solve the resulting quadratic, and substitute each candidate into the original equation to reject extraneous roots.`,`\\text{Check both candidates in the original equation}`)},
()=>{let a=practicePick([2,3,4]);return P('fineq','Solve and graph a compound inequality',`2x+${a}>${a+2}\\quad\\text{OR}\\quad 3x-${a}<-${a+6}`,`Solve each inequality separately, then take the union because the connector is OR. Use open endpoints for strict inequalities.`,`x>1\\quad\\text{or}\\quad x<2`)},
()=>{let a=practicePick([2,3]);return P('fdivide','Divide complex numbers',`\\frac{${a}+i}{1+i}`,`Multiply top and bottom by the conjugate ${mathLine('1-i')}. The denominator becomes 2. Expand and use ${mathLine('i^2=-1')}.`,`\\frac{${a+1}}2+\\frac{${1-a}}2i`)},
()=>{let h=practiceInt(-2,2),k=practiceInt(1,4);return P('fquad','Graph a quadratic',`y=-(${shiftX(h)})^2+${k}`,`Plot the vertex ${mathLine(`(${h},${k})`)}. The axis of symmetry is ${mathLine(`x=${h}`)}. Plot matching points to the left and right and draw the parabola opening down.`,`(${h},${k}),\\quad x=${h}`)},
()=>{let a=practicePick([2,3]);return P('frateq','Solve a rational equation',`\\frac{1}{x}+\\frac{1}{${a}}=\\frac{${a+1}}{${a}x}`,`First exclude x=0. Multiply every term by ${mathLine(`${a}x`)} to clear denominators, then solve the linear equation. Check the restriction.`,`x=1`)},
()=>{let a=practicePick([2,3,4]);return P('fsystem','Graph a system of lines',`\\begin{cases}y=x+${a}\\\\y=-x+${a}\\end{cases}`,`For each line, plot its y-intercept and another point from the slope. Draw both lines and identify their intersection.`,`(0,${a})`)},
()=>{let [a,b]=practicePick([[6,3],[12,4],[12,6],[8,8]]);return W('fwork','Work-rate word problem',`One volunteer can complete a job in ${a} hours. Together with another volunteer, they finish in ${a*b/(a+b)} hours. How long would the second volunteer need alone?`,`Let x be the second volunteer's time. Set up ${mathLine(`\\frac1{${a}}+\\frac1x=\\frac1{${a*b/(a+b)}}`)}. Subtract the known rate and take the reciprocal.`,`x=${b}\\text{ hours}`)},
()=>{let t=practicePick([3,4,5]),a=practicePick([2,3]);return W('frocket','Maximum height word problem',`A rocket's height in feet is ${mathLine(`h(t)=-${a}t^2+${2*a*t}t+${practicePick([20,30,40])}`)}. Find the time when the height is greatest.`,`The height is a downward-opening quadratic. Use the vertex time ${mathLine('t=-b/(2a)')}.`,`t=${t}\\text{ seconds}`)},
()=>{let v=practicePick([2000,3000,4000]),p=practicePick([200,400,500]),q=p*2;return W('finverse','Inverse variation word problem',`A gas occupies ${v} cm³ at ${p} mmHg. At constant temperature, what volume will it occupy at ${q} mmHg?`,`Inverse variation gives ${mathLine('P_1V_1=P_2V_2')}. Solve ${mathLine(`(${p})(${v})=(${q})V_2`)}.`,`${v/2}\\text{ cm}^3`)},
()=>{let a=practicePick([40,60,80]),b=practicePick([3,4]);return W('fspeed','Equal-time motion word problem',`A plane flies ${a*b} miles while a car drives ${a} miles in the same time. The plane is ${a} mph faster. Find the car's speed.`,`Let x be the car speed and x+${a} the plane speed. Equal times give ${mathLine(`\\frac{${a}}x=\\frac{${a*b}}{x+${a}}`)}. Cross multiply and solve.`,`x=\\frac{${a}}{${b-1}}\\text{ mph}`)},
()=>{let total=practicePick([120,180,240]),r=practicePick([3,5]);return W('ftube','Length ratio word problem',`A ${total}-inch tube is cut into two pieces. One is ${r} times as long as the other. Find both lengths.`,`Let the short piece be x; the long piece is ${r}x. Solve ${mathLine(`x+${r}x=${total}`)}.`,`\\frac{${total}}{${r+1}}\\text{ in and }\\frac{${total*r}}{${r+1}}\\text{ in}`)},
()=>{let total=practicePick([100,200,300]),pct=practicePick([44,46,48]);return W('fmixture','Mixture word problem',`How much 40% solution and 60% solution are needed to make ${total} mL of a ${pct}% solution?`,`Let x be the amount of 40% solution; the other amount is ${total}-x. Set up ${mathLine(`0.40x+0.60(${total}-x)=${pct/100*total}`)} and solve.`,`\\text{40%: }${total*(60-pct)/20}\\text{ mL; 60%: }${total*(pct-40)/20}\\text{ mL}`)}
];
const exam4Types=exam4Generators.map((fn,i)=>['exam4-'+i,['Logarithms','Quadratic graph','Quadratic formula','Square root property','Imaginary solutions','Function composition','Log graph','Midpoint','Piecewise graph','Distance','Maximum height','Logarithm conversion','Completing the square','Absolute-value graph','Continuous compounding','Exponential graph','Vertex form'][i],fn]);
const finalTypes=finalGenerators.map((fn,i)=>['final-'+i,['Exponential graph','Operations on functions','Logarithms','Piecewise graph','Complex multiplication','Perpendicular line','Rationalize denominator','Exponent rules','Radical equation','Compound inequality','Complex division','Quadratic graph','Rational equation','Graph a system','Work-rate application','Maximum height','Inverse variation','Motion application','Length ratio','Mixture application'][i],fn]);

let currentExam='1', currentIndex=0, lastKey='', shown=false, rotationQueue=[];
let practiced=new Set(JSON.parse(localStorage.getItem('exam1Practiced')||'[]'));
const currentTypes=()=>currentExam==='1'?exam1Types:currentExam==='2'?exam2Types:currentExam==='3'?exam3Types:currentExam==='4'?exam4Types:finalTypes;
const storageKey=()=>`exam${currentExam}Practiced`;

function updateProgress(){
  $('progress').textContent=`${practiced.size} / ${currentTypes().length} types practiced`;
  localStorage.setItem(storageKey(),JSON.stringify([...practiced]));
}
function rebuildSidebar(){
  $('sidebar').innerHTML='';
  currentTypes().forEach(([key,label],i)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='side-btn'; b.dataset.index=i;
    b.innerHTML=`<strong>${i+1}</strong>${label}`;
    b.addEventListener('click',()=>loadType(i));
    $('sidebar').appendChild(b);
  });
}
function freshProblem(gen){
  let p,tries=0;
  do{p=gen();tries++;}while(p.key===lastKey&&tries<25);
  lastKey=p.key; return p;
}
function loadType(i){
  currentIndex=i;
  const [key,label,gen]=currentTypes()[i];
  const p=freshProblem(gen);
  document.querySelectorAll('.side-btn').forEach((b,j)=>b.classList.toggle('active',j===i));
  $('title').textContent=label;
  $('qnum').textContent=`QUESTION ${i+1} OF ${currentTypes().length}`;
  if(window.MathJax?.typesetClear) MathJax.typesetClear([$('question'), $('solutionBody')]);
  $('question').innerHTML=p.q;
  $('instructions').textContent=instructionFor(key);
  $('solutionBody').innerHTML=p.s;
  $('solution').hidden=true; shown=false;
  $('showSolution').textContent='Show detailed solution';
  $('showSolution').setAttribute('aria-expanded','false');
  practiced.add(i); updateProgress();
  typeset($('question'));
}
function instructionFor(key){
  const map={
    'line-paired':'Find both equations in slope-intercept form.', evaluate:'Substitute the given input carefully.', domain:'Write the domain in interval notation.', scientific:'Rewrite as a whole number or decimal.', systems:'Use substitution or elimination.', equations:'Solve for x.', exponents:'Simplify completely using positive exponents.', fractions:'Clear the denominators, then solve.', absolute:'Evaluate the absolute value first.', 'line-graph':'Plot at least two points and draw the line.', 'line-points':'Give the equation in slope-intercept form.', quadratic:'Use the five given x-values.', inequality:'Graph the solution and write interval notation.', average:'Set up the weighted average and solve.', 'salary-quantity':'Define a variable and write an equation.', money:'Define a variable and translate the relationship.', mixture:'Write equations for total amount and concentration.',
    'difference-squares':'Factor completely.', 'three-part':'Write the solution in interval notation and graph it on a number line.', 'linear-ineq':'Write the solution in interval notation.', 'poly-multiply':'Multiply and simplify completely.', 'abs-ineq':'Give the answer as an interval.', cubes:'Factor completely.', grouping:'Factor completely by grouping.', 'fraction-ineq':'Write the answer in interval notation.', 'system-ineq':'Graph both inequalities and shade the overlap.', 'or-ineq':'Write the answer in interval notation and graph it.', 'quadratic-eq':'Solve the equation.', 'abs-eq':'Solve the equation.', trinomial:'Factor completely.', 'gcf-factor':'Factor completely.', 'poly-subtract':'Subtract and simplify completely.', 'graph-ineq':'Graph the inequality.', pages:'Write a quadratic equation and solve.'
  };
  return map[key]||'';
}
function randomType(){
  let i=randint(0,16); if(i===currentIndex)i=(i+1)%17; loadType(i);
}
function examRotation(){
  if(!rotationQueue.length) rotationQueue=shuffle([...Array(17).keys()]);
  if(rotationQueue[0]===currentIndex && rotationQueue.length>1) rotationQueue.push(rotationQueue.shift());
  loadType(rotationQueue.shift());
}
// ---------------- NUMBER FOUNDATIONS ----------------
const positiveFactors = n => {
  n=Math.abs(n); const values=[];
  for(let d=1;d*d<=n;d++)if(n%d===0){values.push(d);if(d*d!==n)values.push(n/d)}
  return values.sort((a,b)=>a-b);
};
const signedFactorPairs = n => {
  const pairs=[];if(!n)return pairs;
  for(let d=1;d*d<=Math.abs(n);d++)if(Math.abs(n)%d===0){
    const q=Math.abs(n)/d;
    if(n>0)pairs.push([d,q],[-d,-q]);
    else{pairs.push([d,-q]);if(d!==q)pairs.push([-d,q])}
  }
  return pairs;
};
const multiples = (n,count=10) => Array.from({length:count},(_,i)=>n*(i+1));
let numberQuestion;
function showFoundationPanel(name){
  document.querySelectorAll('[data-foundation]').forEach(b=>{const active=b.dataset.foundation===name;b.classList.toggle('primary',active);b.classList.toggle('secondary',!active);b.setAttribute('aria-pressed',String(active))});
  for(const panel of ['table','factors','common'])$('foundation-'+panel).hidden=panel!==name;
  const choices={table:[['multiply','Multiplication'],['signed','Multiplication with negatives']],factors:[['factors','List positive factors'],['pairs','Find a pair by product and sum']],common:[['gcf','GCD / GCF'],['lcm','LCM']]};
  $('numberPracticeMode').innerHTML=choices[name].map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
  newNumberQuestion();
}
function buildMultiplicationTable(){
  let html='<table class="multiplication-table"><caption class="sr-only">Multiplication products from 1 to 12</caption><thead><tr><th scope="col">×</th>';
  for(let c=1;c<=12;c++)html+=`<th scope="col">${c}</th>`;
  html+='</tr></thead><tbody>';
  for(let r=1;r<=12;r++){html+=`<tr><th scope="row">${r}</th>`;for(let c=1;c<=12;c++)html+=`<td><button type="button" data-row="${r}" data-column="${c}" aria-label="${r} times ${c} equals ${r*c}">${r*c}</button></td>`;html+='</tr>'}
  $('multiplicationTable').innerHTML=html+'</tbody></table>';
  $('multiplicationTable').addEventListener('click',event=>{const button=event.target.closest('button[data-row]');if(!button)return;document.querySelectorAll('.multiplication-table .selected').forEach(b=>b.classList.remove('selected'));button.classList.add('selected');const r=Number(button.dataset.row),c=Number(button.dataset.column);$('multiplicationFact').textContent=`${r} × ${c} = ${r*c}`});
}
function showFactors(){
  const n=Number($('factorNumber').value),el=$('factorResults');
  if(!$('factorNumber').value.trim()||!Number.isInteger(n)||Math.abs(n)>10000){el.textContent='Enter a whole number from −10,000 to 10,000.';return}
  if(n===0){el.textContent='Every nonzero integer divides 0, so 0 has infinitely many integer factors. Zero itself cannot be a divisor. Choose a nonzero number to see a finite list.';return}
  const pos=positiveFactors(n),neg=pos.map(x=>-x).sort((a,b)=>a-b),pairs=signedFactorPairs(n);
  el.innerHTML=`<h4>Positive factors of ${n}</h4><p class="factor-list">${pos.join(', ')}</p><h4>Negative factors of ${n}</h4><p class="factor-list">${neg.join(', ')}</p><p>A factor divides ${n} with no remainder. Both signs divide it evenly.</p><h4>Factor pairs whose product is ${n}</h4><ul class="pair-list">${pairs.map(([a,b])=>`<li>${a<0?'('+a+')':a} × ${b<0?'('+b+')':b} = ${n}</li>`).join('')}</ul><p>${n>0?'A positive product comes from two positive factors or two negative factors.':'A negative product comes from one positive factor and one negative factor.'} Each pair is listed once; reversing the order gives the same pair.</p>`;
}
function compareNumbers(){
  const a=Number($('commonA').value),b=Number($('commonB').value),out=$('commonResults');
  if(!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<1||a>1000||b>1000){out.textContent='Enter two positive integers from 1 to 1,000.';return}
  const fa=positiveFactors(a),fb=positiveFactors(b),shared=fa.filter(x=>b%x===0),G=gcd(a,b),L=a/G*b;
  out.innerHTML=`<p><strong>Factors of ${a}:</strong> ${fa.join(', ')}</p><p><strong>Factors of ${b}:</strong> ${fb.join(', ')}</p><p><strong>Common factors:</strong> ${shared.join(', ')}</p><p><strong>GCD (GCF) = ${G}</strong>: the largest number in the common-factor list.</p><p><strong>First ten positive multiples of ${a}:</strong> ${multiples(a).join(', ')}</p><p><strong>First ten positive multiples of ${b}:</strong> ${multiples(b).join(', ')}</p><p><strong>LCM = ${L}</strong>: the smallest positive multiple shared by both numbers. ${a} × ${L/a} = ${L}, and ${b} × ${L/b} = ${L}.</p><p>The common positive multiples start ${multiples(L,5).join(', ')}.</p>`;
}
function newNumberQuestion(){
  const mode=$('numberPracticeMode').value;
  const practiceFactor=()=>Math.random()<.04?1:randint(2,12);
  const a=practiceFactor(),b=practiceFactor();
  if(mode==='multiply'||mode==='signed'){
    const x=mode==='signed'?a*pick([-1,1]):a,y=mode==='signed'?b*pick([-1,1]):b;
    numberQuestion={mode,prompt:`${x<0?'('+x+')':x} × ${y<0?'('+y+')':y} = ?`,answer:x*y,explanation:`${a} × ${b} = ${a*b}. ${x*y<0?'The signs differ, so the product is negative.':'The signs are the same, so the product is positive.'}`};
  }else if(mode==='factors'){
    const n=Math.random()<.08?pick([2,3,5,7,11,13,17,19]):randint(2,9)*randint(2,8),f=positiveFactors(n);
    numberQuestion={mode,prompt:`List all positive factors of ${n}, separated by commas.`,answer:f,explanation:`The positive factors are ${f.join(', ')}. Check pairs from 1 through the square root: ${signedFactorPairs(n).filter(([x])=>x>0).map(([x,y])=>`${x} × ${y}`).join('; ')}.`};
  }else if(mode==='pairs'){
    const pairFactor=()=> (Math.random()<.04?1:randint(2,9))*pick([-1,1]);
    const x=pairFactor(),y=pairFactor();
    numberQuestion={mode,prompt:`Find two integers with product ${x*y} and sum ${x+y}. Enter the two numbers separated by a comma.`,answer:[x,y],product:x*y,sum:x+y,explanation:`One pair is ${x} and ${y}: ${x} × (${y}) = ${x*y}, and ${x} + (${y}) = ${x+y}.`};
  }else{
    const shared=Math.random()<.08?1:randint(2,6);
    const first=randint(2,8),second=pick([2,3,4,5,6,7,8].filter(n=>n!==first));
    const x=shared*first,y=shared*second,G=gcd(x,y),L=x/G*y;
    numberQuestion={mode,prompt:`Find the ${mode==='gcf'?'GCD (GCF)':mode.toUpperCase()} of ${x} and ${y}.`,answer:mode==='gcf'?G:L,explanation:mode==='gcf'?`Factors of ${x}: ${positiveFactors(x).join(', ')}. Factors of ${y}: ${positiveFactors(y).join(', ')}. The common factors are ${positiveFactors(G).join(', ')}; the greatest is ${G}.`:`The smallest common positive multiple is ${L}: ${x} × ${L/x} = ${L} and ${y} × ${L/y} = ${L}. Their common positive multiples start ${multiples(L,4).join(', ')}.`};
  }
  $('numberPracticeQuestion').textContent=numberQuestion.prompt;$('numberPracticeAnswer').value='';$('numberPracticeFeedback').innerHTML='';
  $('numberPracticeAnswer').placeholder=mode==='factors'?'Example: 1, 2, 3, 6':mode==='pairs'?'Example: −2, 3':'Type a number';
}
function checkNumberAnswer(){
  const raw=$('numberPracticeAnswer').value.trim();let correct=false;
  if(!raw){$('numberPracticeFeedback').innerHTML='<p class="feedback">Enter an answer first.</p>';return}
  if(numberQuestion.mode==='factors'||numberQuestion.mode==='pairs'){
    const parts=raw.replace(/−/g,'-').split(/[,\s]+/).filter(Boolean),values=parts.map(Number);
    if(values.every(Number.isInteger)){
      if(numberQuestion.mode==='pairs')correct=values.length===2&&values[0]*values[1]===numberQuestion.product&&values[0]+values[1]===numberQuestion.sum;
      else{const unique=[...new Set(values)].sort((a,b)=>a-b);correct=unique.length===numberQuestion.answer.length&&unique.every((x,i)=>x===numberQuestion.answer[i])}
    }
  }else correct=Number(raw.replace(/−/g,'-'))===numberQuestion.answer;
  $('numberPracticeFeedback').innerHTML=`<p class="feedback ${correct?'correct':'incorrect'}">${correct?'Correct! '+numberQuestion.explanation:'Not quite. Try again, or select “Show answer & steps.”'}</p>`;
}
function initFoundations(){
  buildMultiplicationTable();showFactors();compareNumbers();showFoundationPanel('table');
  document.querySelectorAll('[data-foundation]').forEach(b=>b.addEventListener('click',()=>showFoundationPanel(b.dataset.foundation)));
  $('findFactors').addEventListener('click',showFactors);$('factorNumber').addEventListener('keydown',e=>{if(e.key==='Enter')showFactors()});$('compareNumbers').addEventListener('click',compareNumbers);
  $('numberPracticeMode').addEventListener('change',newNumberQuestion);$('newNumberQuestion').addEventListener('click',newNumberQuestion);$('checkNumberAnswer').addEventListener('click',checkNumberAnswer);
  $('numberPracticeAnswer').addEventListener('keydown',e=>{if(e.key==='Enter')checkNumberAnswer()});
  $('revealNumberAnswer').addEventListener('click',()=>{$('numberPracticeFeedback').innerHTML=`<p class="feedback">${numberQuestion.explanation}</p>`});
}

function switchExam(n){
  const foundations=String(n)==='foundations';
  const calculator=String(n)==='calculator';
  const hubPages={home:'homePage',exams:'examsPage',syllabus:'syllabusPage',feedback:'feedbackPage'};
  const hub=Object.prototype.hasOwnProperty.call(hubPages,String(n));
  Object.values(hubPages).forEach(id=>$(id).hidden=hubPages[n]!==id);
  $('gradeCalculator').hidden=!calculator;
  $('foundations').hidden=!foundations;
  $('examCard').hidden=foundations||calculator||hub;$('examHeading').hidden=foundations||calculator||hub;
  $('sidebar').hidden=foundations||calculator||hub;$('examRotation').hidden=foundations||calculator||hub;
  document.querySelectorAll('.exam-tab').forEach(b=>b.classList.toggle('active',b.dataset.exam===String(n)));
  if(hub){$('brandTitle').textContent='MATH 101';$('brandDescription').textContent='Course materials, practice, mock tests, and study resources.';return}
  if(calculator){$('brandTitle').textContent='MATH 101 Grade Calculator';$('brandDescription').textContent='Estimate your course grade and try different exam scores.';return}
  if(foundations){$('brandTitle').textContent='Multiplication & Factors';$('brandDescription').textContent='Learn multiplication facts, factors, pairs, and multiples.';return}
  $('brandDescription').textContent='Unlimited exam-style practice. New numbers and expressions each time.';
  currentExam=String(n); currentIndex=0; lastKey=''; rotationQueue=[];
  practiced=new Set(JSON.parse(localStorage.getItem(storageKey())||'[]'));
  document.querySelectorAll('.exam-tab').forEach(b=>b.classList.toggle('active',b.dataset.exam===currentExam));
  $('brandTitle').textContent=currentExam==='final'?'MATH 101 Final Practice':`MATH 101 Exam ${currentExam} Practice`;
  rebuildSidebar(); updateProgress(); loadType(0);
}

document.querySelectorAll('.exam-tab').forEach(b=>b.addEventListener('click',()=>switchExam(b.dataset.exam)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>switchExam(b.dataset.go))); 
$('newQuestion').addEventListener('click',()=>loadType(currentIndex));
$('randomType').addEventListener('click',randomType);
$('examRotation').addEventListener('click',examRotation);
$('showSolution').addEventListener('click',()=>{
  shown=!shown; $('solution').hidden=!shown;
  $('showSolution').textContent=shown?'Hide detailed solution':'Show detailed solution';
  $('showSolution').setAttribute('aria-expanded',String(shown));
  if(shown)typeset($('solutionBody'));
});
rebuildSidebar(); updateProgress(); loadType(0);

initFoundations();
switchExam('home');

// Syllabus-based course grade calculator (client-side only; no scores are sent anywhere).
(function initGradeCalculator(){
  const names=['exam1','exam2','exam3','exam4','final','homework','classwork','quizzes'];
  const limits={exam1:102,exam2:102,exam3:102,exam4:102,final:102,homework:15,classwork:5,quizzes:5};
  const el=n=>document.getElementById('gc-'+n);
  const letter=n=>n>=97.5?'A+':n>=92.5?'A':n>=90?'A-':n>=87.5?'B+':n>=82.5?'B':n>=80?'B-':n>=77.5?'C+':n>=70?'C':n>=60?'D':'F';
  function update(){
    const values={};let error='';
    names.forEach(n=>{const raw=el(n).value.trim(),v=raw===''?0:Number(raw),max=limits[n];
      if(!Number.isFinite(v)||v<0||v>max)error='Please enter a score from 0 to '+max+' for '+n+'.';
      values[n]=v;
    });
    el('error').hidden=!error;el('error').textContent=error;
    if(error){el('grade').textContent='—';el('examavg').textContent='—';el('letter').textContent='';el('dropped').textContent='';el('breakdown').textContent='';return}
    const parts=[['Exam 1',values.exam1],['Exam 2',values.exam2],['Exam 3',values.exam3],['Exam 4',values.exam4],['Final (part 1)',values.final],['Final (part 2)',values.final]];
    const dropped=parts.reduce((best,p,i)=>p[1]<parts[best][1]?i:best,0);
    const examAverage=(parts.reduce((sum,p)=>sum+p[1],0)-parts[dropped][1])/5;
    const total=examAverage*.75+values.homework+values.classwork+values.quizzes;
    el('grade').textContent=total.toFixed(2)+'%';el('letter').textContent=letter(total);
    el('examavg').textContent=examAverage.toFixed(2)+'%';el('dropped').textContent='Dropped: '+parts[dropped][0]+' ('+parts[dropped][1]+'%)';
    el('breakdown').textContent='Exams '+(examAverage*.75).toFixed(2)+' + Homework '+values.homework.toFixed(2)+' + Classwork '+values.classwork.toFixed(2)+' + Quizzes '+values.quizzes.toFixed(2)+' = '+total.toFixed(2)+'%';
  }
  names.forEach(n=>el(n).addEventListener('input',update));
  el('reset').addEventListener('click',()=>{names.forEach(n=>el(n).value='');update()});
  update();
})();



// Exam-specific PDF tabs.
document.querySelectorAll('[data-exam-panel]').forEach(button=>button.addEventListener('click',()=>{
 const n=button.dataset.examPanel;
 document.querySelectorAll('[data-exam-panel]').forEach(b=>b.classList.toggle('active',b===button));
 ['1','2','3','4','final'].forEach(i=>document.getElementById('examPanel'+i).hidden=i!==n);
}));
