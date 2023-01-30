# chatgpt

Telegram Bot with OpenAI GPT-3.5 davinci003 connection, context, Stability AI painting and Google scraping

You have to get those APIs and set env variables:

-   OPENAI_KEY - https://openai.com/api/ - $18 free credit, $0.02 per 1K tokens (1K Russian chars), ~$0.005 per response
-   STABILITY_KEY - https://beta.dreamstudio.ai/membership?tab=apiKeys - $10 free credit https://api.stability.ai/docs, $0.002 per image
-   REPLICATE_KEY - https://replicate.com/methexis-inc/img2prompt/api - $0.02 per image
-   TELEGRAM_KEY - contact https://t.me/BotFather
-   STRIPE_KEY - Stripe Live payment token (for $5 payments)

# PROD

-   https://t.me/maxsoft_chat_bot
    -   https://t.me/maxsoft_chat_gpt_group
    -   https://t.me/maxsoft_chat_gpt_group_en

# TODO

-   [x] Temperature separated
-   [x] Detect >600 abuse
-   [x] Context forget/reset timeout
-   [x] DDOS protection
-   [x] DDOS of RU group - 10 requests per hour to user
-   [x] Language from user.language_code
-   [x] add EN group
-   [ ] Parse tokens consumed
-   [ ] Abusive speech detection
-   [ ] Redis
-   [ ] TON
