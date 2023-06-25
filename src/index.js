require("dotenv/config");
const { Configuration, OpenAIApi } = require("openai");
const cheerio = require("cheerio");
const axios = require("axios");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const getDataFromOpenAI = async (prompt) => {
    const response = await openai.createCompletion({
        prompt: prompt,
        model: "text-davinci-003",
        temperature: 0,
        max_tokens: 200,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });
    console.log(`Number of tokens used: ${response.data.usage.total_tokens}`);
    // console.log(response.data.choices[0].text);
    extractInformation(response.data.choices[0].text);
};

async function webScraper(url) {
    try {
        const response = await axios.request({
            method: "GET",
            url: url,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });
        const $ = cheerio.load(response.data);

        const pageTitle = $("title").text();
        const paragraphText = $("p").text();

        // console.log("Page Title:", pageTitle);
        // console.log("Paragraph Text:", paragraphText);

        getDataFromOpenAI(
            `Please read the article thoroughly and consider various aspects to determine its potential bias. Assess the language used, the tone, the selection of facts and sources, and any potential framing or manipulation techniques employed. Rate the article on a scale from 0 to 100, where 0 represents complete neutrality and 100 represents the highest level of bias. Explain your rating by highlighting specific examples of biased language, skewed representation of facts, or any other indicators of potential bias that you come across. Additionally, mention any counterarguments or alternative perspectives that might help provide a more balanced assessment. Please take your time to carefully analyze the article and provide a comprehensive evaluation. Make your response in a JSON format structured like this: {"rating": "your_rating", "explanation": "your_explanation"}.\nArticle:${paragraphText}`
        );
    } catch (error) {
        console.log(error);
    }
    // const htmlClass = $(".elementClass")
    // const htmlId = $("#elementId")
}

function extractInformation(responseObj) {
    const result = JSON.parse(responseObj);
    // console.log(responseObj);
    const rating = result.rating;
    const explanation = result.explanation;
    console.log(`Rating: ${rating}`);
    console.log(`Explanation: ${explanation}`);
}

// webScraper("https://www.cnn.com/2023/06/23/politics/obama-amanpour-what-matters/index.html");
