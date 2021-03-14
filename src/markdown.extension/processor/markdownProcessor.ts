class MarkdownProcessor {
  private static defaultInstance: MarkdownProcessor;

  static getDefaultInstance(): MarkdownProcessor {
    if (!this.defaultInstance) {
      this.defaultInstance = new MarkdownProcessor();
    }
    return this.defaultInstance;
  }

  private viewportFrom: number;
  private viewportTo: number;

  setViewportRange(from: number, to: number): void {
    this.viewportFrom = from;
    this.viewportTo = to;
  }

  testLog(): void {
    console.log("test");
  }
}

export default MarkdownProcessor;
