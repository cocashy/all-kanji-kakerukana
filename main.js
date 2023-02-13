const ANY_BUSHU_SIGN = "-";
const SPACE = "　";

let game;
window.onload = () => {
  game = new Game;
}

class Game {
  constructor() {
    this.selectBox = document.getElementById("select-box");
    this.questionNumberObject = document.getElementById("question-number");

    this.form = document.getElementById("form");
    this.timeObject = document.getElementById("time");
    this.startButton = document.getElementById("start");
    this.giveUpButton = document.getElementById("give-up");
    this.answerCountObject = document.getElementById("answer-count");

    this.answerField = document.getElementById("answer-field");

    this.bushuDict = this.makeBushuDict();
    this.setSelectBox();
    this.timer = new Timer(this.timeObject);
    this.initialize();

    this.selectBox.onchange = this.initialize.bind(this);

    this.form.onsubmit = this.submit.bind(this);
    this.startButton.onclick = this.start.bind(this);
    this.giveUpButton.onclick = this.giveUp.bind(this);

    this.form.submit.disabled = true;
    this.giveUpButton.disabled = true;

    this.isInPlay = false;
  }

  makeBushuDict() {
    const dict = {};
    // "-"の値にはすべての漢字の配列を与える
    dict[ANY_BUSHU_SIGN] = kanjiDict.map(data => data.kanji);
    // {"部首": [該当する漢字の配列]}とする
    for (let data of kanjiDict) {
      if (Object.keys(dict).includes(data.bushu)) {
        dict[data.bushu].push(data.kanji);
      } else {
        dict[data.bushu] = [data.kanji];
      }
    }
    return dict;
  }

  setSelectBox() {
    // 該当する漢字の多い順に部首を並べる
    const list = Object.keys(this.bushuDict);
    list.sort((bushu1, bushu2) => this.bushuDict[bushu2].length - this.bushuDict[bushu1].length);

    for (let bushu of list) {
      let option = document.createElement("option");
      option.innerText = bushu;
      this.selectBox.append(option);
    }
  }

  initialize() {
    const bushu = this.getNowBushu();
    const number = this.bushuDict[bushu].length;
    this.questionNumberObject.innerText = number;

    // ulの子要素をすべて削除する
    while (this.answerField.firstChild) {
      this.answerField.removeChild(this.answerField.firstChild);
    }

    // 正解の数だけアイテムを追加する
    for (let i = 0; i < number; i++) {
      let item = document.createElement("li");
      item.innerText = SPACE;
      this.answerField.append(item);
    }

    this.answerCountObject.innerText = "0";
    this.timer.stop();
    this.timer.reset();
    this.isInPlay = false;
    this.startButton.disabled = false;
    this.form.submit.disabled = true;
    this.giveUpButton.disabled = true;
  }

  getNowBushu() {
    const index = this.selectBox.selectedIndex;
    const bushu = this.selectBox.options[index].innerText;
    return bushu;
  }

  submit(e) {
    e.preventDefault();
    if (!this.isInPlay) return;

    // 入力された漢字が合っているかを調べる
    const answeredKanji = this.form.text.value;
    const bushu = this.getNowBushu();
    const number = this.bushuDict[bushu].length;
    for (let i = 0; i < number; i++) {
      if (this.bushuDict[bushu][i] !== answeredKanji) continue;
      if (this.answerField.children[i].innerText === answeredKanji) return;
      // 正解の漢字を表示する
      this.answerField.children[i].innerText = answeredKanji;
      this.answerField.children[i].scrollIntoView({
        behavior: "smooth"
      });
      this.form.text.value = "";

      const preCount = Number(this.answerCountObject.innerText);
      const nowCount = preCount + 1;
      this.answerCountObject.innerText = nowCount;

      // 全問正解
      if (nowCount === number) {
        this.timer.stop();
        this.isInPlay = false;
        this.startButton.disabled = false;
        this.form.submit.disabled = true;
        this.giveUpButton.disabled = true;
      }
    }
  }

  start() {
    this.timer.start();
    this.isInPlay = true;
    this.startButton.disabled = true;
    this.form.submit.disabled = false;
    this.giveUpButton.disabled = false;
    this.answerCountObject.innerText = "0";

    // すべて空欄にする
    for (let item of this.answerField.children) {
      item.innerText = SPACE
      item.style.color = "black";
    }
  }

  giveUp() {
    this.timer.stop();
    this.isInPlay = false;
    this.startButton.disabled = false;
    this.form.submit.disabled = true;
    this.giveUpButton.disabled = true;

    // 正解を表示する
    const bushu = this.getNowBushu();
    const number = this.bushuDict[bushu].length;
    for (let i = 0; i < number; i++) {
      if (this.answerField.children[i].innerText != SPACE) continue;
      this.answerField.children[i].innerText = this.bushuDict[bushu][i];
      this.answerField.children[i].style.color = "red";
    }
  }
}

class Timer {
  constructor(timeElement) {
    this.element = timeElement;
    this.isActive = false;
  }

  start() {
    this.isActive = true;
    this.startTime = Date.now();
    this.countUp();
  }

  countUp() {
    if (!this.isActive) return;
    const nowTime = new Date(Date.now() - this.startTime);
    const min = String(nowTime.getMinutes()).padStart(2, 0);
    const sec = String(nowTime.getSeconds()).padStart(2, 0);
    const ms = String(nowTime.getMilliseconds()).padStart(3, 0);
    this.element.innerText = `${min}:${sec}.${ms}`;
    setTimeout(this.countUp.bind(this), 10);
  }

  stop() {
    this.isActive = false;
  }

  reset() {
    this.element.innerText = "00:00:000";
  }
}