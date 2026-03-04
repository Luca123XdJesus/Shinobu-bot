const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === "open") {
            console.log("🦋 Shinobu Bot conectado");
        }
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = process.env.NUMBER;
        const code = await sock.requestPairingCode(phoneNumber);
        console.log("Tu código de vinculación es:", code);
    }
}

startBot();
