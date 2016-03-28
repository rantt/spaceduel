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
var fireRef;
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

		posUpdateTimer = this.game.time.now;

    for (var i = 0;i < 100;i++) {
      var bright = ['#FFF','#dcdcdc','#efefef','#ffff00','#00ff00'];
      var sizes = [1,1,1,1,1,2,2,2,3,3,3,4,4,5,6,7,8]
      var starSize = sizes[rand(0,16)];

      this.game.add.sprite(rand(0,Game.w),rand(0,Game.h),this.makeBox(starSize, starSize, bright[rand(0,2)]));
    }


    var fireRef = new Firebase('https://week12.firebaseio.com/');

    //Enemies
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'ebullet');

    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);
    enemyBullets.setAll('tint', '0x00ff00');



		// // Music
		// this.music = this.game.add.sound('music');
		// this.music.volume = 0.5;
		// this.music.play('',0,1,true);

		cursors = game.input.keyboard.createCursorKeys();
		wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
		aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
		dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);

		//Accept Arrow Keys as input
		//capture
		this.game.input.keyboard.addKeyCapture([
				Phaser.Keyboard.LEFT,
				Phaser.Keyboard.RIGHT,
				Phaser.Keyboard.UP,
				Phaser.Keyboard.DOWN
		]);

		// player = this.game.add.sprite(Game.w/2, Game.h/2, this.makeCone(32, '#FFF'));
		player = new Actor(this.game, Game.w/2, Game.h/2, '#0000FF');

    player.uid = parseInt(JSON.parse(localStorage.getItem('atPlayer')));

		player.fireRate = 250;
		player.nextFire = 0;
		player.health = 20;

		player.bullets = this.game.add.group();
		player.bullets.enableBody = true;
		player.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		player.bullets.createMultiple(30, 'pbullet', 0, false);
		player.bullets.setAll('anchor.x', 0);
		player.bullets.setAll('anchor.y', 0.5);
		player.bullets.setAll('outOfBoundsKill', true);
		player.bullets.setAll('checkWorldBounds', true);


		player.movements = function() {
			var position = {};
			// position[this.uid] = {angle: this.angle, x: this.x, y: this.y, color: this.color};
			position[this.uid] = {angle: this.angle, x: this.x, y: this.y, uid: this.uid};

			// console.log(posUpdateTimer);
			// if (this.game.time.now > posUpdateTimer) {
			// 	posUpdateTimer = this.game.time.now + 100;
			// 	fireRef.set(position);
			// }

			if (cursors.left.isDown || aKey.isDown) {
				this.angle -= 4.5;
				fireRef.set(position);
			}else if (cursors.right.isDown || dKey.isDown){
				this.angle += 4.5;
				fireRef.set(position);
			}

			if (cursors.up.isDown || wKey.isDown) {
					this.currentSpeed = 550;
					fireRef.set(position);
					// this.currentSpeed = 150;
			}else if (cursors.down.isDown || sKey.isDown){
				this.currentSpeed = 0; //Drift
			}else {
					if (this.currentSpeed > 0) {
							this.currentSpeed -= 12;
					}
			}

			if (this.currentSpeed > 0)
					this.game.physics.arcade.velocityFromRotation(this.rotation, this.currentSpeed, this.body.velocity);

			if (this.game.input.activePointer.isDown && this.alive == true)
			{
					if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
					{
						// this.shoot_s.play();
						// this.shootSnd.play();
						this.nextFire = this.game.time.now + this.fireRate;
						var bullet = this.bullets.getFirstExists(false);
						bullet.reset(this.x, this.y); bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 2000);
						fireRef.set({bullet: {x: this.x, y: this.y, rotation: bullet.rotation}});
						// fireRef.set({x: this.x, y: this.y, rotation: bullet.rotation});

					}
			}

	};

	fireRef.on('child_changed', function(snapshot) {
		console.log(snapshot.val());

		var actor = snapshot.val();
    console.log(actor.uid);
		if (actor.uid !== player.uid && actor.uid !== undefined) {
			if (actors[actor.uid] === undefined) {
				actors[actor.uid] = new Actor(game, actor.x, actor.y,'#FF0000');
			}else {
				actors[actor.uid].x = actor.x;	
				actors[actor.uid].y = actor.y;	
				actors[actor.uid].angle = actor.angle;	
			}
		}
	});

	fireRef.child('bullet').on('value', function(snapshot) {
		var shot = snapshot.val();
		if (shot != null) {
			console.log(shot);
			var bullet = enemyBullets.getFirstDead();
			bullet.reset(shot.x, shot.y); 
			bullet.rotation = shot.rotation;
			this.game.physics.arcade.velocityFromRotation(bullet.rotation, 1000, bullet.body.velocity);

			// bullet.body.velocity = 500; 

		}

	// 	// var bullet = enemyBullets.getFirstDead();
	// 	// bullet.reset(shot.x, shot.y); 
	// 	// bullet.rotation = shot.rotation;
  //   //
	// 	// console.log(bullet.rotation);
	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
	});

	//Create Twitter button as invisible, show during win condition to post highscore
	this.twitterButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 200,'twitter', this.twitter, this);
	this.twitterButton.anchor.set(0.5);
	this.twitterButton.visible = false;
},

update: function() {
	player.movements();

	// // Toggle Music
	// muteKey.onDown.add(this.toggleMute, this);

},
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
//   game.debug.text('Health: ' + tri.health, 32, 96);
// }

};
