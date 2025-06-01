import { JobRunner } from "./JobRunner";
import { WorkflowManager } from "./WorkflowManager";

const jobRunner = new JobRunner();
export const workflowManager = new WorkflowManager(jobRunner); 