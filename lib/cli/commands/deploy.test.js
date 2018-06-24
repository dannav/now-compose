const Deploy = require('./deploy')

jest.unmock('../../errors')
const errors = require('../../errors')
errors.exit = jest.fn()

describe('command - deploy', () => {
  it('should exit if apiKey is not defined in args', async () => {
    const cmd = new Deploy({}, [])
    await cmd.run()
    expect(errors.exit).toBeCalled()
  })
})
