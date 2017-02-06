//This module contains the games core logic.
//It is built as a set of methods for a game object.
//It is seperated into two main modules. The first, canvasDrawer,
// adds a set of methods with which to manipulate the HTML5 Canvas, as well as the UI.

//The second, game, encapsulates the core game logic that enables this simulation.

function ominousWarning() {
    alert('And so it begins...');
}

//may want to take a look at fabric.js
const canvasDrawer = (function() {
    const canvasObj = {};

    canvasObj.displayPopulation = function() {
        var canvas = document.getElementById("canv");
        var context = canvas.getContext("2d");

        return game.activeAgents.forEach(agent => {
            context.fillStyle = agent.color;
            context.fillRect(agent.location[0], agent.location[1], 4, 4);
        });
    }

    canvasObj.clearCanvas = function() {
        var canvas = document.getElementById("canv");
        var context = canvas.getContext("2d");

        return context.clearRect(0, 0, canvas.width, canvas.height);
    }

    canvasObj.writeMessage = function(message) {
        var canvas = document.getElementById("canv");
        var context = canvas.getContext("2d");

        context.font = "150px Nosifer"
        context.fillStyle = "red"
        return context.fillText(message, (300), (canvas.height / 2));
    }

    //can use this to make explosions and shit
    canvasObj.emergentEffects = function(effectType) {

    }

    return canvasObj;
}());

//this contains the functions and objects required to generate the data for agents
//seperate module will define the canvas
const game = (function() {
    const gameObj = {};

    //initialize key module scope variables
    gameObj.generation = 0;
    gameObj.activeAgents = [];
    gameObj.occupiedLocations = [];

    gameObj.startGame = function(duration, numHum, propZomb, x, y) {
        console.log('The game has started')
        gameObj.gameLength = parseInt(duration);

        //specifies the real world timing of a turn
        window.setInterval(gameObj.turn, 1000)
        return gameObj.generateAgents(numHum, propZomb, x, y);
    }

    gameObj.generateAgents = function(numHum, propZomb, x, y) {
        for (let i = 0; i < numHum; i++) {
            const human = new Agents('Human', 3, gameObj.traitSelector(), 'Blue', initialLocation(x, y), getRandomInt(10, gameObj.gameLength), true);
            gameObj.activeAgents.push(human);
        }
        for (let j = 0; j < (numHum * propZomb); j++) {
            const zombie = new Agents('Zombie', 2, gameObj.traitSelector(), 'Red', initialLocation(x, y), getRandomInt(2, gameObj.gameLength), true);
            gameObj.activeAgents.push(zombie);
        }
    }

    Agents = function(type, speed, trait, color, location, energyLevel, needsToAct) {
        this.type = type;
        this.speed = speed;
        this.trait = trait;
        this.color = color;
        this.location = location;
        this.energyLevel = energyLevel;
        this.needsToAct = needsToAct;

        //not sure if it is necessary to provide additional agent properties.
        //this.action = gameObj.action;
        //this.neighbors = occupiedLocations;
    }

    gameObj.traitSelector = function() {
        const traitNum = getRandomInt(0, 3);
        var trait;

        if (traitNum === 0) {
            trait = 'Measured'
        }
        if (traitNum === 1) {
            trait = 'Sedentary'
        }
        if (traitNum === 2) {
            trait = 'Agressive'
        }

        return trait;
    }

    const initialLocation = function(x, y) {
        let position = [];

        position.push(getRandomInt(1, parseInt(x)));
        position.push(getRandomInt(1, parseInt(y)));

        return position;
    }

    //this may turn into a computational explosion in memory usage

    const determineAction = function(agent) {
        let potentialNeighbors = gameObj.occupiedLocations;

        potentialNeighbors.forEach((location, index) => {
            //occupiedLocations is structured as [[x,y],agent.type]
            if (agent.location[0] + 1 === location[0][0] && agent.location[1] + 1 === location[0][1] && location[1] === 'Zombie') {
                //The human discovered it has a zombie for a neighbor...
                //they now get the opportunity to fight or run away. If they fail, they are now another zombie!!!
                //success or failure is based upon a simple coin flip function

                //can reference neighbor by using gameObj.activeAgents[index]
                if (agent.trait === 'Agressive') {
                    agent.needsToAct = false;
                    return fight(agent, gameObj.activeAgents[index], index);
                } else if (agent.trait === 'Sedentary') {
                    if (coinFlip()) {
                        agent.needsToAct = false;
                        console.log('NEIGHBORS!?')
                        return run(agent);
                    }
                }
                agent.needsToAct = false;
                return run(agent);
            }
            //this approach results in an excessive cascade of coin flips
            /*
            else if(coinFlip()){
            	return move(agent);
            }*/
        })
        if (agent.needsToAct === true) {
            if (coinFlip()) {
                return move(agent);
            }
        }
    }

    //uses a coin flip to simulate success or failure with running away
    const run = function(agent) {
        if (coinFlip()) {
            console.log('run: this is working!')
            return move(agent)
        }
        agent.type = 'Zombie';
        agent.color = 'Orange';
        console.log('run: this is working! -oj?')
        return agent;
    }


    const fight = function(agent, zombie, index) {
        //canvasDrawer.emergentEffects(explosion);
        if (coinFlip()) {
            console.log('Fight: this is working')
            return gameObj.activeAgents.splice(index, 1);
        }
        agent.type = 'Zombie'
        agent.color = 'Orange'
        //agent.energyLevel = 50;
        console.log('Fight: this is working')
        return agent;
    }

    const move = function(agent) {
        //originally had (-1,agent.speed)
        //ths causes problems with only positive movements occuring
        let stepX = getRandomInt((-1 * agent.speed), agent.speed);
        let stepY = getRandomInt((-1 * agent.speed), agent.speed);

        agent.location[0] += stepX;
        agent.location[1] += stepY;

        return agent.location;
    }

    /*

  function build(){
  	let buildPoints = 0;

  }
	*/

    const checkEnergyLevel = function(agent, index) {
        if (agent.energyLevel === 0) {
            return gameObj.activeAgents.splice(index, 1)
        }
    }

    gameObj.turn = function() {
        //identifyLocations();
        if (gameObj.generation === gameObj.gameLength) {
            return gameObj.endGame();
        } else {
            let actionsTaken = 0;
            let actionsToTake = gameObj.activeAgents.length - 1;

            gameObj.activeAgents.forEach((agent, index) => {
                //may be a good idea to also check occupied locations at this point
                gameObj.occupiedLocations.push([agent.location, agent.type]);
                agent.energyLevel--;

                checkEnergyLevel(agent, index);

                if (agent.type === 'Zombie') {
                    move(agent)
                } else if (agent.type === 'Human') {
                    determineAction(agent);
                }
                actionsTaken++;
                return agent;
            });
            gameObj.generation += 1;

            canvasDrawer.clearCanvas();
            canvasDrawer.displayPopulation();

            //need to reset the array each turn so it doesnt overwhelm the cpu
            //the location of this expression at the end of turn() prevents the action calculations from taking place.
            if (actionsTaken === actionsToTake) {
                gameObj.occupiedLocations.length = 0;
            }
        }
    }

    gameObj.endGame = function() {
        gameObj.activeAgents.length = 0;
        //canvasDrawer.clearCanvas;
        canvasDrawer.writeMessage('GAME OVER');
        console.log('GAME OVER');
        return gameObj.generation = 0;
    }

    const getRandomInt = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //Randomly generates true or false values for use in other functions
    const coinFlip = function() {
        console.log('coinFlip(): working')
        return (Math.floor(Math.random() * 2) == 0);
    }

    return gameObj;
}());




//third module that can print out information that may be of interest to players
const summaryInformation = (function() {
    const summaryData = {};

    summaryData.begNumHum = 0;
    summaryData.begNumZomb = 0;

    summaryData.numConverted = 0;

    summaryData.percentConverted = function() {
        return numConverted / begNumHum;
    }

    //number of Humans
    //number of Zombies

    //change in number

}());



function assert(expectedBehavior, descriptionOfCorrectBehavior) {
    if (!expectedBehavior) {
        console.log(descriptionOfCorrectBehavior);
    } else {
        console.log('test passed');
    }
}

console.log('game loaded')
