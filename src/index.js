import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square (props) {
  let buttonClass = "square";
  if (props.isWinPosition) {
    buttonClass += " win-position";
  } else if (!props.isWin && props.isNowPosition) {
    buttonClass += " now-position";
  }

  return (
    <button
      className={buttonClass}
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  static ROW_NUM = 3;
  static COL_NUM = 3;

  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        isWinPosition={this.props.winPosition.includes(i)}
        isWin={this.props.winPosition.length != 0}
        isNowPosition={this.props.nowPosition[0] != null? this.props.nowPosition[0] === Math.floor(i / 3)
          && this.props.nowPosition[1] === i % 3: false}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(rowNum) {

    let rowList = [];
    for (let colIndex = 0; colIndex < Board.COL_NUM; colIndex++) {
      let index = Board.COL_NUM * rowNum + colIndex;
      rowList.push(this.renderSquare(index));
    }

    return rowList;
  }

  render() {

    let boardRender = [];
    for (let rowIndex = 0; rowIndex < Board.ROW_NUM; rowIndex++) {
      boardRender.push(<div key={rowIndex} className="board-row">{this.renderRow(rowIndex)}</div>);
    }

    return (
      <div>
        {boardRender}
      </div>
    );
  }
}

class Game extends React.Component {

  static lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        nowPosition: Array(2).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const calcResult = calculateWinner(current.squares);
    const winner = calcResult != null? calcResult.winner: null;
    if (winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X': 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        nowPosition:[Math.floor(i / 3), i % 3],
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  reverseOrder() {
    document.getElementById("history-list").classList.toggle("desc");
    document.getElementById("history-list").classList.toggle("asc");
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const calcResult = calculateWinner(current.squares);
    const winner = calcResult != null? calcResult.winner: null;
    const winPosition = calcResult != null? Game.lines[calcResult.winPattern]: [];
    const isDraw = !winner && current.squares.every((val) => val != null);

    const moves = history.map((step, move) => {
      const desc = move?
        'Go to move #' + move:
        'Go to game start';

      let liStyle = '';
      if (move === this.state.stepNumber) {
        liStyle = 'current-his';
      }

      return (
        <li key={move} className={liStyle} style={{order: move}}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (isDraw) {
      status = 'Draw Game';
    } else {
      status = 'Next player: ' + (this.state.xIsNext? 'X': 'O');
    }

    let nowPosition = 'now position : ';
    if (current.nowPosition[0] != null) {
        nowPosition += '(' + current.nowPosition[0] + ','
            + current.nowPosition[1] + ')';
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            nowPosition={current.nowPosition}
            winPosition={winPosition}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{nowPosition}</div>
          <ol id="history-list" className="history desc">{moves}</ol>
          <button onClick={() => this.reverseOrder()}>toggle</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  for (let i = 0; i < Game.lines.length; i++) {
    const [a, b, c] = Game.lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winPattern: i,
      }
    }
  }
  return null;
}