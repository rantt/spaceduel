/*global Game*/
Game.Menu = function(game){
  this.game = game;
};

Game.Menu.prototype =  {
    create: function() {

    this.space = this.game.add.tileSprite(0,0,1600,1200,'background');

        // this.title = this.game.add.sprite(Game.w/2,Game.h/2-100,'title');
        // this.title.anchor.setTo(0.5,0.5);
        
      this.titleText = this.game.add.bitmapText(Game.w/2, Game.h/2-100, 'minecraftia', "Space Duel", 128 );
      this.titleText.anchor.setTo(0.5);
      this.titleText.tint = 0xffff00;

      this.game.add.tween(this.titleText)
        .to( {y:300 }, 2000, Phaser.Easing.Linear.In, true, 0, -1)
        .yoyo(true);



        this.instructions = this.game.add.sprite(Game.w/2+600,Game.h/2,'instructions');
        this.instructions.anchor.setTo(0.5);

        // Start Message

        var clickText = this.game.add.bitmapText(Game.w/2, Game.h/2+50, 'minecraftia', '~click to start~', 48).anchor.setTo(0.5); 

    },
    update: function() {
      //Click to Start
      if (this.game.input.activePointer.isDown){
        this.game.state.start('Play');
      }
    }
};
