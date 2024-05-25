import { Environment } from "../../utils/env";

export class LLAMA {

    public static generate = async function* (prompt: string, controller: AbortController = new AbortController()) {

        try {
            console.log(`${Environment.getLLAMAApiUrl()}/completion`)

            const response = await fetch(`${Environment.getLLAMAApiUrl()}/completion`, {
                method: 'POST',
                body: JSON.stringify({
                    prompt: prompt,
                    stream: true,
                    n_predict: 2048,
                    temperature: 0.2,
                    stop: ["</s>"]
                }),
                headers: {
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                signal: controller.signal,
            });

            if (!response.ok) {
                console.log(await response.text());
                throw new Error(`llama.cpp error: ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let content: string = "";
            let leftover: string = ""; // Buffer for partially read lines

            try {
                let cont = true;

                while (cont) {
                    const result = await reader.read();

                    if (result.done) {
                        break;
                    }

                    // Add any leftover data to the current chunk of data
                    const text = leftover + decoder.decode(result.value);

                    // Check if the last character is a line break
                    const endsWithLineBreak = text.endsWith('\n');

                    // Split the text into lines
                    let lines = text.split('\n');

                    // If the text doesn't end with a line break, then the last line is incomplete
                    // Store it in leftover to be added to the next chunk of data
                    if (!endsWithLineBreak) {
                        const pop = lines.pop();
                        if (pop) {
                            leftover = pop;
                        }
                    } else {
                        leftover = ""; // Reset leftover if we have a line break at the end
                    }

                    // Parse all sse events and add them to result
                    const regex = /^(\S+):\s(.*)$/gm;
                    for (const line of lines) {
                        const match = regex.exec(line);
                        if (match) {

                            //@ts-ignore
                            result[match[1]] = match[2]

                            const newResult: { data: any, error?: any } = { ...result as any };

                            // since we know this is llama.cpp, let's just decode the json in data
                            if (newResult.data) {
                                const token = JSON.parse(newResult.data);

                                content += token.content;
                                yield token;

                                // if we got a stop token from server, we will break here
                                if (token.stop) {
                                    cont = false;
                                    break;
                                }
                            }
                            if (newResult.error) {
                                try {
                                    newResult.error = JSON.parse(newResult.error);
                                    if (newResult.error.message.includes('slot unavailable')) {
                                        // Throw an error to be caught by upstream callers
                                        throw new Error('slot unavailable');
                                    } else {
                                        console.error(`llama.cpp error [${newResult.error.code} - ${newResult.error.type}]: ${newResult.error.message}`);
                                    }
                                } catch (e) {
                                    console.error(`llama.cpp error ${newResult.error}`)
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name !== 'AbortError') {
                        console.error("llama error: ", error);
                    }
                }
                throw error;
            }
            finally {
                controller.abort();
            }
            return content;

        } catch (error) {
            console.error("llama error: ", error);
            // throw error;
        }


    }
}