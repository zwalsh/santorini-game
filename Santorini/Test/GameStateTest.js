const GameState = require('./../Common/GameState.js');
const Board = require('./../Common/Board.js');
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;

describe("GameState unit tests", function() {

    let gs;
    let player1Id;
    let player2Id;
    beforeEach(function() {
        player1Id = 0;
        player2Id = 1;
        gs = new GameState(new Board());
    });

    describe("GameState's board", function() {
        it("can be mutated, and those changes persist across accesses", function() {
            let board = gs.getBoard();
            let worker = board.addWorker(0,1);
            expect(gs.getBoard().getWorker(worker)).toEqual([0,1]);
        });
    });

    describe("Changing turns", function() {
        it("changes from player 1's turn to player 2's turn and back", function () {
            expect(gs.getWhoseTurn()).toBe(player1Id);
            gs.flipTurn();
            expect(gs.getWhoseTurn()).toBe(player2Id);
            gs.flipTurn();
            expect(gs.getWhoseTurn()).toBe(player1Id);
        });
        it("proceeds correctly when GameState is constructed with a different initial turn", function () {
            gs = new GameState(gs.getBoard(), player2Id);
            expect(gs.getWhoseTurn()).toBe(player2Id);
            gs.flipTurn();
            expect(gs.getWhoseTurn()).toBe(player1Id);
        });
    });

    describe("Last action", function() {
        it("Update makes a copy of the action before setting it internally", function() {
            // Mutating an Action after passing it to setLastAction 
            // does not change the Action that the GameState has
            let action = new PlaceAction([0,0]);
            gs.setLastAction(action);
            action.loc = [5,5];
            expect(gs.getLastAction().loc).not.toEqual(action.loc);
        });
    });

    describe("Adding worker ownership", function() {
        it("gets stored properly and can be accessed via WorkerId", function() {
            let workerId0 = 0;
            let workerId1 = 1;
            let workerId2 = 2;
            gs.addOwnership(workerId0, player1Id);
            gs.addOwnership(workerId1, player2Id);
            gs.addOwnership(workerId2, player2Id);
            expect(gs.getOwner(workerId0)).toBe(player1Id);
            expect(gs.getOwner(workerId1)).toBe(player2Id);
            expect(gs.getOwner(workerId2)).toBe(player2Id);
        });
    });

    describe("Copying GameState", function() {
        it("copies the GameState's board", function() {
            let worker0Id = gs.getBoard().addWorker(4,4);
            gs.getBoard().buildFloor(worker0Id, 4, 5);
            let gsCopy = gs.copy();
            expect(gs.getBoard().getHeight(4,5)).toBe(1);
            expect(gsCopy.getBoard().getHeight(4,5)).toBe(1);

            gsCopy.getBoard().buildFloor(worker0Id, 4, 5);
            expect(gs.getBoard().getHeight(4,5)).toBe(1);
            expect(gsCopy.getBoard().getHeight(4,5)).toBe(2);
        });
        it("changing the turn on the copy don't affect the original", function() {
            let gsCopy = gs.copy();
            expect(gs.getWhoseTurn()).toBe(player1Id);
            expect(gsCopy.getWhoseTurn()).toBe(player1Id);
            gsCopy.flipTurn();
            expect(gs.getWhoseTurn()).toBe(player1Id);
            expect(gsCopy.getWhoseTurn()).toBe(player2Id);
        });
        it("copies the GameState's Action when lastAction is not null", function() {
            let action = new PlaceAction([3,4]);
            gs.setLastAction(action);
            let gsCopy = gs.copy();
            let gsCopyLastAction = gsCopy.getLastAction();
            expect(gsCopyLastAction.getType()).toBe("place");
            expect(gsCopyLastAction.getLoc()).toEqual([3,4]);
        });
        it("sets the copy's lastAction to null when lastAction is null", function() {
            let gsCopy = gs.copy();
            expect(gsCopy.getLastAction()).toBeNull();
        });
        it("updating the copy's worker ownership doesn't affect original", function() {
            let gsCopy = gs.copy();
            let workerId0 = 0;
            gs.addOwnership(workerId0, player1Id);
            gsCopy.addOwnership(workerId0, player2Id);
            expect(gs.getOwner(workerId0)).toBe(player1Id);
            expect(gsCopy.getOwner(workerId0)).toBe(player2Id);
        });
    });
});