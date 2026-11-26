// Both enquiry interfaces use the same choices and delivery model.
export const pestChoices=['Cockroaches','Bed bugs','Rodents','Other / not sure'];
export const spaceChoices=['Not specified','1 BHK / small space','2 BHK','3 BHK or larger','Commercial premises','Not sure yet'];
export const premisesChoices=[['Home','Apartment'],['Home','Independent home'],['Business','Office / retail'],['Business','Food / hospitality'],['Business','Shared / multiple sites'],['Business','Other workplace']];
export const careChoices=['Help me decide','A current pest concern','Discuss ongoing care'];
export const timeChoices=['Any time','Morning','Afternoon','Evening'];

export function enquiryPayload(formData) {
  const get=(...names)=>names.map(name=>String(formData.get(name)||'').trim()).find(Boolean)||'';
  const email=get('email');
  const payload={
    name:get('name','customer'),phone:get('phone'),email,
    property_type:get('property_type','property')==='Business'?'Business':'Home',
    pest_concern:formData.getAll('pest').join(', ')||get('pest_concern')||'Other / not sure',
    area:get('area')||'To be discussed',approximate_size:get('approximate_size','size')||'Not specified',
    premises_type:get('premises_type')||'To be discussed',care_preference:get('care_preference')||'Help me decide',
    pincode:get('pincode'),preferred_date:get('preferred_date'),
    preferred_time:get('preferred_time')||'Any time',request_type:get('request_type')||'Quote request',
    message:get('message','notes')||'Please discuss available pest control plans with me.',_honey:get('_honey'),
    _template:'table',_subject:'New pest control enquiry — VBK'
  };
  if(email)payload._replyto=email;
  return payload;
}

export function enquirySummary(payload) {
  return ['VBK — ENQUIRY','',...[
    ['Name','name'],['Contact','phone'],['Email','email'],['Request','request_type'],
    ['Space','property_type'],['Premises','premises_type'],['Pest concern','pest_concern'],
    ['Area / city','area'],['PIN code','pincode'],['Approximate size','approximate_size'],
    ['Care preference','care_preference'],['Preferred date','preferred_date'],['Preferred time','preferred_time'],
    ['Additional details','message']
  ].map(([label,key])=>`${label}: ${payload[key]||'Not provided'}`),'','Requested timing is subject to confirmation.'].join('\n');
}
