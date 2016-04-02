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

    this.space = this.game.add.tileSprite(0,0,1600,1200,'background');

		this.stage.disableVisibilityChange = true;

    this.pShotSnd = this.game.add.sound('shot');
    this.pShotSnd.volume = 0.2;

    this.explosionSnd = this.game.add.sound('explosion');

    this.oscSnd = this.game.add.sound('oscillation');
    this.oscSnd.volume = 0.2;
    this.oscSnd.loop = true;
    this.oscSnd.play();



    this.deathTimer = this.game.time.now;

    this.fireRef = new Firebase(<PUT FIREBASE.COM REFERENCE HERE>);

    //Enemies
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'ebullet');

    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);
		enemyBullets.setAll('lifespan', 2000);


    var particle = this.game.add.bitmapData(4, 4);
    particle.ctx.beginPath();
    particle.ctx.rect(0, 0, 4, 4);
    particle.ctx.fillStyle = '#ffff00';
    particle.ctx.fill();


    this.emitter = game.add.emitter(0, 0, 200);
    // this.emitter.makeParticles('pixel');
    this.emitter.makeParticles(particle);
    this.emitter.gravity = 0;
    this.emitter.minParticleSpeed.setTo(-200, -200);
    this.emitter.maxParticleSpeed.setTo(200, 200);




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
            that.pShotSnd.play(); 
						this.nextFire = this.game.time.now + this.fireRate;
						var bullet = this.bullets.getFirstExists(false);
						bullet.lifespan = 2000;
						bullet.reset(this.x, this.y);
						// bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 2000);
						bullet.rotation = this.rotation;
						
						game.physics.arcade.velocityFromRotation(this.rotation, 500, bullet.body.velocity);
						that.fireRef.set({bullet: {x: this.x, y: this.y, rotation: bullet.rotation, uid: this.uid, time: this.game.time.now}});
					}
			}

	};
  player.damage = function(that){
    this.health -= 1;

    var playr = {};
    playr['player'] = {};
    var position = {angle: this.angle, x: this.x, y: this.y, health: this.health};
    playr['player'][this.uid] = position;

    // var position = {};
    // position[this.uid] = {angle: this.angle, x: this.x, y: this.y, uid: this.uid, health: this.health};

    if (this.health <= 0) {
      that.explosionSnd.play();

      that.emitter.x = this.x;
      that.emitter.y = this.y;
      that.emitter.start(true, 1000, null, 128);

      this.kill();
    }
    that.fireRef.set(playr);
  };

  actors[player.uid] = player;
  var that = this;

	// this.fireRef.on('child_changed', function(snapshot) {
	this.fireRef.child('player').on('value', function(snapshot) {

		// var actors = snapshot.val();
    snapshot.forEach(function(childSnapshot) {
      var uid = childSnapshot.key();
      var actor = childSnapshot.val();

      // if (actor.uid !== player.uid && actor.uid !== undefined) {
      if (uid != player.uid) {
        if (actors[uid] === undefined) {
          actors[uid] = new Actor(game, actor.x, actor.y,'#FF0000');
          actors[uid].health = 10; 
        }else {
          actors[uid].x = actor.x;	
          actors[uid].y = actor.y;	
          actors[uid].angle = actor.angle;	
          actors[uid].health = actor.health;

          if (actors[uid].health <= 0) {
            that.emitter.x = actors[uid].x;
            that.emitter.y = actors[uid].y;
            that.emitter.start(true, 1000, null, 128);

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
			var bullet = enemyBullets.getFirstDead();
			bullet.reset(shot.x, shot.y); 
			bullet.rotation = shot.rotation;
			this.game.physics.arcade.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity);
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

      if (this.game.time.now > this.deathTimer) {
        that.fireRef.set(playr);
        this.deathTimer = this.game.time.now + 500;
      }
      
    if (this.game.input.activePointer.isDown || wKey.isDown || cursors.up.isDown){

      player.reset(Game.w/2, Game.h/2);
      player.health = 10;
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
// }

};
