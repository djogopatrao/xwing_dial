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

// data about the damage deck
var damage_deck_cards = null;

// the deck itself
var damage_deck;

// damage cards per ship
var ship_damage = {}



// data.json (data about ships)
var ship_data = {}

window.onload = function() {	

    // load ship json
    $.ajax({
        url:'data/data.json',
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


    // start the playarea with the dials and damage deck
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

    if ( !window.sessionStorage.getItem('xwingDials') ) {
    } else {

        loadState();
        init_playarea()
    }
}

function createShipName( x ) {
    return x.ship_name + "\n" + x.pilot_name + " PS"+x.pilot_initiative;
}

function loadState() {
    var obj = JSON.parse( window.sessionStorage.getItem('xwingDials') )

    dials  = obj.dials
    angles = obj.angles
    init_dials = obj.init_dials
    ship_string_id = obj.ship_string_id
    damage_deck = obj.damage_deck
}

function  saveState(){
    var obj = {
        dials: dials,
        angles: angles,
        init_dials: init_dials,
        ship_string_id: ship_string_id,
        damage_deck: damage_deck
    };
    window.sessionStorage.setItem('xwingDials', JSON.stringify(obj) )
};

function killSession(){
    init_dials = [];
    dials = {};
    angles = {};
    ship_string_id = [];
    damage_deck = null;
    saveState();
    window.sessionStorage.removeItem('xwingDials' )
}

/**
 * Damage Deck Stuff
 *
 *
**/

/** damage deck **/
function prepareDamageDeck() {
    damage_deck = []
    $(damage_deck_cards.cards).each(function(index,c){
        for( var i=0;i<c.amount;i++ ){
            damage_deck.push( c );
        }
    });
   shuffle(damage_deck)
}

function getDamageCardURL( damage_card ) {
    return "damage_deck/syndicate/" + damage_card.title + ".png";
}

function shuffle(a) {
    var j,x,i;
    for (i=a.length-1;i>0;i--){
        j = Math.floor(Math.random()*(i+1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}


function drawDamageCard() {
    return damage_deck.shift();
}



/**
 * Playarea
 *
 *
**/
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
            game.load.image("window_damage","window_damage.png")

            // load damage deck json
            $.ajax( {
                url: './damage_deck/core.json',
                dataType:"json",
                success: function(x) {
                    damage_deck_cards = x;
                    $(damage_deck_cards.cards).each(function(i,c){
                        game.load.image(c.title, getDamageCardURL(c) );
                    });
                    if ( !damage_deck ) {
                        prepareDamageDeck();
                    }
                }
            });

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
            wheel[key].__myindex = i; 
            wheel[key].__mystate = 'wheel'; // or damage 
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

            // damage "window" button
            wheel[key].__damage_button = game.add.text( game.width-64, 350*i+90, 'DAM\nAGE', {font: '20px Arial', backgroundColor: 'orange' });
            wheel[key].__damage_button.inputEnabled = true
            wheel[key].__damage_button.events.onInputDown.add( this.toggleDamage, this );
            wheel[key].__damage_button.__mykey = key;


            // damage "window"
            wheel[key].__damage_window = game.add.sprite( 20, 350*i+90, 'window_damage' )
            wheel[key].__damage_window.alpha = 0.0;
            wheel[key].__damage_window.inputEnabled = false

            // damage text (the list of damages)
            wheel[key].__damage_text = game.add.text( 20, 350*i+90, 'Cartas de dano:', {font: '14px Arial' });
            wheel[key].__damage_text.inputEnabled = true
            wheel[key].__damage_text.events.onInputDown.add( this.toggleDamage, this );
            wheel[key].__damage_text.__mykey = key;
            wheel[key].__damage_text.alpha = 0.0;
            wheel[key].__damage_text.inputEnabled = false

            // damage buttons (to give a hit or crit damage)
            wheel[key].__hit_button = game.add.text( 200, 350*i+90, 'Hit', {font: '20px Arial', backgroundColor: 'orange' });
            wheel[key].__hit_button.inputEnabled = true
            wheel[key].__hit_button.events.onInputDown.add( this.giveHit, this );
            wheel[key].__hit_button.__mykey = key;
            wheel[key].__hit_button.alpha = 0.0 //invisible
            wheel[key].__hit_button.inputEnabled = false

            wheel[key].__crit_button = game.add.text( 226, 350*i+90, 'Crit', {font: '20px Arial', backgroundColor: 'yellow' });
            wheel[key].__crit_button.inputEnabled = true
            wheel[key].__crit_button.events.onInputDown.add( this.giveCrit, this );
            wheel[key].__crit_button.__mykey = key;
            wheel[key].__crit_button.alpha = 0.0 //invisible
            wheel[key].__crit_button.inputEnabled = false


            // ship title
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
    toggleDamage(o,e) {
        var key = o.__mykey;
        if ( wheel[key].__mystate == 'wheel' ) {
            wheel[key].__damage_window.alpha = 1.0;
            wheel[key].__damage_text.alpha = 1.0;
            wheel[key].__hit_button.alpha = 1.0;
            wheel[key].__crit_button.alpha = 1.0;
            wheel[key].__damage_window.inputEnabled = true;
            wheel[key].__damage_text.inputEnabled = true;
            wheel[key].__hit_button.inputEnabled = true;
            wheel[key].__crit_button.inputEnabled = true;
            wheel[key].__mystate = 'damage';
        } else if ( wheel[key].__mystate == 'damage' ) {
            wheel[key].__damage_window.alpha = 0.0;
            wheel[key].__damage_text.alpha = 0.0;
            wheel[key].__hit_button.alpha = 0.0;
            wheel[key].__crit_button.alpha = 0.0;
            wheel[key].__damage_window.inputEnabled = false;
            wheel[key].__damage_text.inputEnabled = false;
            wheel[key].__hit_button.inputEnabled = false;
            wheel[key].__crit_button.inputEnabled = false;
            wheel[key].__mystate = 'wheel';
        } else {
            alert("Estado '"+wheel[key].__mystate+"' inválido! mande um print pro desenvolvedor q é bug!");
        }
    },
    giveHit(o,e) {
        var card = drawDamageCard();
        var i = wheel[ o.__mykey ].__myindex;
        if ( !ship_damage[o.__mykey] ) {
            ship_damage[o.__mykey] = []
        }
        ship_damage[o.__mykey].push( { card: card, flipped: 0} );
        this.updateDamageText(o.__mykey);
    },
    giveCrit(o,e) {
        var card = drawDamageCard();
        var i = wheel[ o.__mykey ].__myindex;
        if ( !ship_damage[o.__mykey] ) {
            ship_damage[o.__mykey] = []
        }
        ship_damage[o.__mykey].push( { card: card, flipped: 1} );
        this.updateDamageText(o.__mykey);

    },
    updateDamageText(shipKey) {
        var text = "Cartas de dano:\n";
        $( ship_damage[shipKey] ).each(function(i,x){
            if ( x.flipped ) {
                text += x.card.title+"\n";
            } else {
                text += "Hit\n";
            }            
        });
        wheel[shipKey].__damage_text.setText(text);
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




