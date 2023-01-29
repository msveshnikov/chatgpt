# chatgpt

Telegram Bot with OpenAI GPT-3.5 davinci003 connection, context, Stability AI painting and Google scraping

You have to get those APIs and set env variables:

-   OPENAI_KEY - https://openai.com/api/ - $18 free credit, $0.02 per 1K tokens (1K Russian chars), ~$0.005 per response
-   STABILITY_KEY - https://beta.dreamstudio.ai/membership?tab=apiKeys - $10 free credit https://api.stability.ai/docs
-   REPLICATE_KEY - https://replicate.com/methexis-inc/img2prompt/api - seems free so far, after some time $0.02 per image
-   TELEGRAM_KEY - contact https://t.me/BotFather
-   STRIPE_KEY - Stripe Live payment token (for $5 donations)

# PROD

http://t.me/maxsoft_chat_bot


# TODO

-   [ ] Redis
-   [ ] TON
-   [x] Temperature separated
-   [x] Detect >600 abuse
-   [x] Context forget/reset timeout
-   [ ] Parse tokens consumed
-   [ ] DDOS protection