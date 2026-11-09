export declare class CreateNoteDto {
    title: string;
    content: string;
    tags?: string;
    isPinned?: boolean;
}
export declare class UpdateNoteDto {
    title?: string;
    content?: string;
    tags?: string;
    isPinned?: boolean;
}
