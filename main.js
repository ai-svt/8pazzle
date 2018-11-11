// 絵合わせ16パズル by @usami_yu
// このコード'game.js'はMITライセンスで公開いたします。
// ご自由に改造してお使いください。

enchant();

window.onload = function(){

  var game = new Game(960, 960);
  game.fps = 24;

  var PRELOAD_MATERIAL = ['hani3.png'];
  if(PRELOAD_MATERIAL) game.preload(PRELOAD_MATERIAL);

//乱数発生関数
  var rand = function(num){ return (Math.random() * num) | 0; }

//グリッドライン用グループ
  var Grid = enchant.Class.create(Group, {
    initialize : function(){
      Group.call(this);
      for(var i = 0;i < 4;i++){
        var leftLine = new Line((i % 4) * 320, 0);
        this.addChild(leftLine);
        var rightLine = new Line((i % 4) * 320 + 319, 0);
        this.addChild(rightLine);
        var topLine = new Line(480, (i % 4) * 320 - 480);
        topLine.rotate(90);
        this.addChild(topLine);
        var bottomLine = new Line(480, (i % 4) * 320 - 161);
        bottomLine.rotate(90);
        this.addChild(bottomLine);
      }
    }
  });

//グリッドライン用ライン
  var Line = enchant.Class.create(Sprite, {
    initialize : function(x, y){
      Sprite.call(this, 1, 960);
      var surface = new Surface(1, 960);
      var ctx = surface.context;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 960);
      ctx.stroke();
      this.image = surface;
      this.x = x;
      this.y = y;
    }
  });

//パネル
  var Panel = enchant.Class.create(Sprite, {
    initialize : function(width, height){
      Sprite.call(this, width, height);
      this.image = game.assets['hani3.png'];
      this.position = 0;
      this.moved = false;
      this.addEventListener(enchant.Event.TOUCH_START, this.onTouchStart);
      this.addEventListener(enchant.Event.TOUCH_END, this.onTouchEnd);
    },
    onTouchStart : function(){
      if(!this.moved) this.tl.fadeTo(0.5, 1);
    },
    onTouchEnd : function(){
      if(!this.moved){
        this.tl.fadeTo(1, 1);
        var nodes = this.parentNode.childNodes;
        for(var j = 0;j < 4;j++){
          if(this.moved) break;
          var x = Math.cos((j / 2) * Math.PI) | 0;
          var y = Math.sin((j / 2) * Math.PI) | 0;
          console.log(x)
          console.log(y)
          for(i in nodes){
            var pos = nodes[i].position;
            console.log("pos:" + pos)
            if(pos === this.position + x + y * 3){
              if(nodes[i].x === 960){
                nodes[i].position = this.position;
                this.position = pos;
                this.moved = true;
                this.tl.moveTo((this.position % 3) * 320, ((this.position / 3) | 0) * 320, 2, QUAD_EASEOUT);
                this.tl.then(function(){
                  this.moved = false;
                  game.endCheck();
                });
                break;
              }
            }
          }
        }
      }
    }
  });

  game.onload = function(){
    game.rootScene.backgroundColor = '#000000';

//パネルシャッフル
    var position = [ 0, 1, 2, 3, 4, 5, 6, 7, 8];
    var p = rand(9);

    for(var i = 0;i < 99;i++){
      var d = rand(4);
      var x = Math.cos((d / 2) * Math.PI) | 0;
      var y = Math.sin((d / 2) * Math.PI) | 0;
      if((p + x + y * 3) > 8 || (p + x + y * 3) < 0) continue;
      d = p + x + y * 3;
      var tmp = position[p];
      position[p] = position[d];
      position[d] = tmp;
      p = d;
    }

//パネル配置
    var panel = [];
    for(var i = 0;i < 9;i++){
      panel[i] = new Panel(320, 320);
      panel[i].position = position[i];
      panel[i].frame = i;
      panel[i].x = (panel[i].position % 3) * 320;
      panel[i].y = ((panel[i].position / 3) | 0) * 320;
      game.rootScene.addChild(panel[i]);
    }
console.log(p)
    panel[p].x = panel[p].y = 960;

//グリッド表示
    var grid = new Grid();
    game.rootScene.addChild(grid);

//ゲーム終了判定
    game.endCheck = function(){
      var c = 0;
      for(var i in panel){
        if(panel[i].position == i) c++;
      }
      if(c === 9){
        panel[p].tl.moveTo((panel[p].position % 3) * 320, ((panel[p].position / 3) | 0) * 320, game.fps / 2, QUAD_EASEOUT);
        panel[p].tl.then(function(){
          game.rootScene.removeChild(grid);
          var endTime = new Date().getTime() - game.startTime;
          game.end(600000 - endTime, ((endTime / 1000) | 0) + '秒かかってクリア！');
        });
      }
    }
  }

//ゲーム開始時間取得
  game.onstart = function(){
    game.startTime = new Date().getTime();
  }

//ゲーム開始
  game.start();
}
