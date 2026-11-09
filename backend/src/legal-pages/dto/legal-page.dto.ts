import { LegalPageStatus } from '@prisma/client';

export class UpdateLegalPageDto {
  status?: LegalPageStatus;
  noIndex?: boolean;

  titleEn?: string;
  slugEn?: string;
  contentEn?: string;
  seoTitleEn?: string;
  seoDescriptionEn?: string;

  titleDe?: string;
  slugDe?: string;
  contentDe?: string;
  seoTitleDe?: string;
  seoDescriptionDe?: string;
}

export class PublishLegalPageDto {
  changeNote?: string;
}
