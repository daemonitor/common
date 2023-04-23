declare module "@daemonitor/common" {
    export interface AppConfig {
        plugins: string[] | { [key: string]: any }[]
    }

    export { AppConfigProvider } from "~/providers/AppConfigProvider"

    export interface Renderable {
        render(): Promise<void>
    }

    export interface IConnector {
        sendData(data: any, type: string, uniqueId: string): Promise<void>;
    }
}
