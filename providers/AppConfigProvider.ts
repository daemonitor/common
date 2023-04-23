import { AppConfig } from "@daemonitor/common"


export class AppConfigProvider {
    private static config: AppConfig

    static async get(key: string): Promise<any> {
        if (!AppConfigProvider.config[key]) {
            return null
        }
        return AppConfigProvider.config[key]
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

