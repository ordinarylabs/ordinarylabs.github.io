/* eslint-disable max-classes-per-file */

// LABOR & INDUSTRY

const MAX_MANAGER_WEALTH = 100;
const MAX_ENGINEER_WEALTH = 50;
const MAX_OPERATOR_WEALTH = 25;

const INITIAL_MANAGER_WEALTH = 20;
const INITIAL_ENGINEER_WEALTH = 10;
const INITIAL_OPERATOR_WEALTH = 5;

// ?? ranges may need to be informed by number of players.
const UNIT_RANGES = [
  [0, 10, -6] as const,
  [10, 20, -5] as const,
  [21, 30, -4] as const,
  [31, 50, -3] as const,
  [51, 70, -2] as const,
  [71, 90, -1] as const,
  [91, 100, 0] as const,
] as const;

const FACTORY_CLOSES_EFFECT = {
  MANAGER: [0, 1] as const,
  ENGINEER: [1, 2] as const,
  OPERATOR: [2, 3] as const,
} as const;

const MANAGER_PROFITABILITY_EFFECT = [-3, -2, -1, 0] as const;
const ENGINEER_LEVEL_EFFECT = [-1, 0, 1] as const;
const OPERATOR_INJURY_EFFECT = [0, -1, -2, -3] as const;

const WEALTH_RANGES = [
  [0, 5, -2] as const,
  [6, 10, -1] as const,
  [11, 20, 0] as const,
  [21, 50, 1] as const,
  [51, 100, 2] as const,
] as const;

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

// GAME

export class Player {
  number: number;

  role: null | Role;

  isWinner: boolean;

  constructor(number: number) {
    this.number = number;

    this.role = null;
    this.isWinner = false;
  }

  assignRole(role: Role) {
    if (this.role === null) {
      this.role = role;
    }
  }

  makeWinner() {
    this.isWinner = true;
  }
}

interface StartYearEvent {
  kind: 'START_YEAR',
}

interface StartQuarterEvent {
  kind: 'START_QUARTER',
}

interface StartMonthEvent {
  kind: 'START_MONTH',
}

interface ManagerSetIncomeEvent {
  kind: 'MANAGER_SET_INCOME',
}

interface EngineerDrawEquipmentEvent {
  kind: 'ENGINEER_DRAW_EQUIPMENT',
  optional: boolean,
  playerNumber: number,
}

interface EngineerDiscardEquipmentEvent {
  kind: 'ENGINEER_DISCARD_EQUIPMENT',
  playerNumber: number,
  equipment: {
    id: number,
  }[],
}

interface OperatorsDrawMishapEvent {
  kind: 'OPERATORS_DRAW_MISHAP',
  optional: boolean;
}

interface OperatorsRollCostOfGoodsEvent {
  kind: 'OPERATORS_ROLL_COST_OF_GOODS',
}

interface OperatorsSetMaintenanceDueEvent {
  kind: 'OPERATORS_SET_MAINTENANCE_DUE',
}

interface EngineerRequestEvent {
  kind: 'ENGINEER_REQUEST',
  availableActions: { something: number }[];
}

interface RequestManagerApprovalEvent {
  kind: 'REQUEST_MANAGER_APPROVAL',
  action: {
    something: number,
  },
}

interface CheckForStrikeIntentEvent {
  kind: 'CHECK_FOR_STRIKE_INTENT',
}

interface StrikeEvent {
  kind: 'STRIKE',
}

interface RollForDelayedMaintenanceBreakageEvent {
  kind: 'ROLL_FOR_DELAYED_MAINTENANCE_BREAKAGE',
  equipmentId: number,
}

interface EquipmentBreaksEvent {
  kind: 'EQUIPMENT_BREAKS',
  equipmentId: number,
  dueToLackOfMaintenance: boolean,
}

interface RandomlySelectInjuredOperatorsEvent {
  kind: 'RANDOMLY_SELECT_INJURED_OPERATORS',
  count: number,
}

interface InjureOperatorEvent {
  kind: 'INJURE_OPERATOR',
  playerNumber: number,
}

export type GameEvent =
  | StartYearEvent
  | StartQuarterEvent
  | StartMonthEvent
  | ManagerSetIncomeEvent
  | EngineerDrawEquipmentEvent
  | EngineerDiscardEquipmentEvent
  | OperatorsDrawMishapEvent
  | OperatorsRollCostOfGoodsEvent
  | OperatorsSetMaintenanceDueEvent
  | EngineerRequestEvent
  | RequestManagerApprovalEvent
  | CheckForStrikeIntentEvent
  | StrikeEvent
  | RollForDelayedMaintenanceBreakageEvent
  | EquipmentBreaksEvent
  | RandomlySelectInjuredOperatorsEvent
  | InjureOperatorEvent;

interface NoneResult {
  kind: 'NONE',
}

interface ManagerSetIncomeResult {
  kind: 'MANAGER_SET_INCOME',
  manager: number,
  engineer: number,
  operator: number,
}

interface EngineerDrawEquipmentResult {
  kind: 'ENGINEER_DRAW_EQUIPMENT',
  accepted: boolean,
}

interface EngineerDiscardEquipmentResult {
  kind: 'ENGINEER_DISCARD_EQUIPMENT',
  equipmentId: number,
}

interface OperatorsDrawMishapResult {
  kind: 'OPERATORS_DRAW_MISHAP',
  accepted: boolean,
}

interface EngineerRequestResult {
  kind: 'ENGINEER_REQUEST',
  actions: { something: number }[],
}

interface EngineerDoneWithRequestsResult {
  kind: 'ENGINEER_DONE_WITH_REQUESTS',
  action: { something: number },
}

interface ManagerApprovedResult {
  kind: 'MANAGER_APPROVED',
}

interface ManagerDeniedResult {
  kind: 'MANAGER_DENIED',
  withPrejudice: boolean,
}

interface IntendsToStrikeResult {
  kind: 'INTENDS_TO_STRIKE',
  playerNumbers: number[],
}

interface RandomlySelectInjuredOperatorResult {
  kind: 'RANDOMLY_SELECT_INJURED_OPERATORS',
  playerNumbers: number[],
}

export type GameResult =
  | NoneResult
  | ManagerSetIncomeResult
  | EngineerDrawEquipmentResult
  | EngineerDiscardEquipmentResult
  | OperatorsDrawMishapResult
  | EngineerRequestResult
  | EngineerDoneWithRequestsResult
  | ManagerApprovedResult
  | ManagerDeniedResult
  | IntendsToStrikeResult
  | RandomlySelectInjuredOperatorResult;

export class Game {
  players: Player[];

  // eslint-disable-next-line no-unused-vars
  evtHandler: (evt: GameEvent) => GameResult;

  manager: Manager;

  managerIncome: Income;

  engineers: Engineer[];

  engineerIncome: Income;

  operators: Operator[];

  operatorIncome: Income;

  currentYear: number;

  currentQuarter: number;

  currentMonth: number;

  process: Process;

  units: Units;

  cash: Cash;

  inventory: Inventory;

  demand: Demand;

  costOfGoods: CostOfGoods;

  mishapDeck: Deck<Mishap>;

  equipmentDeck: Deck<Equipment>;

  mishapDrawnCount: number;

  // eslint-disable-next-line no-unused-vars
  constructor(players: Player[], evtHandler: (evt: GameEvent) => GameResult) {
    this.players = players;
    this.evtHandler = evtHandler;

    if (players.length < 4 || players.length > 10) {
      throw new Error('game only accommodates 4 to 10 players');
    }

    this.managerIncome = new Income();
    this.engineerIncome = new Income();
    this.operatorIncome = new Income();

    this.manager = new Manager(this.managerIncome, this.engineerIncome, this.operatorIncome);

    this.engineers = [];
    this.operators = [];

    for (let i = 0; i < players.length; i += 1) {
      const player = players[i];

      switch (i) {
        case 0: {
          player.assignRole(this.manager);
          break;
        }
        case 1:
        case 5:
        case 7: {
          const engineer = new Engineer(this.engineerIncome);

          this.engineers.push(engineer);
          player.assignRole(engineer);

          break;
        }
        default: {
          const operator = new Operator(this.operatorIncome);

          this.operators.push(operator);
          player.assignRole(operator);
        }
      }
    }

    this.currentYear = 0;
    this.currentQuarter = 0;
    this.currentMonth = 0;

    this.process = new Process();

    this.units = new Units();
    this.cash = new Cash();
    this.inventory = new Inventory();

    this.demand = new Demand();
    this.costOfGoods = new CostOfGoods();

    this.equipmentDeck = new Deck([]);
    this.mishapDeck = new Deck([]);

    this.mishapDrawnCount = 0;
  }

  start() {
    let startingEquipmentPerEngineer = 3;

    if (this.engineers.length === 2) {
      startingEquipmentPerEngineer = 2;
    } else if (this.engineers.length === 3) {
      startingEquipmentPerEngineer = 1;
    }

    this.players.forEach((player) => {
      if (player.role instanceof Engineer) {
        for (let i = 0; i < startingEquipmentPerEngineer - 1; i += 1) {
          this.evtHandler({
            kind: 'ENGINEER_DRAW_EQUIPMENT',
            playerNumber: player.number,
            optional: false,
          });
        }
      }
    });

    this.startYear();
  }

  end() {
    const unitEffect = UNIT_RANGES.reduce((acc, range) => {
      if (this.units.overall >= range[0] && this.units.overall < range[1]) {
        return range[2];
      }
      return acc;
    }, 0);

    const factoryCloses = (rollDie() + unitEffect) > 1;

    this.players.forEach((player) => {
      const { role } = player;
      let roll = rollDie();

      const wealthEffect = WEALTH_RANGES.reduce((acc, range) => {
        if (role && role.wealth.get() >= range[0] && role.wealth.get() < range[1]) {
          return range[2];
        }
        return acc;
      }, 0);

      roll += wealthEffect;

      if (role instanceof Manager) {
        if (factoryCloses && role.profitableYearsCount < 3) {
          roll -= FACTORY_CLOSES_EFFECT.MANAGER[1];
        } else {
          roll -= FACTORY_CLOSES_EFFECT.MANAGER[0];
        }

        const profitabilityEffect = MANAGER_PROFITABILITY_EFFECT[role.profitableYearsCount];

        roll += profitabilityEffect;
      } else if (role instanceof Engineer) {
        if (factoryCloses) {
          if (role.level.overall === 0) {
            roll -= FACTORY_CLOSES_EFFECT.ENGINEER[1];
          } else {
            roll -= FACTORY_CLOSES_EFFECT.ENGINEER[0];
          }
        }

        const levelEffect = ENGINEER_LEVEL_EFFECT[role.level.overall];

        roll += levelEffect;
      } else if (role instanceof Operator) {
        if (factoryCloses) {
          if (role.injuries.overall === 0) {
            roll -= FACTORY_CLOSES_EFFECT.OPERATOR[1];
          } else {
            roll -= FACTORY_CLOSES_EFFECT.OPERATOR[0];
          }
        }

        const injuryEffect = OPERATOR_INJURY_EFFECT[role.injuries.overall];

        roll += injuryEffect;
      }

      if (roll > 1) {
        player.makeWinner();
      }
    });
  }

  startYear() {
    this.currentYear += 1;

    if (this.currentYear > 3) {
      this.end();
      return;
    }

    this.evtHandler({ kind: 'START_YEAR' });

    const res = this.evtHandler({ kind: 'MANAGER_SET_INCOME' });

    if (res.kind === 'MANAGER_SET_INCOME') {
      this.manager.setManagerIncome(res.manager);
      this.manager.setEngineerIncome(res.engineer);
      this.manager.setOperatorIncome(res.operator);
    }

    // TODO: manager approval/denial of engineering promotions

    while (this.currentQuarter < 4) {
      this.startQuarter();
    }

    this.currentQuarter = 0;
  }

  startQuarter() {
    this.currentQuarter += 1;

    this.evtHandler({ kind: 'START_QUARTER' });

    while (this.currentMonth < 3) {
      this.startMonth();
    }

    this.players.forEach((player) => {
      if (player.role instanceof Engineer) {
        player.role.resetQuarterlyEquipmentDrawCount();
      }
    });

    this.mishapDrawnCount = 0;
    this.currentMonth = 0;
  }

  startMonth() {
    this.currentMonth += 1;

    this.evtHandler({ kind: 'START_MONTH' });

    this.players.forEach((player) => {
      if (
        player.role instanceof Engineer
        && player.role.level.overall
        > player.role.quarterlyEquipmentDrawnCount
      ) {
        const drawRes = this.evtHandler({
          kind: 'ENGINEER_DRAW_EQUIPMENT',
          optional: true,
          playerNumber: player.number,
        });

        if (drawRes.kind === 'ENGINEER_DRAW_EQUIPMENT' && drawRes.accepted) {
          const newEquipment = this.equipmentDeck.draw();
          player.role.incrementQuarterlyEquipmentDrawCount();

          // TODO: decrement engineer's available time based on the equipment draw penalty

          if (player.role.equipment.length === 3) {
            const discardRes = this.evtHandler({
              kind: 'ENGINEER_DISCARD_EQUIPMENT',
              playerNumber: player.number,
              equipment: [...player.role.equipment, newEquipment].map((equipment) => ({
                id: equipment.id,
              })),
            });

            if (discardRes.kind === 'ENGINEER_DISCARD_EQUIPMENT') {
              if (newEquipment.id !== discardRes.equipmentId) {
                player.role.setEquipment(player.role.equipment.map((equipment) => {
                  if (discardRes.equipmentId === equipment.id) {
                    this.equipmentDeck.discardInto(equipment);
                    return newEquipment;
                  }
                  return equipment;
                }));
              } else {
                this.equipmentDeck.discardInto(newEquipment);
              }
            }
          }
        }
      }
    });

    this.evtHandler({ kind: 'OPERATORS_ROLL_COST_OF_GOODS' });

    const costOfGoodsRoll = rollDie();
    this.costOfGoods.set(costOfGoodsRoll);

    this.evtHandler({ kind: 'OPERATORS_SET_MAINTENANCE_DUE' });

    let engineerStillHaveRequestsAndTime = true;

    while (engineerStillHaveRequestsAndTime) {
      engineerStillHaveRequestsAndTime = false;

      for (let i = 0; i < this.players.length; i += 1) {
        const player = this.players[i];

        if (
          player.role instanceof Engineer
          && player.role.time.current > 0
          && !player.role.isDoneWithMonthlyRequests
        ) {
          // TODO: get the list of available actions based on engineer's available time
          const availableActions: { something: number }[] = [];

          if (availableActions.length > 0) {
            const engineerRequestRes = this.evtHandler({ kind: 'ENGINEER_REQUEST', availableActions });

            if (engineerRequestRes.kind === 'ENGINEER_DONE_WITH_REQUESTS') {
              player.role.setIsDoneWithMonthlyRequests();
            } else if (engineerRequestRes.kind === 'ENGINEER_REQUEST') {
              for (let j = 0; j < engineerRequestRes.actions.length; j += 1) {
                const action = engineerRequestRes.actions[j];

                const managerApprovalRes = this.evtHandler({ kind: 'REQUEST_MANAGER_APPROVAL', action });

                if (managerApprovalRes.kind === 'MANAGER_APPROVED') {
                  // TODO: execute approved action

                  if (player.role.time.current > 0) {
                    engineerStillHaveRequestsAndTime = true;
                  }
                } else if (managerApprovalRes.kind === 'MANAGER_DENIED') {
                  if (managerApprovalRes.withPrejudice) {
                    player.role.setIsDoneWithMonthlyRequests();
                  }
                }
              }
            }
          } else {
            player.role.setIsDoneWithMonthlyRequests();
          }
        }
      }
    }

    const strikeIntentResult = this.evtHandler({ kind: 'CHECK_FOR_STRIKE_INTENT' });

    if (strikeIntentResult.kind === 'INTENDS_TO_STRIKE') {
      const playerNumberSet = new Set(strikeIntentResult.playerNumbers);

      let strikingOperatorsCount = 0;

      for (let i = 0; i < this.players.length; i += 1) {
        const player = this.players[i];

        if (playerNumberSet.has(player.number) && player.role instanceof Operator) {
          player.role.voteToStrike();
          strikingOperatorsCount += 1;
        }
      }

      if (strikingOperatorsCount > Math.floor(this.operators.length / 2)) {
        this.evtHandler({ kind: 'STRIKE' });
      }
    }

    this.process.equipment.forEach((equipment) => {
      if (equipment.needsMaintenance) {
        this.evtHandler({ kind: 'ROLL_FOR_DELAYED_MAINTENANCE_BREAKAGE', equipmentId: equipment.id });

        const roll = rollDie();

        if (roll > equipment.maintenanceBreakageThreshold) {
          this.evtHandler({ kind: 'EQUIPMENT_BREAKS', equipmentId: equipment.id, dueToLackOfMaintenance: true });
          const injuryCount = equipment.break('maintenance');

          this.randomlyInjureOperators(injuryCount);
        }
      }
    });

    let canDrawMishap = true;
    let mishapOptional = false;

    switch (this.operators.length) {
      case 2:
      case 3: {
        canDrawMishap = this.mishapDrawnCount < 1;
        mishapOptional = !(this.mishapDrawnCount === 0 && this.currentMonth === 3);
        break;
      }
      case 4:
      case 5: {
        canDrawMishap = this.mishapDrawnCount < 2;
        mishapOptional = !((this.mishapDrawnCount === 0 && this.currentMonth === 2)
            || (this.mishapDrawnCount === 1 && this.currentMonth === 3));
        break;
      }
      default:
        break;
    }

    if (canDrawMishap) {
      const drawMishapRes = this.evtHandler({ kind: 'OPERATORS_DRAW_MISHAP', optional: mishapOptional });

      if (drawMishapRes.kind === 'OPERATORS_DRAW_MISHAP' && drawMishapRes.accepted) {
        this.mishapDrawnCount += 1;

        const mishap = this.mishapDeck.draw();

        if (this.process.refinement < mishap.processRefinementThreshold) {
          this.randomlyInjureOperators(mishap.injuryCount);

          // TODO: figure out how you want to also break the machines

          this.mishapDeck.discardInto(mishap);
        }
      }
    }

    // TODO: calculate the cost of production for the month and the units produced
    // TODO: based on equipment still in play, process refinement level, uninjured operators
    // TODO: and whether or not there was a strike

    // TODO: manager rolls demand die and decides how much inventory to release

    this.players.forEach((player) => {
      if (player.role instanceof Engineer) {
        player.role.resetIsDoneWithMonthlyRequests();
      } else if (player.role instanceof Operator) {
        player.role.resetStrikeIntent();
      }
    });
  }

  randomlyInjureOperators(count: number) {
    const injuredOperatorResult = this.evtHandler({ kind: 'RANDOMLY_SELECT_INJURED_OPERATORS', count });

    if (injuredOperatorResult.kind === 'RANDOMLY_SELECT_INJURED_OPERATORS') {
      const playerNumbersSet = new Set(injuredOperatorResult.playerNumbers);

      this.players.forEach((player) => {
        if (playerNumbersSet.has(player.number) && player.role instanceof Operator) {
          player.role.injuries.increment(1);
          this.evtHandler({ kind: 'INJURE_OPERATOR', playerNumber: player.number });
        }
      });
    }
  }
}

// MECHANICS

// ?? there are only equipment and mishap decks

// ** Time should probably be something that is fixed in units
// ** at the beginning of each turn. Operators should have their
// ** time be affected by their injury trackers (decreasing for
// ** each injury)

// ?? should time be allocated to equipment only (leaving time over
// ?? at the end of each turn)? or should it instead just be that
// ?? the equipment is a multiplier for the time that is available?

class Deck<T> {
  cards: T[];

  discard: T[];

  constructor(cards: T[]) {
    this.cards = cards;
    this.discard = [];
  }

  draw() {
    let card = this.cards.pop();
    if (card) return card;

    this.shuffle();

    card = this.cards.pop();
    return card as T;
  }

  discardInto(card: T) {
    this.discard.push(card);
  }

  shuffle() {
    const merged = this.cards.concat(this.discard);

    for (let i = merged.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));

      const firstClone = merged[i];

      merged[i] = merged[j];
      merged[j] = firstClone;
    }

    this.cards = merged;
    this.discard = [];
  }
}

// FACTORS

class Factor {
  #value: number;

  constructor() {
    this.#value = 0;
  }

  set(val: number) {
    this.#value = val;
  }

  get() {
    return this.#value;
  }
}

// player informed

class Income extends Factor {}

class Wealth extends Factor {
  max: number;

  constructor(initial: number, max: number) {
    super();

    this.set(initial);
    this.max = max;
  }
}

class Inventory extends Factor {}

// external

class CostOfGoods extends Factor {}

class Demand extends Factor {}

// TRACKERS

class Tracker {
  overall: number;

  intermediate: number;

  constructor() {
    this.overall = 0;
    this.intermediate = 0;
  }

  increment(val: number) {
    this.intermediate += val;
  }

  consolidate() {
    this.overall += this.intermediate;
    this.intermediate = 0;
  }
}

class Injuries extends Tracker {
  // operator's incentive

  // for each injury their expenses
  // get higher in retirement

  // if they get 3 injuries they
  // have to retire early and can't work
  // anymore.
}

class Level extends Tracker {
  // engineer's individual incentive
  // to increase income. goes up based
  // on installs (maybe other measures)
}

// ?? keeps track of where the last year ended.
// ?? if current year ends up below that, then
// ?? it counts as year with a loss.
class Cash extends Tracker {
  // manager's incentive

  // manager has separate tracker for each profitable
  // or not-profitable year. if it's profitable, the
  // manager gets a black or red token on that year slot.

  // each red token hurts the manager's likelihood of "success"
  // at the end of the game.
}

class Units extends Tracker {
  // need to figure out how units factor into the game.
  // could be the incentive for everyone overall?

  // needs to be like "total units / years played" and
  // keep it above a certain number.

  // units could determine whether the business is successful
  // or the factory is successful kinda thing.

  // units determine whether the overall operation is successful.

  // if the average annual units for the factory are below a certain
  // threshold, the factory closes, which affects everyone's retirement
  // disproportionately the workers. it decreases their final dice roll
  // by a certain amount (2-3 for operators, 1-2 for engineers, and 0-1 managers)

  // the factory closing indicates that they weren't able to continue
  // working for the factory into the future, or that they don't get
  // a pension or something.
}

// TIME

class Time {
  base: number;

  current: number;

  constructor(base: number) {
    this.base = base;
    this.current = base;
  }

  use(amount: number) {
    if (this.current >= amount) {
      this.current -= amount;
    } else {
      throw new Error('not enough time');
    }
  }

  reset() {
    this.current = this.base;
  }
}

// PROCESS

class Process {
  refinement: 1 | 2 | 3 | 4 | 5;

  equipment: Equipment[];

  constructor() {
    this.refinement = 1;
    this.equipment = [];
  }

  // refining the process depends on the combined refinement
  // cost of all equipment in play
  refine(timeObj: {
    engineer: Time,
    operator: Time[],
  }) {
    this.equipment.forEach((equipment) => {
      // TODO: determine how the "multi-engineer"
      // TODO: scenario should affect time consumption
      // TODO: for all the engineers or if it should
      // TODO: only affect the requesting engineer?
      // TODO: might also just be better to increase the
      // TODO: number of pieces of equipment that are in-play
      // TODO: for each new engineer?
      // TODO: maybe both, but then find a way to fractionalize
      // TODO: the repair cost such that if it takes 7 for one engineer
      // TODO: it should take 2 engineers each 6 totalling 12,
      // TODO: 3 engineers each do 5 totaling 15
      // TODO: (thus demonstrating the team/group penalty for
      // TODO: overall output)
      timeObj.engineer.use(equipment.timeToRefine.engineer);

      timeObj.operator.forEach((opTime) => {
        opTime.use(equipment.timeToRefine.operator);
      });
    });

    this.refinement += 1;
  }

  // starts with default equipment at 3 refinement
  // when swapping equipment there is a refinement penalty
  swapEquipment() {
    this.refinement -= 1;
  }
}

// CARDS

class Equipment {
  id: number;

  // ?? equipment from different brands (colors) has a higher integration
  // ?? cost, but should offer higher throughput if you can integrate
  // ?? them all together. so basically you can explain the "some times
  // ?? not all parts work ideally together, but there is a cost trade-off
  // ?? for having the 'best' of every given piece of the infrastructure"
  color: 'red' | 'blue' | 'green';

  cost: number;

  timeToInstall: number;

  timeToService: number;

  timeToRefine: {
    engineer: number,
    operator: number,
  };

  maintenanceInterval: 'monthly' | 'quarterly' | 'annually';

  needsMaintenance: boolean;

  isBroken: boolean;

  // !! may want to have a separate threshold for repair and for injury
  maintenanceBreakageThreshold: number;

  maintenanceBreakageInjurySideEffect: number;

  breakageReason: null | 'maintenance' | 'mishap';

  constructor(
    color: 'red' | 'blue' | 'green',
    cost: number,
    timeToInstall: number,
    timeToService: number,
    timeToRefine: {
        engineer: number,
        operator: number,
    },
    maintenanceInterval: 'monthly' | 'quarterly' | 'annually',
    maintenanceBreakageThreshold: number,
    maintenanceBreakageInjurySideEffect: number,
  ) {
    this.id = Math.random(); // TODO: make a UUID

    this.color = color;

    this.cost = cost;

    this.timeToInstall = timeToInstall;
    this.timeToService = timeToService;
    this.timeToRefine = timeToRefine;

    this.maintenanceInterval = maintenanceInterval;

    this.needsMaintenance = false;
    this.isBroken = false;

    this.maintenanceBreakageThreshold = maintenanceBreakageThreshold;
    this.maintenanceBreakageInjurySideEffect = maintenanceBreakageInjurySideEffect;

    this.breakageReason = null;
  }

  break(reason: 'maintenance' | 'mishap') {
    this.isBroken = true;

    if (this.breakageReason === null) {
      this.breakageReason = reason;
    }

    return this.maintenanceBreakageInjurySideEffect;
  }

  install(time: Time) {
    time.use(this.timeToInstall);
  }

  doMaintenance(time: Time) {
    time.use(this.timeToService);
    this.needsMaintenance = false;
  }

  repair(time: Time) {
    if (this.breakageReason === 'maintenance') {
      time.use(this.timeToService * 2);
    } else if (this.breakageReason === 'mishap') {
      time.use(this.timeToService);
    }

    this.isBroken = false;
    this.breakageReason = null;
  }
}

class Mishap {
  // !! this might be better if it was variable, where
  // !! the number of injuries (operators injured) and
  // !! equipment pieces broken, was progressively increased
  // !! on a single card, instead of just "this card has an affect
  // !! or not"
  // !!
  // !! i.e for process at 3, 2 operators are injured and 1 equipment is broken,
  // !! for process at 4, 1 operator is injured and no equipment is broken,
  // !! for process at 1 everyone dies, etc.
  processRefinementThreshold: number;

  injuryCount: number;

  equipmentCriteria: number;

  constructor(
    processRefinementThreshold: number,
    injuryCount: number,
    equipmentCriteria: number,
  ) {
    this.processRefinementThreshold = processRefinementThreshold;
    this.injuryCount = injuryCount;
    this.equipmentCriteria = equipmentCriteria;
  }
}

// ROLES

class Role {
  income: Income;

  wealth: Wealth;

  constructor(income: Income, wealth: Wealth) {
    this.income = income;
    this.wealth = wealth;
  }
}

class Req {
  action: () => void;

  constructor(action: () => void) {
    this.action = action;
  }

  approve() {
    this.action();
  }
}

class Manager extends Role {
  years: [null | boolean, null | boolean, null | boolean];

  engineerIncome: Income;

  operatorIncome: Income;

  constructor(managerIncome: Income, engineerIncome: Income, operatorIncome: Income) {
    super(managerIncome, new Wealth(INITIAL_MANAGER_WEALTH, MAX_MANAGER_WEALTH));

    this.years = [null, null, null];

    this.engineerIncome = engineerIncome;
    this.operatorIncome = operatorIncome;
  }

  get profitableYearsCount() {
    return this.years.reduce((acc, year) => {
      if (year) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }

  setManagerIncome(value: number) {
    this.income.set(value);
  }

  setEngineerIncome(value: number) {
    this.engineerIncome.set(value);
  }

  setOperatorIncome(value: number) {
    this.operatorIncome.set(value);
  }

  static approve(req: Req) {
    req.approve();
  }
}

class Engineer extends Role {
  time: Time;

  level: Level;

  equipment: Equipment[];

  quarterlyEquipmentDrawnCount: number;

  isDoneWithMonthlyRequests: boolean;

  constructor(income: Income) {
    super(income, new Wealth(INITIAL_ENGINEER_WEALTH, MAX_ENGINEER_WEALTH));

    this.time = new Time(40);

    this.level = new Level();

    this.equipment = [];

    this.quarterlyEquipmentDrawnCount = 0;

    this.isDoneWithMonthlyRequests = false;
  }

  setEquipment(equipment: Equipment[]) {
    this.equipment = equipment;
  }

  incrementQuarterlyEquipmentDrawCount() {
    this.quarterlyEquipmentDrawnCount += 1;
  }

  resetQuarterlyEquipmentDrawCount() {
    this.quarterlyEquipmentDrawnCount = 0;
  }

  setIsDoneWithMonthlyRequests() {
    this.isDoneWithMonthlyRequests = true;
  }

  resetIsDoneWithMonthlyRequests() {
    this.isDoneWithMonthlyRequests = false;
  }

  requestRefinement(process: Process, operatorTime: Time[]): Req {
    return new Req(() => {
      this.refineProcess(process, operatorTime);
    });
  }

  refineProcess(process: Process, operatorTime: Time[]) {
    process.refine({ engineer: this.time, operator: operatorTime });
  }

  requestEquipment(equipment: Equipment) {
    return new Req(() => {
      this.installEquipment(equipment);
    });
  }

  installEquipment(equipment: Equipment) {
    this.time.use(equipment.timeToInstall);
  }

  repairEquipment(equipment: Equipment) {
    this.time.use(equipment.timeToService);
  }
}

class Operator extends Role {
  time: Time;

  injuries: Injuries;

  intendsToStrike: boolean;

  constructor(income: Income) {
    super(income, new Wealth(INITIAL_OPERATOR_WEALTH, MAX_OPERATOR_WEALTH));

    this.time = new Time(40);

    this.injuries = new Injuries();

    this.intendsToStrike = false;
  }

  voteToStrike() {
    this.intendsToStrike = true;
  }

  resetStrikeIntent() {
    this.intendsToStrike = false;
  }
}
