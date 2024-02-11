import { FunctionDefinition } from '~/vendors/openai/assistant/assistant.types';

const definitions: FunctionDefinition[] = [
  {
    name: 'parse_resume',
    description: 'Parse a resume and return the extracted information',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description:
            'The city and state e.g. San Francisco, CA that the candidate is located in',
          name: 'location',
        },
        firstName: {
          type: 'string',
          description: 'The first name of the candidate',
          name: 'firstName',
        },
        lastName: {
          type: 'string',
          description: 'The last name of the candidate',
          name: 'lastName',
        },
        jobTitle: {
          type: 'string',
          description: 'The job title of the candidate',
          name: 'jobTitle',
        },
      },
      required: ['location', 'firstName', 'lastName', 'jobTitle'],
    },
  },
];

export default definitions;
