// 絵合わせ16パズル by @usami_yu
// このコード'game.js'はMITライセンスで公開いたします。
// ご自由に改造してお使いください。

enchant();

const WIN_WIDTH = 960;
const WIN_SIZE = 3;
const IMAGE = `img/${MEMBER}.jpg`;
const IMAGE_CLEAR = "clear.png";

const ONE_WIDTH = WIN_WIDTH / WIN_SIZE;
const SHUFFLE_COUNT = 99;
const PANEL_COUNT = WIN_SIZE * WIN_SIZE;

window.onload = function () {

  const game = new Game(WIN_WIDTH, WIN_WIDTH);
  game.fps = 24;

  const PRELOAD_MATERIAL = [IMAGE, IMAGE_CLEAR];
  if (PRELOAD_MATERIAL) {
    game.preload(PRELOAD_MATERIAL);
  }

//乱数発生関数
  const rand = function (num) {
    return (Math.random() * num) | 0;
  };

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
          const endTime = (new Date().getTime() - game.startTime) / 1000;

          const endScene = new enchant.nineleap.SplashScene();

          const result = new MutableText();
          result.text = `${endTime}s`;
          result.x = (WIN_WIDTH - result.width) / 2;
          result.y = WIN_WIDTH / 4 * 3;
          endScene.scene.addChild(result);

          const clearImg = game.assets[IMAGE_CLEAR];
          const clearImgSprite = new enchant.Sprite(clearImg.width, clearImg.height);
          clearImgSprite.image = clearImg;
          clearImgSprite.x = (WIN_WIDTH - clearImg.width) / 2;
          clearImgSprite.y = (WIN_WIDTH - clearImg.height) / 2;
          endScene.scene.addChild(clearImgSprite);

          game.pushScene(endScene);
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
