// Paste this file into Extensions → Apps Script in the supplied spreadsheet.
// Run setupShieldAndShine once, then deploy as a web app: Execute as Me, Anyone.
// Store SHIELD_WEBHOOK_TOKEN only in Script properties and website runtime secrets.
var SHIELD_SPREADSHEET_ID='1_4Y8Xy431G3-XsgYWwacS2PiJnrDQ1gBcPmGtQw_Yq0';
var SHIELD_TAB='Enquiries';
var SHIELD_HEADERS=['Received at (IST)','Enquiry reference','Name','Phone','Email','Space','Request type','Pest concern','Area / city','PIN code','Premises type','Approximate size','Care preference','Preferred date','Preferred time','Message','Source','Follow-up status','Follow-up notes'];
var SHIELD_FIELDS={name:100,phone:25,email:254,property_type:20,request_type:30,pest_concern:200,area:100,pincode:6,premises_type:100,approximate_size:100,care_preference:100,preferred_date:10,preferred_time:30,message:1000,_honey:200};

function setupShieldAndShine() {
  var book=SpreadsheetApp.openById(SHIELD_SPREADSHEET_ID);
  var sheet=book.getSheetByName(SHIELD_TAB)||book.insertSheet(SHIELD_TAB);
  if(sheet.getMaxColumns()<SHIELD_HEADERS.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),SHIELD_HEADERS.length-sheet.getMaxColumns());
  if(sheet.getLastRow()===0)sheet.getRange(1,1,1,SHIELD_HEADERS.length).setValues([SHIELD_HEADERS]);
  checkShieldHeaders_(sheet);
  sheet.setFrozenRows(1);sheet.setFrozenColumns(2);
  var properties=PropertiesService.getScriptProperties();
  if(!properties.getProperty('SHIELD_WEBHOOK_TOKEN'))properties.setProperty('SHIELD_WEBHOOK_TOKEN',Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''));
  console.log('Ready. The private SHIELD_WEBHOOK_TOKEN is in Project Settings → Script properties. Do not put it in spreadsheet cells.');
}

function doGet() {
  return shieldJson_({service:'VBK enquiry register',ready:!!PropertiesService.getScriptProperties().getProperty('SHIELD_WEBHOOK_TOKEN')});
}

function doPost(e) {
  var lock;
  try {
    var raw=e&&e.postData&&e.postData.contents;
    if(typeof raw!=='string'||raw.length>16384)return shieldJson_({success:false,code:'INVALID_REQUEST'});
    var payload=JSON.parse(raw);
    var expected=PropertiesService.getScriptProperties().getProperty('SHIELD_WEBHOOK_TOKEN');
    if(!expected||!sameShieldToken_(payload.token,expected))return shieldJson_({success:false,code:'UNAUTHORIZED'});
    if(!/^SS-[A-F0-9]{12}$/.test(payload.reference||''))return shieldJson_({success:false,code:'INVALID_REFERENCE'});
    var data=cleanShieldEnquiry_(payload.enquiry);
    if(!data)return shieldJson_({success:false,code:'INVALID_ENQUIRY'});
    lock=LockService.getScriptLock();
    if(!lock.tryLock(3000))return shieldJson_({success:false,code:'BUSY'});
    var sheet=SpreadsheetApp.openById(SHIELD_SPREADSHEET_ID).getSheetByName(SHIELD_TAB);
    if(!sheet)throw new Error('Missing Enquiries tab');
    checkShieldHeaders_(sheet);
    var last=sheet.getLastRow();
    if(last>1&&sheet.getRange(2,2,last-1,1).createTextFinder(payload.reference).matchEntireCell(true).useRegularExpression(false).findNext())return shieldJson_({success:true,reference:payload.reference,duplicate:true});
    // Store a numeric local-IST date serial without changing this workbook's timezone.
    var receivedAtIst=(Date.now()+19800000)/86400000+25569;
    var preferredDate=data.preferred_date?Date.parse(data.preferred_date+'T00:00:00Z')/86400000+25569:'';
    var row=[receivedAtIst,payload.reference,data.name,data.phone,data.email,data.property_type,data.request_type,data.pest_concern,data.area,data.pincode,data.premises_type,data.approximate_size,data.care_preference,preferredDate,data.preferred_time,data.message,'VBK website','New',''];
    var next=last+1;
    if(next>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),100);
    var target=sheet.getRange(next,1,1,row.length);target.setNumberFormat('@');
    sheet.getRange(next,1).setNumberFormat('yyyy-mm-dd hh:mm:ss');sheet.getRange(next,14).setNumberFormat('yyyy-mm-dd');
    target.setValues([row.map(function(value,index){return index===0||index===13?value:shieldCell_(value);})]);
    sheet.getRange(next,18).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['New','Contacted','Quote sent','Booked','Closed'],true).setAllowInvalid(false).build());
    SpreadsheetApp.flush();
    return shieldJson_({success:true,reference:payload.reference});
  } catch {
    return shieldJson_({success:false,code:'SAVE_FAILED'});
  } finally {if(lock&&lock.hasLock())lock.releaseLock();}
}

function cleanShieldEnquiry_(input) {
  if(!input||typeof input!=='object'||Array.isArray(input))return null;
  var data={};
  for(var field in SHIELD_FIELDS) {
    if(input[field]!=null&&typeof input[field]!=='string')return null;
    data[field]=String(input[field]||'').trim();
    if(data[field].length>SHIELD_FIELDS[field])return null;
  }
  if(!data.name||/[\r\n\x00]/.test(data.name)||!/^\+?[\d\s().-]+$/.test(data.phone)||data.phone.replace(/\D/g,'').length<7||data.phone.replace(/\D/g,'').length>15||['Home','Business'].indexOf(data.property_type)<0||data._honey)return null;
  if(data.email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email))return null;
  if(data.pincode&&!/^\d{6}$/.test(data.pincode))return null;
  if(data.preferred_date&&(!/^\d{4}-\d{2}-\d{2}$/.test(data.preferred_date)||!isFinite(Date.parse(data.preferred_date+'T00:00:00Z'))||new Date(data.preferred_date+'T00:00:00Z').toISOString().slice(0,10)!==data.preferred_date))return null;
  return data;
}

function sameShieldToken_(provided,expected) {
  if(typeof provided!=='string'||provided.length!==expected.length)return false;
  var mismatch=0;for(var i=0;i<expected.length;i++)mismatch|=provided.charCodeAt(i)^expected.charCodeAt(i);
  return mismatch===0;
}
function checkShieldHeaders_(sheet) {
  if(JSON.stringify(sheet.getRange(1,1,1,SHIELD_HEADERS.length).getValues()[0])!==JSON.stringify(SHIELD_HEADERS))throw new Error('Unexpected register headers');
}
function shieldCell_(value) {
  var text=String(value==null?'':value);
  return /^[=+\-@\t\r\n]/.test(text)?"'"+text:text;
}
function shieldJson_(value) {return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
