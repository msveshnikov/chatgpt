# CHATGPT

Telegram Bot with OpenAI GPT-3.5-turbo, Gemini Pro, Stability AI painting, and Google scraping capabilities

## Features

-   Multi-language support based on user's language code
-   Context management with automatic reset timeout
-   DDOS protection and request rate limiting
-   Temperature control for AI responses
-   Token consumption tracking
-   Image generation with Stability AI
-   Image-to-text conversion (temporarily disabled)
-   Google search integration
-   Optional subscription payments via Stripe

## Environment Variables

-   TELEGRAM_KEY - contact https://t.me/BotFather
-   OPENAI_KEY - https://openai.com/api/ - $18 free credit, $0.002 per 1K tokens (1K Russian chars), ~$0.002 per response
-   STABILITY_KEY - https://beta.dreamstudio.ai/membership?tab=apiKeys - $10 free credit https://api.stability.ai/docs, $0.002 per image
-   REPLICATE_KEY - https://replicate.com/methexis-inc/img2prompt/api - $0.02 per image
-   GOOGLE_KEY - key of Google Cloud Project with Vertex AI enabled
-   google.json - https://console.cloud.google.com/apis/credentials/key

Optional:

-   STRIPE_KEY - Stripe Live payment token (for subscription payments, provided by BotFather https://core.telegram.org/bots/payments)

Optional (for promotion):

-   GROUP_RU=https://t.me/maxsoft_chat_gpt_group
-   GROUP_RU_ID=-1298741298749
-   ADMIN=Extender777
-   ADMIN_ID=3498273578

## Installation

1. Install NodeJS v.18
2. Set up environment variables or create a .env file
3. Run:

```bash
export PUPPETEER_SKIP_DOWNLOAD=1 #for aarch64
npm install
node index.js
```

## Docker

A Dockerfile is provided for containerized deployment.

## Development

To run the bot locally:

```bash
node index.js
```

## Production

Live bot: https://t.me/maxsoft_chat_bot
Discussion group: https://t.me/maxsoft_chat_gpt_group

## Roadmap

-   [x] Temperature control
-   [x] Abuse detection (>500 tokens)
-   [x] Context management with timeout
-   [x] DDOS protection
-   [x] Multi-language support
-   [x] Token consumption tracking
-   [x] Docker support
-   [x] Gemini Pro integration
-   [ ] Enhance image-to-text functionality
-   [ ] Implement user feedback system
-   [ ] Add support for voice messages
-   [ ] Improve error handling and logging
-   [ ] Implement unit and integration tests
-   [ ] Create user documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

[![Stargazers repo roster for @msveshnikov/chatgpt](https://reporoster.com/stars/msveshnikov/chatgpt)](https://github.com/msveshnikov/chatgpt/stargazers)

[![Forkers repo roster for @msveshnikov/chatgpt](https://reporoster.com/forks/msveshnikov/chatgpt)](https://github.com/msveshnikov/chatgpt/network/members)
