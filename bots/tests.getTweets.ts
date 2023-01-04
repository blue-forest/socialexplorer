import cheerio from "npm:cheerio"

const account = "time_bot0111"

const response = await fetch(`https://twitter.com/${account}`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Host": "twitter.com",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
  },
})

const body = await response.text()

console.log(body)

const $ = cheerio.load(body)

$('li.stream-item').each(function(index){
    var name = $(this).find('.fullname').text();
    var tweet = $(this).find('p.tweet-text').text();
    console.log('user : ' + name);   //name of the user
    console.log('tweet : ' + tweet);   //tweet content
});

