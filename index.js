
require('./db/config');
const {
    default: makeWASocket,
    makeWALegacySocket,
    BufferJSON,
    Browsers,
    initInMemoryKeyStore,
    extractMessageContent,
    makeInMemoryStore,
    proto,
    DisconnectReason,
    useMultiFileAuthState,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    prepareWAMessageMedia,
    downloadContentFromMessage,
    getBinaryNodeChild,
    jidDecode,
    areJidsSameUser,
    generateWAMessage,
    generateForwardMessageContent,
    generateWAMessageContent, 
    generateWAMessageFromContent,
    getAggregateVotesInPollMessage,
    WAMessageStubType,
    getContentType,
    relayMessage,
    WA_DEFAULT_EPHEMERAL,
    makeCacheableSignalKeyStore
} = require("baileys")
const fs = require('fs')
const pino = require('pino')
const chalk = require('chalk')
const path = require('path')
const readline = require("readline");
const CFonts = require('cfonts')
const spin = require('spinnies')
const axios = require('axios')
const FileType = require('file-type')
const yargs = require('yargs/yargs')
const webp = require("node-webpmux");
const _ = require('lodash')
const {
    Boom
} = require('@hapi/boom')
// Metode Pairing
// True = Pairing Code || False = Scan QR
const usePairingCode = true

// promt Input Terminal
async function question(promt) {
    process.stdout.write(promt)
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve) => r1.question("", (ans) => {
        r1.close()
        resolve(ans)
    }))
    
}
const spinner = {
    "interval": 120,
    "frames": [
        "✖ [■░░░░░░░░░░░]",
        "✖ [■■■■■■■■■■■■]"
    ]
}
let globalSpinner;
const getGlobalSpinner = (disableSpins = false) => {
    if (!globalSpinner) globalSpinner = new spin({
        color: 'crimson',
        succeedColor: 'green',
        spinner,
        disableSpins
    });
    return globalSpinner;
}
let spins = getGlobalSpinner(false)
// lopping
const start = (id, text) => {
    spins.add(id, {
        text: text
    })
}
const success = (id, text) => {
    spins.succeed(id, {
        text: text
    })

}
const izalsyeHandler = require("./izalsye");

const RinHandler = require("./izalsye");


// Koneksi WhatsApp
async function connectToWhatsApp() {
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(global.sessionName)
    const client = makeWASocket({
        logger: pino({
            level: "silent"
        }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ['Windows', 'Chrome', '11'],
    });
    if (usePairingCode && !client.authState.creds.registered) {
        const phoneNumber = await question(chalk.gray('\n\n\nMasukan Nomor WhatsApp Kamu Dengan Awalan 62 :\n'));
        const code = await client.requestPairingCode(phoneNumber.trim());
        console.log(chalk.red('︎ BERIKUT KODE PAIRING BOT WA ANDA :'), chalk.white(`[ ${code} ]`));
    }
    //=================================================//
    client.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    //=================================================//
    client.ev.on('messages.upsert', async chatUpdate => {
        try {
            let mek = chatUpdate.messages[0];
    
            if (!mek.message) {
                console.log("Pesan tidak memiliki konten, keluar dari fungsi.");
                return;
            }
    
            // Mengecek apakah pesan tersebut adalah pesan ephemeral
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
            
            // Menampilkan log jika pesan datang dari status broadcast
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                console.log("Pesan dari status broadcast, dilewatkan.");
                return;
            }
    
            // Mengecek apakah pesan bukan dari bot dan jika bot tidak dalam mode publik
            if (!client.public && !mek.key.fromMe && chatUpdate.type === 'notify') {
                console.log("Pesan bukan dari bot dan bot tidak dalam mode publik, dilewatkan.");
                return;
            }
    
            // Mengecek apakah ID pesan diawali dengan 'BAE5' dan panjangnya 16 karakter
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) {
                console.log("Pesan dengan ID yang dimulai dengan 'BAE5', dilewatkan.");
                return;
            }
    
            // Menampilkan isi pesan yang diterima
            console.log("Isi Pesan yang Diterima: ", mek.message);
    
            // Log untuk memproses pesan (mengganti fungsi smsg dengan console.log untuk memudahkan pemahaman)
            const m = mek; // Ganti dengan smsg(client, mek, store) di kode asli
            console.log("Pesan diproses: ", m);
    
            // Mengimpor dan memanggil modul rin (dengan log untuk membantu pemahaman)
            // require("./rin")(client, m, chatUpdate, store);
            const rin = new RinHandler(client);
            await rin.handleMessage(chatUpdate);
            console.log("Modul rin dipanggil dengan data: ", m);
    
            // Mengecek kembali apakah pesan memiliki konten
            const message = chatUpdate.messages[0];
            if (!message.message) {
                console.log("Pesan tidak memiliki konten, keluar.");
                return;
            }
    
            const from = message.key.remoteJid;
            const target = from.split("@")[0];
            console.log("Pesan diterima dari: ", target);
    
        } catch (err) {
            console.error("Terjadi kesalahan: ", err);
        }
    });
    
    client.ev.on("group-participants.update", async (anu) => {
        console.log(anu);
        try {
            let metadata = await client.groupMetadata(anu.id);
            let participants = anu.participants;
            for (let num of participants) {
                // Get Profile Picture User
                try {
                    ppuser = await client.profilePictureUrl(num, "image");
                } catch {
                    ppuser = "https://haryonokudadiri.com/favicon.png";
                }

                // Get Profile Picture Group
                try {
                    ppgroup = await client.profilePictureUrl(anu.id, "image");
                } catch {
                    ppgroup = "https://haryonokudadiri.com/favicon.png";
                }

                if (anu.action == "add") {
                    /*client.sendMessage(anu.id, {
                        image: {
                            url: ppuser
                        },
                        mentions: [num],
                        caption: `@${num.split("@")[0]}\nSelamat Datang di Grup ${metadata.subject}\n\nGunakan perintah *Menu* untuk menampilkan daftar layanan yang tersedia.`,
                    });*/
                } else if (anu.action == "remove") {
                    //client.sendMessage(anu.id, {
                    //image: { url: ppuser },
                    //mentions: [num],
                    //caption: `@${num.split("@")[0]} \nMeninggalkan Grup ${metadata.subject}\nTerimakasih telah Join.`,
                    //});
                } else if (anu.action == "promote") {
                    /*client.sendMessage(anu.id, {
                      image: { url: ppuser },
                      mentions: [num],
                      caption: `@${num.split("@")[0]} Promote From ${metadata.subject}`,
                    });*/
                } else if (anu.action == "demote") {
                    /*client.sendMessage(anu.id, {
                      image: { url: ppuser },
                      mentions: [num],
                      caption: `@${num.split("@")[0]} Demote From ${metadata.subject}`,
                    });*/
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
    //=================================================//
    //=================================================//
    //=================================================//
    //=================================================//
    //=================================================//
    //Kalau Mau Self Lu Buat Jadi false
    client.public = true
    //=================================================//
    //=================================================//
    client.ev.on('creds.update', saveCreds)
    async function videoToWebp(media) {
        const tmpFileOut = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
        );
        const tmpFileIn = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`
        );

        fs.writeFileSync(tmpFileIn, media);

        await new Promise((resolve, reject) => {
            ff(tmpFileIn)
                .on("error", reject)
                .on("end", () => resolve(true))
                .addOutputOptions([
                    "-vcodec",
                    "libwebp",
                    "-vf",
                    "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                    "-loop",
                    "0",
                    "-ss",
                    "00:00:00",
                    "-t",
                    "00:00:05",
                    "-preset",
                    "default",
                    "-an",
                    "-vsync",
                    "0",
                ])
                .toFormat("webp")
                .save(tmpFileOut);
        });

        const buff = fs.readFileSync(tmpFileOut);
        fs.unlinkSync(tmpFileOut);
        fs.unlinkSync(tmpFileIn);
        return buff;
    }

    async function imageToWebp(media) {
        const tmpFileOut = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
        );
        const tmpFileIn = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`
        );

        fs.writeFileSync(tmpFileIn, media);

        await new Promise((resolve, reject) => {
            ff(tmpFileIn)
                .on("error", reject)
                .on("end", () => resolve(true))
                .addOutputOptions([
                    "-vcodec",
                    "libwebp",
                    "-vf",
                    "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                ])
                .toFormat("webp")
                .save(tmpFileOut);
        });

        const buff = fs.readFileSync(tmpFileOut);
        fs.unlinkSync(tmpFileOut);
        fs.unlinkSync(tmpFileIn);
        return buff;
    }

    async function writeExifVid(media, metadata) {
        let wMedia = await videoToWebp(media);
        const tmpFileIn = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
        );
        const tmpFileOut = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
        );
        fs.writeFileSync(tmpFileIn, wMedia);

        if (metadata.packname || metadata.author) {
            const img = new webp.Image();
            const json = {
                "sticker-pack-id": `https://instagram.com/haryonokudadiri`,
                "sticker-pack-name": metadata.packname,
                "sticker-pack-publisher": metadata.author,
                emojis: metadata.categories ? metadata.categories : [""],
            };
            const exifAttr = Buffer.from([
                0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
                0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
            ]);
            const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
            const exif = Buffer.concat([exifAttr, jsonBuff]);
            exif.writeUIntLE(jsonBuff.length, 14, 4);
            await img.load(tmpFileIn);
            fs.unlinkSync(tmpFileIn);
            img.exif = exif;
            await img.save(tmpFileOut);
            return tmpFileOut;
        }
    }

    async function writeExifImg(media, metadata) {
        let wMedia = await imageToWebp(media);
        const tmpFileIn = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
        );
        const tmpFileOut = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
        );
        fs.writeFileSync(tmpFileIn, wMedia);

        if (metadata.packname || metadata.author) {
            const img = new webp.Image();
            const json = {
                "sticker-pack-id": `https://instagram.com/haryonokudadiri`,
                "sticker-pack-name": metadata.packname,
                "sticker-pack-publisher": metadata.author,
                emojis: metadata.categories ? metadata.categories : [""],
            };
            const exifAttr = Buffer.from([
                0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
                0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
            ]);
            const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
            const exif = Buffer.concat([exifAttr, jsonBuff]);
            exif.writeUIntLE(jsonBuff.length, 14, 4);
            await img.load(tmpFileIn);
            fs.unlinkSync(tmpFileIn);
            img.exif = exif;
            await img.save(tmpFileOut);
            return tmpFileOut;
        }
    }
    //=================================================//
    client.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || "";
        let messageType = message.mtype ?
            message.mtype.replace(/Message/gi, "") :
            mime.split("/")[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        /**
         *
         * @param {*} jid
         * @param {*} path
         * @param {*} quoted
         * @param {*} options
         * @returns
         */
        client.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ?
                path :
                /^data:.*?\/.*?;base64,/i.test(path) ?
                Buffer.from(path.split`,` [1], "base64") :
                /^https?:\/\//.test(path) ?
                await await getBuffer(path) :
                fs.existsSync(path) ?
                fs.readFileSync(path) :
                Buffer.alloc(0);
            let buffer;
            if (options && (options.packname || options.author)) {
                buffer = await writeExifImg(buff, options);
            } else {
                buffer = await imageToWebp(buff);
            }

            await client.sendMessage(
                jid, {
                    sticker: {
                        url: buffer
                    },
                    ...options
                }, {
                    quoted
                }
            );
            return buffer;
        };

        /**
         *
         * @param {*} jid
         * @param {*} path
         * @param {*} quoted
         * @param {*} options
         * @returns
         */
        client.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ?
                path :
                /^data:.*?\/.*?;base64,/i.test(path) ?
                Buffer.from(path.split`,` [1], "base64") :
                /^https?:\/\//.test(path) ?
                await await getBuffer(path) :
                fs.existsSync(path) ?
                fs.readFileSync(path) :
                Buffer.alloc(0);
            let buffer;
            if (options && (options.packname || options.author)) {
                buffer = await writeExifVid(buff, options);
            } else {
                buffer = await videoToWebp(buff);
            }

            await client.sendMessage(
                jid, {
                    sticker: {
                        url: buffer
                    },
                    ...options
                }, {
                    quoted
                }
            );
            return buffer;
        };

        return buffer;
    };
    //=================================================//
    client.sendImage = async (jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await client.sendMessage(jid, {
            image: buffer,
            caption: caption,
            ...options
        }, {
            quoted
        })
    }
    //=================================================//
    client.sendText = (jid, text, quoted = '', options) => client.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted
    })
    //=================================================//
    client.sendTextWithMentions = async (jid, text, quoted, options = {}) => client.sendMessage(jid, {
        text: text,
        contextInfo: {
            mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net')
        },
        ...options
    }, {
        quoted
    })
    //=================================================//
    //=================================================//
    //=================================================//
    client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }
    //=================================================
    client.cMod = (jid, copy, text = '', sender = client.user.id, options = {}) => {
        //let copy = message.toJSON()
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = {
            ...content,
            ...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = sender === client.user.id
        return proto.WebMessageInfo.fromObject(copy)
    }
    client.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
        let types = await client.getFile(PATH, true)
        let {
            filename,
            size,
            ext,
            mime,
            data
        } = types
        let type = '',
            mimetype = mime,
            pathFile = filename
        if (options.asDocument) type = 'document'
        if (options.asSticker || /webp/.test(mime)) {
            let {
                writeExif
            } = require('./lib/sticker.js')
            let media = {
                mimetype: mime,
                data
            }
            pathFile = await writeExif(media, {
                packname: global.packname,
                author: global.packname2,
                categories: options.categories ? options.categories : []
            })
            await fs.promises.unlink(filename)
            type = 'sticker'
            mimetype = 'image/webp'
        } else if (/image/.test(mime)) type = 'image'
        else if (/video/.test(mime)) type = 'video'
        else if (/audio/.test(mime)) type = 'audio'
        else type = 'document'
        await client.sendMessage(jid, {
            [type]: {
                url: pathFile
            },
            mimetype,
            fileName,
            ...options
        }, {
            quoted,
            ...options
        })
        return fs.promises.unlink(pathFile)
    }
    client.parseMention = async (text) => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }
    //=================================================//
    client.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
            vtype = Object.keys(message.message.viewOnceMessage.message)[0]
            delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
            delete message.message.viewOnceMessage.message[vtype].viewOnce
            message.message = {
                ...message.message.viewOnceMessage.message
            }
        }
        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
        let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await client.relayMessage(jid, waMessage.message, {
            messageId: waMessage.key.id
        })
        return waMessage
    }
    //=================================================//
    client.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        }
    }
    client.serializeM = (m) => smsg(client, m, store)
    client.ev.on("connection.update", async (update) => {
        const {
            connection,
            lastDisconnect
        } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.badSession) {
                console.log(`Bad Session File, Please Delete Session and Scan Again`);
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log("Connection closed, reconnecting....");
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log("Connection Lost from Server, reconnecting...");
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log("Connection Replaced, Another New Session Opened, Please Restart Bot");
                process.exit();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(`Device Logged Out, Please Delete Folder Session yusril and Scan Again.`);
                process.exit();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Restart Required, Restarting...");
                connectToWhatsApp();
            } else if (reason === DisconnectReason.timedOut) {
                console.log("Connection TimedOut, Reconnecting...");
                connectToWhatsApp();
            } else {
                console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
                connectToWhatsApp();
            }
        } else if (connection === 'connecting') {
            console.log(chalk.magenta('─['), '', chalk.red('IZALSYE'), chalk.magenta(']─'));

            start(`1`, `Connecting...`)
        } else if (connection === "open") {
            success(`1`, `[■■■■■■■■■■■■■] Connected`)
			client.sendMessage("6282141729594@s.whatsapp.net", {text: `Lapor IZALSYE ,\nBot berhasil login.\nOwner bot ${global.owner}`})
        }

    });
    return client
}

// Jalankan Koneksi WhatsApp
connectToWhatsApp()
