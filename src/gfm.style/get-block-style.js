export default ({ block }) => {
  const token = block.getData().get("token") || {};
  const { type: tokenType } = token;

  const blockStyle = {
    fontFamily: "Helvetica Neue, Arial, sans-serif",
    fontSize: 16
  };

  if (tokenType === "atx-heading" || tokenType === "settext-heading") {
    const { level } = token;
    blockStyle.fontSize = blockStyle.fontSize + (7 - level) * 2;
  }

  return blockStyle;
};
