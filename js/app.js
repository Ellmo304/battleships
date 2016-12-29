
var $playerBoard = $('#playerBoard');
var $cpuBoard = $('#cpuBoard');
var $playersTiles = $playerBoard.find('td');
var $cpuTiles = $cpuBoard.find('td');
var $playBtn = $('#playButton');
var $rotateBtn = $('#rotateButton');
var $battleLog = $('#battleLog');
var $cpuBattleLog = $('#cpuBattleLog');

//variables to count hits on ships/check if cpu has sunk your ships/won game
var ACFCRcounter = 0;
var BTSPcounter = 0;
var CR1counter = 0;
var CR2counter = 0;
var DScounter = 0;

//variables to count hits on humans ships/check if human has sunk cpu's ships/won game
var myACFCRcounter = 0;
var myBTSPcounter = 0;
var myCR1counter = 0;
var myCR2counter = 0;
var myDScounter = 0;

var playerShipIsHorizontal = true;
var shipsSelected = 0;
var ship = null;
var $cpuCellChosen = null;
var $hitIndex = false;

//audio files used for hits, misses, wins, losses etc
var splashNoise = new Audio('../audio/splash.wav');
var hitNoise = new Audio('../audio/hit.wav');
var sonarNoise = new Audio('../audio/sonar.wav');
var winNoise = new Audio('../audio/win.wav');
var lossNoise = new Audio('../audio/loss.wav');
var buttonOn = new Audio('../audio/buttonOn.wav');
var buttonOff = new Audio('../audio/buttonOff.wav');
var sunkCPU = new Audio('../audio/sunk1.wav');
var sunkHuman = new Audio('../audio/sunk3.wav');
var shipSunk = new Audio('../audio/shipSunk.wav');


//click listener on rotate button, triggering ishorizontal to be true or false
$rotateBtn.on('click', function() {
  buttonOn.play(); buttonOn.currentTime = 0;
  playerShipIsHorizontal = !playerShipIsHorizontal;
});

//selectshipfunction triggering classes for hovering over squares
function selectShip() {
  shipsSelected++;
  buttonOn.play(); buttonOn.currentTime = 0;
  ship = $(this).attr('id');
  $(this).prop('disabled', true);

  $playerBoard.off('mouseover').on('mouseover', 'td', function() {
    var cellIndex = $playersTiles.index(this);
    for (var i = 0; i < ship.length; i ++) {
      var j = playerShipIsHorizontal ? i : i * 10;
      $playersTiles.eq(cellIndex + j).addClass('hover');
    }
  });

  $playerBoard.off('mouseout').on('mouseout', 'td', function(){
    var cellIndex = $playersTiles.index(this);
    for (var i = 0; i < ship.length; i ++) {
      var j = playerShipIsHorizontal ? i : i * 10;
      $playersTiles.eq(cellIndex + j).removeClass('hover');
    }
  });
  //click listenener on tiles waiting for player to confrim ships placements
  $playerBoard.on('click', 'td', function() {
    if(placeShip($playersTiles.index(this), ship, playerShipIsHorizontal, $playersTiles)) {

      $playerBoard.off('mouseout').off('mouseover'); buttonOff.play(); buttonOff.currentTime = 0;
    }
  });
  //statement to disable buttons once ships placed and change battlelog html
  if (shipsSelected === 5) {
    $playBtn.prop('disabled', false);
    $rotateBtn.prop('disabled', true);
    $battleLog.html('All ships placed, click "Start Game" to commence warfare!');
  }
}
//click listeneners on buttons for 5 diff ships
$('#ACFCR').on('click', selectShip);
$('#BTSP').on('click', selectShip);
$('#CR1').on('click', selectShip);
$('#CR2').on('click', selectShip);
$('#DS').on('click', selectShip);

//function for players ship to be placed correctly and cpus ships to be placed randomly without overlap
function placeShip(index, ship, isHorizontal, $tiles) {
  // var $pos = $tiles.eq(index);
  var $tile;
  var i;
  var j = 0;

  var canPlaceShip = true;

  if((10 - (index % 10) < ship.length && isHorizontal) || (index + (10*(ship.length-1)) > 99 && !isHorizontal)) canPlaceShip = false;

  for (i = 0; i < ship.length; i++) {
    $tile = $tiles.eq(index+j);
    if($tile.hasClass('ship')) canPlaceShip = false;
    j+= isHorizontal ? 1 : 10;
  }

  j = 0;
  if(!canPlaceShip) {
    return false;
  } else {
    for (i = 0; i < ship.length; i++) {
      $tile = $tiles.eq(index+j);
      $tile.addClass('ship');
      $tile.attr('name', ship);
      // console.log($tile.attr('name'));
      j+= isHorizontal ? 1 : 10;
    }
    return true;
  }
}

function placeShipRandomly(ship, $tiles) {
  var randomIndex = Math.floor(Math.random() * $tiles.length);
  var isHorizontal = Math.floor(Math.random()*2) === 1;
  return placeShip(randomIndex, ship, isHorizontal, $tiles);
}

//variables for 5 diff ships
while(!placeShipRandomly('ACFCR', $cpuTiles));
while(!placeShipRandomly('BTSP', $cpuTiles));
while(!placeShipRandomly('CR1', $cpuTiles));
while(!placeShipRandomly('CR2', $cpuTiles));
while(!placeShipRandomly('DS', $cpuTiles));





//function checking for player win conditions
function checkForWin() {
  if (myACFCRcounter === 6 && myBTSPcounter === 5 && myCR1counter === 4 && myCR2counter === 4 && myDScounter === 3) {
    $cpuBoard.off('click');
    winNoise.play();
    $battleLog.text('You\'ve sunk the opposition!!! Player 1 IS VICTORIOUS!!!');
    $cpuBattleLog.text('CPU loses!!!');
  } else {
    setTimeout(cpusChoice, 1750);
  }
}

//function which determines if player makes hit or miss, updating tiles class in response, as well as battlelog, ending by checking for win
function isHit() {
  // console.log($(this).attr('class'));
  switch ($(this).attr('name')) {
    case 'ACFCR' : $battleLog.text('Player 1 hits cpu\'s aircraft carrier!'); (myACFCRcounter ++);
      break;
    case 'BTSP' : $battleLog.text('Player 1 hits cpu\'s battleship!'); myBTSPcounter ++;
      break;
    case 'CR1' : $battleLog.text('Player 1 hits cpu\'s cruiser!'); myCR1counter ++;
      break;
    case 'CR2' : $battleLog.text('Player 1 hits cpu\'s cruiser!'); myCR2counter ++;
      break;
    case 'DS' : $battleLog.text('Player 1 hits cpu\'s destroyer!'); myDScounter ++;
      break;
    default : $battleLog.text('No hits this time');
  }
  if ($(this).hasClass('ship')) {
    hitNoise.play(); hitNoise.currentTime = 0;
    $(this).addClass('hit');$(this).removeClass('ship');
  } else {
    $(this).addClass('miss'); $(this).removeClass('sea');
    splashNoise.play(); splashNoise.currentTime = 0;
  }
  if (myACFCRcounter === 5) {
    $battleLog.text('You sank CPU\'S aircraft carrier!');
    shipSunk.play(); shipSunk.currentTime = 0;
    setTimeout(1000); myACFCRcounter ++;
  } else if (myBTSPcounter === 4) {
    $battleLog.text('You sank CPU\'s battleship!');
    sunkCPU.play(); sunkCPU.currentTime = 0;
    setTimeout(1000); myBTSPcounter ++;
  } else if (myCR1counter === 3) {
    $battleLog.text('You sank CPU\'s cruiser!');
    shipSunk.play(); shipSunk.currentTime = 0;
    setTimeout(1000); myCR1counter ++;
  } else if (myCR2counter === 3) {
    $battleLog.text('You sank CPU\'s cruiser!');
    shipSunk.play(); shipSunk.currentTime = 0;
    setTimeout(1000); myCR2counter ++;
  } else if (myDScounter === 2) {
    $battleLog.text('You sank CPU\'s destroyer!');
    shipSunk.play(); shipSunk.currentTime = 0;
    setTimeout(1000); myDScounter ++;
  }
  checkForWin();
}
//triggers players turn
function playersTurn() {
  $cpuBoard.on('click', 'td', isHit);
  $battleLog.text('Player 1\'s turn to fire!!!');
  console.log($(this));// //click event listener for tiles on enemies board
}


//upon click of start game button, users turn is triggered, click listeneners on human board disabled.
function startGame() {         //function to start game upon start game being clicked, activates listeners on cpu board
  $(this).prop('disabled', true);
  sonarNoise.play();
  $playerBoard.off('click');
  $battleLog.text('Opposition engaged, pick an enemy square to fire!');
  $cpuBattleLog.text('Enemy engaged!');
  playersTurn();
}

//click listener on play button to start game
$('#playButton').on('click', startGame);

////-------------------------------------------------------------------------------------------------------------
//cpus gameplay functions, beginning with check for cpu win conditions


function checkForCpuWin() {
  if (ACFCRcounter === 6 && BTSPcounter === 5 && CR1counter === 4 && CR2counter === 4 && DScounter === 3) {
    lossNoise.play();
    $cpuBoard.off('click');
    $battleLog.text('All your ships have been sunk! You have been defeated!!!');
    $cpuBattleLog.text('CPU IS VICTORIOUS!!!');
  } else {
    setTimeout(playersTurn, 1500);
  }
}

//ishit function for cpu

function cpuFire() {
  if ($cpuCellChosen.hasClass('ship')) {
    $hitIndex = $cpuCellChosen;
  }
  switch ($cpuCellChosen.attr('name')) {
    case 'ACFCR' : $cpuBattleLog.text('CPU hits player 1\'s aircraft carrier!'); (ACFCRcounter ++);
      break;
    case 'BTSP' : $cpuBattleLog.text('CPU hits player 1\'s battleship!'); BTSPcounter ++;
      break;
    case 'CR1' : $cpuBattleLog.text('CPU hits player 1\'s cruiser!'); CR1counter ++;
      break;
    case 'CR2' : $cpuBattleLog.text('CPU hits player 1\'s cruiser!'); CR2counter ++;
      break;
    case 'DS' : $cpuBattleLog.text('CPU hits player 1\'s destroyer!'); DScounter ++;
      break;
    default : $battleLog.text('No hits this time');
  }
  if ($cpuCellChosen.hasClass('ship')) {
    hitNoise.play(); hitNoise.currentTime = 0;
    $cpuCellChosen.addClass('hit');$cpuCellChosen.removeClass('ship');
  } else {
    $cpuCellChosen.addClass('miss'); $cpuCellChosen.removeClass('sea');
    splashNoise.play(); splashNoise.currentTime = 0;
  }

  if (ACFCRcounter === 5) {
    $cpuBattleLog.text('CPU sank your aircraft carrier!');
    shipSunk.play(); shipSunk.currentTime = 0;
    setTimeout(1000); ACFCRcounter ++;
  } else if (BTSPcounter === 4) {
    $cpuBattleLog.text('CPU sank your battleship!');
    sunkHuman.play(); sunkHuman.currentTime = 0;
    setTimeout(1000); BTSPcounter ++;
  } else if (CR1counter === 3) {
    $cpuBattleLog.text('CPU sank your cruiser!');
    shipSunk.play(); shipSunk.currentTime = 0;
    setTimeout(1000); CR1counter ++;
  } else if (CR2counter === 3) {
    $cpuBattleLog.text('CPU sank your cruiser!');
    shipSunk.play(); shipSunk.currentTime = 0;
    setTimeout(1000); CR2counter ++;
  } else if (DScounter === 2) {
    $cpuBattleLog.text('CPU sank your destroyer!');
    shipSunk.play(); shipSunk.currentTime = 0;
    setTimeout(1000); DScounter ++;
  }
  if ($cpuCellChosen.hasClass('hit')) {
    $hitIndex = $playersTiles.index($cpuCellChosen);
  }
  checkForCpuWin();
}
//-------------------------------------------------------------
//function for ai to kill human ship once discovered
function lookForShip() {
  console.log('looking for ship');

  const $boolA = $playersTiles.eq($hitIndex + 1);
  const $boolB = $playersTiles.eq($hitIndex - 1);
  const $boolC = $playersTiles.eq($hitIndex + 10);
  const $boolD = $playersTiles.eq($hitIndex - 10);

  if (($boolA.hasClass('sea') === true || $boolB.hasClass('sea') === true || $boolC.hasClass('sea') === true || $boolD.hasClass('sea') === true || $boolA.hasClass('ship') === true || $boolB.hasClass('ship') === true || $boolC.hasClass('ship') === true || $boolD.hasClass('ship') === true)) {

    var randomIndex2 = Math.ceil(Math.random() * 4);
    var $chosenIndex = 0;
    switch (randomIndex2) {
      case 1 : $chosenIndex = $boolA ;
        break;
      case 2 : $chosenIndex = $boolB ;
        break;
      case 3 : $chosenIndex = $boolC ;
        break;
      case 4 : $chosenIndex = $boolD ;
        break;
    }
    $cpuCellChosen = $chosenIndex;
    console.log($chosenIndex);
  } else {
    $hitIndex = false; cpusChoice();
    console.log('hitindex reset', $hitIndex);
  }

  if ($cpuCellChosen.length === 0 || $cpuCellChosen.hasClass('hit') || $cpuCellChosen.hasClass('miss'))  {
    console.log('looking for ship again');
    lookForShip();
  } else {
    cpuFire();
  }
}
//---------------------------------------------------------------------
//function on cpus turn to decide whether to choose randomly or target a found ship
function cpusChoice() {
  $cpuBoard.off('click');
  if ($hitIndex !== false) {
    lookForShip();
  } else {
    var randomIndex = Math.floor(Math.random() * $playersTiles.length);
    $cpuCellChosen = $playersTiles.eq(randomIndex);
    if($cpuCellChosen.length !== 1 || $cpuCellChosen.hasClass('miss') || $cpuCellChosen.hasClass('hit')) {
      console.log($cpuCellChosen);
      $cpuCellChosen = '';
      cpusChoice();
    } else {
      cpuFire();
    }
  }
}
