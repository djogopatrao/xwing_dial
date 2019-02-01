// the game itself
var game;
// the spinning wheel
var wheel = {};
// can the wheel spin?
var canSpin;
// slices (prizes) placed in the wheel
var slices = 17;
// text field where to show the prize
var prizeText;

var dials;

//
var currentAngle = 0;

window.onload = function() {	

    dials = prompt("Quantos dials?")*1;

     // creation of a 458x488 game
	game = new Phaser.Game(458, 350*dials, Phaser.AUTO, "");
     // adding "PlayGame" state
     game.state.add("PlayGame",playGame);
     // launching "PlayGame" state
     game.state.start("PlayGame");


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

          for (var i=0;i<dials;i++) {
              var key = "wheel_"+i;
              // adding the wheel in the middle of the canvas
      		  wheel[key] = game.add.sprite(game.width /2 , 350*(i+0.5), 'wheel');
              // setting wheel registration point in its center
              wheel[key].anchor.set(0.5);
              wheel[key].inputEnabled = true;
              wheel[key].events.onInputDown.add(this.rotate,this);
              wheel[key].__mykey = key;

              // adding the pin in the middle of the canvas
              var pin = game.add.sprite(game.width / 2,  350*(i+0.5), "pin");
              pin.anchor.set(0.5);
              pin.inputEnabled = true;
              pin.__mykey = key;
              pin.events.onInputDown.add(this.lockDial,this);
          }

          // the game has just started = we can spin the wheel
          canSpin = true;
          // waiting for your input, then calling "spin" function
          //game.input.onDown.add(this.rotate, this);		
          // TODO rotate swipe
	},
     rotate(o,e){
        var wheelref = wheel[o.__mykey]
        signal = e.clientX>200?+1:-1;
        currentAngle = 360/slices * signal; 
        var spinTween = game.add.tween(wheelref).to({
            angle: currentAngle.toString()
        }, 500, Phaser.Easing.Quadratic.Out, true );
    },
    lockDial(o,e){
        alert("lock "+o.__mykey)
    }
}




