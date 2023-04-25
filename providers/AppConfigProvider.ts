export interface AppConfig {
    plugins: string[] | { [key: string]: any }[],

    [key: string]: any;
}


export class AppConfigProvider {
    private config?: AppConfig

    constructor(configPath: string) {
        this.loadConfig(configPath)
    }

    private async loadConfig(configPath: string): Promise<void> {
        this.config = await import(configPath)
    }

    async get(key: string): Promise<any> {
        console.log("Getting config for key", key, this.config)

        if (!this.config) {
            throw new Error("Config not loaded.")
        }

        if (!this.config[key]) {
            return null
        }
        return this.config[key]

    }


    // static async loadConfig(): Promise<void> {
    //     if (!ConfigProvider.config) {
    //         const configPath = path.join(__dirname, "config.json")
    //         return await fs.readFile(configPath, "utf8").then((data) => {
    //             ConfigProvider.config = JSON.parse(data)
    //         })
    //     }
    // }
}

