export function businessSchemas(origin,business,areas=business.areaServed) {
  // Keep the interim personal inbox out of page metadata. Email delivery and
  // the visible contact email still use business.email. Add the official
  // business-domain email here when the owner provides it.
  const contact={...(business.telephone?{telephone:business.telephone}:{})};
  const identity=business.fullName?{alternateName:business.fullName}:{};
  return [
    {'@context':'https://schema.org','@type':'Organization','@id':origin+'/#organization',name:business.name,...identity,url:origin,logo:origin+'/assets/logo.png',...contact},
    {'@context':'https://schema.org','@type':'LocalBusiness','@id':origin+'/#business',name:business.name,...identity,description:'Pest control for homes and commercial premises in '+areas.join(' and ')+'.',url:origin,...contact,
      logo:origin+'/assets/logo.png',image:origin+'/assets/vbk-social-card.png?v=vibe-bug-kontrol',
      parentOrganization:{'@id':origin+'/#organization'},
      areaServed:[...new Set(areas)].map(name=>({'@type':['Mumbai','Thane'].includes(name)?'City':'Place',name})),
      ...(business.address?{address:{'@type':'PostalAddress',...business.address}}:{}),
      ...(business.openingHours.length?{openingHours:business.openingHours}:{}),
      ...(business.priceRange?{priceRange:business.priceRange}:{}),
      ...(business.sameAs.length?{sameAs:business.sameAs}:{}),
      ...(business.mapEmbedUrl?{hasMap:business.mapEmbedUrl}:{}),
    },
    {'@context':'https://schema.org','@type':'WebSite','@id':origin+'/#website',name:business.name,...identity,url:origin,inLanguage:'en-IN',publisher:{'@id':origin+'/#organization'}},
  ];
}
