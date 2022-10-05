// helper function for formatting email replies
const formatText = (text) => {
  if (text) {
    return text
      .split("________________________________")[0]
      .split(
        "--------------------------------------------------------------------------------"
      )[0]
      .replace(/(\r\n|\n|\r)/gm, "");
  } else {
    return text;
  }
};

module.exports = formatText;
