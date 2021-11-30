interface IAlternatives {
  one?: string;
  two?: string;
  tree?: string;
  four?: string;
  five?: string;
}

export interface AsksDTO {
  id?: string;
  type: string;
  ask: string;
  alternatives?: IAlternatives;
}
