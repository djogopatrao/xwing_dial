// the game itself
var game;
// the spinning wheel DIALS
var wheel = {};
// the back of the DIALS
var dial_backs = {}
// the pin the DIALS
var pins = {}

// slices (prizes) placed in the wheel
var slices = 17;
var angles = {}
var dials;

window.onload = function() {	

    if ( !window.sessionStorage.getItem('xwingDials') ) {

        dials = prompt("Quantos dials?")*1;
        for( var i=0;i<dials;i++ ) {
            angles["wheel_"+i] = 0;
        }

    } else {

        var obj = JSON.parse( window.sessionStorage.getItem('xwingDials') )

        dials  = obj.dials
        slices = obj.slices
        angles = obj.angles
    }
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
          game.load.image("back", "dial_back.png");
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
            wheel[key].__mykey = key;
            game.add.tween(wheel[key]).to({angle:angles[key]},500,Phaser.Easing.Quadratic.Out,true);
            wheel[key].events.onInputDown.add(this.rotate,this);

            dial_backs[key] = game.add.sprite( game.width/2, 350*(i+0.5), 'back' );
            dial_backs[key].anchor.set(0.5);
            dial_backs[key].visible = false;
            dial_backs[key].inputEnabled = true;
            dial_backs[key].__mykey = key;
            dial_backs[key].events.onInputDown.add(this.unlockDial,this);


            // adding the pin in the middle of the canvas
            pins[key] = game.add.sprite(game.width / 2,  350*(i+0.5), "pin");
            pins[key].anchor.set(0.5);
            pins[key].inputEnabled = true;
            pins[key].__mykey = key;
            pins[key].events.onInputDown.add(this.lockDial,this);
        }

        // waiting for your input, then calling "spin" function
        //game.input.onDown.add(this.rotate, this);		
        // TODO rotate swipe
        this.saveState();
	},
    rotate(o,e){
        var wheelref = wheel[o.__mykey]
        var signal = e.clientX>200?+1:-1;
        var angleIncrement = 360/slices * signal;
        var spinTween = game.add.tween(wheelref).to({
            angle: angleIncrement.toString()
        }, 500, Phaser.Easing.Quadratic.Out, true );
        var that = this;
        spinTween.onComplete.add(function(){
            angles[o.__mykey] = wheelref.angle
            that.saveState();
        });
    },
    lockDial(o,e){
        wheel[o.__mykey].visible = false;
        dial_backs[o.__mykey].visible = true;
        pins[o.__mykey].visible = false;
    },
    unlockDial(o,e){
        wheel[o.__mykey].visible = true;
        dial_backs[o.__mykey].visible = false;
        pins[o.__mykey].visible = true;
    },
    saveState(){
        var obj = {
            dials: dials,
            slices: slices,
            angles: angles
        };
        window.sessionStorage.setItem('xwingDials', JSON.stringify(obj) )
    }
}




