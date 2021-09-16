fetch('https://website-test-ah.herokuapp.com/api/getbotinfo')
.then(res => res.json())
.then(botInfo => {
  document.getElementById('guilds').innerText = `Now serving in ${botInfo.guilds} servers, ${botInfo.users} users!`;
});

fetch('https://website-test-ah.herokuapp.com/api/getbotinfo')
.then(res => res.json())
.then(botInfo => {
  document.getElementById('bot-tag').innerText = `${botInfo.tag}`;
});

fetch('https://website-test-ah.herokuapp.com/api/getbotinfo')
.then(res => res.json())
.then(botInfo => {
  document.getElementById('description-title-h3').innerText = `What does ${botInfo.tag} do?`
});