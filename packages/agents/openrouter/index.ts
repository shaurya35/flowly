import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export default async function openrouter_node(
    apiKey: string,
    model: string,
    messages: string | Array<{role: string, content: string}>,
    temperature: number = 0.7,
    streaming: boolean = false,
) {
    const chat = new ChatOpenAI({
        model: model,
        temperature: temperature,
        streaming: streaming,
        apiKey: apiKey,
    }, {
        baseURL: 'https://openrouter.ai/api/v1',
    });


    let formattedMessages;
    if (typeof messages === 'string') {
        formattedMessages = [new HumanMessage(messages)];
    } else {
        formattedMessages = messages.map(msg => {
            if (msg.role === 'system') {
                return new SystemMessage(msg.content);
            } else {
                return new HumanMessage(msg.content);
            }
        });
    }

    const response = await chat.invoke(formattedMessages);

    console.log(response.content);
    return response;
}