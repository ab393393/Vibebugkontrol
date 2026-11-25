import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(import.meta.url);const viteRequire=createRequire(require.resolve('vite'));
const {build,transform}=viteRequire('esbuild');const postcss=viteRequire('postcss');
const styles=['styles.css','experience.css','pages.css','refinements.css','diagonal-gallery.css','vbk-motion.css'];
const criticalSelector=/^(?:\*|html|body|:root|h[123]|a(?=[.:\[]|$)|button(?=[.:\[]|$)|img(?=[.:\[]|$)|svg(?=[.:\[]|$)|em(?=[.:\[]|$))|\.(?:hero(?:-|\b)|announcement(?:-|\b)|navigation\b|brand(?:-|\b)|nav(?:-|\b)|site-header\b|container\b|button(?:-|\b)|icon\b|status-dot\b|eyebrow\b|svg-definitions\b|skip-link\b|layout-fragment\b|breadcrumbs\b|page-intro(?:-|\b)|page-lede\b|mobile-contact-bar\b|business-contact-links\b|contact-links-header\b)/;
function selected(node) {
  if(node.type==='rule')return criticalSelector.test(node.selector)?node.clone():null;
  if(node.type==='atrule') {
    if(node.name==='font-face')return node.clone();
    if(node.nodes&&['media','supports','layer'].includes(node.name)){const copy=node.clone({nodes:[]});for(const child of node.nodes){const match=selected(child);if(match)copy.append(match);}return copy.nodes.length?copy:null;}
  }
  return null;
}
export async function preparePublic() {
  const chunks=await Promise.all(styles.map(file=>readFile(path.join(root,'public',file),'utf8')));
  chunks.unshift(await readFile(require.resolve('lenis/dist/lenis.css'),'utf8'));
  const css=chunks.join('\n');const parsed=postcss.parse(css);const critical=postcss.root();
  for(const node of parsed.nodes){const match=selected(node);if(match)critical.append(match);}
  const [combined,aboveFold]=await Promise.all([transform(css,{loader:'css',minify:true,target:'es2020'}),transform(critical.toString(),{loader:'css',minify:true,target:'es2020'})]);
  await writeFile(path.join(root,'public/site.css'),combined.code);await writeFile(path.join(root,'public/critical.css'),aboveFold.code);
  await build({entryPoints:[path.join(root,'public/app.js')],outfile:path.join(root,'public/site.js'),bundle:true,format:'esm',platform:'browser',target:'es2020',minify:true,logLevel:'silent'});
  const premium=await build({entryPoints:[path.join(root,'public/vbk-motion.mjs')],outdir:path.join(root,'public/motion-runtime'),entryNames:'entry-[hash]',chunkNames:'chunk-[hash]',bundle:true,splitting:true,format:'esm',platform:'browser',target:'es2020',minify:true,metafile:true,logLevel:'silent'});
  const motionEntry=Object.entries(premium.metafile.outputs).find(([,output])=>output.entryPoint?.endsWith('public/vbk-motion.mjs'))?.[0];
  if(!motionEntry)throw new Error('The optional motion bundle was not created.');
  const outputFiles=new Set(Object.keys(premium.metafile.outputs).map(file=>path.resolve(file)));
  const motionDirectory=path.join(root,'public/motion-runtime');
  for(const file of await readdir(motionDirectory))if(/^(?:entry|chunk)-[A-Z0-9]+\.js$/.test(file)&&!outputFiles.has(path.join(motionDirectory,file)))await unlink(path.join(motionDirectory,file));
  const js=await readFile(path.join(root,'public/site.js'));
  const version=value=>createHash('sha256').update(value).digest('hex').slice(0,12);
  await writeFile(path.join(root,'public/asset-manifest.json'),JSON.stringify({css:'/site.css?v='+version(combined.code),js:'/site.js?v='+version(js),motion:'/motion-runtime/'+path.basename(motionEntry)})+'\n');
  return {originalCssBytes:Buffer.byteLength(css),combinedCssBytes:Buffer.byteLength(combined.code),criticalCssBytes:Buffer.byteLength(aboveFold.code)};
}
export function publicAssetsPlugin() {
  return {name:'shield-public-assets',configureServer(server){
    let queued=Promise.resolve();server.watcher.on('change',file=>{const relative=path.relative(path.join(root,'public'),file);if(!relative.startsWith('..')&&!relative.startsWith('motion-runtime/')&&(styles.includes(relative)||/\.(?:mjs|js)$/.test(relative)&&relative!=='site.js'))queued=queued.then(()=>preparePublic()).then(()=>server.ws.send({type:'full-reload'})).catch(error=>server.config.logger.error(String(error)));});
  }};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await preparePublic()));
