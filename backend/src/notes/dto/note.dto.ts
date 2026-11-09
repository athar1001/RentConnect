export class CreateNoteDto {
  title!: string;
  content!: string;
  tags?: string;
  isPinned?: boolean;
}

export class UpdateNoteDto {
  title?: string;
  content?: string;
  tags?: string;
  isPinned?: boolean;
}
