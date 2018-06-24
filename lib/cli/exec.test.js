const { shiftFlag, flattenArgs } = require('./exec')

describe('exec', () => {
  describe('shiftFlag', () => {
    it('should move defined flag and value to front of array', () => {
      const args = ['command', '--help', '--file', 'file.txt']
      const expected = ['--file', 'file.txt', 'command', '--help']

      const shifted = shiftFlag(args, '--file')
      expect(shifted).toEqual(expected)
    })

    it('should return args unmodified if flag passed does not exist', () => {
      const args = ['command', '--help', '--file', 'file.txt']
      const expected = args

      const shifted = shiftFlag(args, '--test')
      expect(shifted).toEqual(expected)
    })
  })

  describe('flattenArgs', () => {
    it('should flatten a zeit/args object to an array', () => {
      const args = {
        _: ['hello', 'world'],
        '--file': 'test.txt'
      }

      const expected = ['hello', 'world', '--file', 'test.txt']
      const flattened = flattenArgs(args)
      expect(flattened).toEqual(expected)
    })
  })
})
