import path from "path"
import fs from "fs"

export class PromptBuilder {

    private static instance: PromptBuilder;
    private prompt: string = "";

    constructor(private readonly promptPath: string) { }

    public static getInstance = () => {
        return this.instance;
    }

    public init = async () => {
        if (!fs.existsSync(path.resolve(this.promptPath))) {
            throw new Error(`Prompt file not found: ${this.promptPath}`)
        }

        this.prompt = fs.readFileSync(path.resolve(this.promptPath)).toString()
    }

    public static load = async (promptPath: string) => {
        if (!PromptBuilder.instance) {
            PromptBuilder.instance = new PromptBuilder(promptPath)
            await PromptBuilder.instance.init()
        }
        return PromptBuilder.instance
    }

    public getPrompt = (replaces: { [key: string]: string } = {}) => {
        return this.prompt.replace(/{([^}]*)}/g, (match, key) => {
            return replaces[key] || match;
        })
    }
}