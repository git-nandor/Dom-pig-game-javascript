/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game
- A player looses his entire score when he rolls two 6 in a row and after that his turn will end.
- Add input field where players can set the winning score (.value property)
- Add another dice to the game, loose recent scor if one of them 1, 
*/

//Enable reduced and safer feature set of JavaScript
"use strict";

//Reusable global variables
var scoreLimit, customPromptForPlayername, customAlertForPlayerName, customPromptForWinnerScoreLimit, customAlertForSetGameWinnerScore, customWinnerMessage, customAlertForHoldScore;
var players = [];
var activePlayer = 0;
var scoreLimitField = document.getElementById('winner_score_limit');
var dices = [];
var imageOfDice1 = document.getElementById('dice_1');
var imageOfDice2 = document.getElementById('dice_2');

//Init player object constructor
function Player(id, name) {
    this.id = id;
    this.name = name;
    this.nameField = document.getElementById('name_' + id);
    this.scoreField = document.getElementById('score_' + id);
    this.recentScoreField = document.getElementById('recent_' + id);
    this.score = 0;
    this.recentScore = 0;  
};

//Init custom dialog object constructor
function CustomDialog(dialogIdentifier) {
    
    //Get Html elements
    this.dialogOverlay = document.getElementById('dialog_overlay');
    this.dialogBox = document.getElementById('dialog_box');
    
    //Create message, alert, or prompt based on the given params and with custom style. Custom triggered function by the ok button. 
    this.render = function (typeOfDialog, ContentOfDialogHeader, ContentOfDialogBody, triggeredFunctionByOk, parameterForTriggeredFunction) {       
        this.parameterForTriggeredFunction = parameterForTriggeredFunction;
        this.inputFieldValue = "";
        this.winWidth = window.innerWidth;
        this.winHeight = window.innerHeight;
             
        //Positioning and styleing dialog box
        this.dialogBoxWidth = 550;
        this.dialogOverlay.style.display = "block";
        this.dialogOverlay.style.height = this.winHeight + "px";
        this.dialogBox.style.left = (this.winWidth / 2) - (this.dialogBoxWidth / 2) + "px";
        this.dialogBox.style.top = "100px";
        this.dialogBox.style.display = "block";
        
        //Set Header content, and get Body and Footer
        document.getElementById('dialog_box_header').innerHTML = ContentOfDialogHeader;
        var dialogBoxBody = document.getElementById('dialog_box_body');
        var dialogBoxFooter = document.getElementById('dialog_box_footer');

        /****************************
        *Create dialog types and rules, setting the body content and the footer buttons with the custom functionality
        *Useing dialog identifier when create the object to create custom ok and cancel functions for the dialog object
        */
        switch(typeOfDialog) {
            case 'alert': 
                clearDialogBoxBody();
                dialogBoxBody.classList.remove('default');
                dialogBoxBody.classList.add('alert');
                dialogBoxBody.innerHTML = '<p>' + ContentOfDialogBody + '</p>'; 
                dialogBoxFooter.innerHTML = '<button class = "dialog-button, dialog-ok" onclick = "' + dialogIdentifier + '.ok(\'' + triggeredFunctionByOk + '\')"> OK </button>';
            break;  
            case 'prompt': 
                var input = document.createElement("input"); 
                input.type = "text";
                input.setAttribute("id", "input_field");
                clearDialogBoxBody();
                dialogBoxBody.classList.remove('alert');
                dialogBoxBody.classList.add('default');
                dialogBoxBody.appendChild(input);       
        
                dialogBoxFooter.innerHTML = '<button class = "dialog-button, dialog-ok" onclick = "' + dialogIdentifier + '.ok(\'' + triggeredFunctionByOk + '\')"> OK </button> <button class="dialog-button, dialog-cancel" onclick="' + dialogIdentifier + '.cancel()"> CANCEL </button>';
            break;
            case 'message':
                clearDialogBoxBody();
                dialogBoxBody.classList.remove('alert');
                dialogBoxBody.classList.add('default');
                dialogBoxBody.innerHTML = '<p>' + ContentOfDialogBody + '</p>';  
                dialogBoxFooter.innerHTML = '<button class = "dialog-button, dialog-ok" onclick = "' + dialogIdentifier + '.ok(\'' + triggeredFunctionByOk + '\')"> OK </button>';
            break;    
        }; 
    };
    
    //Build the ok button functionality and style change
    this.ok = function(triggeredFunctionByOk) {
        this.dialogOverlay.style.display = "none";
        this.dialogBox.style.display = "none";

        //If no parameter given but input field is available set the parameter
        if(this.parameterForTriggeredFunction == null && document.getElementById('input_field')){
           this.parameterForTriggeredFunction = document.getElementById('input_field').value;
        };
        
        //Going out from the object and find the triggered function in global scope and call it
        window[triggeredFunctionByOk](this.parameterForTriggeredFunction);
    };
    
    this.cancel = function() {
        this.dialogOverlay.style.display = "none";
        this.dialogBox.style.display = "none";
    };
};

function initGame() {
    clearGameSession();
    createPromptForPlayerName(1);
};

function startGame() {
    for (var i = 0; i < 2; i++) {
        players[i].nameField.innerHTML = players[i].name;
        players[i].scoreField.innerHTML = 0;
        players[i].recentScoreField.innerHTML = 0;
    };
    scoreLimitField.innerHTML = 'Reach ' + scoreLimit + ' score to win!'; 
    activePlayer = 0;
};

function createPromptForPlayerName(playerIdentifier) {
    customPromptForPlayername = new CustomDialog('customPromptForPlayername');
    customPromptForPlayername.render('prompt', 'Player ' + playerIdentifier + ' Name:', '', 'getPlayersName');
};

//Set player name and sanitize the value before adding to the HTML code
function getPlayersName(inputValue) {
    var sanitizedValue = inputValue.replace(/[#&?\[\].,;<>\/\\}{|"']/ig,"");
    
    if (sanitizedValue != "" && sanitizedValue.length <= 9) {
        players[players.length] = new Player(players.length, sanitizedValue);
        players.length < 2 ? createPromptForPlayerName(players.length + 1) : createPromptForWinnerScoreLimit();
    }else {
        customAlertForPlayerName = new CustomDialog('customAlertForPlayerName');
        customAlertForPlayerName.render('alert', 'ERROR', 'Too long or missing name!', 'createPromptForPlayerName', players.length + 1);
    };
};
        
function createPromptForWinnerScoreLimit() {
    customPromptForWinnerScoreLimit = new CustomDialog('customPromptForWinnerScoreLimit');
    customPromptForWinnerScoreLimit.render('prompt', 'Set game winner score limit:', '', 'setGameWinnerScore');
};

//Set game score limit and sanitize the value before adding to the HTML code
function setGameWinnerScore(inputValue) {
    var sanitizedValue = inputValue.replace(/[#&?\[\].,;<>\/\\}{|"']/ig,"");
    var integerValue = parseInt(sanitizedValue);
    if (sanitizedValue != "" && sanitizedValue.length <= 3 && Number.isInteger(integerValue) && integerValue >= 10) {
        scoreLimit = integerValue;
        startGame();
    }else {
        customAlertForSetGameWinnerScore = new CustomDialog('customAlertForSetGameWinnerScore');
        customAlertForSetGameWinnerScore.render('alert', 'ERROR', 'Give a number betveen 10 and 999!', 'createPromptForWinnerScoreLimit');
    }; 
};

function rollDices() {
    dices[0] = Math.floor(Math.random() * 6) +1;
    dices[1] = Math.floor(Math.random() * 6) +1;
    imageOfDice1.setAttribute("src", "dice-" + dices[0] + ".png");
    imageOfDice2.setAttribute("src", "dice-" + dices[1] + ".png");
    
    //If players ahs been set calculate the score
    (players[0] && players[1]) ? calculateNewScore() : ''; 
};

//Calculate scores and add to the HTML code
function calculateNewScore() {
    if (dices[0] == 1 || dices[1] == 1) {
        players[activePlayer].recentScore = 0;
        players[activePlayer].recentScoreField.innerHTML = 0;
        nextPlayer();
    } else if (dices[0] == 6 && dices[1] == 6) {
        players[activePlayer].recentScore = 0;
        players[activePlayer].recentScoreField.innerHTML = 0;
        players[activePlayer].score = 0;
        players[activePlayer].scoreField.innerHTML = 0;
        nextPlayer();
    } else {
        players[activePlayer].recentScore += dices[0] + dices[1];
        players[activePlayer].recentScoreField.innerHTML = players[activePlayer].recentScore;
    };
};

function holdRecentScrore() {
    if (players[0] && players[1]) { 
        players[activePlayer].score += players[activePlayer].recentScore;
        players[activePlayer].scoreField.innerHTML = players[activePlayer].score;
        players[activePlayer].recentScore = 0;
        players[activePlayer].recentScoreField.innerHTML = 0;
        scoreLimit <= players[activePlayer].score ? winGame() : nextPlayer();
    } else {
        customAlertForHoldScore = new CustomDialog('customAlertForHoldScore');
        customAlertForHoldScore.render('alert', 'ERROR', 'Set players first!', 'initGame');
    };
};

function nextPlayer() {
    activePlayer == 0 ? activePlayer = 1 : activePlayer = 0;
    document.querySelector('.player-0-panel').classList.toggle('active');
    document.querySelector('.player-1-panel').classList.toggle('active');
};

function winGame() {
    customWinnerMessage = new CustomDialog('customWinnerMessage');
    customWinnerMessage.render('message', 'WIN!', 'Congratulations ' + players[activePlayer].name + '!', 'clearGameSession');
};

function clearGameSession() {
    players = [];
    activePlayer = 0;
    document.getElementById('name_0').innerHTML = 'Player1';
    document.getElementById('name_1').innerHTML = 'Player2';
    document.getElementById('score_0').innerHTML = 0;
    document.getElementById('score_1').innerHTML = 0;
    document.querySelector('.player-0-panel').classList.remove('active');
    document.querySelector('.player-1-panel').classList.remove('active');
    document.querySelector('.player-0-panel').classList.add('active');
    imageOfDice1.setAttribute("src", "dice-6.png");
    imageOfDice2.setAttribute("src", "dice-6.png");
};
                            
function clearDialogBoxBody() {
    document.getElementById('dialog_box_body').innerHTML = " ";
};

document.getElementById('button_start').addEventListener('click', initGame);
document.getElementById('button_roll').addEventListener('click', rollDices);
document.getElementById('button_hold').addEventListener('click', holdRecentScrore);