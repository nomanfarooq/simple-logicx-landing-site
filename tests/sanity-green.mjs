import { chromium } from 'playwright'
const BASE = process.env.URL || 'http://localhost:4173'
const b = await chromium.launch()
const p = await (await b.newContext()).newPage()
await p.goto(BASE + '/', { waitUntil:'domcontentloaded' })
const r = await p.evaluate(() => {
  const rgbToHsl=(r,g,bl)=>{r/=255;g/=255;bl/=255;const mx=Math.max(r,g,bl),mn=Math.min(r,g,bl),l=(mx+mn)/2,d=mx-mn;if(!d)return[0,0,l];const s=l>.5?d/(2-mx-mn):d/(mx+mn);let h;if(mx===r)h=((g-bl)/d+(g<bl?6:0));else if(mx===g)h=(bl-r)/d+2;else h=(r-g)/d+4;return[h*60,s,l]}
  const test=(name,stops)=>{
    const cv=document.createElement('canvas');cv.width=900;cv.height=1
    const cx=cv.getContext('2d');const g=cx.createLinearGradient(0,0,900,0)
    stops.forEach(([c,pos])=>g.addColorStop(pos,c));cx.fillStyle=g;cx.fillRect(0,0,900,1)
    const d=cx.getImageData(0,0,900,1).data;let v=0,worst=null
    for(let x=0;x<900;x+=3){const i=x*4;const[h,s]=rgbToHsl(d[i],d[i+1],d[i+2])
      if(h>=75&&h<=165&&s>=0.18){v++;if(!worst)worst=`hue ${Math.round(h)}° rgb(${d[i]},${d[i+1]},${d[i+2]})`}}
    return {name,violations:v,worst}
  }
  return [
    test('v1 PRIMARY  cyan->lime (the actual v1 brand gradient)', [['#44C5D8',0],['#94BC43',1]]),
    test('v1 HERO     cyan->lime->gold',[['#44C5D8',0],['#94BC43',.5],['#E7C84C',1]]),
    test('OLD spectrum blue->cyan->amber->coral',[['#0A5A7E',0],['#35CCD9',.34],['#FCC653',.72],['#F53F61',1]]),
    test('NEW spectrum blue->cyan->coral->amber',[['#0A5A7E',0],['#35CCD9',.30],['#F53F61',.68],['#FCC653',1]]),
  ]
})
for(const x of r) console.log(`${x.violations>0?'GREEN DETECTED':'clean        '}  ${String(x.violations).padStart(3)}/300  ${x.name}${x.worst?'  — '+x.worst:''}`)
await b.close()
