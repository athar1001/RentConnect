import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AlertCircle } from 'lucide-react';
import { parseMarkdown } from '@/components/layout/LegalPageLayout';

interface PageProps {
  params: Promise<{ id: string; lang: string }>;
}

async function getPageData(id: string) {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`http://localhost:3000/control/legal-pages/${id}`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: `[PREVIEW] Legal Page (${lang.toUpperCase()})`,
    robots: 'noindex, nofollow',
  };
}

export default async function AdminLegalPagePreview({ params }: PageProps) {
  const { id, lang } = await params;
  
  if (lang !== 'en' && lang !== 'de') {
    notFound();
  }

  const page = await getPageData(id);
  if (!page) {
    notFound();
  }

  const title = lang === 'de' ? page.titleDe : page.titleEn;
  const content = lang === 'de' ? page.contentDe : page.contentEn;

  // Format draft modified date
  const formattedDate = new Date(page.updatedAt).toLocaleString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const parsedContent = parseMarkdown(content || '', formattedDate);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] font-sans">
      <Navbar />
      
      {/* Admin Preview warning banner */}
      <div className="bg-amber-50 border-y border-amber-200 py-3.5 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3 text-amber-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Preview Mode</p>
            <p className="text-xs font-medium">You are viewing the unpublished draft content of this legal page. This page is protected and invisible to search engines.</p>
          </div>
        </div>
      </div>

      <main className="flex-1 bg-gray-50/50 py-16">
        <div className="max-w-4xl mx-auto px-6 bg-white p-10 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {title || 'No Title Entered'}
          </h1>
          <p className="text-xs text-gray-400 mb-8 font-medium">
            Draft Last Modified: {formattedDate}
          </p>
          
          <div 
            className="prose prose-slate max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parsedContent || '<p class="text-slate-400 italic">No content written yet.</p>' }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
