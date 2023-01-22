scp C:\My-progs\Node.JS\chatgpt\index.js ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp C:\My-progs\Node.JS\chatgpt\io.js ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 
scp C:\My-progs\Node.JS\chatgpt\search.js ubuntu@mega.maxsoft.tk:/home/ubuntu/chatgpt/ 

ssh -l ubuntu mega.maxsoft.tk "pm2 restart chatgpt"
