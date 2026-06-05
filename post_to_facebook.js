// post_to_facebook.js
// Posts today's daily verse from tablespoonofgod.com to a Facebook Page.
// Requires two environment variables (stored as GitHub Secrets):
//   FB_PAGE_ID      — your Facebook Page's numeric ID
//   FB_ACCESS_TOKEN — your never-expiring Page Access Token

'use strict';
const https = require('https');

// ---------------------------------------------------------------------------
// CONFIG — read from environment (never hard-code tokens here)
// ---------------------------------------------------------------------------
const PAGE_ID      = process.env.FB_PAGE_ID;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

if (!PAGE_ID || !ACCESS_TOKEN) {
  console.error('ERROR: FB_PAGE_ID and FB_ACCESS_TOKEN environment variables must be set.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// VERSE DATABASE (matches index.html exactly)
// ---------------------------------------------------------------------------
const VERSES = {
  healing: [
    { text: "He heals the brokenhearted and binds up their wounds.", ref: "Psalm 147:3 (NIV)", thought: "Whatever is broken inside you today — a relationship, a dream, your confidence — God is not put off by the pieces. Hand them to Him. He specializes in putting things back together, better than before." },
    { text: "But I will restore you to health and heal your wounds, declares the Lord.", ref: "Jeremiah 30:17 (NIV)", thought: "This is God speaking directly — not maybe, not if you're good enough. He declares it. Today, let that promise be louder than the pain you're carrying." },
    { text: "By his wounds we are healed.", ref: "Isaiah 53:5b (NIV)", thought: "Healing didn't come cheap. Jesus paid for yours with His own suffering. When you feel unworthy to ask for healing, remember — it's already been purchased for you." }
  ],
  fear: [
    { text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.", ref: "2 Timothy 1:7 (NIV)", thought: "That anxious, fearful feeling? It did not come from God. He gave you power to face hard things, love to connect with others, and a clear mind to think well. Walk in that today." },
    { text: "The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?", ref: "Psalm 27:1 (NIV)", thought: "Ask yourself what you're most afraid of right now. Then ask: is that thing bigger than God? The answer is always no. Let His light shine on that fear today." },
    { text: "Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.", ref: "Isaiah 41:10 (NIV)", thought: "God doesn't say 'don't be afraid' without backing it up. He immediately tells you why: I am with you. I am your God. I will help you. He's not asking you to be brave alone." }
  ],
  temptation: [
    { text: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear.", ref: "1 Corinthians 10:13 (NIV)", thought: "You are not uniquely weak — everyone faces what you're facing. And God has already built a way out. Before you give in, look for that exit. He put it there for you." },
    { text: "Submit yourselves, then, to God. Resist the devil, and he will flee from you.", ref: "James 4:7 (NIV)", thought: "Resistance starts with surrender. The strength to say no to temptation comes from saying yes to God first. Start your morning with Him, and you'll face the day from a different position." },
    { text: "Because he himself suffered when he was tempted, he is able to help those who are being tempted.", ref: "Hebrews 2:18 (NIV)", thought: "Jesus was tempted too — and He understands exactly how hard it is. When you're struggling, you can go to Him not with shame but with honesty. He gets it. He's ready to help." }
  ],
  doubt: [
    { text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.", ref: "James 1:5 (NIV)", thought: "Doubt often lives where clarity is missing. If you don't know what to do or what to believe, just ask God — honestly, plainly, like you're texting a trusted friend. He won't make you feel foolish for asking." },
    { text: "Immediately the boy's father exclaimed: 'I do believe; help me overcome my unbelief!'", ref: "Mark 9:24 (NIV)", thought: "This might be the most honest prayer in the Bible. You don't have to pretend to have perfect faith. God can work with 'I believe, but I'm not sure.' Show up with what you have." },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5 (NIV)", thought: "When things don't make sense, the temptation is to figure it all out on your own. Today, try loosening your grip on needing all the answers. Trust the One who holds the whole picture." }
  ],
  love: [
    { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", ref: "John 3:16 (NIV)", thought: "You are included in the word 'world.' God's love for you was not casual — it cost Him everything. Today, live like someone truly loved." },
    { text: "We love because he first loved us.", ref: "1 John 4:19 (NIV)", thought: "If you're struggling to love someone difficult today, start here: remember how God loved you first, before you had it together. Let that love flow through you toward others." },
    { text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", ref: "1 Corinthians 13:4 (NIV)", thought: "Pick one word from this verse and apply it intentionally today — patient, kind, humble. Love is less a feeling and more a series of small, intentional choices. Make one today." }
  ],
  anxiety: [
    { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", ref: "Philippians 4:6 (NIV)", thought: "When the anxiety rises today, redirect it. Turn the worry into a specific prayer. Trade the spiral for a conversation with God." },
    { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7 (NIV)", thought: "Think of whatever is weighing on you today. Now imagine physically handing it over — like setting down a heavy bag. God says: give it to me. He wants it." },
    { text: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28 (NIV)", thought: "Jesus invites the tired people — not the put-together ones. If you're exhausted from trying to hold everything together, this is your invitation. You can stop white-knuckling today and just come." }
  ],
  anger: [
    { text: "Everyone should be quick to listen, slow to speak and slow to become angry.", ref: "James 1:19 (NIV)", thought: "Before you respond to that frustrating message or person — pause. Breathe. Listen more than you speak. Anger rarely makes things better; a pause almost always does." },
    { text: "'In your anger do not sin': Do not let the sun go down while you are still angry.", ref: "Ephesians 4:26 (NIV)", thought: "Anger itself isn't the sin — what you do with it is. Before today ends, don't let the sun set on an unresolved conflict. Make the call, say I'm sorry. Rest easier tonight." },
    { text: "A gentle answer turns away wrath, but a harsh word stirs up anger.", ref: "Proverbs 15:1 (NIV)", thought: "The next time someone comes at you heated, try responding gently — not weakly, but calmly. A soft answer has power. It can stop a whole storm in its tracks." }
  ],
  hope: [
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11 (NIV)", thought: "Even if today feels stuck, God says He has a plan with your name on it — and it ends well. You don't have to see the whole path. Just trust the One who laid it out." },
    { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31 (NIV)", thought: "Tired? The kind of tired that sleep doesn't fix? Waiting on God isn't passive — it's filling back up. Let God recharge what's been drained today." },
    { text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope.", ref: "Romans 15:13 (NIV)", thought: "Hope isn't manufactured — it's filled in. Ask God today to fill you. Not just a trickle, but an overflow. He's generous with hope to those who simply ask and trust." }
  ],
  peace: [
    { text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.", ref: "John 14:27 (NIV)", thought: "The world's peace depends on circumstances going well. Jesus's peace works even when they don't. Whatever is swirling around you today — choose the peace that transcends your situation." },
    { text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.", ref: "Philippians 4:7 (NIV)", thought: "You don't have to understand everything to have peace. God's peace defies explanation — it's something you receive, not figure out. Lay down the need to understand today." },
    { text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.", ref: "Isaiah 26:3 (NIV)", thought: "Peace begins in the mind. Whatever you fix your mind on shapes how you feel. Fix it on God, and peace follows." }
  ],
  stress: [
    { text: "Cast your cares on the Lord and he will sustain you; he will never let the righteous be shaken.", ref: "Psalm 55:22 (NIV)", thought: "You were not designed to carry everything. Hand each stressful thing to God in prayer today. Carrying less is not weakness — it's wisdom." },
    { text: "Humble yourselves, therefore, under God's mighty hand, that he may lift you up in due time.", ref: "1 Peter 5:6 (NIV)", thought: "A lot of stress comes from trying to control what we can't. Humility says: God, this is bigger than me. I trust you with it. Let Him carry the weight of outcomes today." },
    { text: "Therefore I tell you, do not worry about your life, what you will eat or drink; or about your body, what you will wear.", ref: "Matthew 6:25 (NIV)", thought: "The same God who feeds the birds knows exactly what you need today. Don't let worry steal your peace over things He's already got covered." }
  ],
  patience: [
    { text: "Wait for the Lord; be strong and take heart and wait for the Lord.", ref: "Psalm 27:14 (NIV)", thought: "Waiting is not wasting time. God's timing is never accidental. If something hasn't arrived yet, it's not because He forgot. Be strong. Keep waiting." },
    { text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", ref: "Galatians 6:9 (NIV)", thought: "The harvest is coming. Don't stop now. Whatever good thing you've been quietly doing without seeing results — keep showing up. The proper time is real." },
    { text: "Be still before the Lord and wait patiently for him; do not fret when people succeed in their ways.", ref: "Psalm 37:7 (NIV)", thought: "Stillness is a spiritual discipline. Try three quiet minutes with God today before the noise starts. See what happens." }
  ],
  pride: [
    { text: "Pride goes before destruction, a haughty spirit before a fall.", ref: "Proverbs 16:18 (NIV)", thought: "Before you bulldoze ahead with your own way today, ask: is this God's plan or mine? Humility positions you for blessing; pride sets up a stumble." },
    { text: "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves.", ref: "Philippians 2:3 (NIV)", thought: "Try an experiment today: in at least one conversation, put the other person first. Ask about them before talking about yourself. Practice looks like this." },
    { text: "He guides the humble in what is right and teaches them his way.", ref: "Psalm 25:9 (NIV)", thought: "God bypasses the proud and goes straight to the humble. If you want His guidance today, position yourself low. Humble people are teachable — and teachable people get led well." }
  ],
  joy: [
    { text: "Rejoice in the Lord always. I will say it again: Rejoice!", ref: "Philippians 4:4 (NIV)", thought: "Paul wrote this from prison. If he could say rejoice twice in chains, you can find something to be genuinely grateful for today. Joy isn't about circumstances — it's a decision made daily." },
    { text: "The joy of the Lord is your strength.", ref: "Nehemiah 8:10b (NIV)", thought: "When you're feeling depleted, joy is the fuel. Not manufactured happiness — but the deep, stable gladness that comes from knowing whose you are. Come back to that truth today." },
    { text: "You make known to me the path of life; you will fill me with joy in your presence.", ref: "Psalm 16:11 (NIV)", thought: "Joy is found in His presence, not in perfect circumstances. When you need a lift today, spend a few minutes genuinely with God. See what happens." }
  ],
  jealousy: [
    { text: "A heart at peace gives life to the body, but envy rots the bones.", ref: "Proverbs 14:30 (NIV)", thought: "Jealousy hurts the person feeling it more than anyone else. When comparison creeps in today, redirect it. Ask God to help you celebrate others — and trust He hasn't forgotten you." },
    { text: "Do not let your heart envy sinners, but always be zealous for the fear of the Lord.", ref: "Proverbs 23:17 (NIV)", thought: "It's easy to scroll and wish your life looked like someone else's. Stay in your lane. God's plan for you is not inferior — it's just yours." },
    { text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", ref: "1 Corinthians 13:4 (NIV)", thought: "Envy is the opposite of love. When you catch yourself wanting what someone else has, ask God to fill that space with love instead." }
  ],
  loss: [
    { text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", ref: "Psalm 34:18 (NIV)", thought: "If you're grieving today — a person, a relationship, a season — you are not alone. God draws closer to the broken, not away from them. Let yourself be found by Him." },
    { text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.", ref: "Revelation 21:4 (NIV)", thought: "This is God's final word on loss — it doesn't win. The story ends with Him personally wiping away every tear. Grief is real, but it is not the last word." },
    { text: "Blessed are those who mourn, for they will be comforted.", ref: "Matthew 5:4 (NIV)", thought: "Jesus blessed the grieving people, not the ones who had it all together. You don't have to hide your sadness or rush through it. Bring your mourning to Jesus today." }
  ]
};

const HOLIDAY_VERSES = {
  "12-25": { topic: "Christmas",       text: "For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.", ref: "Isaiah 9:6 (NIV)",       thought: "Today the whole world pauses around the birth of one child. His names say it all — Wonderful, Mighty, Everlasting, Peace. Merry Christmas." },
  "12-24": { topic: "Christmas Eve",   text: "The angel said to them, 'Do not be afraid. I bring you good news that will cause great joy for all the people. Today in the town of David a Savior has been born to you; he is the Messiah, the Lord.'", ref: "Luke 2:10-11 (NIV)",    thought: "The best news ever announced wasn't on a screen — it was spoken by an angel to ordinary shepherds. Tonight, receive that announcement personally: your Savior came for you." },
  "4-20":  { topic: "Resurrection",    text: "He is not here; he has risen, just as he said.", ref: "Matthew 28:6 (NIV)",       thought: "Seven words that changed everything. Death didn't win. The tomb is empty. Whatever feels dead in your life today — bring it to the Risen One. He specializes in resurrection." },
  "4-18":  { topic: "Good Friday",     text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.", ref: "Romans 5:8 (NIV)",          thought: "You didn't have to clean yourself up first. While you were still in the mess, Jesus went to the cross for you. That's the definition of grace." },
  "1-1":   { topic: "New Year",        text: "See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.", ref: "Isaiah 43:19 (NIV)",       thought: "A brand new year is God's invitation: watch what I'm about to do. Don't let yesterday's disappointments blind you to today's possibilities. Happy New Year." },
  "11-28": { topic: "Thanksgiving",    text: "Give thanks to the Lord, for he is good; his love endures forever.", ref: "Psalm 107:1 (NIV)",          thought: "Before the food and the family and the football — start with this. His love has been enduring all year, even through the hard parts. Happy Thanksgiving." },
  "11-27": { topic: "Thanksgiving",    text: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.", ref: "1 Thessalonians 5:18 (NIV)", thought: "Not for all circumstances — but in them. Even in the hard seasons, gratitude to God is possible. It changes how you see everything." },
  "12-31": { topic: "New Year's Eve",  text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.", ref: "Lamentations 3:22-23 (NIV)", thought: "As this year closes, look back with honesty and forward with hope. God was faithful through everything. Tomorrow brings fresh mercies. He's not done yet." }
};

// ---------------------------------------------------------------------------
// VERSE SELECTION LOGIC (identical to index.html)
// ---------------------------------------------------------------------------
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
  return (h >>> 0) % 10000 / 10000;
}

function getDayData(date) {
  const month = date.getMonth() + 1;
  const day   = date.getDate();
  const key   = `${month}-${day}`;
  if (HOLIDAY_VERSES[key]) return HOLIDAY_VERSES[key];
  const dateStr = date.toISOString().slice(0, 10);
  const topics  = Object.keys(VERSES);
  const topic   = topics[Math.floor(seededRandom(dateStr + 'topic') * topics.length)];
  const pool    = VERSES[topic];
  const verse   = pool[Math.floor(seededRandom(dateStr + 'verse') * pool.length)];
  return {
    topic: topic.charAt(0).toUpperCase() + topic.slice(1),
    text:  verse.text,
    ref:   verse.ref,
    thought: verse.thought
  };
}

// ---------------------------------------------------------------------------
// BUILD TODAY'S POST
// ---------------------------------------------------------------------------
const today   = new Date();
const data    = getDayData(today);
const dateStr = today.toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
});

const message =
`✝️ A Tablespoon of God — ${dateStr}

📖 Topic: ${data.topic}

"${data.text}"
— ${data.ref}

💭 ${data.thought}

🌐 Read more at tablespoonofgod.com
#TablspoonOfGod #BibleVerse #DailyScripture #Faith #DailyDevotional`;

console.log('--- Posting to Facebook ---');
console.log(message);
console.log('---------------------------');

// ---------------------------------------------------------------------------
// POST TO FACEBOOK GRAPH API
// ---------------------------------------------------------------------------
const postBody = JSON.stringify({
  message,
  access_token: ACCESS_TOKEN
});

const options = {
  hostname: 'graph.facebook.com',
  path:     `/v19.0/${PAGE_ID}/feed`,
  method:   'POST',
  headers:  {
    'Content-Type':   'application/json',
    'Content-Length': Buffer.byteLength(postBody)
  }
};

const req = https.request(options, res => {
  let raw = '';
  res.on('data', chunk => { raw += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(raw);
      if (json.id) {
        console.log(`SUCCESS — Post ID: ${json.id}`);
      } else {
        console.error('Facebook returned an error:', JSON.stringify(json, null, 2));
        process.exit(1);
      }
    } catch (err) {
      console.error('Could not parse Facebook response:', raw);
      process.exit(1);
    }
  });
});

req.on('error', err => {
  console.error('Network error:', err.message);
  process.exit(1);
});

req.write(postBody);
req.end();
