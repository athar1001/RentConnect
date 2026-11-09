import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

interface PageProps {
  params: Promise<{ locale: string }>;
}

async function getPageData(locale: string) {
  try {
    const slug = locale === 'de' ? 'impressum' : 'imprint';
    const res = await fetch(`http://localhost:3000/legal-pages/${slug}`, {
      next: { revalidate: 30 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageData(locale);
  if (!data || data.status !== 'PUBLISHED') {
    return {};
  }

  const title = locale === 'de' ? data.titleDe : data.titleEn;
  const seoTitle = locale === 'de' ? data.seoTitleDe : data.seoTitleEn;
  const seoDesc = locale === 'de' ? data.seoDescriptionDe : data.seoDescriptionEn;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wohnboard.de';
  const path = locale === 'de' ? 'impressum' : 'imprint';

  return {
    title: seoTitle || title,
    description: seoDesc || null,
    alternates: {
      canonical: `${siteUrl}/${locale}/${path}`,
      languages: {
        'en': `${siteUrl}/en/imprint`,
        'de': `${siteUrl}/de/impressum`,
      }
    },
    robots: data.noIndex ? 'noindex, nofollow' : 'index, follow',
  };
}

export default async function ImprintPage({ params }: PageProps) {
  const { locale } = await params;
  const data = await getPageData(locale);
  if (!data || data.status !== 'PUBLISHED') {
    notFound();
  }

  const title = locale === 'de' ? data.titleDe : data.titleEn;
  const content = locale === 'de' ? data.contentDe : data.contentEn;

  return (
    <LegalPageLayout 
      title={title} 
      content={content} 
      lastUpdated={data.updatedAt} 
    />
  );
}
