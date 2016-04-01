/*global Game*/

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */

// // Choose Random integer in a range
function rand (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// var musicOn = true;


var wKey;
var aKey;
var sKey;
var dKey;
var cursors;
var score = 0;
// var fireRef;
var player;
var actors = {};
var posUpdateTimer;

var enemyBullets;


Game.Play = function(game) {
	this.game = game;
};

Game.Play.prototype = {
	create: function() {
		this.game.world.setBounds(0, 0 ,Game.w ,Game.h);
		this.game.stage.backgroundColor = '#000';
		this.stage.disableVisibilityChange = true;

		posUpdateTimer = this.game.time.now;

    for (var i = 0;i < 100;i++) {
      var bright = ['#FFF','#dcdcdc','#efefef','#ffff00','#00ff00'];
      var sizes = [1,1,1,1,1,2,2,2,3,3,3,4,4,5,6,7,8];
      var starSize = sizes[rand(0,16)];

      this.game.add.sprite(rand(0,Game.w),rand(0,Game.h),this.makeBox(starSize, starSize, bright[rand(0,2)]));
    }


    this.fireRef = new Firebase('https://week12.firebaseio.com/');

    //Enemies
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'ebullet');

    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);
    // enemyBullets.setAll('tint', '0x00ff00');
		enemyBullets.setAll('lifespan', 2000);



		// // Music
		// this.music = this.game.add.sound('music');
		// this.music.volume = 0.5;
		// this.music.play('',0,1,true);

		cursors = game.input.keyboard.createCursorKeys();
		wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
		aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
		dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		//Accept Arrow Keys as input
		//capture
		this.game.input.keyboard.addKeyCapture([
				Phaser.Keyboard.LEFT,
				Phaser.Keyboard.RIGHT,
				Phaser.Keyboard.UP,
				Phaser.Keyboard.DOWN
		]);

		player = new Actor(this.game, Game.w/2, Game.h/2, '#0000FF');

    player.uid = parseInt(JSON.parse(localStorage.getItem('atPlayer')));

    player.playerHealthBar = this.game.add.sprite(8, 8, this.makeBox(256, 20, '#33ff00'));

		player.fireRate = 250;
		player.nextFire = 0;
		player.health = 10;

		player.bullets = this.game.add.group();
		player.bullets.enableBody = true;
		player.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		player.bullets.createMultiple(30, 'pbullet', 0, false);
		player.bullets.setAll('anchor.x', 0);
		player.bullets.setAll('anchor.y', 0.5);
		player.bullets.setAll('outOfBoundsKill', true);
		player.bullets.setAll('checkWorldBounds', true);


		player.movements = function(that) {

      var playr = {};
      playr['player'] = {};
			var position = {angle: this.angle, x: this.x, y: this.y, health: this.health};
      playr['player'][this.uid] = position;

      if(cursors.up.isDown || wKey.isDown) {
        // this.game.physics.arcade.accelerationFromRotation(this.rotation, 200, this.body.acceleration); 
        this.currentSpeed = 300;
				that.fireRef.set(playr);
      }else {
        // this.body.acceleration.set(0);
        this.currentSpeed = 0;
      }
		 if (cursors.left.isDown || aKey.isDown)
			{
					this.body.angularVelocity = -300;
					that.fireRef.set(playr);
			}
			else if (cursors.right.isDown || dKey.isDown)
			{
					this.body.angularVelocity = 300;
					that.fireRef.set(playr);
			}
			else
			{
					this.body.angularVelocity = 0;
			}

      // if (this.currentSpeed > 0) {
        this.game.physics.arcade.velocityFromRotation(this.rotation, this.currentSpeed, this.body.velocity);
      // }else {
      //   this.game.physics.arcade.velocityFromRotation(this.rotation, this.currentSpeed, this.body.velocity);
      // }

      //Fire Weapons
			if ((this.game.input.activePointer.isDown || spaceKey.isDown) && this.alive == true)
			{

          that.fireRef.set(playr);
					if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
					{
						// this.shoot_s.play();
						// this.shootSnd.play();
						this.nextFire = this.game.time.now + this.fireRate;
						var bullet = this.bullets.getFirstExists(false);
						bullet.lifespan = 2000;
						bullet.reset(this.x, this.y);
						// bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 2000);
						bullet.rotation = this.rotation;
						
						game.physics.arcade.velocityFromRotation(this.rotation, 400, bullet.body.velocity);
						that.fireRef.set({bullet: {x: this.x, y: this.y, rotation: bullet.rotation, uid: this.uid, time: this.game.time.now}});
					}
			}

	};
  player.damage = function(that){
    this.playerHealthBar.scale.x = this.health/10;
    this.health -= 1;

    var playr = {};
    playr['player'] = {};
    var position = {angle: this.angle, x: this.x, y: this.y, health: this.health};
    playr['player'][this.uid] = position;

    // var position = {};
    // position[this.uid] = {angle: this.angle, x: this.x, y: this.y, uid: this.uid, health: this.health};
    // console.log(position);

    if (this.health <= 0) {
      this.playerHealthBar.scale.x = 0;
      this.kill();
    }
    that.fireRef.set(playr);
  };

  actors[player.uid] = player;

	// this.fireRef.on('child_changed', function(snapshot) {
	this.fireRef.child('player').on('value', function(snapshot) {
		// console.log(snapshot.val());

		// var actors = snapshot.val();
    snapshot.forEach(function(childSnapshot) {
      var uid = childSnapshot.key();
      var actor = childSnapshot.val();
      // console.log(data);
      // console.log(uid, player.uid);

      // if (actor.uid !== player.uid && actor.uid !== undefined) {
      if (uid != player.uid) {
        if (actors[uid] === undefined) {
          actors[uid] = new Actor(game, actor.x, actor.y,'#FF0000');
          actors[uid].health = 10; 
        }else {
          // console.log(actor);
          actors[uid].x = actor.x;	
          actors[uid].y = actor.y;	
          actors[uid].angle = actor.angle;	
          actors[uid].health = actor.health;

          console.log(actors[uid], actor.health);
          if (actors[uid].health <= 0) {
            actors[uid].kill();
          }

          if (actor.reset == true) {
            actors[uid].reset(Game.w/2, Game.h/2);
          }
        }
      }

    });
    // console.log(actor);

	});

	this.fireRef.child('bullet').on('value', function(snapshot) {
		var shot = snapshot.val();
		if (shot !== null && shot.uid !== player.uid) {
			// console.log(shot);
			var bullet = enemyBullets.getFirstDead();
			bullet.reset(shot.x, shot.y); 
			bullet.rotation = shot.rotation;
			this.game.physics.arcade.velocityFromRotation(bullet.rotation, 400, bullet.body.velocity);
		}
	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
	});



	//Create Twitter button as invisible, show during win condition to post highscore
	this.twitterButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 200,'twitter', this.twitter, this);
	this.twitterButton.anchor.set(0.5);
	this.twitterButton.visible = false;


  this.playAgainText = this.game.add.bitmapText(Game.w + 100, this.game.world.centerY, 'minecraftia','',48);

},

update: function() {

  var that = this;

  if (player.alive) {
    this.twitterButton.visible = false;

    player.movements(this);

    Object.keys(actors).forEach(function (key) {
      if (key != player.uid) {

        this.game.physics.arcade.overlap(player.bullets, actors[key], function(actor, bullet) {
          bullet.kill();
        }, null, this);
      }
    });

    //Bullet Hit Player
  this.game.physics.arcade.overlap(enemyBullets, player,function(player, bullet) {
    bullet.kill();
    player.damage(that);
  }, null, this);

  }else {
    this.playAgainText.setText('Play Again?');
    this.game.time.events.add(Phaser.Timer.SECOND * 1.5, function() { 
      this.game.add.tween(this.playAgainText).to({x: this.game.world.centerX-300}, 355, Phaser.Easing.Linear.None).start();
      this.twitterButton.visible = true;

    }, this);

      var playr = {};
      playr['player'] = {};
      playr['player'][player.uid] = {angle: player.angle, x: player.x, y: player.y, health: 0};
      that.fireRef.set(playr);
      
    if (this.game.input.activePointer.isDown || wKey.isDown || cursors.up.isDown){

      player.reset(Game.w/2, Game.h/2);
      player.health = 10;
      player.playerHealthBar.scale.x = 1;
      console.log(player.health);
      that.playAgainText.setText('');
      // player.alive = true;
      playr['player'][player.uid] = {angle: player.angle, x: player.x, y: player.y, health: 0, reset: true};
      that.fireRef.set(playr);

    }
  }

	// // Toggle Music
	// muteKey.onDown.add(this.toggleMute, this);

},
// bulletHitPlayer: function(player, bullet) {
//   bullet.kill();
//   player.damage();
//
// },
makeBox: function(x,y,color) {
	var bmd = this.game.add.bitmapData(x, y);
	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, x, y);
	bmd.ctx.fillStyle = color;
	bmd.ctx.fill();
	return bmd;
},
twitter: function() {
	//Popup twitter window to post highscore
	var game_url = 'http://www.divideby5.com/games/GAMETITLE/'; 
	var twitter_name = 'rantt_';
	var tags = ['1GAM'];

	window.open('http://twitter.com/share?text=My+best+score+is+'+score+'+playing+GAME+TITLE+See+if+you+can+beat+it.+at&via='+twitter_name+'&url='+game_url+'&hashtags='+tags.join(','), '_blank');
},

// toggleMute: function() {
//   if (musicOn == true) {
//     musicOn = false; //     this.music.volume = 0; //   }else {
//     musicOn = true;
//     this.music.volume = 0.5;
//   }
// },
// render: function() {
  // game.debug.text('Health: ' + tri.health, 32, 96);
// }

};
