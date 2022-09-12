/** @enum Direction */
const Direction = {
  Up: 0,
  Right: 1,
  Down: 2,
  Left: 3,
}

/** @enum GameStatus */
const GameStatus = {
  InGame: 0,
  Won: 1,
  Lost: 2,
}

/** @enum {number} CellType */
const CellType = {
  Empty: 0,
  Cherry: 1,
  Snake: 2,
}

/** @typedef {[number, number]} Coordinate */

/** @typedef {Array<Array<CellType>>} Field */

/** @typedef {Array[Coordinate]} Snake */

/**
 * @typedef {Object} State
 * @property {GameStatus} gameStatus
 * @property {Snake} snake
 * @property {Coordinate} cherry
 * @property {Direction} direction
 * @property {number|null} intervalId
 */

/**
 * @typedef {Object} Config
 * @property {number} width
 * @property {number} height
 * @property {number} tick
 */

/** @type {Config} */
const Config = {
  width: 17,
  height: 17,
  tick: 180
}

/** @returns {Snake} */
const getSnakeBasePosition = () => {
  /** @type {Coordinate} */
  const [x, y] = [
    Number((Config.width / 2).toFixed()),
    Number((Config.height / 2).toFixed()),
  ]
  return [
    [x, y],
    [x, y + 1],
    [x, y + 2],
  ]
}

/**
 * @param {number} max
 * @return {number}
 */
const getRandomInteger = (max) => Math.floor(Math.random() * max)

/** @return {Coordinate} */
const getRandomCoordinate = () => [
  getRandomInteger(Config.width),
  getRandomInteger(Config.height),
]

/**
 * @param {Coordinate} coordinateA
 * @param {Coordinate} coordinateB
 * @return {boolean}
 */
const isSameCoordinate = ([x1, y1], [x2, y2]) => x1 === x2 && y1 === y2

/**
 * @param {Snake} snake
 * @param {Coordinate} coordinate
 * @returns {boolean}
 */
const isInSnake = (snake, coordinate) => !!snake.find(
  (snakeBodyCell) => isSameCoordinate(snakeBodyCell, coordinate)
)

/**
 * @param {Snake} snakePosition
 * @param {Coordinate} [currentCherryPosition]
 * @returns {Coordinate}
 */
const getCherryPosition = (snakePosition, currentCherryPosition) => {
  let candidate = getRandomCoordinate()
  while (
    (currentCherryPosition && isSameCoordinate(candidate, currentCherryPosition)) ||
    isInSnake(snakePosition, candidate)
  ) {
    candidate = getRandomCoordinate()
  }
  return candidate
}

/**
 * @param {CellType} cell
 * @returns {string}
 */
const getCellClasses = (cell) => [
  'cell',
  cell === CellType.Snake && 'snake',
  cell === CellType.Cherry && 'cherry'
].filter(Boolean).join(' ')


/** @returns {Field} */
const getEmptyField = () => Array(Config.height).fill(0).map(
  () => Array(Config.width).fill(CellType.Empty)
)

/**
 * @param {State} state
 * @returns {Field}
 */
const getField = ({ snake, cherry: [x, y] }) => {
  const field = getEmptyField()
  snake.forEach(([x, y]) => {
    field[y][x] = CellType.Snake
  })
  field[y][x] = CellType.Cherry
  return field
}

/** @returns {State} */
const getBaseState = () => {
  const snakePosition = getSnakeBasePosition()
  return {
    gameStatus: GameStatus.InGame,
    snake: snakePosition,
    cherry: getCherryPosition(snakePosition),
    direction: Direction.Up,
    intervalId: null
  }
}

/**
 * @param {Coordinate} coordinate
 * @param {Direction} direction
 * @returns {Coordinate}
 */
const moveCoordinate = ([x, y], direction) => ({
  [Direction.Up]: [x, y - 1],
  [Direction.Right]: [x + 1, y],
  [Direction.Down]: [x, y + 1],
  [Direction.Left]: [x - 1, y],
}[direction])

/**
 * @param {Field} field
 * @returns {string}
 */
const renderField = (field) => `<div class="field">${
  field.map((row) =>
    `<div class="row">${row.map((cell) =>
      `<div class="${getCellClasses(cell)}"></div>`).join('')}
    </div>`
  ).join('')
}</div>`

const renderState = () => {
  if (State.gameStatus === GameStatus.Lost) {
    clearInterval(State.intervalId)
  }

  document.body.innerHTML = renderField(
    getField(State)
  )
}

/**
 * @param {Coordinate} coordinate
 * @returns {boolean}
 */
const isOutOfField = ([x, y]) => x === Config.width || x < 0 || y === Config.height || y < 0

const State = getBaseState()

const updateState = () => {
  const { snake, direction, cherry } = State
  const [head] = snake
  const newHead = moveCoordinate(head, direction)

  if (isOutOfField(newHead) || isInSnake(snake, newHead)) {
    State.gameStatus = GameStatus.Lost
  }

  if (isSameCoordinate(cherry, newHead)) {
    snake.unshift(cherry)
    State.cherry = getCherryPosition(snake, cherry)
  }

  snake.unshift(newHead)
  snake.pop()
  State.snake = snake

  renderState()
}

/**
 * @param {string} key
 * @returns {Direction}
 */
const getDirection = (key) => {
  if (!key.startsWith('Arrow')) {
    return State.direction
  }

  const direction = {
    ArrowUp: Direction.Up,
    ArrowRight: Direction.Right,
    ArrowDown: Direction.Down,
    ArrowLeft: Direction.Left,
  }[key]

  if (
    (direction === Direction.Up && State.direction === Direction.Down) ||
    (direction === Direction.Down && State.direction === Direction.Up) ||
    (direction === Direction.Right && State.direction === Direction.Left) ||
    (direction === Direction.Left && State.direction === Direction.Right)
  ) {
    return State.direction
  }

  return direction
}

const init = () => {
  document.addEventListener('keydown', (event) => {
    State.direction = getDirection(event.key)
  })
  State.intervalId = setInterval(updateState, Config.tick)
}

init()
