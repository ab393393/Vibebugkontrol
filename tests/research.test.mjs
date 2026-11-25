import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateResearchReport } from '../lib/research.mjs';

// Synthetic unit-test input only. Never import it into published content.
const valid=()=>({id:'synthetic-validation-fixture',title:'Synthetic validation fixture',summary:'Synthetic test input for validating aggregate count handling, publication metadata and the limitations required for a research report.',publishedOn:'2026-10-24',modifiedOn:'2026-10-24',version:1,correctionNote:'',periodStart:'2026-09-01',periodEnd:'2026-09-30',geography:'Synthetic test geography',sampleUnit:'enquiries',sampleSize:40,collectionMethod:'Synthetic fixture; no actual customer records.',inclusionCriteria:'Synthetic primary-category records with duplicates excluded.',limitations:'Synthetic validation input, not a finding about any population.',reviewedBy:'Test fixture reviewer',verificationNote:'Automated test input only.',publicationApproved:true,counts:[{category:'Cockroaches',count:20},{category:'Rodents',count:20}]});

test('aggregate research needs accurate totals, dates, review and a defined unit',()=>{
  assert.equal(validateResearchReport(valid(),'2026-10-24').sampleSize,40);
  for(const change of [
    {sampleSize:41}, {sampleSize:4}, {sampleUnit:'treatment success'},
    {publicationApproved:false},{reviewedBy:''},{verificationNote:''},{collectionMethod:''},
    {periodStart:'2026-02-30'},{periodEnd:'2026-11-01'},{publishedOn:'2026-10-25'},
    {modifiedOn:'2026-10-23'},{id:'standards'},{id:123},{version:2},
    {counts:[{category:'Cockroaches',count:2},{category:'Rodents',count:38}]},
    {counts:[{category:'Cockroaches',count:20},{category:'Cockroaches',count:20}]},
    {counts:[{category:'Invented',count:40}]},
  ])assert.throws(()=>validateResearchReport({...valid(),...change},'2026-10-24'),JSON.stringify(change));
  assert.doesNotThrow(()=>validateResearchReport({...valid(),version:2,correctionNote:'Corrected the category assignment; denominator unchanged.'},'2026-10-24'));
});
test('publication data refuses customer-level fields and the blank template cannot be published',async()=>{
  assert.throws(()=>validateResearchReport({...valid(),customerName:'Never publish this'},'2026-10-24'));
  assert.throws(()=>validateResearchReport({...valid(),geography:'private@example.test'},'2026-10-24'));
  assert.throws(()=>validateResearchReport({...valid(),counts:[{category:'Rodents',count:40,phone:'private'}]},'2026-10-24'));
  const template=JSON.parse(await readFile(new URL('../docs/research-report.template.json',import.meta.url),'utf8'));
  assert.equal(template.publicationApproved,false);
  assert.throws(()=>validateResearchReport(template,'2026-10-24'));
});
