import {Tuple} from "./tuple"
import {Color} from "./color"
export class PointLight
{
    public position:Tuple;
    public intensity:Color;
    constructor(position?:Tuple,intensity?:Color)
    {
      this.position=position?? Tuple.point(0,0,0);
      this.intensity=intensity?? new Color(1,1,1);
      
    }
}