const Promise = require('bluebird')

class BFS {
  constructor (start, getMoves, isGoal) {
    this.start = start
    this.getMoves = getMoves
    this.isGoal = isGoal
    this.visited = new Map()
    this.visited.set(start, null)
    this.queue = new Set()
    this.queue.add(start)
  }

  _returnPath () {
    const self = this
    if (self.final === undefined) {
      return null
    }
    let currentItem = self.final
    const path = []
    do {
      path.splice(0, 0, currentItem)
      currentItem = self.visited.get(currentItem)
    } while (currentItem !== self.start)
    path.splice(0, 0, currentItem)
    return path
  }

  _fetchAdjutant (fromNodes, depth) {
    return Promise
      .resolve(this.getMoves(fromNodes, depth))
      .tap((map) => {
        if (typeof map !== 'object') {
          throw new Error(`Unexpected result from getMoves.
Expected type: Object.
Actual type: ${typeof map}, value: ${map}`)
        }
        if (map.size !== fromNodes.length) {
          throw new Error(`Unexpected result from getMoves.
Expected count: ${fromNodes.length}.
Actual count: ${map.size}`)
        }
      })
  }

  _checkIsGoal (fromNode, toNodes) {
    const self = this
    return Promise
      .map(toNodes, (toNode) => {
        if (toNode === null || toNode === undefined || self.visited.has(toNode)) {
          return
        }
        self.visited.set(toNode, fromNode)
        return Promise
          .resolve(self.isGoal(toNode))
          .then((isGoal) => {
            if (isGoal) {
              self.final = toNode
              self.isDone = true
              return
            }
            self.queue.add(toNode)
          })
      })
  }

  _processQueue (depth) {
    const self = this
    if (self.isDone || self.queue.size === 0) {
      return Promise.resolve()
    }

    return Promise
      .resolve(self._fetchAdjutant(Array.from(self.queue), depth))
      .then((map) => {
        self.queue.clear()
        const promises = []
        map.forEach((toNodes, fromNode) => {
          promises.push(self._checkIsGoal(fromNode, toNodes, depth))
        })
        return Promise.all(promises)
      })
      .then(() => self._processQueue(depth + 1))
  }

  find () {
    const self = this
    return Promise
      .resolve(self._processQueue(0))
      .then(() => self._returnPath())
  }
}

module.exports = BFS
