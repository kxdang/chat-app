const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  };
};

const generateLocationMessage = (username, coords) => {
  return {
    username,
    url: `https://google.com/maps?q=${coords.lat},${coords.long}`,
    createdAt: new Date().getTime()
  };
};

const userTyping = username => {
  return `${username}... is typing`;
};

const userDoneTyping = clearMessage => {
  return "";
};

module.exports = {
  generateMessage,
  generateLocationMessage,
  userTyping,
  userDoneTyping
};
