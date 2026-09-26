import { GoogleGenAI } from '@google/genai';

const stringFields = [
  'projectName',
  'ecosystem',
  'language',
  'framework',
  'contractKind',
  'targetNetworks',
  'complexity',
  'summary',
];
const listFields = [
  'functionalRequirements',
  'securityRequirements',
  'outOfScope',
  'assumptions',
];

export class SpecificationGenerationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'SpecificationGenerationError';
  }
}

export async function generateSpecification(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new SpecificationGenerationError(
      'Specification generation is not configured. Set GEMINI_API_KEY on the server.',
      503,
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  let response;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          'Create an implementation-ready software specification using only the project request below. Do not assume it is a blockchain project unless the request says so. Mark unknowns as assumptions instead of inventing facts. Return valid JSON with exactly these fields: projectName, ecosystem, language, framework, contractKind, targetNetworks, complexity, summary, functionalRequirements, securityRequirements, outOfScope, assumptions. The first eight fields must be strings; the last four must be arrays of concise strings. Keep requirements specific to the request.\n\nProject request:\n' + prompt,
        ],
        config: { responseMimeType: 'application/json' },
      });
      break;
    } catch (error) {
      const status = getErrorStatus(error);
      if ((status !== 429 && status !== 503) || attempt === 1) {
        throw new SpecificationGenerationError(
          status === 429 || status === 503
            ? 'Gemini is temporarily busy. Please retry your prompt in a moment.'
            : 'Could not generate a specification. Please try again.',
          status === 429 || status === 503 ? status : 502,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 900));
    }
  }

  if (!response) {
    throw new SpecificationGenerationError(
      'Gemini did not return a response.',
      502,
    );
  }

  try {
    const specification = JSON.parse(response.text || '{}');
    const validStrings = stringFields.every(
      (field) => typeof specification[field] === 'string',
    );
    const validLists = listFields.every(
      (field) =>
        Array.isArray(specification[field]) &&
        specification[field].every((item: unknown) => typeof item === 'string'),
    );

    if (!validStrings || !validLists) {
      throw new Error('Incomplete specification');
    }
    return specification;
  } catch {
    throw new SpecificationGenerationError(
      'Could not generate a specification. Please try again.',
      502,
    );
  }
}

function getErrorStatus(error: unknown) {
  if (error && typeof error === 'object' && 'status' in error) {
    return Number(error.status);
  }
  return 0;
}