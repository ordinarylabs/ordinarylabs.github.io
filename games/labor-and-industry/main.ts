import { Game, Player } from './game';

const players = [new Player(1), new Player(2), new Player(3), new Player(4)];

const game = new Game(players, () => {
  return {
    kind: 'NONE',
  };
});

game.start();
