const formatText = require('../email/formatText')

test("Test formatText function", async () => {
  const testText = 'hey!________________________________inReplyTo: earl.josephfernando@gmail.com'
  const result = 'hey!'

  expect(formatText(testText)).toEqual(result)
});
