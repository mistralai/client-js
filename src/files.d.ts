export enum Purpose {
  finetune = 'fine-tune',
}

export interface FileObject {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string;
  purpose?: Purpose;
}

export interface FileDeleted {
  id: string;
  object: string;
  deleted: boolean;
}

export class FilesClient {
  constructor(client: MistralClient);

  create(options: { file: File; purpose?: string }): Promise<FileObject>;

  retrieve(options: { fileId: string }): Promise<FileObject>;

  list(): Promise<FileObject[]>;

  delete(options: { fileId: string }): Promise<FileDeleted>;
}
