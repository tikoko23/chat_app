export const MOTD = [
    "I have no idea what the site name should be",
    "¯\\\\_(ツ)\\_/¯",
    "Uhh.. I have nothing else so here is a link for you: [tikoko-dev.site/info/groups](http://tikoko-dev.site/info/groups)",
    "Okay.",
    "hehe",
    ">:D",
    "Why did the chicken cross the road?",
    "*aesthetic*",
    "no",
    "no.",
    "Never gonna give you up!",
    "Hi!",
    "Ddi u know tha tthe erath was flat but it bceame a sphere cuz it wnated to disporve flta earthesr?<br>😱😱😱🤯🤯🤯",
    "You are breathing manually now (im sorr- im actually not sorry lol)",
    "You are blinking manually now (im sorr- im actually not sorry lol)",
    "👁️👃"
];

export function displayMOTD() {
    const message = MOTD[Math.floor(Math.random() * (MOTD.length))];
    const parsedMessage = marked.parse(message);

    const motdDisplay = document.getElementById("motd");

    motdDisplay.innerHTML = parsedMessage;
}