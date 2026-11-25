// Probe once, when the decoration becomes visible, before loading Three.
export function canRenderShield(doc:Pick<Document,'createElement'>=document) {
  try {
    const canvas=doc.createElement('canvas');
    const context=canvas.getContext('webgl2',{failIfMajorPerformanceCaveat:true,powerPreference:'low-power'});
    if(!context)return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}
