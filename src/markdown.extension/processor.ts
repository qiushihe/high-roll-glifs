class Processor {
  private static defaultInstance: Processor;

  static getDefaultInstance(): Processor {
    if (!this.defaultInstance) {
      this.defaultInstance = new Processor();
    }
    return this.defaultInstance;
  }

  private viewportFrom: number;
  private viewportTo: number;

  constructor() {
    this.viewportFrom = 0;
    this.viewportTo = 0;
  }

  setViewportRange(from: number, to: number): void {
    this.viewportFrom = from;
    this.viewportTo = to;
  }
}

export default Processor;
