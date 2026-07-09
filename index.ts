import { Renderable } from "./components/Renderable.js"
export interface IConnector {
    sendData(data: any, type: string, uniqueId: string): Promise<void>;
}

export {Renderable}

// Shared fleet Service contract (also importable at @daemonitor/common/types/fleet
// by external consumers, which is the published subpath).
export * from "./types/fleet.js"


