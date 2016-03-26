var Actor = function(game, x, y, color) {
  this.game = game;

  var size = 32;
  this.color = color;

  var bmd = this.game.add.bitmapData(size, size);
  bmd.ctx.clearRect(0,0,size,size);
  bmd.ctx.strokeStyle = '#FFF';
  bmd.ctx.fillStyle = color;
  bmd.ctx.lineWidth = 2;
  bmd.ctx.beginPath();
  bmd.ctx.moveTo(size, size/2);
  bmd.ctx.lineTo(0, 0);
  bmd.ctx.lineTo(0, size);
  bmd.ctx.lineTo(size, size/2);
  bmd.ctx.fill();

  Phaser.Sprite.call(this, game, x, y, bmd); 

    // this.player = this.game.add.sprite(Game.w/2, Game.h/2, 'tri');
  this.anchor.setTo(0.5);
  this.passengers = 0;
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.drag.set(0.5);
  this.body.maxVelocity.setTo(800, 800);
  this.body.collideWorldBounds = true;
  this.scale.x = 1.2;
  this.scale.y = 1.2;

  this.fireRate = 250;
  this.nextFire = 0;
  this.health = 20;

  this.game.camera.follow(this, Phaser.Camera.FOLLOW_TOPDOWN);

  this.game.add.existing(this);

  // //SFX
  // this.hitSnd = this.game.add.sound('hit_shield');
  // this.hitSnd.volume = 0.2;
  // this.explosionSnd = this.game.add.sound('explosion');
  // this.explosionSnd.volume = 0.2;
  // this.shootSnd = this.game.add.sound('laser');
  // this.shootSnd.volume = 0.2;


  // this.bullets = this.game.add.group();
  // this.bullets.enableBody = true;
  // this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  // this.bullets.createMultiple(30, 'pbullet', 0, false);
  // this.bullets.setAll('anchor.x', 0);
  // this.bullets.setAll('anchor.y', 0.5);
  // this.bullets.setAll('outOfBoundsKill', true);
  // this.bullets.setAll('checkWorldBounds', true);
  // this.shoot_s = this.game.add.sound('shot');
  // this.shoot_s.volume = 0.2;


};


Actor.prototype = Object.create(Phaser.Sprite.prototype);
Actor.prototype.constructor = Actor;
