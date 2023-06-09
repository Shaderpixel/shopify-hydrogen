export type BadTypeObject = {
  // this is for resolving type errors for now
  [index: string]: any;
};

export type OptionsObject = {
  name: string;
  value: string;
};

export type OptionsArray = OptionsObject[];
