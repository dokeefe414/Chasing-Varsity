const {test}=require('node:test'),assert=require('node:assert/strict');
const {campaign}=require('../scripts/balance-report.cjs');
for(const quality of [.55,.85])test(`scripted career can earn all three titles with ${quality*100}% training quality`,()=>{const rows=campaign(quality);assert.equal(rows.length,18);assert.ok(rows.every(r=>r.rank===1));assert.ok(rows.at(-1).sessions<=36);assert.ok(rows.at(-1).sessions>rows[5].sessions);assert.ok(rows[5].sessions<=25);});
