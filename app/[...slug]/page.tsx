import { notFound } from 'next/navigation';
import { pageFor } from '../../lib/pages.mjs';
import { pageMetadata, PageSchema } from '../../lib/seo';
import { ContentPage } from '../../components/ContentPage';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string[]}>;searchParams?:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({params}:Props) {
  const {slug}=await params;const page=pageFor('/'+slug.join('/'));
  return page ? pageMetadata(page) : {title:'Page Not Found | VBK'};
}
export default async function Page({params,searchParams}:Props) {
  const {slug}=await params;const page=pageFor('/'+slug.join('/'));
  if(!page) notFound();
  return <><ContentPage page={page} query={searchParams?await searchParams:{}} /><PageSchema page={page} /></>;
}
