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
  
