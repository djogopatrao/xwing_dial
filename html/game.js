// the game itself
var game;

// 
var init_dials = [];

// the spinning wheel DIALS
var wheel = {};

// red frame selector
var selector = {}

//
var lock = {};

var drag_event=null;

var faction = null;

var pilots = null;

var ship = null;

var ship_string_id = [];

var scroll=null;

var angles = {}
var dials;
var ship_qtd = {};

// data.json (data about ships)
var ship_data = {}

window.onload = function() {	
    if ( !window.sessionStorage.getItem('xwingDials') ) {
    } else {

        var obj = JSON.parse( window.sessionStorage.getItem('xwingDials') )

        dials  = obj.dials
        angles = obj.angles
        init_dials = obj.init_dials
        ship_string_id = obj.ship_string_id

        init_playarea()
    }

    // load ship json
    $.ajax({
        url:'data/data.json&'+Date.now(),
        dataType: "json",
        success: function(data){
            ship_data = data;
            // populate faction select box
            $.each(ship_data.ships,function(i,j){
                $('#select-faction').append($('<option />').val(i).text(i));
            });
        }
    });


    
    // populate ship select box when selecting a faction
    $('#select-faction').on('change',function(o,e){
        faction = $(o.target).val();
        $('#select-dial')
            .find('option')
            .remove()
            .end()
            .append('<option value="" default=1>Escolha sua nave...</option>')
            .val('')
        ;

        $.each(ship_data.ships[faction],function(i,j){
            $('#select-dial').append($('<option />').val(i).text(j.title));
        });
    });

    // populate pilot select box when selecting a ship
    $('#select-dial').on('change',function(){
        var ship_id = $('#select-dial').val();

        $.ajax({
            url: 'data/pilots/'+faction+'/'+ship_id+'.json',
            dataType: 'json',
            success: function(data){
                ship = data;
                pilots = data.pilots;
                console.log(pilots);
                $('#select-pilot')
                    .find('option')
                    .remove()
                    .end()
                    .append('<option value="" default=1>Escolha seu piloto...</option>')
                    .val('')
                ;
                $(pilots).each(function(k,v){
                    $('#select-pilot').append($('<option />').val(k).text(v.name));
                });
            }
        });    
    });

    // add ship when selecting a pilot
    $('#add-dial-button').on('click',function(){
        var ship_id = $('#select-dial').val();
        var pilot_id = $('#select-pilot').val();
        var new_ship = {
            ship_id: ship_id,
            ship_name: ship.name,
        };
        if ( pilot_id ) {
            new_ship.pilot_name = pilots[pilot_id].name,
            new_ship.pilot_initiative = pilots[pilot_id].initiative
        } else {
            new_ship.pilot_name = "Piloto",
            new_ship.pilot_initiative = 0
        }
        init_dials.push( new_ship );
        
        ship_string_id.push( createShipName(new_ship) )

        var txt="";
        $(init_dials).each(function(i,v){
            txt+="<textarea ship-id='"+i+"' class='ship_identifier' class='form-control input-sm'>"+ship_string_id[i]+"</textarea><br>"}
        );
        $('#dial-list').html(txt);
        $('.ship_identifier').on('change',function(e){
            var i = $(e.target).attr('ship-id');
            ship_string_id[i] = $(e.target).val();
        });
    })


    // hook events to the form
    $('#show-dial-button').on('click',function(){
        dials = init_dials.length;
        for( var i=0;i<dials;i++ ) {
            angles["wheel_"+i] = 0;
        }
        init_playarea();
    });

    // reset and start again
    $('#erase-dials').on('click',function(){
        $('#menubar').show();
        $('#dial-list').show();
        $('#dial-list').html("");
        $('#show-dial-button').show()
        killSession();
        game.destroy();
        });

}

function createShipName( x ) {
    return x.ship_name + "\n" + x.pilot_name + " PS"+x.pilot_initiative;
}

function  saveState(){
    var obj = {
        dials: dials,
        angles: angles,
        init_dials: init_dials,
        ship_string_id: ship_string_id
    };
    window.sessionStorage.setItem('xwingDials', JSON.stringify(obj) )
};

function killSession(){
    init_dials = [];
    dials = {};
    angles = {};
    ship_string_id = [];
    saveState();
    window.sessionStorage.removeItem('xwingDials' )
}

function init_playarea() {
    // creation of a 458x488 game
    game = new Phaser.Game("95", 350*dials, Phaser.AUTO, "main",null,true);
    // adding "PlayGame" state
    game.state.add("PlayGame",playGame);
    // launching "PlayGame" state
    game.state.start("PlayGame");

    $('#menubar').hide();
    $('#dial-list').hide();
    $('#show-dial-button').hide()
}

// PLAYGAME STATE
	
var playGame = function(game){};

playGame.prototype = {
     // function to be executed once the state preloads
     preload: function(){
            // preloading graphic assets
            $(init_dials).each(function(i,v){
                game.load.image(v.ship_id+"_dial", "dials/"+v.ship_id+"_dial.png");
            });
            game.load.image("back", "dials/dial_back.png");
            game.load.image("rebel_back", "dials/rebel_dial_back.png");
            game.load.image("unlock", "unlock.png");
            game.load.image("lock", "lock.png");
            game.load.image("pin", "pin.png");     
            game.load.image("dial_selector", "dial_selector.png")
            Phaser.Canvas.setTouchAction(game.canvas, "auto"); // disable the default "none" so enable scroll
            game.input.touch.preventDefault = false;

     },
     // funtion to be executed when the state is created
  	create: function(){
        // giving some color to background
        game.stage.backgroundColor = "#880044";

        for (var i=0;i<dials;i++) {
            var key = "wheel_"+i;

            // add the back dial
            var backdial = game.add.sprite(game.width / 2 , 350*(i+0.5)+20, "rebel_back" );
            backdial.anchor.set(0.5);

            // adding the wheel in the middle of the canvas
            wheel[key] = game.add.sprite(game.width / 2 , 350*(i+0.5)+20, init_dials[i].ship_id+"_dial" );
            wheel[key].anchor.set(0.5);
            wheel[key].inputEnabled = true;
            wheel[key].__mykey = key;
            game.add.tween(wheel[key]).to({angle:angles[key]},500,Phaser.Easing.Quadratic.Out,true);

            // to lock/unlock the dial
            lock[key] = game.add.sprite(game.width-64, 350*i+20, 'unlock' )
            lock[key].inputEnabled = true;
            lock[key].__mykey = key;
            lock[key].events.onInputDown.add(this.toggleLockDial,this);
            lock[key].events.onInputUp.add(this.releaseLockDial,this);

            // dial selector
            selector[key] = game.add.sprite( game.width/2, 350*i+100, "dial_selector" );
            selector[key].anchor.set(0.5);
            selector[key].inputEnabled = false;

            // text
            var tmp_id = init_dials[i].ship_id+init_dials[i].pilot_name
            if ( ! ship_qtd[tmp_id] ) {
                ship_qtd[tmp_id] = 1;
            } else {
                ship_qtd[tmp_id]++;
            }
            var shipname = ship_string_id[i]; 
            var text = game.add.text( 20, 350*i, shipname, { font: '20px Arial', wordWrap: true, wordWrapWidth: "50%" } )

        }

        // waiting for your input, then calling "spin" function
        //game.input.onDown.add(this.rotate, this);		
        // TODO rotate swipe
        saveState();
	},
    toggleLockDial(o,e){
        if ( o.key=='unlock' ) {
            o.loadTexture( 'lock' )
            wheel[o.__mykey].alpha =  0.0
            wheel[o.__mykey].inputEnabled = false
            selector[o.__mykey].alpha = 0.0;
        } else {
            o.loadTexture( 'unlock' )
            wheel[o.__mykey].alpha =  1.0
            wheel[o.__mykey].inputEnabled = true
            selector[o.__mykey].alpha = 1.0;
        }
        game.input.touch.preventDefault = true; // disable scroll for now
    },
    releaseLockDial(o,e) {
        game.input.touch.preventDefault = false; // enable scroll for back
    },
    update(){
        if (game.input.activePointer.isDown ) {
            for(var w in wheel) {
                if ( wheel[w].input.checkPointerOver(game.input.activePointer)) {    
                    game.input.touch.preventDefault = true; // disable scroll for now

                // pointer is down and is over our sprite, so do something here
                    var delta_x = game.input.x - wheel[w].position.x; 
                    var delta_y = game.input.y - wheel[w].position.y;

                    var angle = Math.asin( delta_x / Math.sqrt( Math.pow( delta_x,2 ) + Math.pow( delta_y,2 ) ) ) * 180/3.141592

                    if ( delta_x>0 && delta_y<=0 ) {
                        angle = angle;
                    } else if ( delta_x>0 && delta_y>0 ) {
                        angle = 180-angle;
                    } else if ( delta_x<=0 && delta_y>0 ) {
                        angle = 180-angle;
                    } else {
                        angle = 360+angle;
                    }

                    if ( drag_event ) {
                        var delta_angle = angle - drag_event.angle;
                        while ( delta_angle > 360 ) { delta_angle-=360; }
                        while ( delta_angle < -360 ) { delta_angle+=360; }

                        wheel[w].angle += delta_angle;
                        angles[w] = wheel[w].angle;
                        saveState();
                    }

                    drag_event={angle:angle, mykey:w}
                    return;
                }
            }
     } else if ( game.input.activePointer.isUp ) {
            if ( drag_event ) {
                drag_event = false;
                game.input.touch.preventDefault = false; // enable scroll again
            }
        }
    }
}




