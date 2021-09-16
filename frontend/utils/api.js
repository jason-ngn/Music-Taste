import axios from 'axios';

export const getBotInfo = async () => {
  const botInfo = await axios.get('https://website-test-ah.herokuapp.com/api/getbotinfo').then(res => {
    return res.data;
  });

  return botInfo;
};