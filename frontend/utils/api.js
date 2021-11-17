import axios from 'axios';

export const getBotInfo = async () => {
  const botInfo = await axios.get('http://localhost:3003/api/getbotinfo').then(res => {
    return res.data;
  });

  return botInfo;
};