scp .\index.js ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp .\ecosystem.config.cjs ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp .\db.js ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp .\search.js ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp .\package.json ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp .\package-lock.json ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp .\.env ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp .\google.json ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 

ssh -l ubuntu mega.maxsoft.tk "cd chatgpt && npm install"
ssh -l ubuntu mega.maxsoft.tk "pm2 restart chatgpt"
