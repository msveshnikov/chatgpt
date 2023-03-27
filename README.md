# CHATGPT

Telegram Bot with OpenAI GPT-3.5-turbo connection, context, Stability AI painting and Google scraping

You have to get those APIs and set environment variables (or put to .env file):

-   TELEGRAM_KEY - contact https://t.me/BotFather
-   OPENAI_KEY - https://openai.com/api/ - $18 free credit, $0.002 per 1K tokens (1K Russian chars), ~$0.002 per response
-   STABILITY_KEY - https://beta.dreamstudio.ai/membership?tab=apiKeys - $10 free credit https://api.stability.ai/docs, $0.002 per image
-   REPLICATE_KEY - https://replicate.com/methexis-inc/img2prompt/api - $0.02 per image

Optional (for payments and translation):
-   STRIPE_KEY - Stripe Live payment token (for subscription payments, provided by BotFather https://core.telegram.org/bots/payments)

Optional (for promotion):
-   GROUP_RU=https://t.me/maxsoft_chat_gpt_group
-   GROUP_RU_ID=-1298741298749
-   GROUP_EN=https://t.me/maxsoft_chat_gpt_group_en
-   GROUP_EN_ID=-3987438235682
-   ADMIN=Extender777
-   ADMIN_ID=3498273578
-   ADMIN2=

# LOCAL RUN

- Install NodeJS v.18

```bash
export PUPPETEER_SKIP_DOWNLOAD=1 #for aarch64 
npm install
node index.js
```

# PROD

-   https://t.me/maxsoft_chat_bot
    -   https://t.me/maxsoft_chat_gpt_group
    -   https://t.me/maxsoft_chat_gpt_group_en

# TODO

-   [x] Temperature separated
-   [x] Detect >500 abuse
-   [x] Context forget/reset timeout
-   [x] DDOS protection
-   [x] DDOS of RU group - 5 requests per hour to user
-   [x] Language from user.language_code
-   [x] Parse tokens consumed to money.json
-   [x] Docker
