import reports from '../content/research-reports.json' with { type:'json' };

// Publication floors are editorial/privacy checks, not statistical significance
// or a guarantee of anonymisation. A person must review every publication.
export const publicationFloors = { total:20, cell:5 };
const fields=['id','title','summary','publishedOn','modifiedOn','version','correctionNote','periodStart','periodEnd','geography','sampleUnit','sampleSize','collectionMethod','inclusionCriteria','limitations','reviewedBy','verificationNote','publicationApproved','counts'];
const textFields=['title','summary','geography','collectionMethod','inclusionCriteria','limitations','reviewedBy','verificationNote'];
const categories=['Cockroaches','Bed bugs','Rodents','Other / unconfirmed'];
function validDate(value) {
  return typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
}
export function validateResearchReport(report, today=new Date().toISOString().slice(0,10)) {
  if(!report || typeof report!=='object' || Array.isArray(report))throw new Error('A research report must be an object.');
  if(Object.keys(report).some(key=>!fields.includes(key)))throw new Error('Only approved aggregate publication fields are allowed.');
  if(typeof report.id!=='string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(report.id) || report.id.length>80 || report.id==='standards')throw new Error('Use a unique research slug, excluding standards.');
  for(const key of textFields) {
    const value=report[key];
    if(typeof value!=='string' || !value.trim() || value.length>1600 || /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\d{7,}/.test(value))throw new Error('Complete the publication text without contact details: '+key);
  }
  if(report.title.length>85 || report.summary.length<90 || report.summary.length>180)throw new Error('Use a concise title and a 90–180 character summary.');
  if(!['enquiries','completed jobs','inspected properties'].includes(report.sampleUnit))throw new Error('Name the unit counted.');
  if(!Number.isSafeInteger(report.sampleSize) || report.sampleSize<publicationFloors.total)throw new Error('The sample is below the publication floor.');
  for(const key of ['publishedOn','modifiedOn','periodStart','periodEnd'])if(!validDate(report[key]))throw new Error('Use valid ISO dates.');
  if(report.periodStart>report.periodEnd || report.periodEnd>report.publishedOn || report.publishedOn>report.modifiedOn || report.modifiedOn>today)throw new Error('The observation window must end before publication; no future publications.');
  if(!Number.isSafeInteger(report.version) || report.version<1 || typeof report.correctionNote!=='string' || report.correctionNote.length>1000 || /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\d{7,}/.test(report.correctionNote) || (report.version>1 && !report.correctionNote.trim()))throw new Error('Versioned corrections need a visible correction note without contact details.');
  if(report.publicationApproved!==true)throw new Error('Reviewed publication approval is required.');
  if(!Array.isArray(report.counts) || !report.counts.length || report.counts.length>categories.length)throw new Error('Provide one primary pest category per counted unit.');
  const seen=new Set();let total=0;
  for(const row of report.counts) {
    if(!row || Object.keys(row).some(key=>!['category','count'].includes(key)) || !categories.includes(row.category) || seen.has(row.category))throw new Error('Pest categories must be recognised and unique.');
    if(!Number.isSafeInteger(row.count) || row.count<publicationFloors.cell)throw new Error('Small cells require regrouping and review before publication.');
    seen.add(row.category);total+=row.count;
  }
  if(total!==report.sampleSize)throw new Error('Category counts must equal the stated denominator.');
  return report;
}
export const publishedReports = reports.map(report=>validateResearchReport(report));
if(new Set(publishedReports.map(report=>report.id)).size!==publishedReports.length)throw new Error('Research report slugs must be unique.');
