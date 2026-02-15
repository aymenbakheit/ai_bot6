# ai_bot6
const express = require('express');
const Groq = require('groq-sdk');

const app = express();
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const conversations = {};

app.get('/ai', async (req, res) => {
    const message = req.query.message || '';
    const user = req.query.user || 'default';

    if (!message) return res.send('اكتب سؤالك!');

    if (!conversations[user]) {
        conversations[user] = [
            { role: 'system', content: 'أنت مساعد ذكي في شات بث مباشر. ردودك قصيرة جداً ولا تتجاوز 180 حرف بدون استثناء.' }
        ];
    }

    conversations[user].push({ role: 'user', content: message });

    const response = await client.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: conversations[user],
        max_tokens: 80
    });

    let reply = response.choices[0].message.content;

    conversations[user].push({ role: 'assistant', content: reply });

    if (conversations[user].length > 11) {
        conversations[user] = [conversations[user][0], ...conversations[user].slice(-10)];
    }

    if (reply.length > 190) reply = reply.slice(0, 187) + '...';

    res.send(reply);
});

app.listen(3000, () => console.log('شغال!'));
