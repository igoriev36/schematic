class ExtrudeTool {
  constructor() {}
  activate() {}
  deactivate() {}
  resume() {}
  onCancel() {}
  onMouseMove() {}
  onLButtonDown() {}
  onSetCursor() {}
  draw() {}
  getExtents() {}

  private updateUI() {}
  private resetTool() {}
  private hasPickedFirstPoint() {}
  private hasPickedPoints() {}
  private drawPreview() {}
  private createEdge() {}

  activateExtrudeTool() {
    // Editor.activeModel.selectTool(new ExtrudeTool())
  }
}

export default ExtrudeTool;
