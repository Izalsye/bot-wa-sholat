const axios = require('axios');
require('./db/config');
class Handler {
    constructor(client) {
        this.client = client;
    }

    async handleMessage(m) {
        const msg = m.messages[0];
        if (!msg.message) return;

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const sender = msg.key.remoteJid;
        const pushname = msg.pushName || "User";
        const phoneNumber = sender.split('@')[0]; // ambil sebelum '@'

        console.log(`Pesan masuk dari ${pushname} (${sender}): ${body}`);

        // Pastikan pesan menggunakan prefix "!"
        if (!body.startsWith("/")) return;
        try {
            const response = await axios.post(global.linkwebhook, {
                from: phoneNumber,
                message: body
            });
            
            console.log("Response dari index.php:", response.data);
            // Kirim reaksi pertama
            await this.client.sendMessage(sender, { react: { text: "🕒", key: msg.key } });

            // Setelah 10 detik, kirimkan balasan yang diterima
            setTimeout(async () => {
                const { text, footer, buttons } = response.data;
            
                // Memeriksa apakah buttons ada dan bukan null atau undefined
                if (buttons && Array.isArray(buttons)) {
                    // Jika buttons ada, kirimkan dengan tombol
                    await this.client.sendMessage(sender, {
                        text: text + "\n\n" + footer,
                        buttons: buttons.map(button => ({
                            buttonId: button.buttonId,
                            buttonText: button.buttonText.text,
                            type: 1
                        })),
                        footer: footer
                    });
                    console.log("Pesan balasan dengan tombol dikirim.");
                } else {
                    // Jika buttons tidak ada, kirimkan hanya text dan footer (jika ada)
                    if (footer) {
                        await this.client.sendMessage(sender, {
                            text: text + "\n\n" + footer,
                            footer: footer
                        });
                        console.log("Pesan balasan tanpa tombol, hanya text dan footer dikirim.");
                    } else {
                        // Jika footer juga tidak ada, kirimkan hanya text
                        await this.client.sendMessage(sender, {
                            text: text
                        });
                        console.log("Pesan balasan hanya text dikirim.");
                    }
                }
            }, 2000); // Menunggu 10 detik sebelum mengirim pesan balasan
            

        } catch (error) {
            console.error("Gagal mengirim ke index.php:", error.message);
        }

        // // Ambil perintah setelah prefix
        // const args = body.slice(1).trim().split(" ");
        // const command = args.shift().toLowerCase();

        // // Reaction saat pesan diterima
        // await this.client.sendMessage(sender, { react: { text: "🕒", key: msg.key } });

        // switch (command) {
        //     case "halo":
        //         await this.client.sendMessage(sender, { text: "Halo Juga! 😊" });
        //         break;

        //     case "ping":
        //         setTimeout(async () => {
        //             // Menghapus reaction dengan emoji centang hijau atau tanda selesai
        //             await this.client.sendMessage(sender, { react: { text: "✅", key: msg.key } });

        //             // Mengirimkan balasan
        //             await this.client.sendMessage(sender, { text: "Pong! 🏓" });
        //         }, 1000);
        //         break;

        //     default:
        //         console.log(`Perintah tidak dikenali: ${command}`);
        //         break;
        // }

        // ini memanggil index.php untuk menjalankan pesan masuk
        // Kirim data ke index.php
        
    }
}

module.exports = Handler;
