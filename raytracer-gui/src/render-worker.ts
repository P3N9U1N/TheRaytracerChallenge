
import * as serializing from "raytracer/serializing";
import { RenderData } from "./renderjob";
declare function postMessage(message:any,transfer?:Transferable[]):void;

onmessage = function(e) {
    var renderdata= e.data as RenderData;

    var world=serializing.deSerializeWorld(renderdata.world);
    var camera=serializing.deSerializeCamera(renderdata.camera);
    var start=Date.now();
    var renderData = camera.renderPartial(world, renderdata.from,renderdata.to);
    console.log(renderdata.from.y+" done  "+ (Date.now()-start))
    postMessage(renderData.buffer,[renderData.buffer]);
}