const $ = (id) => document.getElementById(id);
const randint = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (a) => a[randint(0, a.length - 1)];
const nonzero = (a, b) => { let n = 0; while (!n) n = randint(a, b); return n; };
const sign = (n) => n === 0 ? "" : (n < 0 ? `− ${Math.abs(n)}` : `+ ${n}`);
const signedTerm = (n, v) => {
  const magnitude=Math.abs(n)===1&&v?v:`${Math.abs(n)}${v}`;
  return n<0?`− ${magnitude}`:`+ ${magnitude}`;
};
const gcd = (a,b) => b ? gcd(b, a%b) : Math.abs(a);
const lcm = (a,b) => Math.abs(a*b)/gcd(a,b);
const frac = (n,d) => `\\frac{${n}}{${d}}`;
const reduce = (n,d) => { const g=gcd(n,d); n/=g; d/=g; if(d<0){n=-n;d=-d;} return d===1 ? `${n}` : `${n}/${d}`; };
const math = (s) => `<div class="math">\\[${s}\\]</div>`;
const inlineMath = (s) => `\\(${s}\\)`;
const texNumber = (value) => {
  const match=String(value).match(/^(-?)(\d+)\/(\d+)$/);
  return match ? `${match[1]}\\frac{${match[2]}}{${match[3]}}` : String(value);
};
const answerMath = (s) => `<div class="answer"><span>Answer</span>${math(`\\boxed{${s}}`)}</div>`;
const signedFraction = (n,d) => n===0 ? "" : (n<0 ? `- ${frac(Math.abs(n),d)}` : `+ ${frac(n,d)}`);
const coefficientTerm = (n, variable="x") => n===1 ? variable : n===-1 ? `-${variable}` : `${n}${variable}`;
const coefficientFactor = (n) => n===1 ? "" : n===-1 ? "-" : `${n}`;
const algebraExpression = (coefficient, constant, variable="x") => `${coefficientTerm(coefficient,variable)} ${sign(constant)}`;
const powerTerm = (variable, exponent) => exponent===1 ? variable : `${variable}^{${exponent}}`;
const typeset = (element) => {
  if (window.renderMathInElement) {
    renderMathInElement(element, {delimiters:[{left:"\\[",right:"\\]",display:true},{left:"\\(",right:"\\)",display:false}],throwOnError:false});
  }
};
function quadraticGraph(a,b,c,points){
  const samples=[];
  for(let x=-3;x<=3.001;x+=0.1) samples.push([x,a*x*x+b*x+c]);
  const ys=samples.map(p=>p[1]).concat(points.map(p=>p[1]),[0]);
  let yMin=Math.floor(Math.min(...ys))-1, yMax=Math.ceil(Math.max(...ys))+1;
  if(yMax-yMin<8){const mid=(yMin+yMax)/2;yMin=Math.floor(mid-4);yMax=Math.ceil(mid+4);}
  const W=520,H=340,pad=38,xMin=-4,xMax=4;
  const X=x=>pad+(x-xMin)*(W-2*pad)/(xMax-xMin);
  const Y=y=>H-pad-(y-yMin)*(H-2*pad)/(yMax-yMin);
  let grid="";
  for(let x=xMin;x<=xMax;x++) grid+=`<line class="graph-grid" x1="${X(x)}" y1="${pad}" x2="${X(x)}" y2="${H-pad}"/><text class="graph-label" x="${X(x)}" y="${H-pad+18}" text-anchor="middle">${x}</text>`;
  const yStep=Math.max(1,Math.ceil((yMax-yMin)/8));
  for(let y=Math.ceil(yMin/yStep)*yStep;y<=yMax;y+=yStep) grid+=`<line class="graph-grid" x1="${pad}" y1="${Y(y)}" x2="${W-pad}" y2="${Y(y)}"/><text class="graph-label" x="${pad-8}" y="${Y(y)+4}" text-anchor="end">${y}</text>`;
  const axes=`<line class="graph-axis" x1="${X(0)}" y1="${pad}" x2="${X(0)}" y2="${H-pad}"/><line class="graph-axis" x1="${pad}" y1="${Y(0)}" x2="${W-pad}" y2="${Y(0)}"/>`;
  const path=samples.map((p,i)=>`${i?"L":"M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ");
  const dots=points.map(([x,y])=>`<circle class="graph-point" cx="${X(x)}" cy="${Y(y)}" r="6"/><text class="graph-label" x="${X(x)+8}" y="${Y(y)-8}">(${x}, ${y})</text>`).join("");
  return `<div class="graph-wrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Graph of the quadratic with the five calculated points plotted">${grid}${axes}<path class="graph-curve" d="${path}"/>${dots}</svg></div>`;
}
function numberLineGraph(k,less,equal){
  const W=620,H=125,pad=42,min=-10,max=10;
  const X=x=>pad+(x-min)*(W-2*pad)/(max-min);
  let ticks="";
  for(let x=min;x<=max;x++){
    const major=x%2===0;
    ticks+=`<line class="number-tick" x1="${X(x)}" y1="${major?45:50}" x2="${X(x)}" y2="65"/>`;
    if(major) ticks+=`<text class="graph-label" x="${X(x)}" y="86" text-anchor="middle">${x}</text>`;
  }
  const start=less?pad:X(k), end=less?X(k):W-pad;
  const arrow=less?`${pad},57 ${pad+14},49 ${pad+14},65`:`${W-pad},57 ${W-pad-14},49 ${W-pad-14},65`;
  const point=equal
    ? `<circle class="number-point closed" cx="${X(k)}" cy="57" r="8"/>`
    : `<circle class="number-point open" cx="${X(k)}" cy="57" r="8"/>`;
  return `<div class="number-line-wrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Number line graph"><line class="number-axis" x1="${pad}" y1="57" x2="${W-pad}" y2="57"/>${ticks}<line class="number-shade" x1="${start}" y1="57" x2="${end}" y2="57"/><polygon class="number-arrow" points="${arrow}"/>${point}<text class="graph-label boundary-label" x="${X(k)}" y="30" text-anchor="middle">${k}</text></svg></div>`;
}
function lineGraph(A,B,C){
  const W=520,H=420,pad=42,min=-10,max=10;
  const X=x=>pad+(x-min)*(W-2*pad)/(max-min);
  const Y=y=>H-pad-(y-min)*(H-2*pad)/(max-min);
  let grid="";
  for(let n=min;n<=max;n++){
    grid+=`<line class="graph-grid" x1="${X(n)}" y1="${pad}" x2="${X(n)}" y2="${H-pad}"/><line class="graph-grid" x1="${pad}" y1="${Y(n)}" x2="${W-pad}" y2="${Y(n)}"/>`;
    if(n%2===0){
      grid+=`<text class="graph-label" x="${X(n)}" y="${Y(0)+18}" text-anchor="middle">${n}</text>`;
      if(n!==0) grid+=`<text class="graph-label" x="${X(0)-8}" y="${Y(n)+4}" text-anchor="end">${n}</text>`;
    }
  }
  const samples=[];
  for(let x=min;x<=max;x+=0.1){const y=(C-A*x)/B;if(y>=min-.5&&y<=max+.5)samples.push([x,y]);}
  const path=samples.map((p,i)=>`${i?"L":"M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ");
  const xInt=C/A,yInt=C/B;
  const dots=[[xInt,0],[0,yInt]].map(([x,y])=>`<circle class="graph-point" cx="${X(x)}" cy="${Y(y)}" r="6"/><text class="graph-label" x="${X(x)+8}" y="${Y(y)-9}">(${Number(x.toFixed(2))}, ${Number(y.toFixed(2))})</text>`).join("");
  return `<div class="graph-wrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Graph of the line with both intercepts plotted">${grid}<line class="graph-axis" x1="${X(0)}" y1="${pad}" x2="${X(0)}" y2="${H-pad}"/><line class="graph-axis" x1="${pad}" y1="${Y(0)}" x2="${W-pad}" y2="${Y(0)}"/><path class="graph-curve" d="${path}"/>${dots}</svg></div>`;
}
function domainGraph(left,right,closedLeft,closedRight){
  const W=520,H=300,pad=42,min=-6,max=6;
  const X=x=>pad+(x-min)*(W-2*pad)/(max-min);
  const Y=y=>H-pad-(y-min)*(H-2*pad)/(max-min);
  let grid="";
  for(let n=min;n<=max;n++){
    grid+=`<line class="graph-grid" x1="${X(n)}" y1="${pad}" x2="${X(n)}" y2="${H-pad}"/><line class="graph-grid" x1="${pad}" y1="${Y(n)}" x2="${W-pad}" y2="${Y(n)}"/>`;
    grid+=`<text class="graph-label" x="${X(n)}" y="${Y(0)+18}" text-anchor="middle">${n}</text>`;
    if(n!==0) grid+=`<text class="graph-label" x="${X(0)-8}" y="${Y(n)+4}" text-anchor="end">${n}</text>`;
  }
  const samples=[];
  for(let x=left;x<=right+.001;x+=(right-left)/80){
    const t=(x-left)/(right-left), y=2*Math.sin(Math.PI*t)-1+t;
    samples.push([x,y]);
  }
  const path=samples.map((p,i)=>`${i?"L":"M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ");
  const endpoint=(x,y,closed)=>`<circle class="graph-point ${closed?"":"open-endpoint"}" cx="${X(x)}" cy="${Y(y)}" r="7"/>`;
  return `<div class="graph-wrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Graph with endpoints that determine the domain">${grid}<line class="graph-axis" x1="${X(0)}" y1="${pad}" x2="${X(0)}" y2="${H-pad}"/><line class="graph-axis" x1="${pad}" y1="${Y(0)}" x2="${W-pad}" y2="${Y(0)}"/><path class="graph-curve" d="${path}"/>${endpoint(left,-1,closedLeft)}${endpoint(right,0,closedRight)}</svg></div>`;
}

let reviewed = 0;
let shown = false;
let problemIndex = 0;
let lastKey = "";

function linearEquation(forcedType) {
  const type=forcedType||pick(["one","one","one","all","none"]);
  if(type==="one"){
    const x=randint(-7,11), a=pick([3,4,5,9]), b=nonzero(-8,8), e=pick([2,3,5,7]);
    const c=pick([-6,-4,-3,-2,-1]), d=nonzero(-9,9);
    const f=a*(x+b)+e-c*(x+d);
    const leftConstant=a*b+e, rightConstant=c*d+f, variableCoefficient=a-c;
    const variableAction=c>0?`Subtract ${coefficientTerm(c)}`:`Add ${coefficientTerm(-c)}`;
    const variableOperation=c>0?`-${coefficientTerm(c)}`:`+${coefficientTerm(-c)}`;
    const constantAction=leftConstant>0?`Subtract ${leftConstant}`:`Add ${Math.abs(leftConstant)}`;
    const constantOperation=leftConstant>0?`-${leftConstant}`:`+${Math.abs(leftConstant)}`;
    const removeConstant=leftConstant===0?`<li>There is no constant on the left to move, so continue with ${math(`${coefficientTerm(variableCoefficient)}=${rightConstant}`)}</li>`:`<li>${constantAction} on both sides: ${math(`${coefficientTerm(variableCoefficient)} ${sign(leftConstant)}${constantOperation}=${rightConstant}${constantOperation}`)}${math(`${coefficientTerm(variableCoefficient)}=${rightConstant-leftConstant}`)}</li>`;
    return {key:`eq-one-${a}-${b}-${e}-${c}-${d}-${f}`,label:"Solving equations",q:`Solve for <em>x</em>. ${math(`${a}\\left(x ${sign(b)}\\right) ${sign(e)}=${coefficientFactor(c)}\\left(x ${sign(d)}\\right) ${sign(f)}`)}`,s:`<ol><li>Distribute on <strong>both</strong> sides. Do not combine anything yet: ${math(`${a}\\left(x\\right)+${a}\\left(${b}\\right) ${sign(e)}=${coefficientFactor(c)}\\left(x\\right)+\\left(${c}\\right)\\left(${d}\\right) ${sign(f)}`)}</li><li>Evaluate each multiplication: ${math(`${coefficientTerm(a)} ${sign(a*b)} ${sign(e)}=${coefficientTerm(c)} ${sign(c*d)} ${sign(f)}`)}</li><li>Combine only the constant terms on each side: ${math(`${algebraExpression(a,leftConstant)}=${algebraExpression(c,rightConstant)}`)}</li><li>${variableAction} on both sides: ${math(`${algebraExpression(a,leftConstant)}${variableOperation}=${algebraExpression(c,rightConstant)}${variableOperation}`)}${math(`${coefficientTerm(variableCoefficient)} ${sign(leftConstant)}=${rightConstant}`)}</li>${removeConstant}<li>Divide both sides by ${variableCoefficient}: ${math(frac(coefficientTerm(variableCoefficient),variableCoefficient)+"="+frac(rightConstant-leftConstant,variableCoefficient))}${math(`x=${x}`)}</li></ol>${answerMath(`x=${x}`)}`};
  }
  const a=pick([2,3,4,5,6,7]), b=nonzero(-8,9);
  let c=a, d=a*b;
  if(type==="none") d=a*b+nonzero(-9,9);
  const leftConstant=a*b;
  const variableDifference=a-c;
  const constantDifference=d-leftConstant;
  const constantAction=leftConstant>0?`Subtract ${leftConstant}`:`Add ${Math.abs(leftConstant)}`;
  const constantOperation=leftConstant>0?`-${leftConstant}`:`+${Math.abs(leftConstant)}`;
  const distributed=`${algebraExpression(a,leftConstant)}=${algebraExpression(c,d)}`;
  let ending="";
  if(type==="one"){
    ending=`<li>Combine the variable terms: ${math(`${coefficientTerm(variableDifference)} ${sign(leftConstant)}=${d}`)}</li><li>${constantAction} on both sides: ${math(`${coefficientTerm(variableDifference)} ${sign(leftConstant)}${constantOperation}=${d}${constantOperation}`)}${math(`${coefficientTerm(variableDifference)}=${constantDifference}`)}</li><li>Divide both sides by ${variableDifference}: ${math(frac(`${coefficientTerm(variableDifference)}`,variableDifference)+"="+frac(constantDifference,variableDifference))}${math(`x=${texNumber(reduce(constantDifference,variableDifference))}`)}</li>${answerMath(`x=${texNumber(reduce(constantDifference,variableDifference))}`)}`;
  } else if(type==="all"){
    ending=`<li>Combine like terms on both sides: ${math(`${leftConstant}=${d}`)}</li><li>Subtract ${leftConstant} from both sides: ${math(`${leftConstant}-${leftConstant}=${d}-${leftConstant}`)}${math(`0=0`)}</li></ol><p>The statement ${inlineMath(`0=0`)} is always true. Therefore, <strong>x can be any real number</strong>.</p><p><strong>In interval notation:</strong></p>${answerMath(`\\left(-\\infty,\\infty\\right)`)}`;
  } else {
    ending=`<li>Combine like terms on both sides: ${math(`${leftConstant}=${d}`)}</li><li>Subtract ${leftConstant} from both sides: ${math(`${leftConstant}-${leftConstant}=${d}-${leftConstant}`)}${math(`0=${constantDifference}`)}</li></ol><p>The statement ${inlineMath(`0=${constantDifference}`)} is false. No value of ${inlineMath(`x`)} can make the original equation true.</p>${answerMath(`\\text{No solution}`)}`;
  }
  return {
    key:`eq-${type}-${a}-${b}-${c}-${d}`,
    label:"Solving equations",
    q:`Solve for <em>x</em>. ${math(`${a}\\left(x ${sign(b)}\\right)=${algebraExpression(c,d)}`)}`,
    s:`<ol><li>Distribute ${a} to <strong>both</strong> terms inside the parentheses: ${math(`${a}\\left(x\\right) ${b<0?"-":"+"} ${a}\\left(${Math.abs(b)}\\right)=${algebraExpression(c,d)}`)}${math(distributed)}</li><li>Subtract ${coefficientTerm(c)} from both sides: ${math(`${algebraExpression(a,leftConstant)}-${coefficientTerm(c)}=${algebraExpression(c,d)}-${coefficientTerm(c)}`)}</li>${ending}${type==="one"?"</ol>":""}`
  };
}

function fractionEquation() {
  const [den1,den2]=pick([[4,5],[4,7],[5,8],[6,7]]), lcd=lcm(den1,den2);
  let x,a,c,b,r,k,attempts=0;
  do{
    x=randint(-6,9); a=nonzero(-6,7); c=pick([2,3,4,5]); b=nonzero(-7,8); r=pick([-2,-1,1,2]);
    k=(x+a)/den1-(c*x+b)/den2-r*x;
    attempts++;
  }while((!Number.isInteger(k)||Math.abs(k)>20)&&attempts<500);
  const m1=lcd/den1, m2=lcd/den2;
  const factoredLCD=`${den2}\\left(${den1}\\right)`;
  const leftCoef=m1-m2*c, leftConst=m1*a-m2*b, rightCoef=lcd*r, rightConst=lcd*k;
  const variableAction=rightCoef>0?`Subtract ${coefficientTerm(rightCoef)}`:`Add ${coefficientTerm(-rightCoef)}`;
  const variableOperation=rightCoef>0?`-${coefficientTerm(rightCoef)}`:`+${coefficientTerm(-rightCoef)}`;
  const finalCoef=leftCoef-rightCoef, finalConst=rightConst-leftConst;
  const constantAction=leftConst>0?`Subtract ${leftConst}`:`Add ${Math.abs(leftConst)}`;
  const constantOperation=leftConst>0?`-${leftConst}`:`+${Math.abs(leftConst)}`;
  return {
    key:`fr-${den1}-${den2}-${a}-${b}-${c}-${r}-${k}`,
    label:"Equations with fractions",
    q:`Solve for <em>x</em>. ${math(`${frac(`x ${sign(a)}`,den1)}-${frac(`${coefficientTerm(c)} ${sign(b)}`,den2)}=${algebraExpression(r,k)}`)}`,
    s:`<p>The denominators are ${den1} and ${den2}. Write the LCD as ${inlineMath(factoredLCD)} and <strong>leave it factored</strong> until the denominators cancel.</p><ol><li>Multiply the <strong>entire equation</strong> by ${inlineMath(factoredLCD)}: ${math(`${factoredLCD}\\left(${frac(`x ${sign(a)}`,den1)}-${frac(`${coefficientTerm(c)} ${sign(b)}`,den2)}\\right)=${factoredLCD}\\left(${algebraExpression(r,k)}\\right)`)}</li><li>Distribute ${inlineMath(factoredLCD)} to every term. Do not evaluate ${inlineMath(factoredLCD)} yet: ${math(`${factoredLCD}\\left(${frac(`x ${sign(a)}`,den1)}\\right)-${factoredLCD}\\left(${frac(`${coefficientTerm(c)} ${sign(b)}`,den2)}\\right)=${factoredLCD}\\left(${coefficientTerm(r)}\\right)+${factoredLCD}\\left(${k}\\right)`)}</li><li>Cancel each denominator first: ${math(`${m1}\\left(x ${sign(a)}\\right)-${m2}\\left(${coefficientTerm(c)} ${sign(b)}\\right)=${factoredLCD}\\left(${coefficientTerm(r)}\\right)+${factoredLCD}\\left(${k}\\right)`)}</li><li>Distribute through the remaining parentheses, still leaving the products unevaluated: ${math(`${m1}\\left(x\\right)+${m1}\\left(${a}\\right)-\\left(${m2}\\left(${coefficientTerm(c)}\\right)+${m2}\\left(${b}\\right)\\right)=${factoredLCD}\\left(${coefficientTerm(r)}\\right)+${factoredLCD}\\left(${k}\\right)`)}</li><li>Now evaluate each product: ${math(`${coefficientTerm(m1)} ${sign(m1*a)}-\\left(${coefficientTerm(m2*c)} ${sign(m2*b)}\\right)=${coefficientTerm(rightCoef)} ${sign(rightConst)}`)}</li><li>Remove the parentheses and combine like terms on the left: ${math(`${algebraExpression(leftCoef,leftConst)}=${algebraExpression(rightCoef,rightConst)}`)}</li><li>${variableAction} on both sides: ${math(`${algebraExpression(leftCoef,leftConst)}${variableOperation}=${algebraExpression(rightCoef,rightConst)}${variableOperation}`)}${math(`${coefficientTerm(finalCoef)} ${sign(leftConst)}=${rightConst}`)}</li><li>${constantAction} on both sides: ${math(`${coefficientTerm(finalCoef)} ${sign(leftConst)}${constantOperation}=${rightConst}${constantOperation}`)}${math(`${coefficientTerm(finalCoef)}=${finalConst}`)}</li><li>Divide both sides by ${finalCoef}: ${math(frac(coefficientTerm(finalCoef),finalCoef)+"="+frac(finalConst,finalCoef))}${math(`x=${texNumber(reduce(finalConst,finalCoef))}`)}</li></ol>${answerMath(`x=${texNumber(reduce(finalConst,finalCoef))}`)}`
  };
}

function systemQuestion() {
  const x=randint(-5,9), y=randint(-5,9);
  const a=pick([2,3,4,6]), b=pick([1,2,3,5]), c=pick([1,2,3,5]), d=-b;
  const e=a*x+b*y, f=c*x+d*y;
  const multA=c, multB=a;
  const xNum=multA*e-multB*f, xCoef=multA*a-multB*c;
  return {
    key:`sys-${a}-${b}-${c}-${d}-${e}-${f}`,
    label:"Systems of equations",
    q:`Solve the system. ${math(`${coefficientTerm(a)} ${signedTerm(b,"y")} = ${e} \\qquad ${coefficientTerm(c)} ${signedTerm(d,"y")} = ${f}`)}`,
    s:`<p>We will eliminate <em>x</em>.</p><ol><li>Multiply the first equation by ${multA}: ${math(`${coefficientTerm(multA*a)} ${signedTerm(multA*b,"y")} = ${multA*e}`)}</li><li>Multiply the second equation by −${multB}: ${math(`${coefficientTerm(-multB*c)} ${signedTerm(-multB*d,"y")} = ${-multB*f}`)}</li><li>Add the equations. The <em>x</em>-terms cancel, leaving ${math(`${coefficientTerm(multA*b-multB*d,"y")} = ${multA*e-multB*f}`)}</li><li>Divide to find ${inlineMath("y")}: ${math(`y = ${y}`)}</li><li>Substitute ${inlineMath(`y=${y}`)} into the first original equation: ${math(`${coefficientTerm(a)} ${signedTerm(b*y,"")} = ${e}`)}${math(`${coefficientTerm(a)}=${e-b*y}`)}${math(`x=${x}`)}</li></ol>${answerMath(`(${x}, ${y})`)}`
  };
}

function applicationQuestion(forcedKind) {
  const kind=forcedKind||pick(["average","salary","mixture","rectangle","bills","marbles","supplies"]);
  if(kind==="average"){
    const weight=pick([2,3,4]), target=80, needed=pick([82,84,86,88,90]), denominator=4+weight;
    let scores,sum;
    do{
      scores=[randint(64,76),randint(69,79),randint(72,82)];
      const fourth=target*denominator-weight*needed-scores.reduce((a,n)=>a+n,0);
      scores.push(fourth); sum=scores.reduce((a,n)=>a+n,0);
    }while(scores[3]<62||scores[3]>82);
    return {key:`app-avg-${scores.join("-")}-${weight}`,label:"Applications · weighted average",q:`A student has test scores of ${scores.join(", ")}. The final exam is worth ${weight} test grades. Let ${inlineMath("x")} be the final-exam grade and ${inlineMath("y")} the course grade. Write a linear equation for the course grade, then find the final-exam grade needed for an average of ${target}%.`,s:`<ol><li>Add the four test scores but leave the final exam as ${inlineMath(`${weight}x`)}: ${math(`y=${frac(`${scores.join("+")}+${weight}x`,denominator)}`)}</li><li>For a course grade of ${target}, replace ${inlineMath("y")} with ${target}: ${math(`${target}=${frac(`${sum}+${weight}x`,denominator)}`)}</li><li>Multiply both sides by ${denominator}: ${math(`${denominator}\\left(${target}\\right)=${sum}+${weight}x`)}</li><li>Subtract ${sum} from both sides: ${math(`${denominator*target}-${sum}=${weight}x`)}${math(`${denominator*target-sum}=${weight}x`)}</li><li>Divide both sides by ${weight}: ${math(`x=${needed}`)}</li></ol>${answerMath(`x=${needed}\\%`)}`};
  }
  if(kind==="salary"){
    const monthly=pick([5250,5875,6425,7150]), bonus=pick([4800,5700,6900,7500]), total=12*monthly+bonus;
    return {key:`app-salary-${monthly}-${bonus}`,label:"Applications · salary",q:`An employee earns a monthly salary plus a yearly bonus of $${bonus.toLocaleString()}. The total yearly income is $${total.toLocaleString()}. What is the monthly salary?`,s:`<p>Let ${inlineMath("x")} be the monthly salary. Twelve months of salary plus the bonus gives the yearly income.</p>${math(`12x+${bonus}=${total}`)}<ol><li>Subtract ${bonus} from both sides: ${math(`12x+${bonus}-${bonus}=${total}-${bonus}`)}${math(`12x=${12*monthly}`)}</li><li>Divide both sides by 12: ${math(frac("12x",12)+"="+frac(12*monthly,12))}${math(`x=${monthly}`)}</li></ol><p class="answer">Answer: $${monthly.toLocaleString()} per month.</p>`};
  }
  if(kind==="tickets"){
    const child=randint(25,75), adult=randint(30,80), p1=pick([7,9,11]), p2=p1+pick([4,5,6]), total=child+adult, money=p1*child+p2*adult;
    return {key:`app-t-${child}-${adult}-${p1}`,label:"Applications · tickets",q:`A school performance sold ${total} tickets. Student tickets cost $${p1}, and adult tickets cost $${p2}. The total collected was $${money}. How many of each ticket were sold?`,s:`<p>Let <em>s</em> be student tickets and <em>a</em> be adult tickets.</p>${math(`s + a = ${total}`)}${math(`${p1}s + ${p2}a = ${money}`)}<ol><li>From the first equation, ${math(`s = ${total} − a`)}</li><li>Substitute: ${math(`${p1}(${total} − a) + ${p2}a = ${money}`)}</li><li>Simplify: ${math(`${p1*total} + ${p2-p1}a = ${money}`)}</li><li>Solve: ${math(`a = ${adult}`)}, then ${math(`s = ${child}`)}</li></ol><p class="answer">Answer: ${child} student tickets and ${adult} adult tickets.</p>`};
  }
  if(kind==="mixture"){
    const low=pick([10,20,30]), high=pick([40,50,60]), total=pick([80,120]), x=pick([20,30,40,50]), y=total-x, target=(low*x+high*y)/total;
    const lowCoef=low/10, highCoef=high/10, solute=(target/100)*total;
    const clearedTotal=solute*10;
    return {key:`app-mix-${low}-${high}-${x}-${y}`,label:"Applications · mixtures",q:`How many liters of a ${low}% solution and a ${high}% solution should be combined to make ${total} liters of a ${target}% solution?`,s:`<p>Let <em>x</em> be liters of the ${low}% solution and <em>y</em> be liters of the ${high}% solution.</p>${math(`x + y = ${total}`)}${math(`${(low/100).toFixed(1)}x + ${(high/100).toFixed(1)}y = ${solute}`)}<ol><li>Multiply the entire second equation by 10 to remove the decimals: ${math(`10\\left(${(low/100).toFixed(1)}x + ${(high/100).toFixed(1)}y\\right) = 10\\left(${solute}\\right)`)}${math(`${coefficientTerm(lowCoef)} ${signedTerm(highCoef,"y")} = ${clearedTotal}`)}</li><li>Multiply the first equation by ${-lowCoef}: ${math(`${coefficientTerm(-lowCoef)} ${signedTerm(-lowCoef,"y")} = ${-lowCoef*total}`)}</li><li>Add the equations to eliminate <em>x</em>: ${math(`${coefficientTerm(highCoef-lowCoef,"y")} = ${clearedTotal-lowCoef*total}`)}</li><li>Solve for <em>y</em>, then substitute into ${inlineMath(`x+y=${total}`)}: ${math(`y = ${y} \\qquad x = ${x}`)}</li></ol>${answerMath(`x = ${x}\\text{ L}, \\qquad y = ${y}\\text{ L}`)}`};
  }
  if(kind==="rectangle"){
    const w=randint(5,14), k=pick([2,3,5]), len=k*w, per=2*(len+w);
    return {key:`app-r-${w}-${k}`,label:"Applications · geometry",q:`A rectangular patio has a perimeter of ${per} feet. Its length is ${k} times its width. Find the length and width.`,s:`<p>Let <em>L</em> be length and <em>W</em> be width.</p>${math(`2L + 2W = ${per}`)}${math(`L = ${k}W`)}<ol><li>Substitute ${k}<em>W</em> for <em>L</em>: ${math(`2(${k}W) + 2W = ${per}`)}</li><li>Combine like terms: ${math(`${2*k+2}W = ${per}`)}</li><li>Thus ${math(`W = ${w}`)}</li><li>Then ${math(`L = ${k}(${w}) = ${len}`)}</li></ol><p class="answer">Answer: width ${w} feet and length ${len} feet.</p>`};
  }
  if(kind==="bills"){
    const t=pick([25,35,45,55,65]), f=2*t, money=5*f+10*t;
    return {key:`app-b-${f}-${t}`,label:"Applications · money",q:`A cash register contains only five-dollar and ten-dollar bills. It has twice as many five-dollar bills as ten-dollar bills and contains $${money} total. How many ten-dollar bills are there?`,s:`<p>Let ${inlineMath("t")} be the number of ten-dollar bills. Then the number of five-dollar bills is ${inlineMath("2t")}.</p><ol><li>Write the value equation: ${math(`5\\left(2t\\right)+10t=${money}`)}</li><li>Multiply, but keep both terms visible: ${math(`10t+10t=${money}`)}</li><li>Combine like terms: ${math(`20t=${money}`)}</li><li>Divide both sides by 20: ${math(frac("20t",20)+"="+frac(money,20))}${math(`t=${t}`)}</li></ol><p class="answer">Answer: ${t} ten-dollar bills.</p>`};
  }
  if(kind==="marbles"){
    const blue=randint(18,42), diff=pick([7,11,13,17]), green=blue+diff, total=blue+green;
    return {key:`app-mar-${blue}-${diff}`,label:"Applications · quantities",q:`A bag contains ${total} blue and green marbles. There are ${diff} more green marbles than blue marbles. How many of each color are there?`,s:`<p>Let <em>b</em> be blue marbles and <em>g</em> be green marbles.</p>${math(`b + g = ${total}`)}${math(`g = b + ${diff}`)}<ol><li>Substitute into the total: ${math(`b + (b + ${diff}) = ${total}`)}</li><li>Combine like terms: ${math(`2b + ${diff} = ${total}`)}</li><li>Thus ${math(`b = ${blue}`)}</li><li>Then ${math(`g = ${blue} + ${diff} = ${green}`)}</li></ol><p class="answer">Answer: ${blue} blue marbles and ${green} green marbles.</p>`};
  }
  const x=randint(4,11), y=randint(4,11), p1=pick([9,11,13]), p2=pick([4,5,7]), total=x+y, cost=p1*x+p2*y;
  return {key:`app-s-${x}-${y}-${p1}-${p2}`,label:"Applications · purchases",q:`A club buys ${total} boxes of notebooks and markers. Notebooks cost $${p1} per box, and markers cost $${p2} per box. The club spends $${cost}. How many boxes of each type are purchased?`,s:`<p>Let <em>n</em> be notebook boxes and <em>m</em> be marker boxes.</p>${math(`n + m = ${total}`)}${math(`${p1}n + ${p2}m = ${cost}`)}<ol><li>From the first equation, ${math(`m = ${total} − n`)}</li><li>Substitute: ${math(`${p1}n + ${p2}(${total} − n) = ${cost}`)}</li><li>Combine like terms: ${math(`${p1-p2}n + ${p2*total} = ${cost}`)}</li><li>Thus ${math(`n = ${x}`)} and ${math(`m = ${y}`)}</li></ol><p class="answer">Answer: ${x} notebook boxes and ${y} marker boxes.</p>`};
}

function linesQuestion(forcedKind) {
  const kind=forcedKind||pick(["points","paired","standard"]);
  const m=pick([-5,-3,-2,2,3,4,5]), b=nonzero(-14,14);
  if(kind==="points"){
    const x1=randint(-6,1), x2=x1+pick([2,3,4]), y1=m*x1+b, y2=m*x2+b;
    return {key:`line-p-${m}-${b}-${x1}`,label:"Lines · two points",q:`Find the equation of the line through (${x1}, ${y1}) and (${x2}, ${y2}) in slope-intercept form.`,s:`<ol><li>Find the slope: ${math(`m = ${frac(`${y2} − (${y1})`,`${x2} − (${x1})`)} = ${m}`)}</li><li>Use ${math(`y = mx + b`)} with (${x1}, ${y1}): ${math(`${y1} = ${m}(${x1}) + b`)}</li><li>Solve for the intercept: ${math(`b = ${b}`)}</li></ol><p class="answer">Answer: <em>y</em> = ${m}<em>x</em> ${sign(b)}</p>`};
  }
  if(kind==="standard"){
    const A=pick([2,4,5,6]), B=pick([3,7,8]), C=pick([-24,-18,-12,12,20,28]);
    return {key:`line-s-${A}-${B}-${C}`,label:"Lines · graphing",q:`Graph the line ${inlineMath(`${A}x + ${B}y = ${C}`)}. Identify two points that can be plotted.`,s:`<ol><li>For the <em>x</em>-intercept, set ${inlineMath(`y=0`)}: ${math(`${A}x = ${C}, \\quad x = ${texNumber(reduce(C,A))}`)}</li><li>For the <em>y</em>-intercept, set ${inlineMath(`x=0`)}: ${math(`${B}y = ${C}, \\quad y = ${texNumber(reduce(C,B))}`)}</li><li>Plot the two intercepts and draw the line through them.</li></ol>${lineGraph(A,B,C)}${answerMath(`\\left(${texNumber(reduce(C,A))},0\\right), \\qquad \\left(0,${texNumber(reduce(C,B))}\\right)`)}`};
  }
  const x0=randint(-6,7), y0=randint(-8,9);
  const parallelB=y0-m*x0;
  const pmN=-Math.sign(m), pmD=Math.abs(m);
  const perpBNum=y0*pmD-pmN*x0;
  const perpBTex=texNumber(reduce(perpBNum,pmD));
  const perpBSign=perpBNum===0?"":(perpBNum<0?`- ${texNumber(reduce(Math.abs(perpBNum),pmD))}`:`+ ${perpBTex}`);
  const perpSlopeTex=pmN<0?`-${frac(1,pmD)}`:frac(1,pmD);
  const expandedParallel=m*(-x0);
  const expandedPerpNum=-pmN*x0;
  return {key:`line-paired-${m}-${b}-${x0}-${y0}`,label:"Lines · parallel and perpendicular",q:`Consider the line ${inlineMath(`y=${m}x ${sign(b)}`)}.<br><br>(a) Find the equation of the parallel line through ${inlineMath(`(${x0},${y0})`)}.<br><br>(b) Find the equation of the perpendicular line through ${inlineMath(`(${x0},${y0})`)}.`,s:`<h3>(a) Parallel line</h3><ol><li>Parallel lines have the same slope: ${math(`m=${m}`)}</li><li>Use point-slope form ${inlineMath(`y-y_1=m\\left(x-x_1\\right)`)}: ${math(`y-\\left(${y0}\\right)=${m}\\left(x-\\left(${x0}\\right)\\right)`)}</li><li>Distribute ${m} to both terms: ${math(`y-\\left(${y0}\\right)=${m}\\left(x\\right)-${m}\\left(${x0}\\right)`)}${math(`y-\\left(${y0}\\right)=${m}x ${sign(expandedParallel)}`)}</li><li>Add ${inlineMath(y0)} to both sides: ${math(`y-\\left(${y0}\\right)+\\left(${y0}\\right)=${m}x ${sign(expandedParallel)}+\\left(${y0}\\right)`)}${math(`y=${m}x ${sign(expandedParallel)}+\\left(${y0}\\right)`)}</li><li>Combine the constants: ${math(`y=${m}x ${sign(parallelB)}`)}</li></ol>${answerMath(`y=${m}x ${sign(parallelB)}`)}<h3>(b) Perpendicular line</h3><ol><li>The original slope is ${inlineMath(`m=${m}`)}. Flip the fraction and change its sign.</li><li>Simplify the two signs: ${math(`m_{\\perp}=${perpSlopeTex}`)}</li><li>Use point-slope form: ${math(`y-\\left(${y0}\\right)=${perpSlopeTex}\\left(x-\\left(${x0}\\right)\\right)`)}</li><li>Distribute to both terms: ${math(`y-\\left(${y0}\\right)=${perpSlopeTex}x ${signedFraction(expandedPerpNum,pmD)}`)}</li><li>Add ${inlineMath(y0)} to both sides: ${math(`y-\\left(${y0}\\right)+\\left(${y0}\\right)=${perpSlopeTex}x ${signedFraction(expandedPerpNum,pmD)}+\\left(${y0}\\right)`)}${math(`y=${perpSlopeTex}x ${signedFraction(expandedPerpNum,pmD)}+\\left(${y0}\\right)`)}</li><li>Write ${inlineMath(y0)} with denominator ${pmD}: ${math(`y=${perpSlopeTex}x ${signedFraction(expandedPerpNum,pmD)} ${signedFraction(y0*pmD,pmD)}`)}</li><li>Combine the numerators: ${math(`y=${perpSlopeTex}x ${signedFraction(perpBNum,pmD)}`)}</li></ol>${answerMath(`y=${perpSlopeTex}x ${perpBSign}`)}`};
}

function functionsQuestion(forcedKind) {
  const kind=forcedKind||pick(["evaluate","quadratic","domain","inequality"]);
  if(kind==="evaluate"){
    const a=pick([2,4,5,7]), b=pick([-5,-2,3,6]), c=pick([-7,-3,4,8]), d=nonzero(-6,9), x=pick([-4,-3,-2,2,3]);
    const ans=a*x*x*x+b*x*x+c*x+d;
    return {key:`fn-e-${a}-${b}-${c}-${d}-${x}`,label:"Functions · evaluation",q:`Let ${inlineMath(`f(x) = ${a}x^3 ${signedTerm(b,"x^2")} ${signedTerm(c,"x")} ${sign(d)}`)}. Find ${inlineMath(`f(${x})`)}.`,s:`<ol><li>Replace every <em>x</em> with ${x}: ${math(`f(${x}) = ${a}(${x})^3 ${signedTerm(b,`(${x})^2`)} ${signedTerm(c,`(${x})`)} ${sign(d)}`)}</li><li>Evaluate the powers first, then multiply and combine.</li></ol>${answerMath(`f(${x}) = ${ans}`)}`};
  }
  if(kind==="quadratic"){
    const a=pick([-2,-1,1,2]), b=pick([-4,-2,2,4]), c=pick([-3,1,4,5]);
    const values=[-2,-1,0,1,2].map(x=>[x,a*x*x+b*x+c]);
    const vals=values.map(([x,y])=>`${x} \\mapsto ${y}`).join("\\qquad ");
    const points=values.map(([x,y])=>`(${x}, ${y})`).join(", ");
    const pointsTex=values.map(([x,y])=>`\\left(${x},${y}\\right)`).join("\\qquad ");
    const work=values.map(([x,y])=>math(`x=${x}:\\quad y=${a}\\left(${x}\\right)^2 ${signedTerm(b,`\\left(${x}\\right)`)} ${sign(c)}=${y}`)).join("");
    return {key:`fn-q-${a}-${b}-${c}`,label:"Functions · graphing",q:`Sketch a graph of ${inlineMath(`y=${a===1?"":a===-1?"−":a}x^2 ${signedTerm(b,"x")} ${sign(c)}`)} by plotting the points for ${inlineMath(`x=−2,−1,0,1,2`)}.`,s:`<p>Substitute each requested <em>x</em>-value into the function.</p>${work}<p>The completed value table is:</p>${math(vals)}${quadraticGraph(a,b,c,values)}${answerMath(pointsTex)}`};
  }
  if(kind==="domain"){
    const left=randint(-5,-2), right=randint(2,5), closedL=Math.random()>.5, closedR=Math.random()>.5;
    return {key:`fn-d-${left}-${right}-${closedL}-${closedR}`,label:"Functions · domain",q:`Write the domain of the function using interval notation.${domainGraph(left,right,closedL,closedR)}`,s:`<ol><li>Read the graph from left to right. Its leftmost ${inlineMath("x")} value is ${inlineMath(left)}, and its rightmost ${inlineMath("x")} value is ${inlineMath(right)}.</li><li>The point at ${inlineMath(`x=${left}`)} is ${closedL?"closed, so include it with a bracket":"open, so do not include it; use a parenthesis"}.</li><li>The point at ${inlineMath(`x=${right}`)} is ${closedR?"closed, so include it with a bracket":"open, so do not include it; use a parenthesis"}.</li></ol>${answerMath(`${closedL?"[":"("}${left},${right}${closedR?"]":")"}`)}`};
  }
  const k=randint(-8,9), less=Math.random()>.5, equal=Math.random()>.5;
  const symbol=less?(equal?"≤":"<"):(equal?"≥":">");
  const interval=less?`(−∞, ${k}${equal?"]":")"}`:`${equal?"[":"("}${k}, ∞)`;
  return {key:`fn-i-${k}-${symbol}`,label:"Inequalities",q:`Graph ${inlineMath(`x ${symbol} ${k}`)} on a number line and write the solution in interval notation.`,s:`<p>Place a ${equal?"closed":"open"} point at ${k}. Shade ${less?"to the left":"to the right"} because the solution contains numbers ${less?"less than":"greater than"} ${k}.</p>${numberLineGraph(k,less,equal)}<p>Infinity always uses a parenthesis.</p>${answerMath(interval.replace("∞","\\infty"))}`};
}

function foundationsQuestion(forcedKind) {
  const kind=forcedKind||pick(["scientific","absolute","exponents"]);
  if(kind==="scientific"){
    const n=(randint(121,989)/100).toFixed(2), exp=pick([3,4,5,6,8]);
    return {key:`base-s-${n}-${exp}`,label:"Scientific notation",q:`Rewrite ${math(`${n} \\times 10^{${exp}}`)} as a whole number or decimal.`,s:`<p>A positive exponent moves the decimal ${exp} places to the right.</p>${answerMath((Number(n)*10**exp).toLocaleString("en-US",{useGrouping:false}))}`};
  }
  if(kind==="absolute"){
    const n=randint(-45,-2);
    return {key:`base-a-${n}`,label:"Absolute value",q:`Evaluate ${inlineMath(`−|${n}|`)}.`,s:`<ol><li>The absolute value gives the distance from zero: ${math(`|${n}| = ${Math.abs(n)}`)}</li><li>The negative sign is outside the absolute-value bars: ${math(`−|${n}| = −${Math.abs(n)}`)}</li></ol>${answerMath(`−${Math.abs(n)}`)}`};
  }
  const form=pick(["simple","outer","outer"]);
  if(form==="simple"){
    const xp=pick([3,5,6]), xn=pick([2,4,7]), yn=pick([2,3,5]), yp=pick([4,6,7]);
    return {key:`base-x-simple-${xp}-${xn}-${yn}-${yp}`,label:"Exponent rules",q:`Simplify completely. ${math(frac(`x^{${xp}}y^{-${yn}}`,`x^{-${xn}}y^{${yp}}`))}`,s:`<ol><li>Move each factor with a negative exponent across the fraction bar. Its exponent becomes positive: ${math(frac(`x^{${xp}}x^{${xn}}`,`y^{${yn}}y^{${yp}}`))}</li><li>Move every factor in the denominator up to the numerator. Change the sign of each exponent: ${math(`x^{${xp}}x^{${xn}}y^{-${yn}}y^{-${yp}}`)}</li><li>Use the product rule and add the exponents of matching bases: ${math(`x^{${xp}+${xn}}y^{-${yn}+\\left(-${yp}\\right)}`)}</li><li>Evaluate the exponents: ${math(`x^{${xp+xn}}y^{-${yn+yp}}`)}</li><li>Move the factor with the negative exponent back to the denominator: ${math(frac(`x^{${xp+xn}}`,`y^{${yn+yp}}`))}</li></ol>${answerMath(frac(`x^{${xp+xn}}`,`y^{${yn+yp}}`))}`};
  }
  const n=pick([2,3]), a=pick([4,5,6]), s=pick([1,2,3]), p=pick([4,5,6]), q=pick([1,2,3]), b=pick([4,5,6]), r=pick([1,2,3]);
  const ix=a-s, iy=p-q, iz=b-r;
  return {key:`base-x-outer-${n}-${a}-${s}-${p}-${q}-${b}-${r}`,label:"Exponent rules",q:`Simplify completely. ${math(`\\left(${frac(`x^{-${a}}y^{${p}}z^{-${b}}`,`y^{${q}}z^{-${r}}x^{-${s}}`)}\\right)^{-${n}}`)}`,s:`<ol><li>Leave the outside exponent alone for now. Move every factor with a negative exponent across the fraction bar. Make each moved exponent positive: ${math(`\\left(${frac(`x^{${s}}y^{${p}}z^{${r}}`,`x^{${a}}y^{${q}}z^{${b}}`)}\\right)^{-${n}}`)}</li><li>Move every factor in the denominator up to the numerator. Change the sign of each exponent: ${math(`\\left(x^{${s}}y^{${p}}z^{${r}}x^{-${a}}y^{-${q}}z^{-${b}}\\right)^{-${n}}`)}</li><li>Use the product rule and add the exponents of matching bases: ${math(`\\left(x^{${s}+\\left(-${a}\\right)}y^{${p}+\\left(-${q}\\right)}z^{${r}+\\left(-${b}\\right)}\\right)^{-${n}}`)}</li><li>Evaluate the exponents inside the parentheses: ${math(`\\left(x^{-${ix}}y^{${iy}}z^{-${iz}}\\right)^{-${n}}`)}</li><li>Apply the outside power to every factor. Multiply each inside exponent by ${math(`-${n}`)}: ${math(`x^{-${ix}\\left(-${n}\\right)}y^{${iy}\\left(-${n}\\right)}z^{-${iz}\\left(-${n}\\right)}`)}</li><li>Multiply the exponents: ${math(`x^{${ix*n}}y^{-${iy*n}}z^{${iz*n}}`)}</li><li>Move the factor with the negative exponent back to the denominator: ${math(frac(`${powerTerm("x",ix*n)}${powerTerm("z",iz*n)}`,powerTerm("y",iy*n)))}</li></ol>${answerMath(frac(`${powerTerm("x",ix*n)}${powerTerm("z",iz*n)}`,powerTerm("y",iy*n)))}`};
}

const groups={
  equations:[linearEquation],
  fractions:[fractionEquation],
  systems:[systemQuestion],
  "line-paired":[()=>linesQuestion("paired")],
  "line-points":[()=>linesQuestion("points")],
  "line-graph":[()=>linesQuestion("standard")],
  quadratic:[()=>functionsQuestion("quadratic")],
  domain:[()=>functionsQuestion("domain")],
  inequality:[()=>functionsQuestion("inequality")],
  evaluate:[()=>functionsQuestion("evaluate")],
  exponents:[()=>foundationsQuestion("exponents")],
  scientific:[()=>foundationsQuestion("scientific")],
  absolute:[()=>foundationsQuestion("absolute")],
  applications:[applicationQuestion]
};
const examBlueprint=[
  ()=>linesQuestion("paired"),
  ()=>functionsQuestion("domain"),
  ()=>functionsQuestion("inequality"),
  ()=>functionsQuestion("quadratic"),
  ()=>linearEquation("one"),
  ()=>linesQuestion("standard"),
  ()=>foundationsQuestion("exponents"),
  ()=>functionsQuestion("evaluate"),
  ()=>linesQuestion("points"),
  ()=>foundationsQuestion("absolute"),
  fractionEquation,
  systemQuestion,
  ()=>foundationsQuestion("scientific"),
  ()=>applicationQuestion("average"),
  ()=>applicationQuestion(pick(["salary","rectangle","marbles"])),
  ()=>applicationQuestion("bills"),
  ()=>applicationQuestion(pick(["mixture","supplies"]))
];
const shuffle=(items)=>{
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=randint(0,i);[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
};
let examQueue=[];
let examQuestionNumber=0;

function nextProblem(){
  const selected=$("topic").value;
  let choices;
  if(selected==="exam"){
    if(examQueue.length===0){examQueue=shuffle(examBlueprint);examQuestionNumber=0;}
    choices=[examQueue.shift()];
    examQuestionNumber++;
  } else choices=groups[selected];
  let p, tries=0;
  do { p=pick(choices)(); tries++; } while(p.key===lastKey && tries<20);
  lastKey=p.key; problemIndex++;
  $("question").innerHTML=p.q;
  $("solutionBody").innerHTML=p.s;
  $("topicLabel").textContent=p.label;
  $("problemNumber").textContent=selected==="exam"?`Question ${examQuestionNumber} of 17`:`Question ${problemIndex}`;
  $("solution").hidden=true;
  $("showSolution").textContent="Show detailed solution";
  $("showSolution").setAttribute("aria-expanded","false");
  shown=false;
  typeset($("question"));
}

$("showSolution").addEventListener("click",()=>{
  const box=$("solution");
  if(!shown){
    box.hidden=false; shown=true; reviewed++;
    typeset($("solutionBody"));
    $("showSolution").textContent="Hide solution"; $("showSolution").setAttribute("aria-expanded","true");
  } else {
    box.hidden=true; shown=false; $("showSolution").textContent="Show detailed solution"; $("showSolution").setAttribute("aria-expanded","false");
  }
});
$("newQuestion").addEventListener("click",nextProblem);
$("topic").addEventListener("change",()=>{lastKey="";nextProblem();});
nextProblem();
