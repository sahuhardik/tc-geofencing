export interface ITask {
  task_id: any;
  name: string;
  color: string;
  childNodes: ITask[];
  parent_id: any;
}
