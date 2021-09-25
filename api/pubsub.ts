export interface CredentialsProvider {
    publishKey: string
    subscribeKey: string
    secretKey: string
}

export function pubNubProvider(): CredentialsProvider {
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