# chatgpt

Telegram Bot with OpenAI GPT-3.5 gpt-3.5-turbo connection, context, Stability AI painting and Google scraping

You have to get those APIs and set env variables:

-   OPENAI_KEY - https://openai.com/api/ - $18 free credit, $0.002 per 1K tokens (1K Russian chars), ~$0.002 per response
-   STABILITY_KEY - https://beta.dreamstudio.ai/membership?tab=apiKeys - $10 free credit https://api.stability.ai/docs, $0.002 per image
-   REPLICATE_KEY - https://replicate.com/methexis-inc/img2prompt/api - $0.02 per image
-   TELEGRAM_KEY - contact https://t.me/BotFather
-   STRIPE_KEY - Stripe Live payment token (for subscription payments)
-   GOOGLE_KEY - key of Google Cloud Project with Translate API enabled
-   google.json - https://cloud.google.com/translate https://console.cloud.google.com/apis/credentials/key

-   GROUP_RU=https://t.me/maxsoft_chat_gpt_group
-   GROUP_RU_ID=-1001776618845
-   GROUP_EN=https://t.me/maxsoft_chat_gpt_group_en
-   GROUP_EN_ID=-1001716321937
-   ADMIN=Extender777
-   ADMIN_ID=123456789
-   ADMIN2=

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
