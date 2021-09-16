import { Camera } from "raytracer/camera";
import { serializeCamera, serializeWorld } from "raytracer/serializing";
import { World } from "raytracer/world";
export class RenderJob
{
    private  queue: WebWorkerQueue<RenderData>;
    onRenderingFinished :()=>void;
    constructor(public numberOfWorkers:number,canvas:HTMLCanvasElement, stringUrl:string)
    {
      this.queue= new WebWorkerQueue<any>(stringUrl,numberOfWorkers);
      var ctx = canvas.getContext("2d");
      this.queue.onTaskDone =(task,renderData)=>{

         var imageData = new ImageData(new Uint8ClampedArray(renderData), task.to.x-task.from.x, task.to.y-task.from.y);        
         ctx.putImageData(imageData, task.from.x, task.from.y);
         if (this.queue.count==0 && this.onRenderingFinished)
         {
           this.onRenderingFinished();
         }
      };
     
    }

    start(world:World,camera:Camera)
    {  
      var serializedWorld=serializeWorld(world);
      var serializedCamera=serializeCamera(camera);
      var batchSize=Math.floor(camera.vsize/this.numberOfWorkers);
      var y=0;
      var done=false;
      do
      {              
         var ynext=y+batchSize; 
         if (ynext>=camera.vsize)
         {
           done =true;
           ynext=camera.vsize;
         }
        var data=
          {world:serializedWorld,
         camera:serializedCamera,
         from: {x:0,y:y},
         to: {x:camera.hsize ,y: ynext}
         }; 
         this.queue.add(data);
         y=ynext ;
      }while(!done)
   }


   
}



export class WebWorkerQueue<T>
{    
  private workers:Worker[]=[];
  private status:Map<Worker,T>= new Map<Worker,T>()
  private queue:T[]=[];
  
  public onTaskDone:(task:T,result:any)=>void;
  public onTaskError:(task:T,ev:ErrorEvent)=>void;

  constructor(stringUrl:string,numberOfWorkers:number = navigator.hardwareConcurrency )
  {   
   for (var i=0;i<numberOfWorkers;i++)
   {
      let worker = new Worker(stringUrl);
      this.workers.push(worker);
      
      worker.onmessage=(ev:MessageEvent<any>)=>
      {        
         var task=this.status.get(worker);
         this.reAssignWorker(worker);      
         this.taskDone(task,ev.data);         
      }
      worker.onerror=(ev:ErrorEvent)=>
      {        
         var task=this.status.get(worker);
         this.reAssignWorker(worker);    
         this.taskError(task,ev);
      }


   }     
  }
 
  private reAssignWorker(worker:Worker):boolean
  {      
      if (this.queue.length >0)
      {
         var nextTask= this.queue.shift();
         this.status.set(worker,nextTask);
         worker.postMessage(nextTask);
         return true;
      } else
      {
         this.status.delete(worker);
         return false;
      }
  }
  private taskDone(task:T,result:any)
  {
     if (this.onTaskDone) this.onTaskDone(task,result);
  }
  private taskError(task:T,ev:ErrorEvent)
  {
     if (this.onTaskError) this.onTaskError(task,ev);
  }

  add(task:T)
  {
   var unbusyWorker=this.workers.find((w)=>!this.status.has(w));
   if (unbusyWorker!==undefined)
   {
      unbusyWorker.postMessage(task);
      this.status.set(unbusyWorker,task);
   } else
   {
      this.queue.push(task);
   }
  } 
  stop()
  {
     for (var w of this.workers)
     {
        w.terminate();
        
     }
     this.queue.length=0;
     this.status.clear();
  }
  get count():number
  {
    return this.queue.length+this.status.size;
  }

}



export type RenderData=
{
  world:World,
  camera:Camera,
  from:{
     x:number,
     y:number
  },
  to:{
   x:number,
   y:number
}
}

