import { Renderable } from "./components/Renderable.js"
export interface IConnector {
    sendData(data: any, type: string, uniqueId: string): Promise<void>;
}

export {Renderable}


