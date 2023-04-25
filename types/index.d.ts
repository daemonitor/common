declare module "@daemonitor/common" {

    export interface AppConfig {
        plugins: string[] | { [key: string]: any }[]
    }


    export interface Renderable {
        render(): Promise<void>
    }

    export interface IConnector {
        // constructor(options?: any): void;

        sendData(data: any, type: string, uniqueId: string): Promise<void>;
    }
}
