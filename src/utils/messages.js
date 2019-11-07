const generateMessage = text => {
  return {
    text,
    createdAt: new Date().getTime()
  };
};

const generateLocationMessage = coords => {
  return {
    url: `https://google.com/maps?q=${coords.lat},${coords.long}`,
    createdAt: new Date().getTime()
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage
};
