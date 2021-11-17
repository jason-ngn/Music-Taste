fetch('http://localhost:3003/api/getbotinfo')
.then(res => res.json())
.then(botInfo => {
  document.getElementById('guilds').innerText = `Now serving in ${botInfo.guilds} servers, ${botInfo.users} users!`;
});

fetch('http://localhost:3003/api/getbotinfo')
.then(res => res.json())
.then(botInfo => {
  document.getElementById('bot-tag').innerText = `${botInfo.tag}`;
});

fetch('http://localhost:3003/api/getbotinfo')
.then(res => res.json())
.then(botInfo => {
  document.getElementById('description-title-h3').innerText = `What does ${botInfo.tag} do?`
});