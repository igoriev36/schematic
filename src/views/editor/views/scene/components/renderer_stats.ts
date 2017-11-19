import RendererStats from "../libs/threex.rendererstats";

const rendererStats = RendererStats();
rendererStats.domElement.style.position = "absolute";
rendererStats.domElement.style.left = "0px";
rendererStats.domElement.style.bottom = "40px";

export default rendererStats;
