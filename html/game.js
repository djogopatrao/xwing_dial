// the game itself
var game,game2;
// the spinning wheel
var wheel; 
// can the wheel spin?
var canSpin;
// slices (prizes) placed in the wheel
var slices = 17;
// text field where to show the prize
var prizeText;

//
var currentAngle = 0;

window.onload = function() {	
     // creation of a 458x488 game
	game = new Phaser.Game(458, 488, Phaser.AUTO, "");
     // adding "PlayGame" state
     game.state.add("PlayGame",playGame);
     // launching "PlayGame" state
     game.state.start("PlayGame");


     // creation of a 458x488 game
	game2 = new Phaser.Game(458, 488, Phaser.AUTO, "");
     // adding "PlayGame" state
     game2.state.add("PlayGame2",playGame2);
     // launching "PlayGame" state
     game2.state.start("PlayGame2");

}

// PLAYGAME STATE
	
var playGame = function(game){};

playGame.prototype = {
     // function to be executed once the state preloads
     preload: function(){
          // preloading graphic assets
          game.load.image("wheel", "firespray_dial.png");
		game.load.image("pin", "pin.png");     
     },
     // funtion to be executed when the state is created
  	create: function(){
          // giving some color to background
  		game.stage.backgroundColor = "#880044";
          // adding the wheel in the middle of the canvas
  		wheel = game.add.sprite(game.width / 2, game.width / 2, "wheel");
          // setting wheel registration point in its center
          wheel.anchor.set(0.5);
          // adding the pin in the middle of the canvas
          var pin = game.add.sprite(game.width / 2, game.width / 2, "pin");
          // setting pin registration point in its center
          pin.anchor.set(0.5);
          // adding the text field
          prizeText = game.add.text(game.world.centerX, 480, "");
          // setting text field registration point in its center
          prizeText.anchor.set(0.5);
          // aligning the text to center
          prizeText.align = "center";
          // the game has just started = we can spin the wheel
          canSpin = true;
          // waiting for your input, then calling "spin" function
          game.input.onDown.add(this.rotate, this);		
            // TODO rotate swipe
	},
     startRotate(e) {
        mouseIsDown = true;
        positionStartSwipeX = game.input.x
    },
     endRotate(e) {
        mouseIsDown = false;
        positionStartSwipeX = game.input.x
    },
     doRotate(e) {
            currentAngle = 45;
            var spinTween = game.add.tween(wheel).to({
                angle: currentAngle.toString()
            }, 500, Phaser.Easing.Quadratic.Out, true );
    },
     rotate(e){
        console.log(1);
        signal = e.clientX>200?+1:-1;
        currentAngle = 360/slices * signal; 
        var spinTween = game.add.tween(wheel).to({
            angle: currentAngle.toString()
        }, 500, Phaser.Easing.Quadratic.Out, true );
    }
}




