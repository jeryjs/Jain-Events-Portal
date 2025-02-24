import Participant from '../Participant';

class CricketPlayer extends Participant {
  role: string;
  runs: number;
  wickets: number;

  constructor(id: number, name: string, age: number, runs: number, wickets: number) {
    super(id, name, age);
    this.role = "CricketPlayer";
    this.runs = runs;
    this.wickets = wickets;
  }
}

class FootballPlayer extends Participant {
  role: string;
  position: string;
  goals: number;
  assists: number;

  constructor(id: number, name: string, age: number, position: string, goals: number, assists: number) {
    super(id, name, age);
    this.role = "FootballPlayer";
    this.position = position;
    this.goals = goals;
    this.assists = assists;
  }
}

class BasketballPlayer extends Participant {
  role: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;

  constructor(id: number, name: string, age: number, points: number, rebounds: number, assists: number, steals: number, blocks: number) {
    super(id, name, age);
    this.role = "BasketballPlayer";
    this.points = points;
    this.rebounds = rebounds;
    this.assists = assists;
    this.steals = steals;
    this.blocks = blocks;
  }
}

export { CricketPlayer, FootballPlayer, BasketballPlayer };