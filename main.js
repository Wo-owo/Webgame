const { createApp } = Vue;

createApp({
  data() {
    return {
      title: "文字冒险游戏",
      currentText: "你醒来发现自己身处一个陌生的房间。",
      choices: [
        { text: "观察房间", nextText: "房间里空无一物，只有一扇门。" },
        { text: "打开门", nextText: "门锁住了。你需要一把钥匙。" }
      ]
    };
  },
  methods: {
    makeChoice(index) {
      this.currentText = this.choices[index].nextText;
      this.choices = []; // 清空选项，或者你可以加载新的一组
    }
  }
}).mount('#app');
