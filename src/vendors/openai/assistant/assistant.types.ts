export type FunctionParameter = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  name: string;
};

export interface FunctionDefinition {
  name: string;
  description?: string;
  parameters: {
    type: 'object';
    properties: { [key: string]: FunctionParameter };
    required?: string[];
  };
}
