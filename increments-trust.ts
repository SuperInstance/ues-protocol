export interface TrustTensor {
  consistency: number;
  competence: number;
  transparency: number;
  responsiveness: number;
  adherence: number;
  degradation: number;
  awareness: number;
  collaboration: number;
  predictability: number;
  recovery: number;
  ethics: number;
  expertise: number;
}

export interface TrustUpdate {
  parameter: keyof TrustTensor;
  delta: number;
  reason: string;
  timestamp: number;
}

export class TrustEngine {
  private tensor: TrustTensor;
  private history: TrustUpdate[] = [];
  private static readonly LOSS_RATIO = 25;
  private static readonly WEIGHTS = {
    consistency: 2,
    competence: 2,
    transparency: 1,
    responsiveness: 1,
    adherence: 1,
    degradation: 1,
    awareness: 1,
    collaboration: 1,
    predictability: 1,
    recovery: 1,
    ethics: 1,
    expertise: 1
  };
  private static readonly WEIGHT_SUM = 14;

  constructor(initial?: Partial<TrustTensor>) {
    this.tensor = {
      consistency: 0.5,
      competence: 0.5,
      transparency: 0.5,
      responsiveness: 0.5,
      adherence: 0.5,
      degradation: 0.5,
      awareness: 0.5,
      collaboration: 0.5,
      predictability: 0.5,
      recovery: 0.5,
      ethics: 0.5,
      expertise: 0.5,
      ...initial
    };
    this.clampAll();
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private clampAll(): void {
    for (const key in this.tensor) {
      this.tensor[key as keyof TrustTensor] = this.clamp(this.tensor[key as keyof TrustTensor]);
    }
  }

  update(update: TrustUpdate): void {
    const current = this.tensor[update.parameter];
    const effectiveDelta = update.delta >= 0 ? update.delta : update.delta * TrustEngine.LOSS_RATIO;
    const newValue = this.clamp(current + effectiveDelta);
    this.tensor[update.parameter] = newValue;
    this.history.push({ ...update, timestamp: update.timestamp || Date.now() });
  }

  getOverall(): number {
    let weightedSum = 0;
    for (const key in this.tensor) {
      const param = key as keyof TrustTensor;
      weightedSum += this.tensor[param] * TrustEngine.WEIGHTS[param];
    }
    return weightedSum / TrustEngine.WEIGHT_SUM;
  }

  getAutonomyLevel(): string {
    const overall = this.getOverall();
    if (overall < 0.3) return "L1";
    if (overall < 0.5) return "L2";
    if (overall < 0.7) return "L3";
    if (overall < 0.85) return "L4";
    return "L5";
  }

  getTensor(): TrustTensor {
    return { ...this.tensor };
  }

  getHistory(): TrustUpdate[] {
    return [...this.history];
  }

  serialize(): string {
    return JSON.stringify({
      tensor: this.tensor,
      history: this.history
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.tensor = parsed.tensor;
    this.history = parsed.history;
    this.clampAll();
  }

  generateHTMLReport(): string {
    const overall = this.getOverall();
    const level = this.getAutonomyLevel();
    const format = (v: number) => (v * 100).toFixed(1);

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Cocapn Fleet Trust Report</title>
  <style>
    body { font-family: monospace; margin: 20px; background: #0a0a14; color: #e0e0ff; }
    .container { max-width: 800px; margin: auto; }
    .header { text-align: center; margin-bottom: 30px; }
    .overall { background: #1a1a2e; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
    .level { font-size: 1.5em; font-weight: bold; color: #4fc3f7; }
    .bars { margin: 20px 0; }
    .bar-item { margin: 8px 0; display: flex; align-items: center; }
    .bar-label { width: 140px; }
    .bar-bg { flex: 1; height: 20px; background: #2a2a3e; border-radius: 3px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 3px; }
    .history { margin-top: 30px; }
    .history-item { background: #1a1a2e; padding: 10px; margin: 5px 0; border-radius: 5px; font-size: 0.9em; }
    .positive { color: #81c784; }
    .negative { color: #e57373; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>INCREMENTS Trust Module</h1>
      <h2>Cocapn Fleet</h2>
    </div>
    <div class="overall">
      <div>Overall Trust: <span class="level">${format(overall)}%</span></div>
      <div>Autonomy Level: <span class="level">${level}</span></div>
    </div>
    <div class="bars">
      ${Object.entries(this.tensor).map(([key, value]) => {
        const width = value * 100;
        const color = value > 0.7 ? '#4caf50' : value > 0.4 ? '#ffb74d' : '#f44336';
        return `
        <div class="bar-item">
          <div class="bar-label">${key}:</div>
          <div class="bar-bg">
            <div class="bar-fill" style="width: ${width}%; background: ${color};"></div>
          </div>
          <div style="width: 50px; text-align: right;">${format(value)}%</div>
        </div>`;
      }).join('')}
    </div>
    <div class="history">
      <h3>Update History</h3>
      ${this.history.slice(-10).reverse().map(item => {
        const sign = item.delta >= 0 ? '+' : '';
        const cls = item.delta >= 0 ? 'positive' : 'negative';
        const date = new Date(item.timestamp).toLocaleString();
        return `
        <div class="history-item">
          <span class="${cls}">${sign}${item.delta.toFixed(3)}</span> 
          ${item.parameter} – ${item.reason}
          <div style="font-size: 0.8em; color: #aaa;">${date}</div>
        </div>`;
      }).join('')}
    </div>
  </div>
</body>
</html>`;
  }
}