const { bot } = require('./bot_brain.js');

const discord_reply = `Did someone say discord? Join Matan's discord to get updates on stream schedule, juggling advice, hangout and all around have a good time! https://discord.gg/bNUaFRE`;

test('discord command', () => {
    const text1 = bot(null, 'abc this message has discord somewhere in it');
    expect(text1).toBe(discord_reply);
    
    const text2 = bot(null, 'randomcapitalizationDiscOrD');
    expect(text2).toBe(discord_reply);    

    const text3 = bot(null, 'no mention of the WORD');
    expect(text3).toEqual(expect.not.stringContaining(discord_reply));
})

//saying matanbots name multiples of 11 times untested
//fewer than 11 tests, so shouldn't get that reply
expect.extend({
    matanbotReply(context, message) {

        const replies = [
            `matanbot is currently under development, please excuse the lack of functionality`,
            `I'm so glad someone recognizes my potential as being the best bot on the channel`,
            `I am a juggle bot, that is all I am`,
            `hi ${context.username}!`                  
        ]
        
        return replies.includes(message); 
    }w
})

test('matanbot mention', () => {    
    basic_context = {username:'matanjuggles'}
    const text1 = bot(basic_context, 'basic matanbot test');
    expect(expect.matanbotReply(basic_context, text1));

    const text2 = bot(basic_context, 'matanbot cross discord test') //discord has precedence
    expect(text2).toBe(discord_reply);

    const text3 = bot(basic_context, 'middleofwordMatanBOTcapitalizationtest');
    expect(expect.matanbotReply(basic_context, text3));
})