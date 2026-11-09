import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LegalPageLayoutProps {
  title: string;
  content: string;
  lastUpdated?: string;
}

export function parseMarkdown(md: string, formattedDate: string | null): string {
  if (!md) return '';
  
  let text = md;
  if (formattedDate) {
    text = text.replace(/{{lastUpdated}}/g, formattedDate);
  }

  // Basic regex markdown parser
  let html = text
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-gray-900 mt-6 mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-base font-semibold text-gray-700 mt-4 mb-2">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-slate-200 pl-4 italic my-4">$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-semibold">$1</a>')
    .replace(/^\-\-\-$|^\*\*\*$|^\_\_\_$/gm, '<hr class="my-6 border-slate-200" />')
    .replace(/\n\s*\n/g, '</p><p class="mt-4">')
    .replace(/^\s*\-\s+(.*$)/gim, '<li class="list-disc ml-5 mt-1">$1</li>');

  // Wrap lists
  html = html.replace(/(<li class="list-disc ml-5 mt-1">.*<\/li>)/g, '<ul class="my-3">$1</ul>');
  
  // Wrap in paragraphs if not wrapped
  html = `<p class="mt-4">${html}</p>`;
  html = html
    .replace(/<p class="mt-4"><h/g, '<h')
    .replace(/<\/h(\d)><\/p>/g, '</h$1>')
    .replace(/<p class="mt-4"><ul/g, '<ul')
    .replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p class="mt-4"><blockquote/g, '<blockquote')
    .replace(/<\/blockquote><\/p>/g, '</blockquote>')
    .replace(/<p class="mt-4"><hr/g, '<hr')
    .replace(/<\/hr><\/p>/g, '')
    .replace(/<p class="mt-4"><\/p>/g, '');

  return html;
}

export function LegalPageLayout({ title, content, lastUpdated }: LegalPageLayoutProps) {
  // Format updated date nicely
  const formattedDate = lastUpdated 
    ? new Date(lastUpdated).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  const parsedContent = parseMarkdown(content, formattedDate);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] font-sans">
      <Navbar />
      <main className="flex-1 bg-gray-50/50 py-16">
        <div className="max-w-4xl mx-auto px-6 bg-white p-10 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {title}
          </h1>
          {formattedDate && (
            <p className="text-xs text-gray-400 mb-8 font-medium">
              Last Updated: {formattedDate}
            </p>
          )}
          
          <div 
            className="prose prose-slate max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
