import PubNub from "pubnub";
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
                console.log("New message in channel [%s]. Contents: %s", msg.channel, msg.message);
            }
        });
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

const pubSub = new PubSub();
pubSub.publish({channel: CHANNELS_MAP.TEST, message: "holis"});