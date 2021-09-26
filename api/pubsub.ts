import PubNub from "pubnub";
import { Block } from "../blockchain/block";
export interface CredentialsProvider {
    publishKey: string
    subscribeKey: string
    secretKey: string
}

const CHANNELS_MAP = {
    TEST: "TEST",
    BLOCK: "BLOCK"
}

export class PubSub {
    private pubNub: PubNub;

    constructor() {
        this.pubNub = new PubNub(envCredentialsProvider());
        this.subscribeToChannels();
        this.listen();
    }

    private subscribeToChannels() {
        this.pubNub.subscribe({
            channels: Object.values(CHANNELS_MAP)
        })
    }

    public publish({ channel, message }: { channel: string, message: string }) {
        this.pubNub.publish({ channel, message });
    }

    private listen() {
        this.pubNub.addListener({
            message: msg => {
                const { channel, message } = msg;
                console.log("Message received. Channel: %s", channel);
                switch (channel) {
                    case CHANNELS_MAP.BLOCK:
                        console.log("Block message: %s", message);
                        break;
                    default:
                        return;
                }
            }
        });
    }

    public broadcastBlock({ block }: { block: Block }) {
        this.publish({
            channel: CHANNELS_MAP.BLOCK,
            message: JSON.stringify(block)
        })
    }
}

export function envCredentialsProvider(): CredentialsProvider {
    const publishKey = process.env["PUBNUB_PUBLISH_KEY"];
    const subscribeKey = process.env["PUBNUB_SUBSCRIBE_KEY"];
    const secretKey = process.env["PUBNUB_SECRET_KEY"];
    if (publishKey === undefined ||
        subscribeKey === undefined ||
        secretKey === undefined) {
        throw Error("Failed to bootrstrap PubNub credentials!")
    }
    return { publishKey, subscribeKey, secretKey }
}