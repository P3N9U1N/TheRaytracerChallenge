
/**
 * Object pool that will minimize garbage collection usage
 */
export abstract class ObjectPool<T>
{
    protected items:T[];
    protected _length:number;
    protected indexMap:Map<T,number>;

    constructor(arrayLength:number=0)
    {
      this.items=new Array<T>(arrayLength);
      this.indexMap= new Map<T,number>();
      this._length=0;
      for (var i=0;i<arrayLength;i++)
      {
        var newItem=this.create();
        this.indexMap.set(newItem,i);
        this.items[i]=newItem;
      }
      
    }

    indexOf(item:T):number
    {
     var i= this.indexMap.get(item);
     return (i===undefined || i>=this._length)  ? -1: i;
    }

    /**
     * Removes an item and fills the gap with the last item.
     * Removed items will be reused when calling .add() 
    */
    remove(item:T):void;
    remove(index:number):void;
    public remove(a:any):void
    { 
        var index:number;
        if (a instanceof Object)
        {
            index=this.indexMap.get(a);
            if (index === undefined) return;
        } else
        {
            index= Math.floor(a as number); 
        }
        if (index <0 || index >=this._length) return;
        this._length--;        
        var removeItem=  this.items[index];
        var lastItem=this.items[this._length];
        this.items[index] = lastItem;
        this.items[this._length]=removeItem;
        this.indexMap.set(removeItem,this._length);
        this.indexMap.set(lastItem,index);
    }
    public clear()
    {
        this._length=0;
    }

    /**
     * Returns an unused item or creates a new one, if no unused item available
    */
    public add():T
    {
        if (this.items.length==this._length)
        {
            var newItem=this.create();
            this.indexMap.set(newItem,this._length);
            this._length=this.items.push(newItem);           
            return newItem;
        }        
        return this.items[this._length++];  
    }
    public get(index:number):T | undefined
    {
        if (index >=this._length) return undefined;   
        return this.items[index];
    }


    public get length() : number {
        return this._length;
    }

    
    protected abstract create():T;
}

