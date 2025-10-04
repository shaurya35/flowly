import OpenAI from "openai";

export default async function openai_node(
  apiKey: string,
  model: string,
  input: string,
  stream?: boolean,
) {
  const client = new OpenAI({
    apiKey: apiKey,
  });

  const response = await client.responses.create({
    model: model,
    input: input,
    stream: stream,
  });

  console.log(response);
  return response;
}
