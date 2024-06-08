export enum JobStatus {
    QUEUED = 'QUEUED',
    STARTED = 'STARTED',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    SUCCESS = 'SUCCESS',
    CANCELLED = 'CANCELLED',
    CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED',
  }
  
  export interface TrainingParameters {
    training_steps: number;
    learning_rate: number;
  }
  
  export interface WandbIntegration {
    type: 'wandb';
    project: string;
    name: string | null;
    api_key: string | null;
    run_name: string | null;
  }
  
  export type Integration = WandbIntegration;
  
  export interface Job {
    id: string;
    hyperparameters: TrainingParameters;
    fine_tuned_model: string;
    model: string;
    status: JobStatus;
    jobType: string;
    created_at: number;
    modified_at: number;
    training_files: string[];
    validation_files?: string[];
    object: 'job';
    integrations: Integration[];
  }
  
  export interface Event {
    name: string;
    data?: Record<string, unknown>;
    created_at: number;
  }
  
  export interface Metric {
    train_loss: number | null;
    valid_loss: number | null;
    valid_mean_token_accuracy: number | null;
  }
  
  export interface Checkpoint {
    metrics: Metric;
    step_number: number;
    created_at: number;
  }
  
  export interface DetailedJob extends Job {
    events: Event[];
    checkpoints: Checkpoint[];
  }
  
  export interface Jobs {
    data: Job[];
    object: 'list';
  }
  
 