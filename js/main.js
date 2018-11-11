// 絵合わせ16パズル by @usami_yu
// このコード'game.js'はMITライセンスで公開いたします。
// ご自由に改造してお使いください。

enchant();

const WIN_WIDTH = 960;
const WIN_SIZE = 3;
const IMAGE = "img/hani3.png";

const ONE_WIDTH = WIN_WIDTH / WIN_SIZE;
const SHUFFLE_COUNT = 1;
const PANEL_COUNT = WIN_SIZE * WIN_SIZE;

window.onload = function () {

  var game = new Game(WIN_WIDTH, WIN_WIDTH);
  game.fps = 24;

  var PRELOAD_MATERIAL = [IMAGE];
  if (PRELOAD_MATERIAL) {
    game.preload(PRELOAD_MATERIAL);
  }

//乱数発生関数
  var rand = function (num) {
    return (Math.random() * num) | 0;
  }

//グリッドライン用グループ
  const Grid = enchant.Class.create(Group, {
    initialize: function () {
      Group.call(this);
      for (let i = 0; i < WIN_SIZE + 1; i++) {
        const leftLine = new Line((i % 4) * ONE_WIDTH, 0);
        this.addChild(leftLine);
        const rightLine = new Line((i % 4) * ONE_WIDTH + ONE_WIDTH - 1, 0);
        this.addChild(rightLine);
        const topLine = new Line(WIN_WIDTH / 2, (i % 4) * ONE_WIDTH - WIN_WIDTH / 2);
        topLine.rotate(90);
        this.addChild(topLine);
        const bottomLine = new Line(WIN_WIDTH / 2, (i % 4) * ONE_WIDTH - WIN_WIDTH / 2 - 1);
        bottomLine.rotate(90);
        this.addChild(bottomLine);
      }
    }
  });

//グリッドライン用ライン
  const Line = enchant.Class.create(Sprite, {
    initialize: function (x, y) {
      Sprite.call(this, 1, WIN_WIDTH);
      const surface = new Surface(1, WIN_WIDTH);
      const ctx = surface.context;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, WIN_WIDTH);
      ctx.stroke();
      this.image = surface;
      this.x = x;
      this.y = y;
    }
  });

//パネル
  const Panel = enchant.Class.create(Sprite, {
    initialize: function (width, height) {
      Sprite.call(this, width, height);
      this.image = game.assets[IMAGE];
      this.position = 0;
      this.moved = false;
      this.addEventListener(enchant.Event.TOUCH_START, this.onTouchStart);
      this.addEventListener(enchant.Event.TOUCH_END, this.onTouchEnd);
    },
    onTouchStart: function () {
      if (!this.moved) {
        this.tl.fadeTo(0.5, 1);
      }
    },
    onTouchEnd: function () {
      if (!this.moved) {
        this.tl.fadeTo(1, 1);
        const nodes = this.parentNode.childNodes;
        for (let j = 0; j < 4; j++) {
          if (this.moved) {
            break;
          }
          const x = Math.cos((j / 2) * Math.PI) | 0;
          const y = Math.sin((j / 2) * Math.PI) | 0;
          for (let i in nodes) {
            const pos = nodes[i].position;
            if (pos === this.position + x + y * WIN_SIZE) {
              if (nodes[i].x === WIN_WIDTH) {
                nodes[i].position = this.position;
                this.position = pos;
                this.moved = true;
                this.tl.moveTo((this.position % WIN_SIZE) * ONE_WIDTH,
                    ((this.position / WIN_SIZE) | 0) * ONE_WIDTH, 2, enchant.Easing.QUAD_EASEINOUT);
                this.tl.then(function () {
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

  game.onload = function () {
    game.rootScene.backgroundColor = '#000000';

//パネルシャッフル
    const position = [];
    for (let i = 0; i < PANEL_COUNT; i++) {
      position.push(i);
    }
    let p = rand(PANEL_COUNT);

    for (let i = 0; i < SHUFFLE_COUNT; i++) {
      const d = rand(4);
      const x = Math.cos((d / 2) * Math.PI) | 0;
      const y = Math.sin((d / 2) * Math.PI) | 0;
      const newP = p + x + y * WIN_SIZE;
      if (newP > position.length - 1 || newP < 0) {
        continue;
      }
      const tmp = position[p];
      position[p] = position[newP];
      position[newP] = tmp;
      p = newP;
    }

//パネル配置
    const panel = [];
    for (let i = 0; i < PANEL_COUNT; i++) {
      panel[i] = new Panel(ONE_WIDTH, ONE_WIDTH);
      panel[i].position = position[i];
      panel[i].frame = i;
      panel[i].x = (panel[i].position % WIN_SIZE) * ONE_WIDTH;
      panel[i].y = ((panel[i].position / WIN_SIZE) | 0) * ONE_WIDTH;
      game.rootScene.addChild(panel[i]);
    }
    panel[p].x = panel[p].y = WIN_WIDTH;

//グリッド表示
    const grid = new Grid();
    game.rootScene.addChild(grid);

//ゲーム終了判定
    game.endCheck = function () {
      let c = 0;
      for (let i in panel) {
        if (panel[i].position == i) {
          c++;
        }
      }
      if (c === PANEL_COUNT) {
        panel[p].tl.moveTo((panel[p].position % WIN_SIZE) * ONE_WIDTH,
            ((panel[p].position / WIN_SIZE) | 0) * ONE_WIDTH, game.fps / 2,
            enchant.Easing.QUAD_EASEINOUT);
        panel[p].tl.then(function () {
          game.rootScene.removeChild(grid);
          const endTime = new Date().getTime() - game.startTime;
          game.end(600000 - endTime, ((endTime / 1000) | 0) + '秒かかってクリア！');
        });
      }
    }
  };

//ゲーム開始時間取得
  game.onstart = function () {
    game.startTime = new Date().getTime();
  };

//ゲーム開始
  game.start();
};
