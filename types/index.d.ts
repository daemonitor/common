declare module "@daemonitor/common" {

    interface AppConfig {
        plugins: string[] | { [key: string]: any }[]
    }


    interface Renderable {
        render(): Promise<void>
    }

    interface IConnector {
        // constructor(options?: any): void;

        sendData(data: any, type: string, uniqueId: string): Promise<void>;
    }
}


export {
    type AppConfig,
    type Renderable,
    type IConnector
}
