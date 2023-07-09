const Telegram = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

dotenv.config({ path : './config/config.env' });

const bot = new Telegram(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

let history = {};

const openai = new OpenAIApi(config);

bot.on("message", async (msg) => {

    const chatId = msg.chat.id;

    if(msg.text == '/start') {

        bot.sendMessage(chatId, "Welcome to MrGPT! \nI can assume different names and personalities to give you advices, information, write, essays, articles, emails or simply chat with you in your free time! \nTo get started you can just ping me Hello or anything you like and lets start chatting \n I can also generate images based on the input received to get started with this use !generate: {image description} command \nIf you get stuck somewhere use /help command \nThank you ❤️");

        return;
    }

    if(msg.text.includes("!generate")) {

        if(msg.text.indexOf(':') == -1) {

            bot.sendMessage(chatId, "Invalid Command Please use !generate: {image description} to generate an image");

            return;
        }
        else {

            const tokens = msg.text.split(':');

            const prompt = tokens[1];
            const size = "512x512";

            try {
                
                const response = await openai.createImage({
                    prompt,
                    n: 1,
                    size
                });

                const image_url = response.data.data[0].url;

                bot.sendPhoto(chatId, image_url);

                return;

            } catch (error) {
                
                bot.sendMessage(chatId, "Sorry, But I cannot generate that image :(");
            }

            return;
        }

    }

    if(history.chatId == undefined) {

        history.chatId = [];
    }

    history.chatId.push({role: "user", content: `${msg.text}`});

    try {

        const replyMsg = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: history.chatId,
        });

        history.chatId.push({role: "assistant", content: `${replyMsg.data.choices[0].message.content}`});

        bot.sendMessage(chatId, replyMsg.data.choices[0].message.content);

    } catch (error) {
        
        history.chatId.push({role: "assistant", content: "Sorry But I cannot repond on that :("});

        bot.sendMessage(chatId, "Sorry But I cannot repond on that :(");
    }

});

setTimeout(()=>{

    history = {};

}, 1800000);
