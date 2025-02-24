import Participant from '@common/models/Participant';

class CricketPlayer extends Participant {
  constructor(id, name, age, runs, wickets) {
    super(id, name, age);
    this.role = "CricketPlayer";
    this.runs = runs;
    this.wickets = wickets;
  }
}

class FootballPlayer extends Participant {
  constructor(id, name, age, position, goals, assists) {
    super(id, name, age);
    this.role = "FootballPlayer";
    this.position = position;
    this.goals = goals;
    this.assists = assists;
  }
}

class BasketballPlayer extends Participant {
  constructor(id, name, age, points, rebounds, assists, steals, blocks) {
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