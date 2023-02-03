scp C:\My-progs\Node.JS\chatgpt\index.js ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp C:\My-progs\Node.JS\chatgpt\io.js ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp C:\My-progs\Node.JS\chatgpt\search.js ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp C:\My-progs\Node.JS\chatgpt\package.json ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp C:\My-progs\Node.JS\chatgpt\package-lock.json ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp C:\My-progs\Node.JS\chatgpt\.env ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp C:\My-progs\Node.JS\chatgpt\google.json ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 

ssh -l ubuntu mega.maxsoft.tk "cd chatgpt && npm install"
ssh -l ubuntu mega.maxsoft.tk "pm2 restart chatgpt"
