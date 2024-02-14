scp .\index.js ubuntu@mangatv.shop:/home/ubuntu/chatgpt/ 
scp .\ecosystem.config.cjs ubuntu@mangatv.shop:/home/ubuntu/chatgpt/ 
scp .\db.js ubuntu@mangatv.shop:/home/ubuntu/chatgpt/ 
scp .\search.js ubuntu@mangatv.shop:/home/ubuntu/chatgpt/ 
scp .\package.json ubuntu@mangatv.shop:/home/ubuntu/chatgpt/ 
scp .\package-lock.json ubuntu@mangatv.shop:/home/ubuntu/chatgpt/ 
scp .\.env ubuntu@mangatv.shop:/home/ubuntu/chatgpt/ 

ssh -l ubuntu mangatv.shop "cd chatgpt && npm install"
ssh -l ubuntu mangatv.shop "pm2 restart chatgpt"
