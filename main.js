const { createApp } = Vue;

createApp({
  data() {
    return {
      initialPoints: 100,
      points: 100,
      failCount: 0,
      presetOptions: [],
      options: []
    };
  },
  methods: {
    async loadPreset() {
      try {
        const res = await fetch('options.json');
        const data = await res.json();
        this.presetOptions = data.presetOptions;
      } catch (e) {
        console.error('加载预设选项失败', e);
      }
    },
    generateOptions() {
      const list = [];

      // 1. 先从 presetOptions 中取出尚未耗尽 appearCount 的项
      const available = this.presetOptions.filter(o => o.appearCount > 0);
      // 随机或按顺序挑选一部分
      while (list.length < 3 && available.length > 0) {
        const idx = Math.floor(Math.random() * available.length);
        const opt = available[idx];
        list.push(opt);
        opt.appearCount--;
        if (opt.appearCount <= 0) {
          available.splice(idx, 1);
        }
      }

      // 2. 若不足 3 个，再用随机生成补足
      const countRandom = 3 + Math.floor(Math.random() * 2) - list.length;
      const names = ['探险', '休息', '交易', '训练', '研究'];
      for (let i = 0; list.length < 3 + Math.floor(Math.random()*2); i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const cost = Math.floor(Math.random() * 31) - 10;
        list.push({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          name,
          description: cost >= 0 ? `${name} 将消耗你 ${cost} 点数` : `${name} 将为你带来 ${Math.abs(cost)} 点收益`,
          cost,
          imgSrc: ''
        });
      }

      this.options = list;
    },
    makeChoice(opt) {
      this.points -= opt.cost;
      if (this.points < 0) this.failCount++;
      else this.failCount = 0;

      if (this.failCount >= 3) {
        alert('失败！三次选择后仍未恢复至非负点数。游戏结束。');
        this.restart();
        return;
      }

      this.updateUI();
      this.generateOptions();
    },
    updateUI() {
      document.getElementById('points').textContent = this.points;
      document.getElementById('status').textContent = this.points < 0
        ? `警告：点数为负，剩余失败机会：${3 - this.failCount}`
        : '';
      const list = document.getElementById('option-list');
      list.innerHTML = '';
      this.options.forEach((opt, idx) => {
        const card = document.createElement('div'); card.className = 'option-card';
        card.innerHTML = `
          <div class="option-img"><img src="${opt.imgSrc}" alt="" /></div>
          <div class="option-content">
            <div class="option-name">${opt.name}</div>
            <div class="option-desc">${opt.description}</div>
            <div class="option-cost">${opt.cost >= 0 ? '消耗：' + opt.cost : '获得：' + Math.abs(opt.cost)} 点</div>
            <button>选择</button>
          </div>`;
        card.querySelector('button').addEventListener('click', () => this.makeChoice(opt));
        list.appendChild(card);
      });
    },
    restart() {
      this.points = this.initialPoints;
      this.failCount = 0;
      // 重置 presetOptions 的 appearCount（可根据需求加载时缓存初始副本）
      this.loadPreset().then(() => {
        this.updateUI();
        this.generateOptions();
      });
    }
  },
  async mounted() {
    await this.loadPreset();
    this.updateUI();
    this.generateOptions();
  }
}).mount('#app');
