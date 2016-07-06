const BFS = require('../src/bfs')
const should = require('should')
const Promise = require('bluebird')

describe('bfs', () => {
  const getMoves = (map) => (fromNodes) => {
    const res = new Map()
    return Promise
      .each(fromNodes, (fromNode) => {
        res.set(fromNode, map.get(fromNode) || [])
      })
      .return(res)
  }

  it('tests standard path using integers', () => {
    const map = new Map([
      [1, [2, 3]],
      [2, [3, 4]],
      [3, [4]],
      [4, [5]]
    ])
    const isGoal = (item) => {
      return Promise.resolve(item === 5)
    }
    const bfs = new BFS(1, getMoves(map), isGoal)

    return bfs.find()
      .then((result) => [1, 2, 4, 5].should.deepEqual(result))
  })

  it('tests standard path using strings', () => {
    const map = new Map([
      ['1', ['2', '3']],
      ['2', ['3', '4']],
      ['3', []],
      ['4', ['5']]
    ])
    const isGoal = (item) => {
      return Promise.resolve(item === '4')
    }
    const bfs = new BFS('1', getMoves(map), isGoal)

    return bfs.find()
      .then((result) => ['1', '2', '4'].should.deepEqual(result))
  })

  it('tests standard path using strings and integers', () => {
    const map = new Map([
      ['1', [2, '3']],
      [2, ['3', 4]],
      ['3', []],
      [4, ['5']]
    ])
    const isGoal = (item) => {
      return Promise.resolve(item === 4)
    }
    const bfs = new BFS('1', getMoves(map), isGoal)

    return bfs.find()
      .then((result) => ['1', 2, 4].should.deepEqual(result))
  })

  it('tests using bfs and not dfs', () => {
    const map = new Map([
      [1, [2, 6]],
      [2, [3]],
      [3, [4]],
      [4, [5]],
      [5, [6]],
      [6, [7]]
    ])

    const isGoal = (item) => {
      return Promise.resolve(item === 7)
    }
    const bfs = new BFS(1, getMoves(map), isGoal)

    return bfs.find()
      .then((result) => result.should.deepEqual([1, 6, 7]))
  })

  it('tests using bfs and not dfs2', () => {
    const map = new Map([
      [1, [2, 3]],
      [2, [4, 5]],
      [3, [6, 7]],
      [4, [8, 9]],
      [5, [10, 11]],
      [6, [12, 13]],
      [7, [14, 15]],
      [8, [16, 17]],
      [9, [18, 19]],
      [10, [20, 21]],
      [11, [22, 23]]
    ])

    const isGoal = () => {
      return Promise.resolve(false)
    }
    const bfs = new BFS(1, getMoves(map), isGoal)

    return bfs.find()
      .then((result) => should.equal(null, result))
  })

  it('getMoves should be called specific amount of times', () => {
    const map = new Map([
      [1, [2, 3, 4]],
      [2, [3]],
      [3, [4]],
      [4, [5, 6, 7]],
      [5, [6]],
      [6, [7]],
      [7, [8]],
      [8, []]
    ])

    let getMovesCalls = 0
    const getMovesWithCounter = () => {
      const func = getMoves(map)
      return (from) => {
        getMovesCalls += 1
        return func(from)
      }
    }
    const isGoal = (item) => {
      return Promise.resolve(item === 8)
    }
    const bfs = new BFS(1, getMovesWithCounter(), isGoal)

    return bfs.find()
      .then((result) => {
        getMovesCalls.should.equal(3)
      })
  })

  it('tests path is null', () => {
    const map = new Map([
      [1, [2, 3]],
      [2, [3, 4]],
      [3, []],
      [4, [5]]
    ])

    const isGoal = (item) => {
      return Promise.resolve(item === 10)
    }
    const bfs = new BFS(1, getMoves(map), isGoal)

    return bfs.find()
      .then((result) => should.equal(null, result))
  })

  it('should get illegal value 1', (done) => {
    const isGoal = (item) => {
      return Promise.resolve(item === 4)
    }
    const bfs = new BFS(1, () => [], isGoal)

    return bfs.find()
      .then(() => done('error was not thrown'))
      .catch((err) => {
        `Unexpected result from getMoves.
Expected count: 1.
Actual count: undefined`.should.equal(err.message)
        done()
      })
  })

  it('should get illegal value 2', (done) => {
    const isGoal = (item) => {
      return Promise.resolve(item === 4)
    }
    const bfs = new BFS(1, () => 1, isGoal)

    return bfs.find()
      .then(() => done('error was not thrown'))
      .catch((err) => {
        `Unexpected result from getMoves.
Expected type: Object.
Actual type: number, value: 1`.should.equal(err.message)
        done()
      })
  })
})
